// ===================================
// src/routes/categoryRoutes.js
// ===================================
import express from 'express';
import {
  getAllCategories,
  getActiveCategories,
  getCategoryById,
  getCategoryProducts,
  getSubcategories,
  getParentCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllCategories);
router.get('/active', getActiveCategories);
router.get('/:id', getCategoryById);
router.get('/:id/products', getCategoryProducts);
router.get('/:id/subcategories', getSubcategories);
router.get('/:id/parent', getParentCategory);

// Rutas de administrador
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;