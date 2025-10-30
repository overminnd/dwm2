// ===================================
// src/routes/addressRoutes.js
// ===================================
import express from 'express';
import {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  validateAddress,
  getDefaultAddress
} from '../controllers/addressController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas de direcciones requieren autenticación
router.get('/', protect, getUserAddresses);
router.get('/default', protect, getDefaultAddress);
router.get('/:id', protect, getAddressById);
router.post('/', protect, createAddress);
router.put('/:id', protect, updateAddress);
router.delete('/:id', protect, deleteAddress);
router.put('/:id/set-default', protect, setDefaultAddress);
router.post('/validate', protect, validateAddress);

export default router;