import express from 'express';
import * as challengeController from '../controllers/challengeController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authMiddleware, challengeController.createChallenge);
router.get('/', authMiddleware, challengeController.getChallenges);
router.get('/:id', authMiddleware, challengeController.getChallengeById);
router.put('/:id', authMiddleware, challengeController.updateChallenge);
router.put('/:id/progress', authMiddleware, challengeController.updateChallengeProgress);
router.delete('/:id', authMiddleware, challengeController.deleteChallenge);

export default router;
