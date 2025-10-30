// ===================================
// src/routes/contactRoutes.js
// ===================================
import express from 'express';
import {
  sendContactMessage,
  getAllMessages,
  getMessageById,
  markMessageAsRead,
  getUnreadMessages,
  deleteMessage,
  getMessagesBySender
} from '../controllers/contactController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Ruta pública - Enviar mensaje
router.post('/', sendContactMessage);

// Rutas de administrador - Gestión de mensajes
router.get('/messages', protect, authorize('admin'), getAllMessages);
router.get('/messages/unread', protect, authorize('admin'), getUnreadMessages);
router.get('/messages/:id', protect, authorize('admin'), getMessageById);
router.put('/messages/:id/mark-read', protect, authorize('admin'), markMessageAsRead);
router.delete('/messages/:id', protect, authorize('admin'), deleteMessage);
router.get('/messages/sender/:userId', protect, authorize('admin'), getMessagesBySender);

export default router;