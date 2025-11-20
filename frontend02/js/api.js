/**
 * ============================================================================
 * MARAZUL - API Client
 * ============================================================================
 * 
 * Archivo: api.js
 * Descripción: Cliente para todas las peticiones HTTP al backend
 * Versión: 1.0
 * 
 * Este módulo centraliza todas las llamadas a la API del backend
 * usando jQuery $.ajax() para compatibilidad con el proyecto.
 */

import { API_ENDPOINTS, MESSAGES } from './config.js';
import { getAuthHeaders } from './auth.js';
import { showToast, log } from './utils.js';

// ============================================================================
// CONFIGURACIÓN BASE
// ============================================================================

/**
 * Configuración por defecto para todas las peticiones
 */
const defaultConfig = {
  timeout: 15000, // 15 segundos
  dataType: 'json'
};

/**
 * Manejo centralizado de errores HTTP
 * @param {Object} error - Objeto de error de jQuery
 * @param {boolean} showMessage - Si debe mostrar toast (por defecto true)
 * @returns {Object} Objeto de error normalizado
 */
function handleError(error, showMessage = true) {
  log('error', 'Error en petición API:', error);
  
  let message = MESSAGES.ERROR.GENERIC;
  let statusCode = error.status || 0;
  
  // Errores específicos según código HTTP
  switch (statusCode) {
    case 0:
      message = MESSAGES.ERROR.NETWORK;
      break;
    case 401:
      message = MESSAGES.ERROR.UNAUTHORIZED;
      break;
    case 403:
      message = 'No tienes permisos para realizar esta acción';
      break;
    case 404:
      message = 'Recurso no encontrado';
      break;
    case 409:
      message = error.responseJSON?.message || 'Conflicto con los datos';
      break;
    case 422:
      message = error.responseJSON?.message || 'Datos inválidos';
      break;
    case 500:
      message = 'Error del servidor. Intenta más tarde';
      break;
    default:
      message = error.responseJSON?.message || MESSAGES.ERROR.GENERIC;
  }
  
  if (showMessage) {
    showToast(message, 'error');
  }
  
  return {
    success: false,
    message,
    statusCode,
    error: error.responseJSON || error
  };
}

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

/**
 * Inicia sesión con email y contraseña
 * @param {Object} credentials - {email, password}
 * @returns {Promise<Object>} Usuario y token
 */
export function login(credentials) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.LOGIN,
      method: 'POST',
      data: JSON.stringify(credentials),
      contentType: 'application/json',
      ...defaultConfig,
      success: (response) => {
        log('info', 'Login exitoso');
        resolve({
          success: true,
          user: response.user || response.data?.user,
          token: response.token || response.data?.token
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario {nombre, email, password, etc.}
 * @returns {Promise<Object>} Resultado del registro
 */
export function register(userData) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.REGISTER,
      method: 'POST',
      data: JSON.stringify(userData),
      contentType: 'application/json',
      ...defaultConfig,
      success: (response) => {
        log('info', 'Registro exitoso');
        resolve({
          success: true,
          message: response.message || MESSAGES.SUCCESS.REGISTER
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Verifica si el token actual es válido
 * @returns {Promise<Object>} Resultado de la verificación
 */
export function verifyToken() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.VERIFY_TOKEN,
      method: 'GET',
      headers: getAuthHeaders(),
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Token verificado');
        resolve({
          success: true,
          user: response.user || response.data?.user
        });
      },
      error: (error) => {
        const errorData = handleError(error, false);
        reject(errorData);
      }
    });
  });
}

// ============================================================================
// PRODUCTOS
// ============================================================================

/**
 * Obtiene todos los productos
 * @param {Object} params - Parámetros de filtrado {page, limit, category, search}
 * @returns {Promise<Object>} Lista de productos
 */
