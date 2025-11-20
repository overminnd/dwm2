// ============================================
// API - LLAMADAS AL BACKEND CON JQUERY
// ============================================

import { API_ENDPOINTS, STORAGE_KEYS } from './config.js';

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene el token JWT del localStorage
 */
function getAuthToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/**
 * Obtiene headers con autenticación
 */
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// ============================================
// AUTENTICACIÓN
// ============================================

/**
 * Login de usuario
 */
export function login(email, password) {
  return $.ajax({
    url: API_ENDPOINTS.LOGIN,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email, password })
  });
}

/**
 * Registro de usuario
 */
export function register(userData) {
  return $.ajax({
    url: API_ENDPOINTS.REGISTER,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(userData)
  });
}

/**
 * Logout de usuario
 */
export function logout() {
  return $.ajax({
    url: API_ENDPOINTS.LOGOUT,
    method: 'POST',
    headers: getAuthHeaders()
  });
}

// ============================================
// PRODUCTOS
// ============================================

/**
 * Obtiene todos los productos
 */
export function getProducts(params = {}) {
  return $.ajax({
    url: API_ENDPOINTS.PRODUCTS,
    method: 'GET',
    data: params
  });
}

/**
 * Obtiene productos destacados
 */
export function getFeaturedProducts(limit = 6) {
  return $.ajax({
    url: API_ENDPOINTS.FEATURED_PRODUCTS,
    method: 'GET',
    data: { limit }
  });
}

/**
 * Obtiene un producto por ID
 */
export function getProductById(id) {
  return $.ajax({
    url: API_ENDPOINTS.PRODUCT_BY_ID(id),
    method: 'GET'
  });
}

// ============================================
// CATEGORÍAS
// ============================================

/**
 * Obtiene todas las categorías
 */
export function getCategories() {
  return $.ajax({
    url: API_ENDPOINTS.CATEGORIES,
    method: 'GET'
  });
}

/**
 * Obtiene categorías activas
 */
export function getActiveCategories() {
  return $.ajax({
    url: API_ENDPOINTS.ACTIVE_CATEGORIES,
    method: 'GET'
  });
}

// ============================================
// CARRITO
// ============================================

/**
 * Obtiene el carrito del usuario
 */
export function getCart() {
  return $.ajax({
    url: API_ENDPOINTS.CART,
    method: 'GET',
    headers: getAuthHeaders()
  });
}

/**
 * Agrega un producto al carrito
 */
export function addToCart(productId, quantity = 1) {
  return $.ajax({
    url: API_ENDPOINTS.ADD_TO_CART,
    method: 'POST',
    headers: getAuthHeaders(),
    data: JSON.stringify({ productId, quantity })
  });
}

/**
 * Actualiza la cantidad de un item del carrito
 */
export function updateCartItem(itemId, quantity) {
  return $.ajax({
    url: API_ENDPOINTS.UPDATE_CART_ITEM(itemId),
    method: 'PUT',
    headers: getAuthHeaders(),
    data: JSON.stringify({ quantity })
  });
}

/**
 * Elimina un item del carrito
 */
export function removeFromCart(itemId) {
  return $.ajax({
    url: API_ENDPOINTS.REMOVE_FROM_CART(itemId),
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}

// ============================================
// ÓRDENES
// ============================================

/**
 * Obtiene las órdenes del usuario
 */
export function getOrders(page = 1, limit = 10) {
  return $.ajax({
    url: API_ENDPOINTS.ORDERS,
    method: 'GET',
    headers: getAuthHeaders(),
    data: { page, limit }
  });
}

/**
 * Obtiene una orden por ID
 */
export function getOrderById(orderId) {
  return $.ajax({
    url: API_ENDPOINTS.ORDER_BY_ID(orderId),
    method: 'GET',
    headers: getAuthHeaders()
  });
}

/**
 * Crea una nueva orden
 */
export function createOrder(orderData) {
  return $.ajax({
    url: API_ENDPOINTS.ORDERS,
    method: 'POST',
    headers: getAuthHeaders(),
    data: JSON.stringify(orderData)
  });
}

// ============================================
// PERFIL DE USUARIO
// ============================================

/**
 * Obtiene el perfil del usuario
 */
export function getUserProfile() {
  return $.ajax({
    url: API_ENDPOINTS.USER_PROFILE,
    method: 'GET',
    headers: getAuthHeaders()
  });
}

/**
 * Actualiza el perfil del usuario
 */
export function updateUserProfile(profileData) {
  return $.ajax({
    url: API_ENDPOINTS.UPDATE_PROFILE,
    method: 'PUT',
    headers: getAuthHeaders(),
    data: JSON.stringify(profileData)
  });
}

// ============================================
// DIRECCIONES
// ============================================

/**
 * Obtiene las direcciones del usuario
 */
export function getAddresses() {
  return $.ajax({
    url: API_ENDPOINTS.ADDRESSES,
    method: 'GET',
    headers: getAuthHeaders()
  });
}

/**
 * Crea una nueva dirección
 */
export function createAddress(addressData) {
  return $.ajax({
    url: API_ENDPOINTS.ADDRESSES,
    method: 'POST',
    headers: getAuthHeaders(),
    data: JSON.stringify(addressData)
  });
}

/**
 * Actualiza una dirección
 */
export function updateAddress(addressId, addressData) {
  return $.ajax({
    url: API_ENDPOINTS.ADDRESS_BY_ID(addressId),
    method: 'PUT',
    headers: getAuthHeaders(),
    data: JSON.stringify(addressData)
  });
}

/**
 * Elimina una dirección
 */
export function deleteAddress(addressId) {
  return $.ajax({
    url: API_ENDPOINTS.ADDRESS_BY_ID(addressId),
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}

// ============================================
// BANNERS
// ============================================

/**
 * Obtiene los banners activos
 */
export function getActiveBanners() {
  return $.ajax({
    url: API_ENDPOINTS.ACTIVE_BANNERS,
    method: 'GET'
  });
}

// ============================================
// CONTACTO
// ============================================

/**
 * Envía un mensaje de contacto
 */
export function sendContactMessage(messageData) {
  return $.ajax({
    url: API_ENDPOINTS.CONTACT,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(messageData)
  });
}