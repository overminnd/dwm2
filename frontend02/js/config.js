/**
 * ============================================================================
 * MARAZUL - Configuración Global
 * ============================================================================
 * 
 * Archivo: config.js
 * Descripción: Constantes y configuración global del frontend
 * Versión: 1.0
 * 
 * IMPORTANTE: Este archivo debe ser importado primero en todos los módulos
 * que necesiten acceder a configuración global.
 */

// ============================================================================
// RUTAS Y PATHS
// ============================================================================

/**
 * Ruta base del proyecto en XAMPP
 * Ajustar según tu configuración local
 */
export const BASE_PATH = '/MARAZUL/MARAZUL/frontend02';

/**
 * URL del backend API
 * Puerto por defecto: 5000
 */
export const API_URL = 'http://localhost:5000/api';

/**
 * Rutas de páginas principales
 */
export const ROUTES = {
  HOME: `${BASE_PATH}/index.html`,
  LOGIN: `${BASE_PATH}/components/login.html`,
  REGISTRO: `${BASE_PATH}/components/registro.html`,
  AJUSTES: `${BASE_PATH}/components/ajustes.html`,
  HISTORIAL: `${BASE_PATH}/components/historial.html`,
  CONTACTO: `${BASE_PATH}/components/contacto.html`,
  QUIENES_SOMOS: `${BASE_PATH}/components/quienes-somos.html`
};

/**
 * Rutas de componentes HTML
 */
export const COMPONENTS = {
  HEADER: `${BASE_PATH}/components/header.html`,
  CARRITO: `${BASE_PATH}/components/carrito.html`,
  CARRUSEL: `${BASE_PATH}/components/carrusel.html`,
  CATEGORIAS: `${BASE_PATH}/components/categorias.html`,
  PRODUCTO_DESTACADO: `${BASE_PATH}/components/ProductoDestacado.html`,
  CATALOGO: `${BASE_PATH}/components/catalogo.html`
};

// ============================================================================
// ENDPOINTS API
// ============================================================================

/**
 * Endpoints del backend
 */
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  VERIFY_TOKEN: `${API_URL}/auth/verify`,
  
  // Usuarios
  USER_PROFILE: `${API_URL}/users/profile`,
  UPDATE_PROFILE: `${API_URL}/users/profile`,
  CHANGE_PASSWORD: `${API_URL}/users/change-password`,
  
  // Productos
  PRODUCTS: `${API_URL}/products`,
  PRODUCT_BY_ID: (id) => `${API_URL}/products/${id}`,
  FEATURED_PRODUCTS: `${API_URL}/products/featured`,
  PRODUCTS_BY_CATEGORY: (categoryId) => `${API_URL}/products/category/${categoryId}`,
  SEARCH_PRODUCTS: `${API_URL}/products/search`,
  
  // Categorías
  CATEGORIES: `${API_URL}/categories`,
  ACTIVE_CATEGORIES: `${API_URL}/categories/active`,
  CATEGORY_BY_ID: (id) => `${API_URL}/categories/${id}`,
  
  // Carrito
  CART: `${API_URL}/cart`,
  ADD_TO_CART: `${API_URL}/cart/add`,
  UPDATE_CART_ITEM: (itemId) => `${API_URL}/cart/item/${itemId}`,
  REMOVE_FROM_CART: (itemId) => `${API_URL}/cart/item/${itemId}`,
  CLEAR_CART: `${API_URL}/cart/clear`,
  
  // Pedidos
  ORDERS: `${API_URL}/orders`,
  ORDER_BY_ID: (id) => `${API_URL}/orders/${id}`,
  CREATE_ORDER: `${API_URL}/orders`,
  
  // Direcciones
  ADDRESSES: `${API_URL}/addresses`,
  ADDRESS_BY_ID: (id) => `${API_URL}/addresses/${id}`,
  DEFAULT_ADDRESS: `${API_URL}/addresses/default`,
  
  // Contacto
  CONTACT: `${API_URL}/contact`
};

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

