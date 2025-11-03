// Product categories
export const CATEGORIES = {
  PESCADOS: 1,
  MARISCOS: 2,
  MOLUSCOS: 3
};

// Product units
export const UNITS = {
  KG: 'kg',
  UNIT: 'unidad',
  PACK: 'pack',
  DOZEN: 'docena'
};

// Order status translations
export const ORDER_STATUS_TEXT = {
  pending_payment: 'Pendiente de pago',
  paid: 'Pagado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado'
};

// Payment method translations
export const PAYMENT_METHOD_TEXT = {
  credit_card: 'Tarjeta de Crédito',
  debit_card: 'Tarjeta de Débito',
  bank_transfer: 'Transferencia Bancaria',
  cash: 'Efectivo'
};

// Chilean regions
export const CHILEAN_REGIONS = [
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana',
  'Región de O\'Higgins',
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región de Aysén',
  'Región de Magallanes'
];

// Shipping costs by region
export const SHIPPING_COSTS = {
  'Región Metropolitana': 2990,
  'Región de Valparaíso': 3990,
  'Región de O\'Higgins': 3990,
  'default': 4990
};

// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Filter options
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio: Menor a Mayor' },
  { value: 'price_desc', label: 'Precio: Mayor a Menor' },
  { value: 'name_asc', label: 'Nombre: A-Z' },
  { value: 'name_desc', label: 'Nombre: Z-A' },
  { value: 'rating', label: 'Mejor Valorados' },
  { value: 'newest', label: 'Más Recientes' }
];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100
};

// Image sizes
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 150, height: 150 },
  SMALL: { width: 300, height: 300 },
  MEDIUM: { width: 600, height: 600 },
  LARGE: { width: 1200, height: 1200 }
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu internet.',
  SERVER_ERROR: 'Error en el servidor. Intenta nuevamente más tarde.',
  NOT_FOUND: 'No se encontró el recurso solicitado.',
  UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión.',
  VALIDATION_ERROR: 'Error de validación. Verifica los datos ingresados.',
  UNKNOWN_ERROR: 'Ocurrió un error desconocido.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  REGISTER_SUCCESS: 'Cuenta creada exitosamente',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado correctamente',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
  ORDER_CREATED: 'Pedido creado exitosamente',
  ITEM_ADDED_CART: 'Producto agregado al carrito',
  ITEM_REMOVED_CART: 'Producto eliminado del carrito',
  ADDRESS_SAVED: 'Dirección guardada correctamente'
};

// Breakpoints (Bootstrap)
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400
};

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// API retry config
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504]
};

export default {
  CATEGORIES,
  UNITS,
  ORDER_STATUS_TEXT,
  PAYMENT_METHOD_TEXT,
  CHILEAN_REGIONS,
  SHIPPING_COSTS,
  TOAST_TYPES,
  SORT_OPTIONS,
  PAGINATION,
  IMAGE_SIZES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  BREAKPOINTS,
  ANIMATION,
  RETRY_CONFIG
};