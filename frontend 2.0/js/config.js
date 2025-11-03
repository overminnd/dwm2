// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'MarAzul',
  APP_VERSION: '1.0.0',
  CURRENCY: 'CLP',
  CURRENCY_SYMBOL: '$',
  LOCALE: 'es-CL',
  ITEMS_PER_PAGE: 12,
  MAX_CART_ITEMS: 50
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'marazul_auth_token',
  USER: 'marazul_user',
  CART: 'marazul_cart',
  WISHLIST: 'marazul_wishlist',
  THEME: 'marazul_theme',
  LANGUAGE: 'marazul_language'
};

// Routes
export const ROUTES = {
  HOME: '/index.html',
  LOGIN: '/pages/login.html',
  REGISTER: '/pages/registro.html',
  PROFILE: '/pages/ajustes.html',
  CART: '/pages/carrito.html',
  CHECKOUT: '/pages/checkout.html',
  ORDERS: '/pages/historial.html',
  PRODUCT_DETAIL: '/pages/producto-detalle.html',
  CONTACT: '/pages/contacto.html',
  ABOUT: '/pages/quienes-somos.html'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  PROFILE: '/auth/profile',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  PRODUCTS_BY_CATEGORY: (categoryId) => `/products/category/${categoryId}`,
  PRODUCT_SEARCH: '/products/search',
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id) => `/categories/${id}`,
  
  // Cart
  CART: '/cart',
  CART_ADD: '/cart/add',
  CART_UPDATE: '/cart/update',
  CART_REMOVE: '/cart/remove',
  CART_CLEAR: '/cart/clear',
  
  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id) => `/orders/${id}`,
  CREATE_ORDER: '/orders/create',
  
  // Addresses
  ADDRESSES: '/addresses',
  ADDRESS_BY_ID: (id) => `/addresses/${id}`,
  
  // Payments
  PAYMENT_CREATE: '/payments/create',
  PAYMENT_CONFIRM: '/payments/confirm'
};

// Image placeholders
export const PLACEHOLDERS = {
  PRODUCT: '/assets/images/placeholder.jpg',
  CATEGORY: '/assets/images/placeholder.jpg',
  USER: 'https://ui-avatars.com/api/?name=Usuario&size=200&background=003366&color=fff'
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{8,9}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD [de] MMMM [de] YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm'
};

// Order Status
export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash'
};

export default {
  API_CONFIG,
  APP_CONFIG,
  STORAGE_KEYS,
  ROUTES,
  API_ENDPOINTS,
  PLACEHOLDERS,
  VALIDATION,
  DATE_FORMATS,
  ORDER_STATUS,
  PAYMENT_METHODS
};