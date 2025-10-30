// ===================================
// src/routes/bannerRoutes.js
// ===================================
import express from 'express';
import {
  getAllBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners
} from '../controllers/bannerController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllBanners);
router.get('/active', getActiveBanners);
router.get('/:id', getBannerById);

// Rutas de administrador
router.post('/', protect, authorize('admin'), createBanner);
router.put('/:id', protect, authorize('admin'), updateBanner);
router.delete('/:id', protect, authorize('admin'), deleteBanner);
router.post('/reorder', protect, authorize('admin'), reorderBanners);

export default router;