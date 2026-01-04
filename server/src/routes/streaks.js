import express from 'express';
import * as streakController from '../controllers/streakController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/:id', authMiddleware, streakController.getStreak);
router.put('/:id', authMiddleware, streakController.updateStreak);
router.get('/', authMiddleware, streakController.getAllStreaks);

export default router;
