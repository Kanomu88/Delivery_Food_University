import express from 'express';
import {
  createVendor,
  getVendorById,
  updateVendor,
  toggleOrderAcceptance,
  getVendorDashboard,
  getSalesReport,
  getPopularMenus,
} from '../controllers/vendorController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/:id', getVendorById);

// Vendor routes
router.post('/', authenticate, authorize('vendor'), createVendor);
router.put('/:id', authenticate, authorize('vendor'), updateVendor);
router.put('/status/toggle', authenticate, authorize('vendor'), toggleOrderAcceptance);
router.get('/dashboard/stats', authenticate, authorize('vendor'), getVendorDashboard);
router.get('/reports/sales', authenticate, authorize('vendor'), getSalesReport);
router.get('/reports/popular-menus', authenticate, authorize('vendor'), getPopularMenus);

export default router;
