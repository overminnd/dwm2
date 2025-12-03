/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MARAZUL E-COMMERCE - PÁGINA HISTORIAL DE PEDIDOS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Gestiona el historial de pedidos del usuario:
 * - Verificación de autenticación
 * - Carga de pedidos desde localStorage
 * - Renderizado de lista de pedidos
 * - Modal de detalle de pedido
 * - Estado vacío cuando no hay pedidos
 * 
 * Fecha: 26 Noviembre 2025
 * Versión: 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// VARIABLES GLOBALES
// ═══════════════════════════════════════════════════════════════════════════

let currentUser = null;
let userOrders = [];

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

$(document).ready(function() {
  console.log('📦 Inicializando página de historial de pedidos...');
  
  // Cargar componentes dinámicos
  loadPageComponents();
  
  // Verificar autenticación y cargar pedidos
  setTimeout(() => {
    checkAuthenticationAndLoadOrders();
  }, 500);
});

/**
 * Carga los componentes dinámicos de la página
 */
function loadPageComponents() {
  // Cargar header
  UTILS.loadComponent('header-container', 'header.html', function() {
    if (typeof initHeader === 'function') {
      initHeader();
    }
    console.log('✅ Header cargado');
  });
  
  // Cargar carrito
  UTILS.loadComponent('carrito-container', 'carrito.html', function() {
    console.log('✅ Carrito cargado');
  });
  
  console.log('✅ Componentes de historial inicializados');
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verifica si hay un usuario autenticado y carga sus pedidos
 */
function checkAuthenticationAndLoadOrders() {
  console.log('🔐 Verificando autenticación...');
  
  // Obtener usuario actual desde localStorage
  const userString = localStorage.getItem('marazul_current_user');
  
  if (!userString) {
    console.log('❌ Usuario no autenticado. Redirigiendo a login...');
    // Redirigir a login
    window.location.href = CONFIG.ROUTES.LOGIN;

  }
  
  try {
    currentUser = JSON.parse(userString);
    console.log('✅ Usuario autenticado:', currentUser.email);
    
    // Cargar pedidos del usuario
    loadOrders();
  } catch (error) {
    console.error('❌ Error al parsear usuario:', error);
    window.location.href = CONFIG.ROUTES.LOGIN;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CARGA DE PEDIDOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Carga los pedidos del usuario desde localStorage
 */
function loadOrders() {
  console.log('📦 Cargando pedidos del usuario...');
  
  // Clave en localStorage: marazul_orders_[email]
  const ordersKey = `marazul_orders_${currentUser.email}`;
  const ordersString = localStorage.getItem(ordersKey);
  
  if (!ordersString) {
    console.log('📭 No hay pedidos en localStorage');
    userOrders = [];
  } else {
    try {
      userOrders = JSON.parse(ordersString);
      console.log(`✅ ${userOrders.length} pedidos cargados`);
    } catch (error) {
      console.error('❌ Error al parsear pedidos:', error);
      userOrders = [];
    }
  }
  
  // Renderizar pedidos
  renderOrdersList();
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERIZADO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Renderiza la lista de pedidos o el estado vacío
 */
function renderOrdersList() {
  const $container = $('#orders-container');
  
  // Ocultar spinner de carga
  $('#loading-spinner').hide();
  
  // Si no hay pedidos, mostrar estado vacío
  if (userOrders.length === 0) {
    renderEmptyState();
    return;
  }
  
  // Ordenar pedidos por fecha (más reciente primero)
  const sortedOrders = userOrders.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  // Generar HTML de pedidos
  let ordersHTML = '<div class="row g-3">';
  
  sortedOrders.forEach(order => {
    ordersHTML += generateOrderCard(order);
  });
  
  ordersHTML += '</div>';
  
  // Insertar en el DOM
  $container.html(ordersHTML);
  
  // Vincular eventos de click
  bindOrderCardEvents();
  
  console.log('✅ Lista de pedidos renderizada');
}

/**
 * Genera el HTML de una card de pedido
 */
function generateOrderCard(order) {
  const statusBadge = getStatusBadge(order.status);
  const formattedDate = formatDate(order.date);
  const formattedTotal = formatPrice(order.total);
  const itemCount = order.items.length;
  
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card order-card shadow-sm h-100" data-order-id="${order.id}">
        <div class="card-body">
          
          <!-- Header de la card -->
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 class="card-title fw-bold mb-1">${order.id}</h6>
              <p class="text-muted small mb-0">
                <i class="bi bi-calendar3 me-1"></i>
                ${formattedDate}
              </p>
            </div>
            ${statusBadge}
          </div>
          
          <!-- Información del pedido -->
          <div class="mb-3">
            <p class="mb-1">
              <i class="bi bi-box-seam me-2" style="color: #003366;"></i>
              <strong>${itemCount}</strong> ${itemCount === 1 ? 'producto' : 'productos'}
            </p>
            <p class="mb-0">
              <i class="bi bi-currency-dollar me-2" style="color: #003366;"></i>
              <strong class="fs-5">${formattedTotal}</strong>
            </p>
          </div>
          
          <!-- Botón ver detalle -->
          <button class="btn btn-sm w-100 text-white" style="background-color: #003366;">
            <i class="bi bi-eye me-1"></i>
            Ver detalle
          </button>
          
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza el estado vacío cuando no hay pedidos
 */
function renderEmptyState() {
  const $container = $('#orders-container');
  
  const emptyHTML = `
    <div class="empty-state">
      <div class="empty-state-icon mb-4">
        <i class="bi bi-inbox"></i>
      </div>
      <h4 class="fw-bold mb-3">Aún no has realizado ningún pedido</h4>
      <p class="text-muted mb-4">
        Cuando realices tu primera compra, aparecerá aquí el historial.
      </p>
      <a href="/MARAZUL/MARAZUL/frontend/index.html" 
         class="btn btn-lg text-white" 
         style="background-color: #003366;">
        <i class="bi bi-shop me-2"></i>
        Explorar Productos
      </a>
    </div>
  `;
  
  $container.html(emptyHTML);
  console.log('✅ Estado vacío renderizado');
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENTOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vincula eventos de click a las cards de pedidos
 */
function bindOrderCardEvents() {
  $('.order-card').on('click', function() {
    const orderId = $(this).data('order-id');
    showOrderDetail(orderId);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL DE DETALLE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Muestra el modal con el detalle completo del pedido
 */
function showOrderDetail(orderId) {
  console.log('📋 Mostrando detalle del pedido:', orderId);
  
  // Buscar pedido
  const order = userOrders.find(o => o.id === orderId);
  
  if (!order) {
    console.error('❌ Pedido no encontrado:', orderId);
    return;
  }
  
  // Generar HTML del detalle
  const detailHTML = generateOrderDetailHTML(order);
  
  // Insertar en el modal
  $('#order-detail-content').html(detailHTML);
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
  modal.show();
}

/**
 * Genera el HTML del detalle completo del pedido
 */
function generateOrderDetailHTML(order) {
  const statusBadge = getStatusBadge(order.status);
  const formattedDate = formatDate(order.date);
  const formattedTotal = formatPrice(order.total);
  
  let html = `
    <!-- Información General -->
    <div class="mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 class="fw-bold mb-1">${order.id}</h5>
          <p class="text-muted small mb-0">
            <i class="bi bi-calendar3 me-1"></i>
            ${formattedDate}
          </p>
        </div>
        ${statusBadge}
      </div>
    </div>
    
    <hr>
    
    <!-- Productos -->
    <div class="mb-4">
      <h6 class="fw-bold mb-3">
        <i class="bi bi-box-seam me-2" style="color: #003366;"></i>
        Productos
      </h6>
      <div class="list-group list-group-flush">
  `;
  
  // Listar productos
  order.items.forEach(item => {
    const itemTotal = item.quantity * item.price;
    html += `
      <div class="list-group-item d-flex justify-content-between align-items-start px-0">
        <div class="flex-grow-1">
          <h6 class="mb-1">${item.name}</h6>
          <small class="text-muted">
            ${formatPrice(item.price)} x ${item.quantity}
          </small>
        </div>
        <strong>${formatPrice(itemTotal)}</strong>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
    
    <hr>
    
    <!-- Total -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0">Total</h5>
      <h4 class="fw-bold mb-0" style="color: #003366;">${formattedTotal}</h4>
    </div>
  `;
  
  // Dirección de envío (si existe)
  if (order.shippingAddress) {
    html += `
      <hr>
      <div class="mb-3">
        <h6 class="fw-bold mb-2">
          <i class="bi bi-geo-alt me-2" style="color: #003366;"></i>
          Dirección de Envío
        </h6>
        <p class="text-muted mb-0">${order.shippingAddress}</p>
      </div>
    `;
  }
  
  // Método de pago (si existe)
  if (order.paymentMethod) {
    html += `
      <div class="mb-3">
        <h6 class="fw-bold mb-2">
          <i class="bi bi-credit-card me-2" style="color: #003366;"></i>
          Método de Pago
        </h6>
        <p class="text-muted mb-0">${order.paymentMethod}</p>
      </div>
    `;
  }
  
  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Retorna el badge HTML según el estado del pedido
 */
function getStatusBadge(status) {
  const statusConfig = {
    'pending': {
      text: 'Pendiente',
      class: 'bg-warning text-dark'
    },
    'processing': {
      text: 'Procesando',
      class: 'bg-info text-dark'
    },
    'completed': {
      text: 'Completado',
      class: 'bg-success'
    },
    'cancelled': {
      text: 'Cancelado',
      class: 'bg-danger'
    }
  };
  
  const config = statusConfig[status] || statusConfig['pending'];
  
  return `<span class="badge status-badge ${config.class}">${config.text}</span>`;
}

/**
 * Formatea una fecha en formato legible
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('es-CL', options);
}

/**
 * Formatea un precio en formato chileno
 */
function formatPrice(price) {
  return '$' + price.toLocaleString('es-CL');
}

// ═══════════════════════════════════════════════════════════════════════════
// LOG DE INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

console.log('✅ historial.js cargado correctamente');