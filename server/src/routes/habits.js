import express from 'express';
import * as habitController from '../controllers/habitController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Habit CRUD
router.post('/', authMiddleware, habitController.createHabit);
router.get('/', authMiddleware, habitController.getHabits);
router.get('/:id', authMiddleware, habitController.getHabitById);
router.put('/:id', authMiddleware, habitController.updateHabit);
router.delete('/:id', authMiddleware, habitController.deleteHabit);

// Habit logs
router.get('/:id/logs', authMiddleware, habitController.getHabitLogs);
router.post('/:id/logs/toggle', authMiddleware, habitController.toggleHabitLog);
router.put('/:id/logs', authMiddleware, habitController.updateHabitLog);

export default router;
