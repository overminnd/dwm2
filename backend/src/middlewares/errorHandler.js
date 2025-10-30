// ===================================
// src/middlewares/errorHandler.js
// ===================================

// @desc    Middleware para manejar errores de Mongoose
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error para desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('Error completo:', err);
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: message
    });
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }

  // Error de clave duplicada (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `El ${field} ya está en uso`
    });
  }

  // Error de JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error por defecto
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// @desc    Middleware para rutas no encontradas (404)
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta ${req.originalUrl} no encontrada`);
  error.statusCode = 404;
  next(error);
};