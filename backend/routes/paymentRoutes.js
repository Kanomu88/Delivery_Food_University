import express from 'express';
import {
  initiatePayment,
  verifyPayment,
  getPaymentByOrderId,
  retryPayment,
  mockPaymentSuccess,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';
import { validatePayment } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/initiate', authenticate, paymentLimiter, validatePayment, initiatePayment);
router.post('/verify', verifyPayment); // Webhook from payment gateway
router.post('/retry/:paymentId', authenticate, paymentLimiter, retryPayment);
router.get('/:orderId', authenticate, getPaymentByOrderId);

// Mock payment for testing (remove in production)
router.post('/mock-success', authenticate, mockPaymentSuccess);

export default router;