export function getProducts(params = {}) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.PRODUCTS,
      method: 'GET',
      data: params,
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Productos obtenidos:', response.data?.length || response.products?.length);
        resolve({
          success: true,
          products: response.products || response.data || [],
          pagination: response.pagination || null
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Obtiene productos destacados
 * @param {number} limit - Cantidad de productos (por defecto 6)
 * @returns {Promise<Object>} Lista de productos destacados
 */
export function getFeaturedProducts(limit = 6) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.FEATURED_PRODUCTS,
      method: 'GET',
      data: { limit },
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Productos destacados obtenidos');
        resolve({
          success: true,
          products: response.products || response.data || []
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Obtiene un producto por ID
 * @param {string} productId - ID del producto
 * @returns {Promise<Object>} Producto
 */
export function getProductById(productId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.PRODUCT_BY_ID(productId),
      method: 'GET',
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Producto obtenido:', productId);
        resolve({
          success: true,
          product: response.product || response.data
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Busca productos por término
 * @param {string} searchTerm - Término de búsqueda
 * @param {Object} filters - Filtros adicionales
 * @returns {Promise<Object>} Resultados de búsqueda
 */
export function searchProducts(searchTerm, filters = {}) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.SEARCH_PRODUCTS,
      method: 'GET',
      data: {
        q: searchTerm,
        ...filters
      },
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Búsqueda completada');
        resolve({
          success: true,
          products: response.products || response.data || []
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Obtiene productos por categoría
 * @param {string} categoryId - ID de la categoría
 * @param {Object} params - Parámetros adicionales
 * @returns {Promise<Object>} Productos de la categoría
 */
export function getProductsByCategory(categoryId, params = {}) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.PRODUCTS_BY_CATEGORY(categoryId),
      method: 'GET',
      data: params,
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Productos de categoría obtenidos');
        resolve({
          success: true,
          products: response.products || response.data || []
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

// ============================================================================
// CATEGORÍAS
// ============================================================================

/**
 * Obtiene todas las categorías
 * @returns {Promise<Object>} Lista de categorías
 */
export function getCategories() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.CATEGORIES,
      method: 'GET',
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Categorías obtenidas');
        resolve({
          success: true,
          categories: response.categories || response.data || []
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Obtiene solo categorías activas
 * @returns {Promise<Object>} Lista de categorías activas
 */
export function getActiveCategories() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.ACTIVE_CATEGORIES,
      method: 'GET',
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Categorías activas obtenidas');
        resolve({
          success: true,
          categories: response.categories || response.data || []
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Obtiene una categoría por ID
 * @param {string} categoryId - ID de la categoría
 * @returns {Promise<Object>} Categoría
 */
export function getCategoryById(categoryId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.CATEGORY_BY_ID(categoryId),
      method: 'GET',
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Categoría obtenida');
        resolve({
          success: true,
          category: response.category || response.data
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

// ============================================================================
// CARRITO
// ============================================================================

/**
 * Obtiene el carrito del usuario (requiere autenticación)
 * @returns {Promise<Object>} Carrito del usuario
 */
export function getCart() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.CART,
      method: 'GET',
      headers: getAuthHeaders(),
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Carrito obtenido');
        resolve({
          success: true,
          cart: response.cart || response.data,
          items: response.cart?.items || response.data?.items || []
        });
      },
      error: (error) => {
        const errorData = handleError(error, false);
        reject(errorData);
      }
    });
  });
}

/**
 * Agrega un producto al carrito
 * @param {string} productId - ID del producto
 * @param {number} quantity - Cantidad
 * @returns {Promise<Object>} Carrito actualizado
 */
export function addToCartAPI(productId, quantity = 1) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.ADD_TO_CART,
      method: 'POST',
      headers: getAuthHeaders(),
      data: JSON.stringify({ productId, quantity }),
      contentType: 'application/json',
      ...defaultConfig,
      success: (response) => {
        log('info', 'Producto agregado al carrito');
        resolve({
          success: true,
          cart: response.cart || response.data,
          message: response.message || MESSAGES.SUCCESS.ADDED_TO_CART
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Actualiza la cantidad de un item del carrito
 * @param {string} itemId - ID del item en el carrito
 * @param {number} quantity - Nueva cantidad
 * @returns {Promise<Object>} Carrito actualizado
 */
export function updateCartItem(itemId, quantity) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.UPDATE_CART_ITEM(itemId),
      method: 'PUT',
      headers: getAuthHeaders(),
      data: JSON.stringify({ quantity }),
      contentType: 'application/json',
      ...defaultConfig,
      success: (response) => {
        log('info', 'Item del carrito actualizado');
        resolve({
          success: true,
          cart: response.cart || response.data
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Elimina un item del carrito
 * @param {string} itemId - ID del item en el carrito
 * @returns {Promise<Object>} Carrito actualizado
 */
export function removeFromCartAPI(itemId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.REMOVE_FROM_CART(itemId),
      method: 'DELETE',
      headers: getAuthHeaders(),
      ...defaultConfig,
      success: (response) => {
        log('info', 'Item eliminado del carrito');
        resolve({
          success: true,
          cart: response.cart || response.data
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Vacía completamente el carrito
 * @returns {Promise<Object>} Resultado
 */
export function clearCart() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.CLEAR_CART,
      method: 'DELETE',
      headers: getAuthHeaders(),
      ...defaultConfig,
      success: (response) => {
        log('info', 'Carrito vaciado');
        resolve({
          success: true,
          message: response.message || 'Carrito vaciado'
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

// ============================================================================
// PEDIDOS / ÓRDENES
// ============================================================================

/**
 * Obtiene el historial de pedidos del usuario
 * @param {Object} params - Parámetros de filtrado
 * @returns {Promise<Object>} Lista de pedidos
 */
export function getOrders(params = {}) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.ORDERS,
      method: 'GET',
      headers: getAuthHeaders(),
      data: params,
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Pedidos obtenidos');
        resolve({
          success: true,
          orders: response.orders || response.data || []
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Obtiene un pedido específico por ID
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} Detalle del pedido
 */
export function getOrderById(orderId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.ORDER_BY_ID(orderId),
      method: 'GET',
      headers: getAuthHeaders(),
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Pedido obtenido:', orderId);
        resolve({
          success: true,
          order: response.order || response.data
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Crea un nuevo pedido
 * @param {Object} orderData - Datos del pedido {items, shippingAddress, paymentMethod}
 * @returns {Promise<Object>} Pedido creado
 */
export function createOrder(orderData) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.CREATE_ORDER,
      method: 'POST',
      headers: getAuthHeaders(),
      data: JSON.stringify(orderData),
      contentType: 'application/json',
      ...defaultConfig,
      success: (response) => {
        log('info', 'Pedido creado exitosamente');
        resolve({
          success: true,
          order: response.order || response.data,
          message: response.message || MESSAGES.SUCCESS.ORDER_CREATED
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

// ============================================================================
// DIRECCIONES
// ============================================================================

/**
 * Obtiene todas las direcciones del usuario
 * @returns {Promise<Object>} Lista de direcciones
 */
export function getAddresses() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.ADDRESSES,
      method: 'GET',
      headers: getAuthHeaders(),
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Direcciones obtenidas');
        resolve({
          success: true,
          addresses: response.addresses || response.data || []
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Obtiene una dirección específica por ID
 * @param {string} addressId - ID de la dirección
 * @returns {Promise<Object>} Dirección
 */
export function getAddressById(addressId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.ADDRESS_BY_ID(addressId),
      method: 'GET',
      headers: getAuthHeaders(),
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Dirección obtenida');
        resolve({
          success: true,
          address: response.address || response.data
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Crea una nueva dirección
 * @param {Object} addressData - Datos de la dirección
 * @returns {Promise<Object>} Dirección creada
 */
export function createAddress(addressData) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.ADDRESSES,
      method: 'POST',
      headers: getAuthHeaders(),
      data: JSON.stringify(addressData),
      contentType: 'application/json',
      ...defaultConfig,
      success: (response) => {
        log('info', 'Dirección creada');
        resolve({
          success: true,
          address: response.address || response.data
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Actualiza una dirección existente
 * @param {string} addressId - ID de la dirección
 * @param {Object} addressData - Datos actualizados
 * @returns {Promise<Object>} Dirección actualizada
 */
export function updateAddress(addressId, addressData) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.ADDRESS_BY_ID(addressId),
      method: 'PUT',
      headers: getAuthHeaders(),
      data: JSON.stringify(addressData),
      contentType: 'application/json',
      ...defaultConfig,
      success: (response) => {
        log('info', 'Dirección actualizada');
        resolve({
          success: true,
          address: response.address || response.data
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Elimina una dirección
 * @param {string} addressId - ID de la dirección
 * @returns {Promise<Object>} Resultado
 */
export function deleteAddress(addressId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.ADDRESS_BY_ID(addressId),
      method: 'DELETE',
      headers: getAuthHeaders(),
      ...defaultConfig,
      success: (response) => {
        log('info', 'Dirección eliminada');
        resolve({
          success: true,
          message: response.message || 'Dirección eliminada'
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

// ============================================================================
// USUARIO / PERFIL
// ============================================================================

/**
 * Obtiene el perfil del usuario autenticado
 * @returns {Promise<Object>} Datos del perfil
 */
export function getProfile() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.USER_PROFILE,
      method: 'GET',
      headers: getAuthHeaders(),
      ...defaultConfig,
      success: (response) => {
        log('debug', 'Perfil obtenido');
        resolve({
          success: true,
          user: response.user || response.data
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Actualiza el perfil del usuario
 * @param {Object} profileData - Datos a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export function updateProfile(profileData) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.UPDATE_PROFILE,
      method: 'PUT',
      headers: getAuthHeaders(),
      data: JSON.stringify(profileData),
      contentType: 'application/json',
      ...defaultConfig,
      success: (response) => {
        log('info', 'Perfil actualizado');
        resolve({
          success: true,
          user: response.user || response.data,
          message: response.message || MESSAGES.SUCCESS.PROFILE_UPDATED
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

/**
 * Cambia la contraseña del usuario
 * @param {Object} passwordData - {currentPassword, newPassword}
 * @returns {Promise<Object>} Resultado
 */
export function changePassword(passwordData) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.CHANGE_PASSWORD,
      method: 'PUT',
      headers: getAuthHeaders(),
      data: JSON.stringify(passwordData),
      contentType: 'application/json',
      ...defaultConfig,
      success: (response) => {
        log('info', 'Contraseña cambiada');
        resolve({
          success: true,
          message: response.message || MESSAGES.SUCCESS.PASSWORD_CHANGED
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

// ============================================================================
// CONTACTO
// ============================================================================

/**
 * Envía un mensaje de contacto
 * @param {Object} contactData - {nombre, email, asunto, mensaje}
 * @returns {Promise<Object>} Resultado
 */
export function sendContactMessage(contactData) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.CONTACT,
      method: 'POST',
      data: JSON.stringify(contactData),
      contentType: 'application/json',
      ...defaultConfig,
      success: (response) => {
        log('info', 'Mensaje de contacto enviado');
        resolve({
          success: true,
          message: response.message || MESSAGES.SUCCESS.CONTACT_SENT
        });
      },
      error: (error) => {
        const errorData = handleError(error);
        reject(errorData);
      }
    });
  });
}

// ============================================================================
// EXPORTS DEFAULT
// ============================================================================

export default {
  // Auth
  login,
  register,
  verifyToken,
  
  // Products
  getProducts,
  getFeaturedProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  
  // Categories
  getCategories,
  getActiveCategories,
  getCategoryById,
  
  // Cart
  getCart,
  addToCartAPI,
  updateCartItem,
  removeFromCartAPI,
  clearCart,
  
  // Orders
  getOrders,
  getOrderById,
  createOrder,
  
  // Addresses
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  
  // Profile
  getProfile,
  updateProfile,
  changePassword,
  
  // Contact
  sendContactMessage
};