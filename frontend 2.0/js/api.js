// ============================================
// API - LLAMADAS AL BACKEND
// ============================================

import { API_ENDPOINTS, STORAGE_KEYS } from './config.js';

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene el token de autenticación
 */
function getAuthToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/**
 * Headers por defecto para las peticiones
 */
function getHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

/**
 * Maneja errores de la API
 */
function handleApiError(error) {
  console.error('API Error:', error);
  throw error;
}

// ============================================
// AUTH
// ============================================

/**
 * Login de usuario
 */
export async function login(email, password) {
  try {
    // TODO: Conectar con backend real
    // const response = await fetch(API_ENDPOINTS.LOGIN, {
    //   method: 'POST',
    //   headers: getHeaders(false),
    //   body: JSON.stringify({ email, password })
    // });
    
    // SIMULACIÓN - Eliminar cuando se conecte al backend
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: '1',
          email: email,
          name: 'Usuario Demo',
          token: 'mock-token-123'
        };
        resolve({ success: true, data: mockUser });
      }, 500);
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Registro de usuario
 */
export async function register(userData) {
  try {
    // TODO: Conectar con backend real
    // const response = await fetch(API_ENDPOINTS.REGISTER, {
    //   method: 'POST',
    //   headers: getHeaders(false),
    //   body: JSON.stringify(userData)
    // });
    
    // SIMULACIÓN
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          data: { 
            id: '1', 
            email: userData.email,
            name: userData.firstName 
          } 
        });
      }, 500);
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// PRODUCTS
// ============================================

/**
 * Obtiene productos destacados
 */
export async function getFeaturedProducts(limit = 6) {
  try {
    // TODO: Conectar con backend real
    // const response = await fetch(`${API_ENDPOINTS.FEATURED_PRODUCTS}?limit=${limit}`);
    // return await response.json();
    
    // SIMULACIÓN
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockProducts = [
          {
            _id: '1',
            name: 'Filete de Salmón',
            shortDescription: 'Fresco del día',
            price: 8990,
            mainImage: 'https://picsum.photos/seed/salmon/400/300',
            stock: 15,
            category: { name: 'Pescado' }
          },
          {
            _id: '2',
            name: 'Merluza Austral',
            shortDescription: 'Premium',
            price: 5990,
            mainImage: 'https://picsum.photos/seed/merluza/400/300',
            stock: 20,
            category: { name: 'Pescado' }
          },
          {
            _id: '3',
            name: 'Camarones Grandes',
            shortDescription: 'Por kilo',
            price: 12990,
            mainImage: 'https://picsum.photos/seed/camarones/400/300',
            stock: 10,
            category: { name: 'Mariscos' }
          }
        ];
        resolve({ success: true, data: mockProducts });
      }, 300);
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Obtiene todas las categorías activas
 */
export async function getActiveCategories() {
  try {
    // TODO: Conectar con backend real
    // const response = await fetch(API_ENDPOINTS.ACTIVE_CATEGORIES);
    // return await response.json();
    
    // SIMULACIÓN
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockCategories = [
          { _id: '1', name: 'Pescado', slug: 'pescado', isActive: true },
          { _id: '2', name: 'Mariscos', slug: 'mariscos', isActive: true },
          { _id: '3', name: 'Congelados', slug: 'congelados', isActive: true }
        ];
        resolve({ success: true, data: mockCategories });
      }, 300);
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// CART
// ============================================

/**
 * Obtiene el carrito actual
 */
export async function getCart() {
  try {
    // TODO: Conectar con backend real
    // const response = await fetch(API_ENDPOINTS.CART, {
    //   headers: getHeaders()
    // });
    // return await response.json();
    
    // SIMULACIÓN - usar localStorage
    const cartItems = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART_ITEMS) || '[]');
    return { success: true, data: { items: cartItems } };
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Agrega un producto al carrito
 */
export async function addToCart(productId, quantity) {
  try {
    // TODO: Conectar con backend real
    // const response = await fetch(API_ENDPOINTS.ADD_TO_CART, {
    //   method: 'POST',
    //   headers: getHeaders(),
    //   body: JSON.stringify({ productId, quantity })
    // });
    // return await response.json();
    
    // SIMULACIÓN - usar localStorage
    const cartItems = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART_ITEMS) || '[]');
    const existingIndex = cartItems.findIndex(item => item.productId === productId);
    
    if (existingIndex >= 0) {
      cartItems[existingIndex].quantity += quantity;
    } else {
      cartItems.push({ productId, quantity });
    }
    
    localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(cartItems));
    localStorage.setItem(STORAGE_KEYS.CART_COUNT, cartItems.length.toString());
    
    return { success: true, data: { items: cartItems } };
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// ORDERS
// ============================================

/**
 * Obtiene las órdenes del usuario
 */
export async function getOrders(page = 1, limit = 10) {
  try {
    // TODO: Conectar con backend real
    // const response = await fetch(`${API_ENDPOINTS.ORDERS}?page=${page}&limit=${limit}`, {
    //   headers: getHeaders()
    // });
    // return await response.json();
    
    // SIMULACIÓN
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          data: {
            orders: [],
            totalPages: 0,
            currentPage: page
          }
        });
      }, 300);
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// USER PROFILE
// ============================================

/**
 * Obtiene el perfil del usuario
 */
export async function getUserProfile() {
  try {
    // TODO: Conectar con backend real
    // const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
    //   headers: getHeaders()
    // });
    // return await response.json();
    
    // SIMULACIÓN
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
    return { success: true, data: user };
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Actualiza el perfil del usuario
 */
export async function updateUserProfile(profileData) {
  try {
    // TODO: Conectar con backend real
    // const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
    //   method: 'PUT',
    //   headers: getHeaders(),
    //   body: JSON.stringify(profileData)
    // });
    // return await response.json();
    
    // SIMULACIÓN
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    const updatedUser = { ...user, ...profileData };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    return { success: true, data: updatedUser };
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// ADDRESSES
// ============================================

/**
 * Obtiene las direcciones del usuario
 */
export async function getAddresses() {
  try {
    // TODO: Conectar con backend real
    // const response = await fetch(API_ENDPOINTS.ADDRESSES, {
    //   headers: getHeaders()
    // });
    // return await response.json();
    
    // SIMULACIÓN
    return { success: true, data: [] };
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// CONTACT
// ============================================

/**
 * Envía un mensaje de contacto
 */
export async function sendContactMessage(messageData) {
  try {
    // TODO: Conectar con backend real
    // const response = await fetch(API_ENDPOINTS.CONTACT, {
    //   method: 'POST',
    //   headers: getHeaders(false),
    //   body: JSON.stringify(messageData)
    // });
    // return await response.json();
    
    // SIMULACIÓN
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Mensaje enviado correctamente' });
      }, 500);
    });
  } catch (error) {
    return handleApiError(error);
  }
}