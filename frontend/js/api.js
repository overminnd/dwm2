/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MARAZUL E-COMMERCE - CLIENTE API (HTTP)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Cliente completo para comunicación con el backend usando jQuery AJAX.
 * 
 * Backend: Node.js + Express 5 + MongoDB
 * Puerto: 5000
 * Base URL: http://localhost:5000/api
 * 
 * Funcionalidades:
 * - Autenticación (login, register, profile)
 * - Productos (CRUD, búsqueda, filtros)
 * - Categorías (listado)
 * - Carrito (sincronización)
 * - Órdenes (crear, historial)
 * - Manejo automático de tokens JWT
 * - Manejo robusto de errores HTTP
 * - Timeout y retry logic
 * 
 * Fecha: 27 Noviembre 2025
 * Versión: 1.0.1 - CORREGIDO: No normaliza respuestas sin data/pagination
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL CLIENTE HTTP
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configuración global de AJAX para todas las peticiones
 */
$.ajaxSetup({
  timeout: 30000, // 30 segundos
  cache: false,
  crossDomain: true,
});

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL DE REQUEST
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Realiza una petición HTTP al backend
 * 
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {string} endpoint - Endpoint de la API (ej: '/products')
 * @param {Object} data - Datos a enviar (opcional)
 * @param {Object} options - Opciones adicionales (opcional)
 * @returns {Promise} Promesa con la respuesta
 * 
 * @example
 * // GET request
 * const products = await apiRequest('GET', '/products');
 * 
 * // POST request con datos
 * const result = await apiRequest('POST', '/auth/login', {
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 */
async function apiRequest(method, endpoint, data = null, options = {}) {
  const url = `${CONFIG.API_URL}${endpoint}`;

  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      method,
      headers,
      data: data ? JSON.stringify(data) : null,
      dataType: 'json',
      timeout: 10000,
      success: (response) => {
        resolve(response);
      },
      error: (jqXHR) => {
       const msg =
        jqXHR.responseJSON?.message ||
        jqXHR.responseJSON?.error ||
        jqXHR.statusText ||
        'Error desconocido';

        reject({
          status: jqXHR.status,
          message: msg,
          details: jqXHR.responseJSON
        });
      }
    });
  });
}

/**
 * Maneja los errores de las peticiones HTTP
 * @private
 */
