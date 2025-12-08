/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MARAZUL E-COMMERCE - AUTENTICACIÓN Y MANEJO DE HEADER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Sistema completo de autenticación y manejo del header con jQuery.
 * 
 * Funcionalidades:
 * - Login/Logout
 * - Manejo de sesión con localStorage
 * - Renderizado dinámico del header según estado de autenticación
 * - Badge del carrito
 * - Dropdown de usuario con fondo blanco
 * 
 * Fecha: 27 Noviembre 2025
 * Versión: 1.2.1 (Eliminada función register duplicada)
 * 
 * NOTA: La función register() ahora está solo en api.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// MANEJO DE USUARIOS Y TOKENS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene el usuario actual desde localStorage
 * 
 * @returns {Object|null} Usuario actual o null si no está autenticado
 * 
 * @example
 * const user = getCurrentUser();
 * if (user) {
 *   console.log('Usuario:', user.name);
 * }
 */
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('marazul_current_user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    return null;
  }
}

/**
 * Guarda el usuario actual en localStorage
 * 
 * @param {Object} user - Objeto usuario { name, email, id, ... }
 * @returns {boolean} true si se guardó correctamente
 * 
 * @example
 * setCurrentUser({ name: 'Juan Pérez', email: 'juan@test.com' });
 */
