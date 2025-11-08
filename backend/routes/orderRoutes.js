import express from 'express';
import {
  createOrder,
  getUserOrders,
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { orderLimiter } from '../middleware/rateLimiter.js';
import { validateOrder } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Customer routes
router.post('/', authenticate, authorize('customer'), orderLimiter, validateOrder, createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/cancel', authenticate, authorize('customer'), cancelOrder);

// Vendor routes
router.get('/vendor/orders', authenticate, authorize('vendor'), getVendorOrders);
router.put('/:id/status', authenticate, authorize('vendor'), updateOrderStatus);

export default router;