/**
 * Claves para localStorage
 * Usar estas constantes para evitar errores de tipeo
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'marazul_auth_token',
  USER_DATA: 'marazul_user_data',
  CART_ITEMS: 'marazul_cart_items',
  LAST_VISIT: 'marazul_last_visit',
  PREFERENCES: 'marazul_preferences',
  SEARCH_HISTORY: 'marazul_search_history'
};

// ============================================================================
// CONFIGURACIÓN DE UI
// ============================================================================

/**
 * Configuración de elementos de interfaz
 */
export const UI_CONFIG = {
  // Carrusel
  CAROUSEL: {
    INTERVAL: 5000, // 5 segundos
    PAUSE: 'hover',
    WRAP: true
  },
  
  // Paginación
  PAGINATION: {
    ITEMS_PER_PAGE: 12,
    MAX_PAGES_SHOWN: 5
  },
  
  // Modales
  MODAL: {
    BACKDROP: 'static',
    KEYBOARD: false
  },
  
  // Toasts/Alertas
  TOAST: {
    DURATION: 3000, // 3 segundos
    POSITION: 'top-end'
  },
  
  // Loading
  LOADING: {
    MIN_DURATION: 300, // mínimo 300ms para evitar flicker
    SPINNER_SIZE: 'md'
  }
};

// ============================================================================
// VALIDACIONES
// ============================================================================

/**
 * Expresiones regulares y reglas de validación
 */
export const VALIDATION = {
  // Email
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Teléfono chileno (formato: +56912345678 o 912345678)
  PHONE_REGEX: /^(\+?56)?[9][0-9]{8}$/,
  
  // RUT chileno (formato: 12345678-9 o 12.345.678-9)
  RUT_REGEX: /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9Kk]$/,
  
  // Contraseña (mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número)
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  
  // Longitudes
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_ADDRESS_LENGTH: 5,
  MAX_ADDRESS_LENGTH: 200
};

// ============================================================================
// MENSAJES
// ============================================================================

/**
 * Mensajes predefinidos del sistema
 */
export const MESSAGES = {
  // Éxito
  SUCCESS: {
    LOGIN: '¡Bienvenido! Has iniciado sesión correctamente',
    REGISTER: 'Cuenta creada exitosamente. Por favor inicia sesión',
    PROFILE_UPDATED: 'Perfil actualizado correctamente',
    PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
    ADDED_TO_CART: 'Producto agregado al carrito',
    ORDER_CREATED: '¡Pedido realizado con éxito!',
    CONTACT_SENT: 'Mensaje enviado. Te responderemos pronto'
  },
  
  // Errores
  ERROR: {
    GENERIC: 'Ha ocurrido un error. Por favor intenta nuevamente',
    NETWORK: 'Error de conexión. Verifica tu internet',
    UNAUTHORIZED: 'Sesión expirada. Por favor inicia sesión nuevamente',
    INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
    EMAIL_EXISTS: 'Este email ya está registrado',
    INVALID_TOKEN: 'Token inválido o expirado',
    EMPTY_CART: 'El carrito está vacío',
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
    INSUFFICIENT_STOCK: 'Stock insuficiente',
    INVALID_QUANTITY: 'Cantidad inválida'
  },
  
  // Validación
  VALIDATION: {
    REQUIRED_FIELD: 'Este campo es obligatorio',
    INVALID_EMAIL: 'Email inválido',
    INVALID_PHONE: 'Teléfono inválido (ej: +56912345678)',
    INVALID_RUT: 'RUT inválido (ej: 12.345.678-9)',
    INVALID_PASSWORD: 'La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número',
    PASSWORD_MISMATCH: 'Las contraseñas no coinciden',
    MIN_LENGTH: (min) => `Mínimo ${min} caracteres`,
    MAX_LENGTH: (max) => `Máximo ${max} caracteres`
  },
  
  // Confirmaciones
  CONFIRM: {
    LOGOUT: '¿Estás seguro que deseas cerrar sesión?',
    DELETE_ADDRESS: '¿Eliminar esta dirección?',
    CLEAR_CART: '¿Vaciar el carrito?',
    CANCEL_ORDER: '¿Cancelar este pedido?'
  }
};

