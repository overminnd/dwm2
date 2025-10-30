// ===================================
// src/routes/reviewRoutes.js
// ===================================
import express from 'express';
import {
  getProductReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getAverageRating,
  listByProduct,
  canUserReview,
  getUserReviews
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/:id', getReviewById);
router.post('/list-by-product', listByProduct);

// Rutas protegidas
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.get('/can-review/:productId', protect, canUserReview);
router.get('/my-reviews', protect, getUserReviews);

// Nota: Las rutas de reseñas por producto están en productRoutes
// GET /api/products/:productId/reviews
// GET /api/products/:productId/reviews/average

export default router;