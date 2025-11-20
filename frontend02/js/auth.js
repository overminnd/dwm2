/**
 * ============================================================================
 * MARAZUL - Autenticación y Gestión de Componentes
 * ============================================================================
 * 
 * Archivo: auth.js
 * Descripción: Manejo de autenticación, sesiones y carga de componentes HTML
 * Versión: 1.0
 */

import {
  STORAGE_KEYS,
  ROUTES,
  COMPONENTS,
  MESSAGES
} from './config.js';

import {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearStorage,
  showToast,
  log
} from './utils.js';

// ============================================================================
// GESTIÓN DE USUARIO Y SESIÓN
// ============================================================================

/**
 * Obtiene el usuario actual desde localStorage
 * @returns {Object|null} Objeto de usuario o null si no hay sesión
 */
export function getCurrentUser() {
  try {
    const userData = getFromStorage(STORAGE_KEYS.USER_DATA);
    const token = getFromStorage(STORAGE_KEYS.AUTH_TOKEN);
    
    if (!userData || !token) {
      return null;
    }
    
    return userData;
  } catch (error) {
    log('error', 'Error obteniendo usuario actual:', error);
    return null;
  }
}

/**
 * Guarda los datos del usuario en localStorage
 * @param {Object} user - Objeto con datos del usuario
 * @param {string} token - Token JWT de autenticación
 * @returns {boolean} True si se guardó correctamente
 */
export function setCurrentUser(user, token) {
  try {
    if (!user || !token) {
      log('warn', 'Intento de guardar usuario sin datos completos');
      return false;
    }
    
    // Guardar datos de usuario
    const success1 = saveToStorage(STORAGE_KEYS.USER_DATA, user);
    
    // Guardar token
    const success2 = saveToStorage(STORAGE_KEYS.AUTH_TOKEN, token);
    
    if (success1 && success2) {
      log('info', 'Usuario guardado correctamente:', user.email);
      return true;
    }
    
    return false;
  } catch (error) {
    log('error', 'Error guardando usuario:', error);
    return false;
  }
}

/**
 * Verifica si hay un usuario autenticado
 * @returns {boolean} True si hay sesión activa
 */
export function isAuthenticated() {
  const user = getCurrentUser();
  const token = getAuthToken();
  return !!(user && token);
}

/**
 * Obtiene el token de autenticación
 * @returns {string|null} Token JWT o null
 */
export function getAuthToken() {
  return getFromStorage(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * Actualiza los datos del usuario en localStorage
 * @param {Object} updatedData - Datos actualizados del usuario
 * @returns {boolean} True si se actualizó correctamente
 */
export function updateUserData(updatedData) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      log('warn', 'No hay usuario para actualizar');
      return false;
    }
    
    const mergedUser = { ...currentUser, ...updatedData };
    return saveToStorage(STORAGE_KEYS.USER_DATA, mergedUser);
  } catch (error) {
    log('error', 'Error actualizando datos de usuario:', error);
    return false;
  }
}

/**
 * Cierra la sesión del usuario
 * @param {boolean} redirect - Si debe redirigir al login (por defecto true)
 */
export function logout(redirect = true) {
  try {
    log('info', 'Cerrando sesión...');
    
    // Limpiar localStorage
    clearStorage();
    
    // Mostrar mensaje
    showToast(MESSAGES.SUCCESS.LOGOUT || 'Sesión cerrada', 'info');
    
    // Redirigir al login si es necesario
    if (redirect) {
      setTimeout(() => {
        window.location.href = ROUTES.LOGIN;
      }, 1000);
    }
  } catch (error) {
    log('error', 'Error cerrando sesión:', error);
    showToast(MESSAGES.ERROR.GENERIC, 'error');
  }
}

/**
 * Verifica si el token es válido (simple verificación de expiración)
 * @returns {boolean} True si el token es válido
 */
export function isTokenValid() {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Decodificar JWT (solo la parte payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      log('warn', 'Token expirado');
      return false;
    }
    
    return true;
  } catch (error) {
    log('error', 'Error verificando token:', error);
    return false;
  }
}

/**
 * Protege una página requiriendo autenticación
 * Si no hay sesión, redirige al login
 */
export function requireAuth() {
  if (!isAuthenticated() || !isTokenValid()) {
    log('warn', 'Acceso no autorizado, redirigiendo a login');
    showToast(MESSAGES.ERROR.UNAUTHORIZED, 'warning');
    setTimeout(() => {
      window.location.href = ROUTES.LOGIN;
    }, 1500);
    return false;
  }
  return true;
}

