/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MARAZUL E-COMMERCE - CONFIGURACIÓN GLOBAL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este archivo centraliza TODA la configuración del frontend.
 * 
 * IMPORTANTE: 
 * - Ajustar BASE_PATH según el entorno (desarrollo/producción)
 * - Ajustar API_URL según donde corra el backend
 * 
 * Fecha: 26 Noviembre 2025
 * Versión: 1.0.2 - CORREGIDO: TOKEN ahora usa 'marazul_auth_token'
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// DETECCIÓN DE ENTORNO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detecta si estamos en producción o desarrollo
 */
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

/**
 * Detecta si estamos en XAMPP (puerto 8080 o ruta MARAZUL)
 */
const isXAMPP = window.location.port === '8080' || 
                window.location.pathname.includes('MARAZUL');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE RUTAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ruta base del proyecto
 * 
 * Desarrollo (XAMPP): /MARAZUL/MARAZUL/frontend
 * Producción (AWS):   / (raíz)
 */
const BASE_PATH = isProduction ? '' : '/MARAZUL/MARAZUL/frontend';

/**
 * URL del backend API
 * 
 * Desarrollo: http://localhost:5000/api
 * Producción: https://api.marazul.com/api (ajustar según deployment)
 */
const API_URL = isProduction 
  ? 'https://api.marazul.com/api'  // TODO: Ajustar en producción
  : 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════════════════════
// RUTAS DE PÁGINAS PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════

const ROUTES = {
  // Página principal
  HOME: `${BASE_PATH}/index.html`,
  
  // Páginas de autenticación
  LOGIN: `${BASE_PATH}/components/login.html`,
  REGISTRO: `${BASE_PATH}/components/registro.html`,
  
  // Páginas de usuario
  AJUSTES: `${BASE_PATH}/components/ajustes.html`,
  HISTORIAL: `${BASE_PATH}/components/historial.html`,
  
  // Páginas informativas
  CONTACTO: `${BASE_PATH}/components/contacto.html`,
  QUIENES_SOMOS: `${BASE_PATH}/components/quienes-somos.html`,
};

// ═══════════════════════════════════════════════════════════════════════════
// RUTAS DE COMPONENTES HTML
// ═══════════════════════════════════════════════════════════════════════════

const COMPONENTS = {
  HEADER: `${BASE_PATH}/components/header.html`,
  CARRITO: `${BASE_PATH}/components/carrito.html`,
  CARRUSEL: `${BASE_PATH}/components/carrusel.html`,
  CATEGORIAS: `${BASE_PATH}/components/categorias.html`,
  PRODUCTO_DESTACADO: `${BASE_PATH}/components/ProductoDestacado.html`,
  CATALOGO: `${BASE_PATH}/components/catalogo.html`,
};

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINTS DE LA API
// ═══════════════════════════════════════════════════════════════════════════

const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me'
  },

  PRODUCTS: {
    ALL: '/products',
    BY_ID: (id) => `/products/${id}`
  },

  CATEGORIES: {
    ALL: '/categories'
  },

  CART: {
    GET: '/cart',                                   // GET carrito completo
    ADD: '/cart/items',                             // POST añadir producto
    UPDATE: (itemId) => `/cart/items/${itemId}`,    // PUT actualizar item
    DELETE: (itemId) => `/cart/items/${itemId}`,    // DELETE eliminar item
    CLEAR: '/cart/clear',                           // DELETE vaciar carrito
    TOTAL: '/cart/total'                            // GET total del carrito
},


  ORDERS: {
    CREATE: '/orders',
    HISTORY: '/orders',
    BY_ID: (id) => `/orders/${id}`,
    ITEMS: (id) => `/orders/${id}/items`,
    CANCEL: (id) => `/orders/${id}/cancel`,
  },

  CONTACT: {
    SEND: '/contact'
  },

  REVIEWS: {
    FOR_PRODUCT: (id) => `/reviews/product/${id}`,
    ADD: (id) => `/reviews/${id}`
  }
};



// ═══════════════════════════════════════════════════════════════════════════
// LLAVES DE LOCALSTORAGE
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  // Autenticación
  TOKEN: 'marazul_auth_token',      // ✅ CORREGIDO: Coincide con login.js y auth.js
  USER: 'marazul_current_user',     // ✅ Correcta
  
  // Carrito
  CART: 'marazul_cart_v1',
  
  // Preferencias
  PREFERENCES: 'marazul_preferences',
  THEME: 'marazul_theme',
};

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE UI
// ═══════════════════════════════════════════════════════════════════════════

