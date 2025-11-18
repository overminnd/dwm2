// ============================================
// CONFIGURACIÓN GLOBAL DEL PROYECTO
// ============================================

// URLs base
export const BASE_PATH = '/MARAZUL/MARAZUL';
export const API_BASE_URL = 'http://localhost:5000/api';

// Rutas de la aplicación
export const ROUTES = {
  HOME: `${BASE_PATH}/index.html`,
  LOGIN: `${BASE_PATH}/components/login.html`,
  REGISTRO: `${BASE_PATH}/components/registro.html`,
  HISTORIAL: `${BASE_PATH}/components/historial.html`,
  AJUSTES: `${BASE_PATH}/components/ajustes.html`,
  CONTACTO: `${BASE_PATH}/components/contacto.html`,
  QUIENES_SOMOS: `${BASE_PATH}/components/quienes-somos.html`
};

// Endpoints de la API
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  
  // Users
  USER_PROFILE: `${API_BASE_URL}/users/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/products`,
  FEATURED_PRODUCTS: `${API_BASE_URL}/products/featured`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
  
  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`,
  ACTIVE_CATEGORIES: `${API_BASE_URL}/categories/active`,
  
  // Cart
  CART: `${API_BASE_URL}/cart`,
  ADD_TO_CART: `${API_BASE_URL}/cart/add`,
  UPDATE_CART_ITEM: (id) => `${API_BASE_URL}/cart/items/${id}`,
  REMOVE_FROM_CART: (id) => `${API_BASE_URL}/cart/items/${id}`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/orders`,
  ORDER_BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
  
  // Addresses
  ADDRESSES: `${API_BASE_URL}/addresses`,
  ADDRESS_BY_ID: (id) => `${API_BASE_URL}/addresses/${id}`,
  
  // Banners
  ACTIVE_BANNERS: `${API_BASE_URL}/banners/active`,
  
  // Contact
  CONTACT: `${API_BASE_URL}/contact`
};

// Configuración del localStorage
export const STORAGE_KEYS = {
  USER: 'marazul_current_user',
  TOKEN: 'marazul_token',
  CART_COUNT: 'marazul_cart_count',
  CART_ITEMS: 'marazul_cart_items'
};

// Configuración general
export const CONFIG = {
  ITEMS_PER_PAGE: 12,
  FEATURED_PRODUCTS_LIMIT: 6,
  MAX_CART_QUANTITY: 99,
  MIN_PASSWORD_LENGTH: 6
};