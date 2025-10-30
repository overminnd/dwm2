// ===================================
// src/middlewares/auth.js
// ===================================
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { config } from '../config/config.js';

// @desc    Proteger rutas - Verificar que el usuario esté autenticado
export const protect = async (req, res, next) => {
  try {
    let token;

    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar que existe el token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, token no proporcionado'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, config.jwtSecret);

      // Buscar usuario por ID del token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar que el usuario esté activo
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Cuenta desactivada'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
};

// @desc    Autorizar roles específicos
// @usage   authorize('admin') o authorize('admin', 'customer')
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Rol ${req.user.role} no tiene permisos para realizar esta acción`
      });
    }

    next();
  };
};