function setCurrentUser(user) {
  try {
    if (!user) {
      localStorage.removeItem('marazul_current_user');
      return true;
    }
    
    localStorage.setItem('marazul_current_user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('❌ Error guardando usuario:', error);
    return false;
  }
}

/**
 * Obtiene el token de autenticación actual
 * 
 * @returns {string|null} Token JWT o null
 * 
 * @example
 * const token = getAuthToken();
 * if (token) {
 *   // Usuario autenticado
 * }
 */
function getAuthToken() {
  return localStorage.getItem('marazul_auth_token');
}

/**
 * Guarda el token de autenticación
 * 
 * @param {string} token - Token JWT
 * @returns {boolean} true si se guardó correctamente
 * 
 * @example
 * setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 */
function setAuthToken(token) {
  try {
    if (!token) {
      localStorage.removeItem('marazul_auth_token');
      return true;
    }
    
    localStorage.setItem('marazul_auth_token', token);
    return true;
  } catch (error) {
    console.error('❌ Error guardando token:', error);
    return false;
  }
}

/**
 * Verifica si el usuario está autenticado
 * 
 * @returns {boolean} true si hay usuario y token válidos
 * 
 * @example
 * if (isAuthenticated()) {
 *   // Mostrar contenido de usuario autenticado
 * }
 */
function isAuthenticated() {
  const user = getCurrentUser();
  const token = getAuthToken();
  return user !== null && token !== null;
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicia sesión con email y contraseña
 * 
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Respuesta del servidor con token y usuario
 * 
 * @example
 * const response = await login('usuario@test.com', 'password123');
 * if (response.success) {
 *   console.log('Login exitoso:', response.user);
 * }
 */
async function login(email, password) {
  console.log('🔐 Intentando login...');
  
  try {
    const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      console.log('✅ Login exitoso');
      
      // Guardar token y usuario
      setAuthToken(data.token);
      setCurrentUser(data.user);
      
      // Establecer flag de login reciente para actualizar header
      localStorage.setItem('marazul_recent_login', 'true');
      
      // Emitir evento de login
      $(document).trigger('auth:login', [data.user]);
      
      return data;
    } else {
      console.error('❌ Login fallido:', data.message);
      return data;
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    return {
      success: false,
      message: 'Error de conexión con el servidor'
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTA: FUNCIÓN register() ELIMINADA
// ═══════════════════════════════════════════════════════════════════════════
// 
// La función register() ahora está solo en api.js para evitar conflictos.
// 
// ANTES (líneas 190-230):
// async function register(userData) { ... }
// 
// AHORA: 
// - register() está en api.js
// - Usa apiRequest() para mayor consistencia
// - Maneja ambas estructuras de respuesta del backend
//
// Si necesitas usar register(), asegúrate de que api.js esté cargado.
//
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Alias de setAuthToken para compatibilidad con login.js y registro.js
 */
function saveToken(token) {
  return setAuthToken(token);
}

/**
 * Alias de setCurrentUser para compatibilidad con login.js y registro.js
 */
function saveUser(user) {
  return setCurrentUser(user);
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cierra la sesión del usuario
 * Limpia localStorage y redirige a home
 * 
 * @param {boolean} redirect - Si debe redirigir a home (default: true)
 * 
 * @example
 * logout(); // Cierra sesión y redirige
 * logout(false); // Solo cierra sesión sin redirigir
 */
function logout(redirect = true) {
  console.log('🚪 Cerrando sesión...');
  
  // Limpiar datos de autenticación
  setCurrentUser(null);
  setAuthToken(null);
  
  // Limpiar flag de login reciente
  localStorage.removeItem('marazul_recent_login');
  
  // Emitir evento de logout
  $(document).trigger('auth:logout');
  
  // Log
  console.log('✅ Sesión cerrada correctamente');
  
  // Redirigir a home
  if (redirect) {
    setTimeout(() => {
      navigateTo(CONFIG.ROUTES.HOME);
    }, 100);
  }

  if (showMessage) {
    alert("Sesión cerrada correctamente");
  }

  // Limpia datos
  localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
  localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);

  // Redirige SIEMPRE
  window.location.href = CONFIG.ROUTES.HOME;

}

/**
 * Requiere autenticación para acceder a una página
 * Si no está autenticado, redirige a login
 * 
 * @example
 * // Al inicio de ajustes.html, historial.html, etc:
 * requireAuth();
 */
function requireAuth() {
  if (!isAuthenticated()) {
    console.warn('⚠️  Acceso denegado: usuario no autenticado');
    
    // Guardar URL actual para redirigir después del login
    const currentUrl = window.location.pathname;
    saveToStorage('redirect_after_login', currentUrl);
    
    // Redirigir a login
    navigateTo(CONFIG.ROUTES.LOGIN);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN DEL HEADER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa el header con el estado de autenticación actual
 * Esta es la función que se llamará después de cargar header.html
 * 
 * Reemplaza las 44 líneas de código inline que estaban en cada HTML
 * 
 * @example
 * loadComponent('#header-container', CONFIG.COMPONENTS.HEADER, initHeader);
 */
function initHeader() {
  console.log('🔧 Inicializando header...');
  
  const $userArea = $('#user-area');
  
  if ($userArea.length === 0) {
    console.error('❌ Elemento #user-area no encontrado en el header');
    return;
  }
  
  const user = getCurrentUser();
  
  if (user && isAuthenticated()) {
    // Usuario autenticado: mostrar dropdown
    console.log('✅ Usuario autenticado detectado:', user.email);
    renderUserDropdown(user);
  } else {
    // Usuario no autenticado: mostrar botón login
    console.log('🔓 Usuario no autenticado');
    renderLoginButton();
  }
  
  // Actualizar badge del carrito
  updateCartBadge();
  
  console.log('✅ Header inicializado correctamente');
}

/**
 * Verifica si hubo un login reciente y actualiza el header
 * Se llama automáticamente al cargar la página
 * 
 * @private
 */
function checkRecentLoginAndUpdate() {
  const recentLogin = localStorage.getItem('marazul_recent_login');
  
  if (recentLogin === 'true') {
    console.log('🔄 Login reciente detectado, actualizando header...');
    
    // Limpiar flag
    localStorage.removeItem('marazul_recent_login');
    
    // Forzar actualización del header
    if ($('#user-area').length > 0) {
      initHeader();
    }
  }
}

/**
 * Renderiza el dropdown de usuario autenticado
 * ACTUALIZADO: Solo ícono blanco + dropdown con fondo blanco
 * 
 * @param {Object} user - Objeto usuario
 * @private
 */
function renderUserDropdown(user) {
  const $userArea = $('#user-area');

  const userEmail = user.email || 'Usuario';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || userEmail;

  // ======================================================
  // NUEVO: OPCIONES DE MENÚ SEGÚN ROLE
  // ======================================================
  let menuOptions = "";

  if (user.role === "admin") {
    // 🔴 MODO ADMIN
    menuOptions = `
      <li>
        <a class="dropdown-item py-2 px-3" 
          href="/MARAZUL/MARAZUL/frontend/components/dashboard.html"
          style="background-color: #e6f3ff; border-radius: 4px; font-weight: 600;">
          <i class="bi bi-tools me-2"></i>
          Administrador
        </a>
      </li>

      <li>
        <a class="dropdown-item py-2 px-3" href="/MARAZUL/MARAZUL/frontend/components/mensajes.html">
          <i class="bi bi-receipt-cutoff me-2"></i>
          Mensajes
        </a>
      </li>


      <li>
        <a class="dropdown-item py-2 px-3" href="/MARAZUL/MARAZUL/frontend/components/ordenes.html">
          <i class="bi bi-receipt-cutoff me-2"></i>
          Órdenes
        </a>
      </li>

      <li><hr class="dropdown-divider my-1"></li>
    `;
  } else {
    // 🟢 CUSTOMER NORMAL → mantener tal cual
    menuOptions = `
      <li>
        <a class="dropdown-item py-2 px-3" href="${CONFIG.ROUTES.AJUSTES}">
          <i class="bi bi-gear me-2" style="color: #003366;"></i>
          Mi cuenta
        </a>
      </li>

      <li><hr class="dropdown-divider my-1"></li>
    `;
  }

  // ======================================================
  // HTML ORIGINAL, SIN CAMBIAR, SOLO INSERTANDO menuOptions
  // ======================================================
  const dropdownHTML = `
    <div class="dropdown user-dropdown-wrapper">

      <!-- BOTÓN IDENTICO AL CARRITO -->
      <button
        class="btn btn-outline-dark d-flex align-items-center gap-2"
        type="button"
        id="userDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style="
          height: 31px;
          padding: 0 10px;
          color: white;
          border-color: white;
          font-size: 0.9rem;
        "
      >
        <i class="bi bi-person-circle" style="font-size: 1rem;"></i>
        <span class="fw-semibold">${escapeHtml(fullName)}</span>
      </button>

      <!-- DROPDOWN CENTRADO BAJO EL BOTÓN -->
      <ul
        class="dropdown-menu dropdown-menu-end user-dropdown-menu shadow"
        aria-labelledby="userDropdown"
        style="min-width: 240px; border: 1px solid #dee2e6; background-color: #ffffff;"
      >

        <li>
          <div class="dropdown-header bg-light border-bottom px-3 py-2">
            <small class="text-dark fw-bold d-block text-truncate">${escapeHtml(userEmail)}</small>
          </div>
        </li>

        ${menuOptions}

        <li>
          <a class="dropdown-item py-2 px-3 text-danger" href="#" id="logout-btn">
            <i class="bi bi-box-arrow-right me-2"></i>
            Cerrar sesión
          </a>
        </li>

      </ul>
    </div>
  `;

  $userArea.html(dropdownHTML);

  $('#logout-btn').on('click', function (e) {
    e.preventDefault();
    logout();
  });

  console.log("✅ Dropdown renderizado correctamente para rol:", user.role || "Customer");
}








/**
 * Renderiza el botón de login para usuarios no autenticados
 * ACTUALIZADO: Muestra ícono + texto "Iniciar Sesión"
 * 
 * @private
 */
function renderLoginButton() {
  const $userArea = $('#user-area');
  
  const loginButtonHTML = `
    <a href="${CONFIG.ROUTES.LOGIN}" 
       class="btn btn-sm btn-outline-light d-flex align-items-center gap-2" 
       style="text-decoration: none;">
      <i class="bi bi-person-circle"></i>
      <span class="d-none d-md-inline">Iniciar Sesión</span>
      <span class="d-inline d-md-none">Login</span>
    </a>
  `;
  
  $userArea.html(loginButtonHTML);
  
  console.log('🔓 Botón de login renderizado');
}

// ═══════════════════════════════════════════════════════════════════════════
// BADGE DEL CARRITO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Actualiza el badge del carrito con la cantidad de items
 * Lee del localStorage y actualiza el número en el badge
 * 
 * Esta función se llama desde:
 * - initHeader() al cargar
 * - addToCart() al agregar producto
 * - removeFromCart() al eliminar producto
 * 
 * @example
 * updateCartBadge(); // Actualiza el badge
 */
function updateCartBadge() {
  const cart = getFromStorage(CONFIG.STORAGE_KEYS.CART, []);
  const $badge = $('#cart-badge');
  
  if ($badge.length === 0) {
    // Badge aún no existe, intentar nuevamente en 100ms
    setTimeout(updateCartBadge, 100);
    return;
  }
  
  const itemCount = cart.length;
  
  // Actualizar número
  $badge.text(itemCount);
  
  // Mostrar/ocultar badge según cantidad
  if (itemCount > 0) {
    $badge.show();
  } else {
    $badge.hide();
  }
  
  console.log(`🛒 Badge actualizado: ${itemCount} productos distintos`);
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Escapa HTML para prevenir XSS
 * 
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 * @private
 */
function escapeHtml(text) {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function syncLocalCartIntoBackend() {
  const localCart = getFromStorage(CONFIG.STORAGE_KEYS.CART, []);

  if (!localCart || localCart.length === 0) {
    console.log("🟦 No hay carrito local para sincronizar.");
    return;
  }

  console.log("🔄 Fusionando carrito local → backend...", localCart);

  for (const item of localCart) {
    await addToCartBackend(item.productId, item.quantity);
  }

  // Limpia carrito local para evitar duplicación
  saveToStorage(CONFIG.STORAGE_KEYS.CART, []);
}

async function refreshLocalCartFromBackend() {
  const response = await getCartFromBackend();

  if (!response.success) {
    console.error("❌ No se pudo refrescar carrito desde backend");
    return;
  }

  const backendItems = response.data.items || response.data;

  const normalized = backendItems.map(item => ({
    cartItemId: item._id,
    productId: item.productId._id,
    name: item.productId.name,
    price: item.unitPrice,
    image: item.productId.mainImage,
    quantity: item.quantity
  }));

  saveToStorage(CONFIG.STORAGE_KEYS.CART, normalized);

  console.log("🟢 Carrito local actualizado con backend:", normalized);
}


// ═══════════════════════════════════════════════════════════════════════════
// EVENTOS GLOBALES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Escuchar evento de actualización del carrito
 * Cuando se agrega/elimina un producto, actualizar el badge
 */
$(document).on('cart:updated', function() {
  updateCartBadge();
});

/**
 * Escuchar evento de login exitoso
 * Cuando el usuario hace login, actualizar el header inmediatamente
 */
$(document).on('auth:login', async function(event, user) {
  console.log('✅ Evento login detectado:', user.email || user.name);

  // Asegurar que el usuario fue guardado
  setCurrentUser(user);

  // 🔄 1. Fusionar carrito local → backend
  await syncLocalCartIntoBackend();

  // 🔄 2. Refrescar carrito local con datos reales del backend
  await refreshLocalCartFromBackend();

  // 🔄 3. Actualizar badge del carrito
  updateCartBadge();

  // 🔄 4. Re-renderizar header
  setTimeout(function() {
    if ($('#user-area').length > 0) {
      console.log('🔄 Actualizando header después de login...');
      initHeader();
    }
  }, 200);
});


/**
 * Escuchar evento de logout
 * Actualizar header y limpiar datos
 */
$(document).on('auth:logout', function() {
  console.log('👋 Evento logout detectado');
  
  // Actualizar header inmediatamente si está disponible
  setTimeout(function() {
    if ($('#user-area').length > 0) {
      console.log('🔄 Actualizando header después de logout...');
      initHeader();
    }
  }, 100);
});

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAR FUNCIONES
// ═══════════════════════════════════════════════════════════════════════════

// Hacer disponible globalmente (para compatibilidad con jQuery)
window.AUTH = {
  // Manejo de usuarios
  getCurrentUser,
  setCurrentUser,
  getAuthToken,
  setAuthToken,
  isAuthenticated,
  
  // Login (register ahora está en api.js)
  login,
  saveToken,
  saveUser,
  
  // Logout
  logout,
  requireAuth,
  
  // Header
  initHeader,
  updateCartBadge,
  checkRecentLoginAndUpdate,
};

// Hacer funciones disponibles globalmente para fácil acceso
Object.assign(window, window.AUTH);

// Log en desarrollo
if (!CONFIG.isProduction) {
  console.log('✅ AUTH cargado correctamente (v1.2.1 - Sin register duplicado)');
  console.log('📦 Funciones disponibles:', Object.keys(window.AUTH).length);
  
  // Mostrar estado de autenticación
  if (isAuthenticated()) {
    const user = getCurrentUser();
    console.log('👤 Usuario autenticado:', user.firstName || user.name || user.email);
  } else {
    console.log('🔓 Usuario no autenticado');
  }
}

// Verificar login reciente cuando el DOM esté listo
$(document).ready(function() {
  // Verificar si hubo un login reciente y actualizar header
  setTimeout(checkRecentLoginAndUpdate, 100);
});

function updateHeaderCartVisibility() {
    const wrapper = document.getElementById("header-cart-wrapper");
    const user = getCurrentUser();

    if (!wrapper) return;

    // ① Usuario NO autenticado → ocultar (ya funciona)
    if (!isAuthenticated()) {
        wrapper.style.display = "none";
        return;
    }

    // ③ Usuario normal → mostrar carrito
    wrapper.style.display = "block";
}