const UI_CONFIG = {
  // Tiempos de animación (ms)
  TOAST_DURATION: 3000,
  FADE_DURATION: 300,
  SLIDE_DURATION: 400,
  
  // Límites
  MAX_CART_ITEMS: 50,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Paginación
  PRODUCTS_PER_PAGE: 12,
  ORDERS_PER_PAGE: 10,
};

// ═══════════════════════════════════════════════════════════════════════════
// IMÁGENES Y RECURSOS
// ═══════════════════════════════════════════════════════════════════════════

const IMAGES = {
  // Imagen por defecto cuando no hay imagen de producto o cuando falla la carga
  DEFAULT_IMAGE: 'https://picsum.photos/seed/marazul-default/400/300',
  
  // Logo
  LOGO: `${BASE_PATH}/assets/logo.png`,
  
  // Placeholders
  PLACEHOLDER_PRODUCT: 'https://picsum.photos/seed/product/400/300',
  PLACEHOLDER_USER: 'https://ui-avatars.com/api/?name=Usuario&background=003366&color=fff',
};

// ═══════════════════════════════════════════════════════════════════════════
// MENSAJES DEL SISTEMA
// ═══════════════════════════════════════════════════════════════════════════

const MESSAGES = {
  // Éxito
  SUCCESS: {
    LOGIN: '¡Bienvenido de vuelta!',
    LOGOUT: 'Sesión cerrada correctamente',
    REGISTER: '¡Registro exitoso! Bienvenido a MarAzul',
    CART_ADD: 'Producto agregado al carrito',
    CART_REMOVE: 'Producto eliminado del carrito',
    ORDER_CREATED: '¡Pedido creado exitosamente!',
  },
  
  // Error
  ERROR: {
    GENERIC: 'Ocurrió un error. Por favor intenta nuevamente.',
    NETWORK: 'Error de conexión. Verifica tu internet.',
    UNAUTHORIZED: 'Debes iniciar sesión para continuar.',
    NOT_FOUND: 'El recurso solicitado no fue encontrado.',
    SERVER: 'Error del servidor. Intenta más tarde.',
    VALIDATION: 'Por favor verifica los datos ingresados.',
  },
  
  // Advertencia
  WARNING: {
    UNSAVED_CHANGES: 'Tienes cambios sin guardar. ¿Deseas continuar?',
    DELETE_CONFIRM: '¿Estás seguro de eliminar este elemento?',
    CLEAR_CART: '¿Deseas vaciar el carrito completamente?',
  },
  
  // Información
  INFO: {
    LOADING: 'Cargando...',
    EMPTY_CART: 'Tu carrito está vacío',
    NO_RESULTS: 'No se encontraron resultados',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIONES
// ═══════════════════════════════════════════════════════════════════════════

const VALIDATION = {
  // Expresiones regulares
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^(\+?56)?(\s?)(0?9)(\s?)[9876543]\d{7}$/,
    RUT: /^[0-9]+-[0-9kK]{1}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  },
  
  // Límites
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
};

// ═══════════════════════════════════════════════════════════════════════════
// COLORES DEL SISTEMA (para referencia)
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  PRIMARY: '#003366',      // Azul corporativo (header)
  SUCCESS: '#2e7d32',      // Verde (botones éxito)
  INFO: '#4db6ac',         // Turquesa (info)
  WARNING: '#ff9800',      // Naranja (advertencias)
  DANGER: '#dc3545',       // Rojo (errores, badges)
  
  // Categorías (para iconos/badges)
  PESCADO: '#2196F3',
  MARISCOS: '#E91E63',
  CONSERVAS: '#FF9800',
  CONGELADOS: '#00BCD4',
  FRESCOS: '#4CAF50',
  PREMIUM: '#9C27B0',
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAR CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

// Hacer disponible globalmente (para compatibilidad con jQuery)
window.CONFIG = {
  // Entorno
  isProduction,
  isXAMPP,
  
  // Rutas
  BASE_PATH,
  API_URL,
  ROUTES,
  COMPONENTS,
  ENDPOINTS,
  
    // Costo fijo de envío
  SHIPPING_FLAT_FEE: 3500,

  // Storage
  STORAGE_KEYS,
  
  // UI
  UI_CONFIG,
  MESSAGES,
  VALIDATION,
  COLORS,
  
  // Imágenes (NUEVO - evita loop infinito)
  DEFAULT_IMAGE: IMAGES.DEFAULT_IMAGE,
  IMAGES,
};

// Log de configuración en desarrollo
if (!isProduction) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔧 MARAZUL - Configuración Cargada');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Entorno:', isProduction ? 'PRODUCCIÓN' : 'DESARROLLO');
  console.log('BASE_PATH:', BASE_PATH);
  console.log('API_URL:', API_URL);
  console.log('═══════════════════════════════════════════════════════');
}