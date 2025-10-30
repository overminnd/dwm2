// ===================================
// src/routes/productRoutes.js
// ===================================
import express from 'express';
import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  retireProduct,
  updateStock,
  checkAvailability,
  addImages,
  getRelatedProducts
} from '../controllers/productController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.get('/:id/availability', checkAvailability);
router.get('/:id/related', getRelatedProducts);

// Rutas de administrador
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.put('/:id/publish', protect, authorize('admin'), publishProduct);
router.put('/:id/retire', protect, authorize('admin'), retireProduct);
router.put('/:id/stock', protect, authorize('admin'), updateStock);
router.post('/:id/images', protect, authorize('admin'), addImages);

export default router;