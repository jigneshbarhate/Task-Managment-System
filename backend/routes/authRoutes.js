import express from 'express';
import * as authController from '../controllers/authController.js';
import * as authValidator from '../validators/authValidator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', authValidator.registerValidator, authController.register);
router.post('/login', authValidator.loginValidator, authController.login);
router.post('/logout', authController.logout);

router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authValidator.profileValidator, authController.updateProfile);
router.put('/change-password', protect, authValidator.changePasswordValidator, authController.changePassword);

export default router;
