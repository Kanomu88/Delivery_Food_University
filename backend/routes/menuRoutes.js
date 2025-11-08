import express from 'express';
import {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  getVendorMenuItems,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validateMenuItem } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Vendor routes
router.get('/vendor/my-menus', authenticate, authorize('vendor'), getVendorMenuItems);
router.post('/', authenticate, authorize('vendor'), validateMenuItem, createMenuItem);
router.put('/:id', authenticate, authorize('vendor'), validateMenuItem, updateMenuItem);
router.delete('/:id', authenticate, authorize('vendor'), deleteMenuItem);

export default router;