// ============================================================================
// CONFIGURACIÓN DE CARRITO
// ============================================================================

/**
 * Configuración específica del carrito
 */
export const CART_CONFIG = {
  MAX_QUANTITY_PER_ITEM: 99,
  MIN_QUANTITY_PER_ITEM: 1,
  SYNC_INTERVAL: 30000, // 30 segundos para sincronización con backend
  AUTO_SAVE: true
};

// ============================================================================
// CONFIGURACIÓN DE PRODUCTOS
// ============================================================================

/**
 * Configuración de productos
 */
export const PRODUCT_CONFIG = {
  DEFAULT_IMAGE: `${BASE_PATH}/assets/images/placeholder-product.jpg`,
  IMAGE_SIZES: {
    THUMBNAIL: 'small',
    CARD: 'medium',
    DETAIL: 'large'
  },
  FEATURED_LIMIT: 6, // Cantidad de productos destacados en home
  RECENT_LIMIT: 8 // Cantidad de productos recientes
};

// ============================================================================
// ESTADOS DE PEDIDOS
// ============================================================================

/**
 * Estados posibles de pedidos
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

/**
 * Etiquetas en español para estados de pedidos
 */
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pendiente',
  [ORDER_STATUS.CONFIRMED]: 'Confirmado',
  [ORDER_STATUS.PROCESSING]: 'En preparación',
  [ORDER_STATUS.SHIPPED]: 'Enviado',
  [ORDER_STATUS.DELIVERED]: 'Entregado',
  [ORDER_STATUS.CANCELLED]: 'Cancelado'
};

/**
 * Clases CSS para badges de estado
 */
export const ORDER_STATUS_CLASSES = {
  [ORDER_STATUS.PENDING]: 'bg-warning',
  [ORDER_STATUS.CONFIRMED]: 'bg-info',
  [ORDER_STATUS.PROCESSING]: 'bg-primary',
  [ORDER_STATUS.SHIPPED]: 'bg-secondary',
  [ORDER_STATUS.DELIVERED]: 'bg-success',
  [ORDER_STATUS.CANCELLED]: 'bg-danger'
};

// ============================================================================
// CONFIGURACIÓN DE DESARROLLO
// ============================================================================

/**
 * Modo de desarrollo (cambiar a false en producción)
 */
export const DEV_MODE = true;

/**
 * Nivel de logging (0: none, 1: errors, 2: warnings, 3: info, 4: debug)
 */
export const LOG_LEVEL = DEV_MODE ? 4 : 1;

/**
 * Mock data (usar datos simulados cuando backend no está disponible)
 */
export const USE_MOCK_DATA = false;

// ============================================================================
// FUNCIONES HELPER DE CONFIGURACIÓN
// ============================================================================

/**
 * Obtiene la URL completa de un asset
 * @param {string} path - Ruta relativa del asset
 * @returns {string} URL completa
 */
export function getAssetUrl(path) {
  return `${BASE_PATH}/assets/${path}`;
}

/**
 * Construye URL con query parameters
 * @param {string} baseUrl - URL base
 * @param {Object} params - Objeto con parámetros
 * @returns {string} URL con query string
 */
export function buildUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}

/**
 * Verifica si estamos en modo desarrollo
 * @returns {boolean}
 */
export function isDevelopment() {
  return DEV_MODE;
}

/**
 * Verifica si se debe mostrar log según nivel
 * @param {number} level - Nivel del mensaje
 * @returns {boolean}
 */
export function shouldLog(level) {
  return level <= LOG_LEVEL;
}

// ============================================================================
// EXPORTS DEFAULT
// ============================================================================

export default {
  BASE_PATH,
  API_URL,
  ROUTES,
  COMPONENTS,
  API_ENDPOINTS,
  STORAGE_KEYS,
  UI_CONFIG,
  VALIDATION,
  MESSAGES,
  CART_CONFIG,
  PRODUCT_CONFIG,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  DEV_MODE,
  LOG_LEVEL,
  USE_MOCK_DATA,
  getAssetUrl,
  buildUrl,
  isDevelopment,
  shouldLog
};