/**
 * Redirige al home si ya hay sesión activa
 * Útil para evitar que usuarios autenticados accedan a login/registro
 */
export function redirectIfAuthenticated() {
  if (isAuthenticated() && isTokenValid()) {
    log('info', 'Usuario ya autenticado, redirigiendo a home');
    window.location.href = ROUTES.HOME;
    return true;
  }
  return false;
}

// ============================================================================
// CARGA DE COMPONENTES HTML
// ============================================================================

/**
 * Carga un componente HTML dinámicamente
 * @param {string} containerId - ID del contenedor donde cargar el componente
 * @param {string} componentPath - Ruta del componente HTML
 * @param {Function} callback - Función a ejecutar después de cargar (opcional)
 * @returns {Promise} Promise que se resuelve cuando se carga el componente
 */
export async function loadComponent(containerId, componentPath, callback = null) {
  try {
    const container = document.getElementById(containerId);
    
    if (!container) {
      log('error', `Contenedor #${containerId} no encontrado`);
      return;
    }
    
    log('debug', `Cargando componente: ${componentPath} en #${containerId}`);
    
    // Fetch del componente
    const response = await fetch(componentPath);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const html = await response.text();
    container.innerHTML = html;
    
    log('debug', `Componente cargado: ${componentPath}`);
    
    // Ejecutar callback si existe
    if (callback && typeof callback === 'function') {
      callback();
    }
    
    return html;
  } catch (error) {
    log('error', `Error cargando componente ${componentPath}:`, error);
    console.error(error);
    
    // Mostrar mensaje de error en el contenedor
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle"></i>
          Error cargando componente
        </div>
      `;
    }
  }
}

/**
 * Carga múltiples componentes en paralelo
 * @param {Array} components - Array de objetos {containerId, path, callback}
 * @returns {Promise} Promise que se resuelve cuando todos se cargan
 */
export async function loadComponents(components) {
  try {
    const promises = components.map(comp => 
      loadComponent(comp.containerId, comp.path, comp.callback)
    );
    
    await Promise.all(promises);
    log('info', 'Todos los componentes cargados');
  } catch (error) {
    log('error', 'Error cargando múltiples componentes:', error);
  }
}

// ============================================================================
// INICIALIZACIÓN DEL HEADER
// ============================================================================

/**
 * Inicializa el header y todos sus componentes
 * Debe llamarse después de cargar el componente header.html
 */
export function initHeader() {
  try {
    log('debug', 'Inicializando header...');
    
    // Actualizar estado de autenticación en el header
    updateHeaderAuthState();
    
    // Configurar eventos del header
    setupHeaderEvents();
    
    // Actualizar badge del carrito
    updateCartBadge();
    
    log('debug', 'Header inicializado correctamente');
  } catch (error) {
    log('error', 'Error inicializando header:', error);
  }
}

/**
 * Actualiza el estado de autenticación en el header
 * Muestra/oculta elementos según si hay sesión activa
 */
function updateHeaderAuthState() {
  const user = getCurrentUser();
  const userIcon = document.querySelector('#userIcon');
  const userDropdown = document.querySelector('#userDropdown');
  const loginLink = document.querySelector('#loginLink');
  
  if (!userIcon && !userDropdown && !loginLink) {
    log('warn', 'Elementos de autenticación del header no encontrados');
    return;
  }
  
  if (user && isAuthenticated()) {
    // Usuario autenticado
    log('debug', 'Usuario autenticado en header:', user.email);
    
    if (userIcon) {
      userIcon.style.display = 'block';
    }
    
    if (userDropdown) {
      userDropdown.style.display = 'block';
      
      // Actualizar nombre del usuario en dropdown
      const userNameElement = userDropdown.querySelector('.user-name');
      if (userNameElement) {
        userNameElement.textContent = user.nombre || user.email;
      }
    }
    
    if (loginLink) {
      loginLink.style.display = 'none';
    }
  } else {
    // Usuario no autenticado
    log('debug', 'Usuario no autenticado en header');
    
    if (userIcon) {
      userIcon.style.display = 'none';
    }
    
    if (userDropdown) {
      userDropdown.style.display = 'none';
    }
    
    if (loginLink) {
      loginLink.style.display = 'block';
    }
  }
}

/**
 * Configura los eventos del header
 */
function setupHeaderEvents() {
  // Evento de logout
  const logoutBtn = document.querySelector('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        logout();
      }
    });
  }
  
  // Evento del botón de búsqueda
  const searchBtn = document.querySelector('#searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Abrir modal de búsqueda
      const searchModal = document.querySelector('#searchModal');
      if (searchModal) {
        const modal = new bootstrap.Modal(searchModal);
        modal.show();
      }
    });
  }
  
  // Evento del carrito
  const cartBtn = document.querySelector('#cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Abrir offcanvas del carrito
      const carritoOffcanvas = document.querySelector('#carritoOffcanvas');
      if (carritoOffcanvas) {
        const offcanvas = new bootstrap.Offcanvas(carritoOffcanvas);
        offcanvas.show();
      }
    });
  }
}

/**
 * Actualiza el badge del carrito con la cantidad de items
 */
export function updateCartBadge() {
  try {
    const badge = document.querySelector('#cart-badge');
    
    if (!badge) {
      log('debug', 'Badge del carrito no encontrado');
      return;
    }
    
    // Obtener items del carrito desde localStorage
    const cartItems = getFromStorage(STORAGE_KEYS.CART_ITEMS, []);
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    if (totalItems > 0) {
      badge.textContent = totalItems > 99 ? '99+' : totalItems;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
    
    log('debug', `Badge del carrito actualizado: ${totalItems} items`);
  } catch (error) {
    log('error', 'Error actualizando badge del carrito:', error);
  }
}

// ============================================================================
// UTILIDADES DE USUARIO
// ============================================================================

/**
 * Obtiene el nombre completo del usuario actual
 * @returns {string} Nombre completo o email si no hay nombre
 */
export function getUserFullName() {
  const user = getCurrentUser();
  if (!user) return '';
  
  return user.nombre || user.email || '';
}

/**
 * Obtiene el email del usuario actual
 * @returns {string} Email o cadena vacía
 */
export function getUserEmail() {
  const user = getCurrentUser();
  return user?.email || '';
}

/**
 * Obtiene el ID del usuario actual
 * @returns {string|null} ID del usuario o null
 */
export function getUserId() {
  const user = getCurrentUser();
  return user?._id || user?.id || null;
}

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string} role - Rol a verificar (ej: 'admin', 'user')
 * @returns {boolean} True si tiene el rol
 */
export function hasRole(role) {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  
  return user.role === role;
}

/**
 * Verifica si el usuario es administrador
 * @returns {boolean} True si es admin
 */
export function isAdmin() {
  return hasRole('admin');
}

// ============================================================================
// HEADERS PARA PETICIONES HTTP
// ============================================================================

/**
 * Obtiene headers para peticiones HTTP con autenticación
 * @param {boolean} includeContentType - Incluir Content-Type (por defecto true)
 * @returns {Object} Objeto con headers
 */
export function getAuthHeaders(includeContentType = true) {
  const headers = {};
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
}

/**
 * Obtiene configuración completa para fetch con autenticación
 * @param {string} method - Método HTTP (GET, POST, etc.)
 * @param {Object} body - Cuerpo de la petición (opcional)
 * @returns {Object} Configuración para fetch
 */
export function getFetchConfig(method = 'GET', body = null) {
  const config = {
    method,
    headers: getAuthHeaders()
  };
  
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }
  
  return config;
}

// ============================================================================
// EVENTOS GLOBALES
// ============================================================================

/**
 * Evento que se dispara cuando cambia el estado de autenticación
 */
export const AUTH_CHANGED_EVENT = 'auth-changed';

/**
 * Dispara evento de cambio de autenticación
 */
function triggerAuthChanged() {
  const event = new CustomEvent(AUTH_CHANGED_EVENT, {
    detail: { user: getCurrentUser() }
  });
  window.dispatchEvent(event);
}

/**
 * Escucha cambios en el estado de autenticación
 * @param {Function} callback - Función a ejecutar cuando cambia
 */
export function onAuthChanged(callback) {
  window.addEventListener(AUTH_CHANGED_EVENT, (e) => {
    callback(e.detail.user);
  });
}

// ============================================================================
// EXPORTS DEFAULT
// ============================================================================

export default {
  getCurrentUser,
  setCurrentUser,
  isAuthenticated,
  getAuthToken,
  updateUserData,
  logout,
  isTokenValid,
  requireAuth,
  redirectIfAuthenticated,
  loadComponent,
  loadComponents,
  initHeader,
  updateCartBadge,
  getUserFullName,
  getUserEmail,
  getUserId,
  hasRole,
  isAdmin,
  getAuthHeaders,
  getFetchConfig,
  onAuthChanged
};