function handleApiError(error, method, endpoint) {
  console.error('❌ API Error:', method, endpoint, error);
  
  let errorMessage = CONFIG.MESSAGES.ERROR.GENERIC;
  let statusCode = 0;
  let errorData = null;
  
  if (error.status) {
    statusCode = error.status;
    
    // Parsear respuesta de error si existe
    if (error.responseJSON) {
      errorData = error.responseJSON;
      errorMessage = errorData.message || errorData.error || errorMessage;
    } else if (error.responseText) {
      try {
        errorData = JSON.parse(error.responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = error.responseText;
      }
    }
    
    // Mensajes específicos según status code
    switch (statusCode) {
      case 400:
        errorMessage = errorData?.message || 'Solicitud incorrecta';
        break;
      case 401:
        errorMessage = CONFIG.MESSAGES.ERROR.UNAUTHORIZED;
        // Auto-logout si token expiró
        if (isAuthenticated()) {
          console.warn('⚠️  Token expirado, cerrando sesión...');
          logout(false);
        }
        break;
      case 403:
        errorMessage = 'No tienes permisos para esta acción';
        break;
      case 404:
        errorMessage = CONFIG.MESSAGES.ERROR.NOT_FOUND;
        break;
      case 409:
        errorMessage = errorData?.message || 'Conflicto con el estado actual';
        break;
      case 500:
      case 502:
      case 503:
        errorMessage = CONFIG.MESSAGES.ERROR.SERVER;
        break;
      default:
        if (statusCode >= 500) {
          errorMessage = CONFIG.MESSAGES.ERROR.SERVER;
        }
    }
    
  } else if (error.statusText === 'timeout') {
    errorMessage = 'La petición tardó demasiado. Intenta nuevamente.';
  } else if (error.statusText === 'error') {
    errorMessage = CONFIG.MESSAGES.ERROR.NETWORK;
  }
  
  return {
    success: false,
    data: null,
    error: {
      message: errorMessage,
      statusCode: statusCode,
      details: errorData
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Realiza login con email y contraseña
 * 
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise} { success, data: { user, token }, error }
 * 
 * @example
 * const result = await login('user@example.com', 'password123');
 * if (result.success) {
 *   setCurrentUser(result.data.user);
 *   setAuthToken(result.data.token);
 *   navigateTo(CONFIG.ROUTES.HOME);
 * }
 */
async function login(email, password) {
  const result = await apiRequest('POST', CONFIG.ENDPOINTS.AUTH.LOGIN, {
    email: email,
    password: password
  });
  
  if (result.success) {
    // Guardar usuario y token automáticamente
    const userData = result.data.user || result.data;
    const token = result.data.token;
    
    if (userData && token) {
      setCurrentUser(userData);
      setAuthToken(token);
      
      // Emitir evento de login
      $(document).trigger('auth:login', [userData]);
      
      console.log('✅ Login exitoso:', userData.name || userData.email);
    }
  }
  
  return result;
}

/**
 * Registra un nuevo usuario
 * 
 * @param {Object} userData - Datos del usuario { name, email, password, phone, address }
 * @returns {Promise} { success, data: { user, token }, error }
 * 
 * @example
 * const result = await register({
 *   name: 'Juan Pérez',
 *   email: 'juan@example.com',
 *   password: 'Password123',
 *   phone: '+56912345678',
 *   address: 'Calle 123, Santiago'
 * });
 */
async function register(userData) {
  const result = await apiRequest('POST', CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
  
  if (result.success) {
    // La respuesta puede venir de 2 formas después de nuestros cambios:
    // Forma 1: { success: true, token: "...", user: {...} } (directo)
    // Forma 2: { success: true, data: { token: "...", user: {...} } } (normalizado)
    
    const user = result.user || result.data?.user;
    const token = result.token || result.data?.token;
    
    if (user && token) {
      setCurrentUser(user);
      setAuthToken(token);
      
      // Emitir evento de login
      $(document).trigger('auth:login', [user]);
      
      console.log('✅ Registro exitoso:', user.name || user.email);
    }
  }
  
  return result;
}

/**
 * Obtiene el perfil del usuario actual
 * Requiere autenticación
 * 
 * @returns {Promise} { success, data: user, error }
 * 
 * @example
 * const result = await getProfile();
 * if (result.success) {
 *   console.log('Perfil:', result.data);
 * }
 */
async function getProfile() {
  return await apiRequest('GET', CONFIG.ENDPOINTS.AUTH.PROFILE);
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todos los productos
 * 
 * @param {Object} filters - Filtros opcionales { category, featured, search, limit, offset }
 * @returns {Promise} { success, data: products[], error }
 * 
 * @example
 * // Todos los productos
 * const result = await getProducts();
 * 
 * // Productos por categoría
 * const result = await getProducts({ category: 'pescados' });
 * 
 * // Productos destacados
 * const result = await getProducts({ featured: true, limit: 6 });
 */
async function getProducts(filters = {}) {
  let endpoint = CONFIG.ENDPOINTS.PRODUCTS.ALL;
  
  // Construir query string
  const params = new URLSearchParams();
  
  if (filters.category) {
    params.append('category', filters.category);
  }
  
  if (filters.categoryId) {
    params.append('categoryId', filters.categoryId);
  }
  
  if (filters.featured) {
    params.append('featured', 'true');
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  if (filters.limit) {
    params.append('limit', filters.limit);
  }
  
  if (filters.offset) {
    params.append('offset', filters.offset);
  }
  
  if (params.toString()) {
    endpoint += '?' + params.toString();
  }
  
  return await apiRequest('GET', endpoint);
}

/**
 * Obtiene productos destacados
 * 
 * @param {number} limit - Cantidad de productos (default: 6)
 * @returns {Promise} { success, data: products[], error }
 * 
 * @example
 * const result = await getFeaturedProducts(6);
 */
async function getFeaturedProducts(limit = 6) {
  return await getProducts({ featured: true, limit: limit });
}

/**
 * Obtiene productos por categoría
 * 
 * @param {string} category - Nombre de la categoría
 * @param {number} limit - Cantidad de productos (opcional)
 * @returns {Promise} { success, data: products[], error }
 * 
 * @example
 * const result = await getProductsByCategory('pescados', 12);
 */
async function getProductsByCategory(category, limit = null) {
  const filters = { category: category };
  if (limit) filters.limit = limit;
  
  return await getProducts(filters);
}

/**
 * Obtiene un producto por su ID
 * 
 * @param {string} productId - ID del producto
 * @returns {Promise} { success, data: product, error }
 * 
 * @example
 * const result = await getProductById('123abc');
 */
async function getProductById(productId) {
  const endpoint = CONFIG.ENDPOINTS.PRODUCTS.BY_ID(productId);
  return await apiRequest('GET', endpoint);
}

/**
 * Busca productos por término de búsqueda
 * 
 * @param {string} query - Término de búsqueda
 * @param {number} limit - Cantidad de resultados (opcional)
 * @returns {Promise} { success, data: products[], error }
 * 
 * @example
 * const result = await searchProducts('salmón');
 */
async function searchProducts(query, limit = null) {
  const filters = { search: query };
  if (limit) filters.limit = limit;
  
  return await getProducts(filters);
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORÍAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todas las categorías activas
 * 
 * @returns {Promise} { success, data: categories[], error }
 * 
 * @example
 * const result = await getCategories();
 * if (result.success) {
 *   result.data.forEach(cat => console.log(cat.name));
 * }
 */
async function getCategories() {
  return await apiRequest('GET', CONFIG.ENDPOINTS.CATEGORIES.ALL);
}

// ═══════════════════════════════════════════════════════════════════════════
// CARRITO (Sincronización con Backend)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sincroniza el carrito local con el backend
 * Solo funciona si el usuario está autenticado
 * 
 * @returns {Promise} { success, data: cart, error }
 * 
 * @example
 * const result = await syncCart();
 * if (result.success) {
 *   console.log('Carrito sincronizado:', result.data);
 * }
 */
async function getCartFromBackend() {
  if (!isAuthenticated()) {
    return { success: false, data: null, error: { message: 'Usuario no autenticado' } };
  }
  
  return apiRequest('GET', ENDPOINTS.CART.GET);
}

// Añadir un producto al carrito
async function addToCartBackend(productId, quantity = 1) {
  return apiRequest('POST', ENDPOINTS.CART.ADD, { productId, quantity });
}

// Actualizar un ítem del carrito
async function updateCartItemBackend(itemId, quantity) {
  return apiRequest('PUT', ENDPOINTS.CART.UPDATE(itemId), { quantity });
}

// Eliminar ítem del carrito
async function removeFromCartBackend(itemId) {
  return apiRequest('DELETE', ENDPOINTS.CART.DELETE(itemId));
}

// Vaciar carrito
async function clearCartBackend() {
  return apiRequest('DELETE', ENDPOINTS.CART.CLEAR);
}

// Total del carrito
async function getCartTotalBackend() {
  return apiRequest('GET', ENDPOINTS.CART.TOTAL);
}


// ═══════════════════════════════════════════════════════════════════════════
// ÓRDENES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Crea una nueva orden
 * Requiere autenticación
 * 
 * @param {Object} orderData - Datos de la orden
 * @param {Array} orderData.items - Items del carrito
 * @param {Object} orderData.shippingAddress - Dirección de envío
 * @param {string} orderData.paymentMethod - Método de pago
 * @returns {Promise} { success, data: order, error }
 * 
 * @example
 * const result = await createOrder({
 *   items: getCartItems(),
 *   shippingAddress: {
 *     street: 'Calle 123',
 *     city: 'Santiago',
 *     region: 'RM',
 *     phone: '+56912345678'
 *   },
 *   paymentMethod: 'credit_card'
 * });
 */
async function createOrder(orderData) {
  if (!isAuthenticated()) {
    return {
      success: false,
      data: null,
      error: { message: CONFIG.MESSAGES.ERROR.UNAUTHORIZED }
    };
  }
  
  return await apiRequest('POST', CONFIG.ENDPOINTS.ORDERS.CREATE, orderData);
}

/**
 * Obtiene el historial de órdenes del usuario
 * Requiere autenticación
 * 
 * @returns {Promise} { success, data: orders[], error }
 * 
 * @example
 * const result = await getOrderHistory();
 * if (result.success) {
 *   result.data.forEach(order => {
 *     console.log('Orden:', order.orderNumber, order.status);
 *   });
 * }
 */
async function getOrderHistory() {
  if (!isAuthenticated()) {
    return {
      success: false,
      data: null,
      error: { message: CONFIG.MESSAGES.ERROR.UNAUTHORIZED }
    };
  }
  
  return await apiRequest('GET', CONFIG.ENDPOINTS.ORDERS.HISTORY);
}

async function getAdminOrders(status = "paid") {
  return await apiRequest(
    "GET",
    `/orders/admin?status=${status}`
  );
}


async function updateOrderStatus(orderId, newStatus) {
  return await apiRequest(
    "PUT",
    `/orders/${orderId}/status`,
    { status: newStatus }
  );
}



/**
 * Obtiene una orden por su ID
 * Requiere autenticación
 * 
 * @param {string} orderId - ID de la orden
 * @returns {Promise} { success, data: order, error }
 * 
 * @example
 * const result = await getOrderById('order_123');
 */
async function getOrderById(orderId) {
  if (!isAuthenticated()) {
    return {
      success: false,
      data: null,
      error: { message: CONFIG.MESSAGES.ERROR.UNAUTHORIZED }
    };
  }
  
  const endpoint = CONFIG.ENDPOINTS.ORDERS.BY_ID(orderId);
  return await apiRequest('GET', endpoint);
}

async function cancelOrder(orderId) {
  return apiRequest('PUT', ENDPOINTS.ORDERS.CANCEL(orderId));
}

async function getOrderItems(orderId) {
  return apiRequest('GET', ENDPOINTS.ORDERS.ITEMS(orderId));
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN - PRODUCTOS Y CATEGORÍAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ADMIN: Obtener todos los productos (incluyendo no publicados)
 * 
 * Asume que el backend acepta GET /products?admin=true
 * Si en tu backend es diferente, cambia el endpoint/params.
 */
async function adminGetProducts() {
  const endpoint = `${ENDPOINTS.PRODUCTS.ALL}?admin=true`;
  return await apiRequest('GET', endpoint);
}

/**
 * ADMIN: Crear producto
 * 
 * @param {Object} productData - { name, price, stock, categoryId, status, ... }
 */
async function adminCreateProduct(productData) {
  return await apiRequest('POST', ENDPOINTS.PRODUCTS.ALL, productData);
}

/**
 * ADMIN: Actualizar producto (incluye stock, nombre, precio, status, etc.)
 * 
 * @param {string} productId 
 * @param {Object} data - campos a actualizar
 */
async function adminUpdateProduct(productId, data) {
  const endpoint = ENDPOINTS.PRODUCTS.BY_ID(productId);
  return await apiRequest('PUT', endpoint, data);
}

/**
 * ADMIN: Eliminar producto
 */
async function adminDeleteProduct(productId) {
  const endpoint = ENDPOINTS.PRODUCTS.BY_ID(productId);
  return await apiRequest('DELETE', endpoint);
}

/**
 * ADMIN: Cambiar estado de producto (ej: 'published' / 'draft' / 'disabled')
 * 
 * Si en tu backend NO tienes /products/:id/status, 
 * puedes reutilizar adminUpdateProduct(productId, { status: newStatus })
 */
async function adminUpdateProductStatus(productId, newStatus) {
  // 👉 si tienes un endpoint dedicado:
  // const endpoint = `/products/${productId}/status`;
  // return await apiRequest('PUT', endpoint, { status: newStatus });

  // 👉 versión genérica usando PUT /products/:id
  return await adminUpdateProduct(productId, { status: newStatus });
}

/* =========================
   CATEGORÍAS
========================= */

/**
 * ADMIN: Obtener todas las categorías (activas y no activas, si el backend lo permite)
 * Por ahora reutilizamos GET /categories.
 */
async function adminGetCategories() {
  return await apiRequest('GET', ENDPOINTS.CATEGORIES.ALL + '?admin=true');
}

/**
 * ADMIN: Crear categoría
 * @param {Object} data - { name, description, ... }
 */
async function adminCreateCategory(data) {
  return await apiRequest('POST', ENDPOINTS.CATEGORIES.ALL, data);
}

/**
 * ADMIN: Actualizar categoría
 */
async function adminUpdateCategory(categoryId, data) {
  const endpoint = `/categories/${categoryId}`;
  return await apiRequest('PUT', endpoint, data);
}

/**
 * ADMIN: Eliminar categoría
 */
async function adminDeleteCategory(categoryId) {
  const endpoint = `/categories/${categoryId}`;
  return await apiRequest('DELETE', endpoint);
}

/**
 * ADMIN: Cambiar estado de categoría (ej: active true/false)
 * Si tu schema usa otra cosa (status), ajusta acá.
 */
async function adminToggleCategoryActive(categoryId, isActive) {
  return await adminUpdateCategory(categoryId, { active: isActive });
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTACTO
// ═══════════════════════════════════════════════════════════════════════════
// Mensajes de contacto - Admin
async function getAllMessagesAdmin() {
  return apiRequest("GET", "/contact/messages");
}

async function getMessageById(id) {
  return apiRequest("GET", `/contact/messages/${id}`);
}

async function markMessageAsRead(id) {
  return apiRequest("PUT", `/contact/messages/${id}/mark-read`);
}

async function deleteMessage(id) {
  return apiRequest("DELETE", `/contact/messages/${id}`);
}

/**
 * Envía un mensaje desde el formulario de contacto
 * 
 * @param {Object} data - { name, email, phone, message }
 * @returns {Promise} { success, message }
 */
async function sendContactMessage(data) {
  return apiRequest("POST", "/contact", data);
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════════════════
async function getProductReviews(productId) {
  return apiRequest('GET', ENDPOINTS.REVIEWS.FOR_PRODUCT(productId));
}

async function addReview(productId, reviewData) {
  return apiRequest('POST', ENDPOINTS.REVIEWS.ADD(productId), reviewData);
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES DE LA API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verifica si el backend está disponible
 * Hace un ping al endpoint root que retorna info de la API
 * 
 * @returns {Promise<boolean>} true si el backend responde
 * 
 * @example
 * const isOnline = await checkBackendHealth();
 * if (!isOnline) {
 *   alert('El servidor no está disponible');
 * }
 */
async function checkBackendHealth() {
  try {
    const response = await $.ajax({
      url: CONFIG.API_URL.replace('/api', ''), // http://localhost:5000
      method: 'GET',
      timeout: 5000
    });
    
    console.log('✅ Backend disponible');
    return true;
    
  } catch (error) {
    console.error('❌ Backend no disponible:', error);
    return false;
  }
}

/**
 * Obtiene estadísticas de la API (si el endpoint existe)
 * 
 * @returns {Promise} { success, data: stats, error }
 */
async function getApiStats() {
  return await apiRequest('GET', '/stats');
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAR FUNCIONES
// ═══════════════════════════════════════════════════════════════════════════

// Hacer disponible globalmente (para compatibilidad con jQuery)
window.API = {
  // Core
  apiRequest,
  checkBackendHealth,
  
  // Auth
  login,
  register,
  getProfile,
  
  // Products
  getProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductById,
  searchProducts,
  
  // Categories
  getCategories,
  
  // Cart
  syncCart,
  getCartFromBackend,
  
  // Orders
  createOrder,
  getOrderHistory,
  getOrderById,
  getAdminOrders,
  updateOrderStatus,

  // ADMIN PRODUCTS
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUpdateProductStatus,

  //  ADMIN CATEGORIES
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminToggleCategoryActive,

  
  // Utils
  getApiStats,

  // Contact messages (Admin)
  getAllMessagesAdmin,
  getMessageById,
  markMessageAsRead,
  deleteMessage,

  // Contact
  sendContactMessage,

};

// Hacer funciones disponibles globalmente para fácil acceso
Object.assign(window, window.API);

// Log en desarrollo
if (!CONFIG.isProduction) {
  console.log('✅ API cargada correctamente');
  console.log('📦 Funciones disponibles:', Object.keys(window.API).length);
  console.log('🌐 API URL:', CONFIG.API_URL);
  
  // Verificar conectividad con backend
  checkBackendHealth().then(isOnline => {
    if (isOnline) {
      console.log('✅ Backend conectado correctamente');
    } else {
      console.warn('⚠️  Backend no disponible. Verifica que esté corriendo en', CONFIG.API_URL);
    }
  });
}