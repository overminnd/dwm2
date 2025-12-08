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
  calculateOrderTotal,
  getAllOrdersAdmin
} from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// ADMIN primero, SIEMPRE
router.get('/admin', protect, authorize('admin'), getAllOrdersAdmin);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

// RUTAS DE USUARIO
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, createOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/:orderId/items', protect, getOrderItems);
router.get('/:id/total', protect, calculateOrderTotal);


export default router;