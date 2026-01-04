import express from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/change-username', authMiddleware, authController.changeUsername);
router.post('/logout', authMiddleware, authController.logout);

// ✅ FIX #7, #13: Export endpoint with password re-confirmation
router.post('/export', authMiddleware, authController.exportUserData);

export default router;
