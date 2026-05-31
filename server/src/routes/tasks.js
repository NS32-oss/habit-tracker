import express from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import {
  getAllTasks,
  getDashboardStats,
  getTask,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  archiveTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  addNote,
  bulkUpdate,
} from '../controllers/taskController.js'

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Dashboard stats
router.get('/stats', getDashboardStats)

// CRUD operations
router.get('/', getAllTasks)
router.post('/', createTask)
router.get('/:id', getTask)
router.put('/:id', updateTask)
router.patch('/:id/toggle', toggleTask)
router.delete('/:id', deleteTask)
router.patch('/:id/archive', archiveTask)

// Subtasks
router.post('/:id/subtasks', addSubtask)
router.patch('/:id/subtasks/:subtaskId/toggle', toggleSubtask)
router.delete('/:id/subtasks/:subtaskId', deleteSubtask)

// Notes
router.post('/:id/notes', addNote)

// Bulk operations
router.post('/bulk/update', bulkUpdate)

export default router
