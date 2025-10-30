// ===================================
// src/routes/authRoutes.js
// ===================================
import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  validateToken,
  invalidateAllUserTokens
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/validate-token', validateToken);

// Rutas protegidas (requieren autenticación)
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/invalidate-user-tokens', protect, invalidateAllUserTokens);

export default router;