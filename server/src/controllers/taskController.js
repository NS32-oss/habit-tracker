import Task from '../models/Task.js'
import mongoose from 'mongoose'
import dayjs from 'dayjs'

// Get all tasks with filtering
export const getAllTasks = async (req, res, next) => {
  try {
    const { filter = 'all', sortBy = 'dueDate', search = '', categoryFilter = '' } = req.query
    const userId = req.userId

    let query = { userId, archived: false }

    // Apply filters
    if (filter === 'today') {
      const today = dayjs().startOf('day').toDate()
      const tomorrow = dayjs().add(1, 'day').startOf('day').toDate()
      query.dueDate = { $gte: today, $lt: tomorrow }
      query.completed = false
    } else if (filter === 'upcoming') {
      query.dueDate = { $gte: dayjs().startOf('day').toDate() }
      query.completed = false
    } else if (filter === 'completed') {
      query.completed = true
    } else if (filter === 'overdue') {
      query.dueDate = { $lt: dayjs().startOf('day').toDate() }
      query.completed = false
    } else if (filter === 'high-priority') {
      query.priority = { $in: ['high', 'critical'] }
      query.completed = false
    } else if (filter === 'pinned') {
      query.pinned = true
      query.completed = false
    } else if (filter === 'favorites') {
      query.favorite = true
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { labels: { $regex: search, $options: 'i' } },
      ]
    }

    // Category filter
    if (categoryFilter) {
      query.category = categoryFilter
    }

    // Build sort
    let sortObj = {}
    if (sortBy === 'dueDate') {
      sortObj = { dueDate: 1, priority: -1, createdAt: -1 }
    } else if (sortBy === 'priority') {
      const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 }
      // MongoDB doesn't directly support custom order, so we'll sort on client
      sortObj = { priority: 1, dueDate: 1 }
    } else if (sortBy === 'created') {
      sortObj = { createdAt: -1 }
    } else if (sortBy === 'alphabetical') {
      sortObj = { title: 1 }
    }

    const tasks = await Task.find(query)
      .sort({ pinned: -1, ...sortObj })
      .lean()

    // Apply priority-based sorting if needed
    if (sortBy === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    }

    res.json(tasks)
  } catch (error) {
    next(error)
  }
}

// Get dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.userId
    const today = dayjs().startOf('day').toDate()
    const tomorrow = dayjs().add(1, 'day').startOf('day').toDate()

    const [
      totalTasks,
      completedToday,
      dueToday,
      overdueTasks,
      activeTasks,
      highPriorityTasks,
    ] = await Promise.all([
      Task.countDocuments({ userId, archived: false }),
      Task.countDocuments({ userId, completed: true, completedAt: { $gte: today, $lt: tomorrow } }),
      Task.countDocuments({ userId, dueDate: { $gte: today, $lt: tomorrow }, completed: false }),
      Task.countDocuments({ userId, dueDate: { $lt: today }, completed: false, archived: false }),
      Task.countDocuments({ userId, completed: false, archived: false }),
      Task.countDocuments({ userId, priority: { $in: ['high', 'critical'] }, completed: false, archived: false }),
    ])

    const completionPercentage = totalTasks > 0 ? Math.round((completedToday / dueToday) * 100) || 0 : 0

    res.json({
      tasksDueToday: dueToday,
      completedToday,
      completionPercentage,
      activeTasks,
      highPriorityTasks,
      overdueTasks,
      totalTasks,
    })
  } catch (error) {
    next(error)
  }
}

// Get single task
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    next(error)
  }
}

// Create task
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, category, labels, color, dueDate, dueTime, startDate, recurring } = req.body

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Task title is required' })
    }

    const task = new Task({
      userId: req.userId,
      title: title.trim(),
      description,
      priority,
      category,
      labels,
      color,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueTime,
      startDate: startDate ? new Date(startDate) : null,
      recurring,
    })

    await task.save()
    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}

// Update task
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const allowedFields = [
      'title',
      'description',
      'priority',
      'category',
      'labels',
      'color',
      'dueDate',
      'dueTime',
      'startDate',
      'recurring',
      'completed',
      'pinned',
      'favorite',
      'archived',
      'section',
      'order',
    ]

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        if (key === 'dueDate' || key === 'startDate') {
          task[key] = req.body[key] ? new Date(req.body[key]) : null
        } else if (key === 'completed') {
          task[key] = req.body[key]
          if (req.body[key]) {
            task.completedAt = new Date()
          } else {
            task.completedAt = null
          }
        } else {
          task[key] = req.body[key]
        }
      }
    })

    // Log activity
    task.activityLog.push({
      action: 'updated',
      details: req.body,
    })

    await task.save()
    res.json(task)
  } catch (error) {
    next(error)
  }
}

// Toggle task completion
export const toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    task.completed = !task.completed
    if (task.completed) {
      task.completedAt = new Date()
    } else {
      task.completedAt = null
    }

    task.activityLog.push({
      action: task.completed ? 'completed' : 'reopened',
    })

    await task.save()
    res.json(task)
  } catch (error) {
    next(error)
  }
}

// Delete task
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    await Task.deleteOne({ _id: req.params.id })
    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// Archive task
export const archiveTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    task.archived = true
    task.activityLog.push({
      action: 'archived',
    })

    await task.save()
    res.json(task)
  } catch (error) {
    next(error)
  }
}

// Add subtask
export const addSubtask = async (req, res, next) => {
  try {
    const { title } = req.body
    if (!title) {
      return res.status(400).json({ message: 'Subtask title is required' })
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    task.subtasks.push({
      _id: new mongoose.Types.ObjectId(),
      title,
      completed: false,
    })

    await task.save()
    res.json(task)
  } catch (error) {
    next(error)
  }
}

// Toggle subtask
export const toggleSubtask = async (req, res, next) => {
  try {
    const { subtaskId } = req.params
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const subtask = task.subtasks.id(subtaskId)
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' })
    }

    subtask.completed = !subtask.completed
    if (subtask.completed) {
      subtask.completedAt = new Date()
    } else {
      subtask.completedAt = null
    }

    await task.save()
    res.json(task)
  } catch (error) {
    next(error)
  }
}

// Delete subtask
export const deleteSubtask = async (req, res, next) => {
  try {
    const { subtaskId } = req.params
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    task.subtasks.id(subtaskId).deleteOne()
    await task.save()
    res.json(task)
  } catch (error) {
    next(error)
  }
}

// Add note
export const addNote = async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content) {
      return res.status(400).json({ message: 'Note content is required' })
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    task.notes.push({
      _id: new mongoose.Types.ObjectId(),
      content,
    })

    await task.save()
    res.json(task)
  } catch (error) {
    next(error)
  }
}

// Bulk update (reorder, bulk actions)
export const bulkUpdate = async (req, res, next) => {
  try {
    const { updates } = req.body // Array of { taskId, updates }
    const userId = req.userId

    const results = await Promise.all(
      updates.map(async ({ taskId, updates: taskUpdates }) => {
        return Task.findOneAndUpdate(
          { _id: taskId, userId },
          { $set: taskUpdates },
          { new: true }
        )
      })
    )

    res.json(results)
  } catch (error) {
    next(error)
  }
}
