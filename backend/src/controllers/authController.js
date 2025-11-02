// ===================================
// src/controllers/authController.js
// VERSIÓN CON DEBUG LOGS
// ===================================
import jwt from 'jsonwebtoken';
import { User, SessionToken } from '../models/index.js';
import { config } from '../config/config.js';

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

// Generar Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpire
  });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    console.log('📝 REGISTRO - Datos recibidos:', { email, firstName, lastName, phone });

    // Validar campos requeridos
    if (!email || !password || !firstName) {
      console.log('❌ REGISTRO - Campos faltantes');
      return res.status(400).json({
        success: false,
        message: 'Email, contraseña y nombre son obligatorios'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      console.log('❌ REGISTRO - Contraseña muy corta');
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Validar formato de teléfono (si se proporciona)
    if (phone && !/^[0-9]{8,9}$/.test(phone)) {
      console.log('❌ REGISTRO - Teléfono inválido');
      return res.status(400).json({
        success: false,
        message: 'Teléfono inválido (debe tener 8-9 dígitos)'
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      console.log('❌ REGISTRO - Email ya existe:', email);
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone
    });

    console.log('✅ REGISTRO - Usuario creado:', user.email);

    // Generar tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Guardar session token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 días

    await SessionToken.create({
      userId: user._id,
      token,
      refreshToken,
      expiresAt
    });

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      message: 'Usuario registrado correctamente'
    });
  } catch (error) {
    console.error('❌ REGISTRO - Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('\n=================================');
    console.log('🔐 LOGIN INICIADO');
    console.log('=================================');
    console.log('📧 Email recibido:', email);
    console.log('🔑 Password recibido:', password);
    console.log('📏 Longitud password:', password ? password.length : 0);

    // Validar campos
    if (!email || !password) {
      console.log('❌ LOGIN - Campos faltantes');
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona email y contraseña'
      });
    }

    // Buscar usuario
    console.log('🔍 Buscando usuario en BD...');
    const user = await User.findOne({ email: email.toLowerCase() });
    
    console.log('👤 Usuario encontrado:', user ? 'SÍ ✅' : 'NO ❌');
    
    if (user) {
      console.log('📋 Datos del usuario en BD:');
      console.log('   - ID:', user._id);
      console.log('   - Email:', user.email);
      console.log('   - firstName:', user.firstName);
      console.log('   - Role:', user.role);
      console.log('   - isActive:', user.isActive);
      console.log('   - Password hash (primeros 20 chars):', user.password.substring(0, 20) + '...');
    }

    if (!user) {
      console.log('❌ LOGIN - Usuario no encontrado');
      console.log('=================================\n');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    console.log('🔐 Comparando contraseñas...');
    console.log('   - Password ingresado:', password);
    console.log('   - Método comparePassword existe:', typeof user.comparePassword);
    
    const isMatch = await user.comparePassword(password);
    
    console.log('✅ Resultado de comparación:', isMatch ? 'COINCIDE ✅' : 'NO COINCIDE ❌');

    if (!isMatch) {
      console.log('❌ LOGIN - Contraseña incorrecta');
      console.log('=================================\n');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!user.isActive) {
      console.log('❌ LOGIN - Cuenta desactivada');
      console.log('=================================\n');
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    console.log('🎫 Generando tokens...');
    
    // Generar tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    console.log('💾 Guardando sesión...');

    // Guardar session token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await SessionToken.create({
      userId: user._id,
      token,
      refreshToken,
      expiresAt
    });

    console.log('✅ LOGIN EXITOSO');
    console.log('=================================\n');

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      message: 'Inicio de sesión exitoso'
    });
  } catch (error) {
    console.error('❌ LOGIN - Error:', error);
    console.error('Stack trace:', error.stack);
    console.log('=================================\n');
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cerrar sesión
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Obtener token del header
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      // Eliminar session token
      await SessionToken.deleteOne({ token });
    }

    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Renovar token con refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);

    // Buscar session token
    const session = await SessionToken.findOne({ 
      userId: decoded.id,
      refreshToken 
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      });
    }

    // Generar nuevo token
    const newToken = generateToken(decoded.id);

    // Actualizar session
    session.token = newToken;
    await session.save();

    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Refresh token inválido o expirado'
    });
  }
};

// @desc    Validar token actual
// @route   POST /api/auth/validate-token
// @access  Public
export const validateToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token requerido',
        valid: false
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Buscar usuario
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.json({
        success: false,
        message: 'Token inválido',
        valid: false
      });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Token inválido o expirado',
      valid: false
    });
  }
};

// @desc    Invalidar todos los tokens de un usuario
// @route   POST /api/auth/invalidate-user-tokens
// @access  Private
export const invalidateAllUserTokens = async (req, res) => {
  try {
    // Eliminar todos los tokens del usuario
    await SessionToken.deleteMany({ userId: req.user.id });

    res.json({
      success: true,
      message: 'Todas las sesiones han sido cerradas'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};