import express from 'express';
import * as catController from '../controllers/catController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/mood', authMiddleware, catController.getCatMood);
router.get('/stats', authMiddleware, catController.getCatStats);
router.put('/name', authMiddleware, catController.updateCatName);

export default router;
