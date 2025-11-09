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

// Vendor routes (specific routes must come before /:id)
router.post('/', authenticate, authorize('vendor'), createVendor);
router.put('/status/toggle', authenticate, authorize('vendor'), toggleOrderAcceptance);
router.get('/dashboard/stats', authenticate, authorize('vendor'), getVendorDashboard);
router.get('/reports/sales', authenticate, authorize('vendor'), getSalesReport);
router.get('/reports/popular-menus', authenticate, authorize('vendor'), getPopularMenus);
router.put('/:id', authenticate, authorize('vendor'), updateVendor);

// Public routes (must come after specific routes)
router.get('/:id', getVendorById);

export default router;
