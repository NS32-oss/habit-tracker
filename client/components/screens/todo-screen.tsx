'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { taskAPI } from '@/lib/api'
import { TaskCard } from '@/components/task-card'
import { TaskModal } from '@/components/task-modal'
import { TaskFilters } from '@/components/task-filters'
import { TaskDashboard } from '@/components/task-dashboard'
import { toast } from 'sonner'
import dayjs from 'dayjs'

export type TaskFilterType = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue' | 'high-priority' | 'pinned' | 'favorites'
export type TaskSortType = 'dueDate' | 'priority' | 'created' | 'alphabetical'

interface Task {
  _id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  labels: string[]
  color: string
  dueDate: string | null
  dueTime: string | null
  completed: boolean
  completedAt?: string
  pinned: boolean
  favorite: boolean
  archived: boolean
  subtasks: any[]
  notes: any[]
  recurring: any
}

export function ToDoScreen() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'overview' | 'active' | 'completed' | 'calendar' | 'projects'>('overview')
  const [activeFilter, setActiveFilter] = useState<TaskFilterType>('all')
  const [activeSort, setActiveSort] = useState<TaskSortType>('dueDate')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [stats, setStats] = useState<any>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadTasks = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      const [tasksData, statsData] = await Promise.all([
        taskAPI.getAll(activeFilter, activeSort, searchQuery, categoryFilter),
        taskAPI.getStats(),
      ])

      setTasks(tasksData)
      setStats(statsData)
      setError(null)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to load tasks:', error)
        setError('Failed to load tasks. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [activeFilter, activeSort, searchQuery, categoryFilter])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const handleCreateTask = async (taskData: any) => {
    try {
      const newTask = await taskAPI.create(taskData)
      setTasks([newTask, ...tasks])
      toast.success('Task created!')
      setShowModal(false)
      loadTasks() // Refresh stats
    } catch (error) {
      toast.error('Failed to create task')
      console.error(error)
    }
  }

  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      const updated = await taskAPI.update(taskId, updates)
      setTasks(tasks.map(t => t._id === taskId ? updated : t))
      toast.success('Task updated!')
      setEditingTask(null)
      setShowModal(false)
    } catch (error) {
      toast.error('Failed to update task')
      console.error(error)
    }
  }

  const handleToggleTask = async (taskId: string) => {
    try {
      const updated = await taskAPI.toggle(taskId)
      setTasks(tasks.map(t => t._id === taskId ? updated : t))
      toast.success(updated.completed ? '✓ Task completed!' : 'Task reopened')
      loadTasks() // Refresh stats
    } catch (error) {
      toast.error('Failed to toggle task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskAPI.delete(taskId)
      setTasks(tasks.filter(t => t._id !== taskId))
      toast.success('Task deleted')
      loadTasks() // Refresh stats
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const handleArchiveTask = async (taskId: string) => {
    try {
      await taskAPI.archive(taskId)
      setTasks(tasks.filter(t => t._id !== taskId))
      toast.success('Task archived')
      loadTasks() // Refresh stats
    } catch (error) {
      toast.error('Failed to archive task')
    }
  }

  const handlePinTask = async (taskId: string, pinned: boolean) => {
    try {
      const updated = await taskAPI.update(taskId, { pinned: !pinned })
      setTasks(tasks.map(t => t._id === taskId ? updated : t))
      toast.success(!pinned ? '📌 Task pinned' : 'Pin removed')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleFavoriteTask = async (taskId: string, favorite: boolean) => {
    try {
      const updated = await taskAPI.update(taskId, { favorite: !favorite })
      setTasks(tasks.map(t => t._id === taskId ? updated : t))
      toast.success(!favorite ? '⭐ Added to favorites' : 'Removed from favorites')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.category)))
  }, [tasks])

  const sectionTasks = useMemo(() => {
    switch (activeSection) {
      case 'active':
        return tasks.filter((task) => !task.completed && !task.archived)
      case 'completed':
        return tasks.filter((task) => task.completed)
      default:
        return tasks
    }
  }, [activeSection, tasks])

  const projectGroups = useMemo(() => {
    return uniqueCategories
      .map((category) => ({
        category,
        tasks: tasks.filter((task) => task.category === category),
      }))
      .sort((left, right) => right.tasks.length - left.tasks.length)
  }, [tasks, uniqueCategories])

  const calendarTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => task.dueDate)
      .sort((left, right) => dayjs(left.dueDate).valueOf() - dayjs(right.dueDate).valueOf())
  }, [tasks])

  const isEmpty = tasks.length === 0

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 page-shell py-3 pb-28 sm:py-4 sm:pb-24">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-800 dark:text-white sm:mb-2 sm:text-4xl">✅ To-Do</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">Stay organized and boost your productivity</p>
          </div>

          <div className="flex gap-2 overflow-x-auto rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-gray-200/80 backdrop-blur [scrollbar-width:none] [-ms-overflow-style:none] dark:bg-gray-900/80 dark:ring-gray-800 [&::-webkit-scrollbar]:hidden">
            {[
              ['overview', 'Overview'],
              ['active', 'Active'],
              ['completed', 'Completed'],
              ['calendar', 'Calendar'],
              ['projects', 'Projects'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key as typeof activeSection)}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${activeSection === key ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Dashboard */}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:px-4 sm:py-2.5"
            />
            <motion.button
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 sm:px-4"
            >
              + Add Task
            </motion.button>
          </div>

          {activeSection !== 'projects' && (
            <TaskFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              activeSort={activeSort}
              onSortChange={setActiveSort}
              categories={uniqueCategories}
              selectedCategory={categoryFilter}
              onCategoryChange={setCategoryFilter}
            />
          )}
        </motion.div>

        {/* Tasks List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-5xl mb-4 animate-bounce">✅</div>
                <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={loadTasks}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          ) : activeSection === 'overview' ? (
            <OverviewSection tasks={tasks} stats={stats} activeFilter={activeFilter} setShowModal={setShowModal} setActiveFilter={setActiveFilter} />
          ) : activeSection === 'calendar' ? (
            <CalendarSection tasks={calendarTasks} />
          ) : activeSection === 'projects' ? (
            <ProjectsSection groups={projectGroups} />
          ) : sectionTasks.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            <AnimatePresence mode="popLayout">
              {sectionTasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <TaskCard
                    task={task}
                    onToggle={() => handleToggleTask(task._id)}
                    onEdit={() => {
                      setEditingTask(task)
                      setShowModal(true)
                    }}
                    onDelete={() => handleDeleteTask(task._id)}
                    onArchive={() => handleArchiveTask(task._id)}
                    onPin={() => handlePinTask(task._id, task.pinned)}
                    onFavorite={() => handleFavoriteTask(task._id, task.favorite)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {showModal && (
          <TaskModal
            task={editingTask}
            onSave={editingTask ? (data) => handleUpdateTask(editingTask._id, data) : handleCreateTask}
            onClose={() => {
              setShowModal(false)
              setEditingTask(null)
            }}
            categories={uniqueCategories}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function OverviewSection({
  tasks,
  stats,
  activeFilter,
  setShowModal,
  setActiveFilter,
}: {
  tasks: Task[]
  stats: any
  activeFilter: TaskFilterType
  setShowModal: (value: boolean) => void
  setActiveFilter: (value: TaskFilterType) => void
}) {
  const featuredTasks = tasks.filter((task) => !task.completed).slice(0, 3)
  const dueToday = tasks.filter((task) => task.dueDate && dayjs(task.dueDate).isSame(dayjs(), 'day')).length
  const activeTasks = tasks.filter((task) => !task.completed && !task.archived).length
  const highPriorityTasks = tasks.filter((task) => task.priority === 'high' || task.priority === 'critical').length
  const overdueTasks = tasks.filter((task) => task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day') && !task.completed).length

  return (
    <div className="content-grid">
      <div className="space-y-4">
        <div className="stats-grid">
          <OverviewCard label="Due Today" value={stats?.dueTodayTasks ?? dueToday} accent="bg-linear-to-r from-blue-500 to-cyan-500" />
          <OverviewCard label="Completed" value={stats?.completedTasks ?? tasks.filter((task) => task.completed).length} accent="bg-linear-to-r from-emerald-500 to-teal-500" />
          <OverviewCard label="Active" value={stats?.activeTasks ?? activeTasks} accent="bg-linear-to-r from-purple-500 to-fuchsia-500" />
          <OverviewCard label="High Priority" value={stats?.highPriorityTasks ?? highPriorityTasks} accent="bg-linear-to-r from-amber-500 to-orange-500" />
          <OverviewCard label="Overdue" value={stats?.overdueTasks ?? overdueTasks} accent="bg-linear-to-r from-rose-500 to-red-500" />
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Task list</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Primary working queue for your selected view.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-700">
              + Add Task
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {featuredTasks.length === 0 ? (
              <EmptyState filter={activeFilter} />
            ) : (
              featuredTasks.map((task) => <TaskCard key={task._id} task={task} onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} onArchive={() => {}} onPin={() => {}} onFavorite={() => {}} />)
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6 self-start">
        <div className="card-surface p-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Featured tasks</h3>
          <div className="mt-3 space-y-3">
            {featuredTasks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No active tasks to highlight.</p>
            ) : (
              featuredTasks.map((task) => <TaskCard key={task._id} task={task} onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} onArchive={() => {}} onPin={() => {}} onFavorite={() => {}} />)
            )}
          </div>
        </div>

        <div className="card-surface p-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Quick actions</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button onClick={() => setShowModal(true)} className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-purple-50 hover:text-purple-700 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-purple-900/30">
              Add Task
            </button>
            <button onClick={() => setActiveFilter('high-priority')} className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-purple-50 hover:text-purple-700 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-purple-900/30">
              Focus High Priority
            </button>
          </div>
        </div>

        <div className="card-surface p-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Productivity summary</h3>
          <div className="mt-3 space-y-3 text-sm">
            <SummaryRow label="Search filter" value={activeFilter} />
            <SummaryRow label="Featured tasks" value={featuredTasks.length} />
            <SummaryRow label="Completion rate" value={`${stats?.completionRate ?? 0}%`} />
          </div>
        </div>
      </aside>
    </div>
  )
}

function CalendarSection({ tasks }: { tasks: Task[] }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Task calendar</h3>
      <div className="mt-4 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No scheduled tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-700/60">
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{task.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{task.category || 'General'}</p>
              </div>
              <div className="text-right text-sm text-gray-600 dark:text-gray-300">
                <p>{task.dueDate ? dayjs(task.dueDate).format('MMM D') : 'No date'}</p>
                <p>{task.dueTime || 'Any time'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ProjectsSection({ groups }: { groups: Array<{ category: string; tasks: Task[] }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 md:col-span-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">No projects yet.</p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.category} className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{group.category || 'General'}</h3>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-200">{group.tasks.length}</span>
            </div>
            <div className="mt-3 space-y-2">
              {group.tasks.slice(0, 4).map((task) => (
                <p key={task._id} className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-700/60 dark:text-gray-200">{task.title}</p>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function OverviewCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="card-surface-compact p-4">
      <div className={`h-1.5 w-16 rounded-full ${accent}`} />
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-gray-800 dark:text-white">{value}</p>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      <span className="font-semibold text-gray-800 dark:text-white">{value}</span>
    </div>
  )
}

interface EmptyStateProps {
  filter: TaskFilterType
}

function EmptyState({ filter }: EmptyStateProps) {
  const emptyStates: Record<TaskFilterType, { icon: string; title: string; message: string }> = {
    all: {
      icon: '📭',
      title: 'No Tasks Yet',
      message: 'Create your first task to get started!',
    },
    today: {
      icon: '☀️',
      title: 'No Tasks for Today',
      message: 'Enjoy your day or add a new task!',
    },
    upcoming: {
      icon: '🗓️',
      title: 'No Upcoming Tasks',
      message: 'You\'re all caught up!',
    },
    completed: {
      icon: '🎉',
      title: 'No Completed Tasks',
      message: 'Complete some tasks to see them here',
    },
    overdue: {
      icon: '✨',
      title: 'No Overdue Tasks',
      message: 'All caught up on your deadlines!',
    },
    'high-priority': {
      icon: '🚀',
      title: 'No High Priority Tasks',
      message: 'Everything is under control!',
    },
    pinned: {
      icon: '📌',
      title: 'No Pinned Tasks',
      message: 'Pin important tasks to find them quickly',
    },
    favorites: {
      icon: '⭐',
      title: 'No Favorite Tasks',
      message: 'Add tasks to your favorites',
    },
  }

  const state = emptyStates[filter] || emptyStates.all

  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="text-6xl mb-4">{state.icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {state.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {state.message}
        </p>
      </div>
    </div>
  )
}
