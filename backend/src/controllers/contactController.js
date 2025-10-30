// ===================================
// src/controllers/contactController.js
// ===================================
import { ContactMessage } from '../models/index.js';

// @desc    Enviar mensaje de contacto
// @route   POST /api/contact
// @access  Public
export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validaciones básicas
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y mensaje son obligatorios'
      });
    }

    // Validar formato de email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Crear mensaje
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : 'Sin asunto',
      message: message.trim(),
      userId: req.user ? req.user.id : null,
      read: false
    });

    res.status(201).json({
      success: true,
      data: contactMessage,
      message: 'Mensaje enviado correctamente. Te responderemos pronto.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener todos los mensajes (Admin)
// @route   GET /api/contact/messages
// @access  Private/Admin
export const getAllMessages = async (req, res) => {
  try {
    const { read, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (read === 'true') {
      filter.read = true;
    } else if (read === 'false') {
      filter.read = false;
    }

    const messages = await ContactMessage.find(filter)
      .populate('userId', 'email firstName lastName')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ContactMessage.countDocuments(filter);

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener un mensaje específico (Admin)
// @route   GET /api/contact/messages/:id
// @access  Private/Admin
export const getMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id)
      .populate('userId', 'email firstName lastName phone');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Marcar mensaje como leído (Admin)
// @route   PUT /api/contact/messages/:id/mark-read
// @access  Private/Admin
export const markMessageAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    message.read = true;
    await message.save();

    res.json({
      success: true,
      data: message,
      message: 'Mensaje marcado como leído'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener mensajes no leídos (Admin)
// @route   GET /api/contact/messages/unread
// @access  Private/Admin
export const getUnreadMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({ read: false })
      .populate('userId', 'email firstName lastName')
      .sort('-createdAt')
      .limit(50);

    const count = await ContactMessage.countDocuments({ read: false });

    res.json({
      success: true,
      data: messages,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar mensaje (Admin)
// @route   DELETE /api/contact/messages/:id
// @access  Private/Admin
export const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Mensaje eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener mensajes de un remitente específico (Admin)
// @route   GET /api/contact/messages/sender/:userId
// @access  Private/Admin
export const getMessagesBySender = async (req, res) => {
  try {
    const messages = await ContactMessage.find({ 
      userId: req.params.userId 
    })
    .populate('userId', 'email firstName lastName')
    .sort('-createdAt');

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};