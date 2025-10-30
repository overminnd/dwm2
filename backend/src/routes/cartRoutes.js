// ===================================
// src/routes/cartRoutes.js
// ===================================
import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartTotal,
  markCartAsAbandoned
} from '../controllers/cartController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas del carrito requieren autenticación
router.get('/', protect, getCart);
router.post('/items', protect, addItemToCart);
router.put('/items/:itemId', protect, updateCartItem);
router.delete('/items/:itemId', protect, removeCartItem);
router.delete('/clear', protect, clearCart);
router.get('/total', protect, getCartTotal);
router.post('/mark-abandoned', protect, markCartAsAbandoned);

export default router;