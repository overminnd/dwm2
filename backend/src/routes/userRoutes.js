// ===================================
// src/routes/userRoutes.js
// ===================================
import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  uploadAvatar,
  deleteAvatar,
  getUserAddresses,
  getUserOrders,
  getUserCart,
  findByEmail,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Rutas protegidas - Usuario actual
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/deactivate', protect, deactivateAccount);
router.post('/upload-avatar', protect, uploadAvatar);
router.delete('/avatar', protect, deleteAvatar);
router.get('/addresses', protect, getUserAddresses);
router.get('/orders', protect, getUserOrders);
router.get('/cart', protect, getUserCart);

// Rutas de administrador
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.post('/find-by-email', protect, authorize('admin'), findByEmail);

export default router;