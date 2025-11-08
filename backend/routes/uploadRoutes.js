import express from 'express';
import { uploadMenuImage, deleteMenuImage } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// Upload menu image (vendor only)
router.post(
  '/menu-image',
  authenticate,
  authorize('vendor'),
  upload.single('image'),
  uploadMenuImage
);

// Delete menu image (vendor only)
router.delete(
  '/menu-image/:filename',
  authenticate,
  authorize('vendor'),
  deleteMenuImage
);

export default router;
