import express from 'express';
import {
  requestReport,
  getReportRequests,
  generateReport,
  updateReportData,
  getReportById,
  getVendorsForReport,
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Vendor routes
router.post('/request', authenticate, authorize('vendor'), requestReport);

// Admin routes
router.get('/requests', authenticate, authorize('admin'), getReportRequests);
router.get('/requests/:requestId', authenticate, authorize('admin'), getReportById);
router.post('/generate/:requestId', authenticate, authorize('admin'), generateReport);
router.put('/update/:requestId', authenticate, authorize('admin'), updateReportData);
router.get('/vendors', authenticate, authorize('admin'), getVendorsForReport);

export default router;
