import express from 'express';
import {
  getAllCanteens,
  getCanteenById,
  getVendorsByCanteen,
  createCanteen,
  updateCanteen,
  deleteCanteen,
} from '../controllers/canteenController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllCanteens);
router.get('/:id', getCanteenById);
router.get('/:id/vendors', getVendorsByCanteen);

// Admin routes
router.post('/', protect, admin, createCanteen);
router.put('/:id', protect, admin, updateCanteen);
router.delete('/:id', protect, admin, deleteCanteen);

export default router;
