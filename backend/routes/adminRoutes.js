import express from 'express';
import {
  getAllUsers,
  toggleUserBan,
  getAllVendors,
  approveVendor,
  suspendVendor,
  getAllOrders,
  getSystemReports,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require admin role
router.use(authenticate, authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleUserBan);

// Vendor management
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/suspend', suspendVendor);

// Order management
router.get('/orders', getAllOrders);

// Reports
router.get('/reports', getSystemReports);

export default router;
