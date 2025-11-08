import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { validateRegistration, validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
