import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// ✅ FIX #9: Split dashboard stats into summary and today endpoints
router.get('/summary', authMiddleware, analyticsController.getDashboardSummary);
router.get('/today', authMiddleware, analyticsController.getTodayStats);
router.get('/habit/:id', authMiddleware, analyticsController.getHabitAnalytics);
router.get('/', authMiddleware, analyticsController.getDashboardStats);

export default router;
