// ===================================
// src/routes/orderRoutes.js
// ===================================
import express from 'express';
import {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  updateOrderStatus,
  getOrderItems,
  calculateOrderTotal
} from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Rutas protegidas - Usuario
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, createOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/:orderId/items', protect, getOrderItems);
router.get('/:id/total', protect, calculateOrderTotal);

// Rutas de administrador
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

export default router;