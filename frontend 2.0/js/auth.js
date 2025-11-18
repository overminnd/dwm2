// ============================================
// AUTH - AUTENTICACIÓN Y COMPONENTES
// ============================================

import { ROUTES, STORAGE_KEYS } from './config.js';
import { login as apiLogin } from './api.js';

// ============================================
// GESTIÓN DE USUARIO
// ============================================

/**
 * Obtiene el usuario actual del localStorage
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Guarda el usuario en localStorage
 */
export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    if (user.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, user.token);
    }
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }
}

/**
 * Cierra sesión del usuario
 */
export function logout() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
  localStorage.removeItem(STORAGE_KEYS.CART_COUNT);
  window.location.href = ROUTES.HOME;
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

// ============================================
// CARGA DE COMPONENTES
// ============================================

/**
 * Carga un componente HTML dinámicamente
 * @param {string} containerId - ID del contenedor donde se inyectará
 * @param {string} filePath - Ruta del archivo HTML a cargar
 * @param {Function} callback - Función a ejecutar después de cargar
 */
export function loadComponent(containerId, filePath, callback) {
  fetch(filePath)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(html => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = html;
        if (typeof callback === 'function') {
          callback();
        }
      }
    })
    .catch(err => {
      console.error(`Error al cargar ${filePath}:`, err);
    });
}

// ============================================
// INICIALIZACIÓN DEL HEADER
// ============================================

/**
 * Inicializa el header con el estado de autenticación del usuario
 * Esta función reemplaza initHeader() que estaba duplicada en todos los archivos
 */
export function initHeader() {
  const userArea = document.getElementById('user-area');
  if (!userArea) return;

  userArea.innerHTML = '';

  const user = getCurrentUser();

  if (user) {
    // Usuario autenticado - Mostrar dropdown
    userArea.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-outline-dark btn-sm dropdown-toggle" 
                type="button"
                id="userMenu" 
                data-bs-toggle="dropdown" 
                aria-expanded="false">
          ${user.name || user.email}
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
          <li><h6 class="dropdown-header">${user.email}</h6></li>
          <li><a class="dropdown-item" href="${ROUTES.HISTORIAL}">Historial de compras</a></li>
          <li><a class="dropdown-item" href="${ROUTES.AJUSTES}">Ajustes de usuario</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a id="logoutBtn" class="dropdown-item text-danger" href="#">Cerrar sesión</a></li>
        </ul>
      </div>
    `;

    // Event listener para logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }
  } else {
    // Usuario NO autenticado - Mostrar botón de login
    userArea.innerHTML = `
      <a class="btn btn-outline-dark btn-sm" href="${ROUTES.LOGIN}">
        Iniciar Sesión
      </a>
    `;
  }
}

// ============================================
// ACTUALIZACIÓN DEL BADGE DEL CARRITO
// ============================================

/**
 * Actualiza el badge del carrito en el header
 */
export function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;

  const cartItems = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART_ITEMS) || '[]');
  const count = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove('d-none');
  } else {
    badge.classList.add('d-none');
  }
}

// ============================================
// PROTECCIÓN DE RUTAS
// ============================================

/**
 * Redirige a login si el usuario no está autenticado
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = ROUTES.LOGIN;
    return false;
  }
  return true;
}

/**
 * Redirige al home si el usuario ya está autenticado
 * Útil para páginas de login/registro
 */
export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = ROUTES.HOME;
    return true;
  }
  return false;
}

// ============================================
// INICIALIZACIÓN DE PÁGINA
// ============================================

/**
 * Inicializa componentes comunes en todas las páginas
 * @param {Object} options - Opciones de inicialización
 */
export function initPage(options = {}) {
  const {
    loadHeader = true,
    loadCarrito = true,
    requireAuthentication = false
  } = options;

  // Verificar autenticación si es requerida
  if (requireAuthentication) {
    if (!requireAuth()) return;
  }

  // Cargar header
  if (loadHeader) {
    const headerPath = options.headerPath || '../components/header.html';
    loadComponent('header-container', headerPath, () => {
      initHeader();
      updateCartBadge();
    });
  }

  // Cargar carrito
  if (loadCarrito) {
    const carritoPath = options.carritoPath || '../components/carrito.html';
    loadComponent('carrito-container', carritoPath, () => {
      // Aquí se pueden agregar más inicializaciones del carrito
    });
  }
}