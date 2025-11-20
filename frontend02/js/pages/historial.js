/**
 * ============================================================================
 * MARAZUL - Página de Historial de Pedidos
 * ============================================================================
 * 
 * Archivo: pages/historial.js
 * Descripción: Lógica del historial de pedidos del usuario
 * Versión: 1.0
 */

import { ORDER_STATUS_LABELS, ORDER_STATUS_CLASSES } from '../config.js';
import {
  requireAuth,
  loadComponent,
  initHeader
} from '../auth.js';
import {
  getOrders,
  getOrderById
} from '../api.js';
import {
  formatPrice,
  formatDate,
  showToast,
  showLoading,
  hideLoading,
  log
} from '../utils.js';

// ============================================================================
// VARIABLES GLOBALES
// ============================================================================

let allOrders = []; // Todos los pedidos del usuario

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa la página de historial
 */
async function init() {
  try {
    log('info', 'Inicializando página de historial...');
    
    // Verificar autenticación
    if (!requireAuth()) {
      return;
    }
    
    // Cargar componentes
    await loadComponents();
    
    // Inicializar header
    initHeader();
    
    // Cargar pedidos
    await loadOrders();
    
    // Configurar eventos
    setupEvents();
    
    log('info', 'Página de historial inicializada');
  } catch (error) {
    log('error', 'Error inicializando historial:', error);
  }
}

/**
 * Carga componentes HTML necesarios
 */
async function loadComponents() {
  try {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      await loadComponent('header-container', '../components/header.html');
    }
  } catch (error) {
    log('error', 'Error cargando componentes:', error);
  }
}

// ============================================================================
// CARGA DE PEDIDOS
// ============================================================================

/**
 * Carga todos los pedidos del usuario
 */
async function loadOrders() {
  const container = document.getElementById('orders-container');
  
  if (!container) {
    log('warn', 'Contenedor de pedidos no encontrado');
    return;
  }
  
  try {
    showLoading(container);
    
    const response = await getOrders();
    
    if (response.success && response.orders.length > 0) {
      allOrders = response.orders;
      renderOrders(allOrders);
      log('info', `${allOrders.length} pedidos cargados`);
    } else {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
          <p class="text-muted">No tienes pedidos aún</p>
          <a href="/MARAZUL/MARAZUL/frontend02/index.html" class="btn btn-primary">
            Ver productos
          </a>
        </div>
      `;
    }
  } catch (error) {
    log('error', 'Error cargando pedidos:', error);
    container.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle"></i>
        Error cargando el historial de pedidos
      </div>
    `;
  }
}

/**
 * Renderiza la lista de pedidos
 * @param {Array} orders - Array de pedidos
 */
function renderOrders(orders) {
  const container = document.getElementById('orders-container');
  
  if (!container) return;
  
  let html = '<div class="row g-3">';
  
  orders.forEach(order => {
    html += createOrderCard(order);
  });
  
  html += '</div>';
  
  container.innerHTML = html;
  
  // Configurar eventos de las cards
  setupOrderCardEvents();
}

/**
 * Crea el HTML de una card de pedido
 * @param {Object} order - Objeto del pedido
 * @returns {string} HTML de la card
 */
function createOrderCard(order) {
  const statusClass = ORDER_STATUS_CLASSES[order.estado] || 'bg-secondary';
  const statusLabel = ORDER_STATUS_LABELS[order.estado] || order.estado;
  const orderDate = formatDate(order.fechaPedido || order.createdAt);
  const itemCount = order.items?.length || 0;
  
  return `
    <div class="col-12">
      <div class="card order-card shadow-sm" data-order-id="${order._id}" style="cursor: pointer;">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-3">
              <h6 class="mb-1">Pedido #${order.numeroPedido || order._id.slice(-6).toUpperCase()}</h6>
              <small class="text-muted">${orderDate}</small>
            </div>
            <div class="col-md-3">
              <small class="text-muted d-block">Items</small>
              <span>${itemCount} producto${itemCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="col-md-3">
              <small class="text-muted d-block">Total</small>
              <strong class="text-success">${formatPrice(order.total)}</strong>
            </div>
            <div class="col-md-3 text-end">
              <span class="badge ${statusClass}">${statusLabel}</span>
              <div class="mt-2">
                <button class="btn btn-sm btn-outline-primary btn-view-order" 
                        data-order-id="${order._id}">
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Configura eventos de las cards de pedidos
 */
function setupOrderCardEvents() {
  // Click en la card para ver detalles
  document.querySelectorAll('.order-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // No abrir si se hizo click en el botón
      if (e.target.closest('.btn-view-order')) {
        return;
      }
      
      const orderId = this.dataset.orderId;
      viewOrderDetails(orderId);
    });
  });
  
  // Botones de ver detalles
  document.querySelectorAll('.btn-view-order').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const orderId = this.dataset.orderId;
      viewOrderDetails(orderId);
    });
  });
}

// ============================================================================
// DETALLES DEL PEDIDO
// ============================================================================

/**
 * Muestra los detalles de un pedido en un modal
 * @param {string} orderId - ID del pedido
 */
async function viewOrderDetails(orderId) {
  try {
    log('debug', 'Viendo detalles del pedido:', orderId);
    
    // Buscar pedido en el array local primero
    let order = allOrders.find(o => o._id === orderId);
    
    // Si no está en local, buscar en API
    if (!order) {
      const response = await getOrderById(orderId);
      if (response.success) {
        order = response.order;
      }
    }
    
    if (!order) {
      showToast('Pedido no encontrado', 'error');
      return;
    }
    
    // Renderizar modal con detalles
    renderOrderDetailsModal(order);
    
    // Abrir modal
    const modalElement = document.getElementById('orderDetailsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  } catch (error) {
    log('error', 'Error viendo detalles del pedido:', error);
    showToast('Error cargando detalles del pedido', 'error');
  }
}

/**
 * Renderiza el modal con los detalles del pedido
 * @param {Object} order - Objeto del pedido
 */
function renderOrderDetailsModal(order) {
  const modalBody = document.getElementById('order-details-body');
  
  if (!modalBody) {
    log('error', 'Modal de detalles no encontrado');
    return;
  }
  
  const statusClass = ORDER_STATUS_CLASSES[order.estado] || 'bg-secondary';
  const statusLabel = ORDER_STATUS_LABELS[order.estado] || order.estado;
  
  let html = `
    <div class="mb-3">
      <h6>Pedido #${order.numeroPedido || order._id.slice(-6).toUpperCase()}</h6>
      <small class="text-muted">Fecha: ${formatDate(order.fechaPedido || order.createdAt, true)}</small>
      <div class="mt-2">
        <span class="badge ${statusClass}">${statusLabel}</span>
      </div>
    </div>
    
    <div class="mb-3">
      <h6>Productos</h6>
      <div class="list-group list-group-flush">
  `;
  
  order.items.forEach(item => {
    html += `
      <div class="list-group-item">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>${item.producto?.nombre || 'Producto'}</strong>
            <br>
            <small class="text-muted">Cantidad: ${item.cantidad} × ${formatPrice(item.precio)}</small>
          </div>
          <strong>${formatPrice(item.subtotal)}</strong>
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
    
    <div class="mb-3">
      <h6>Dirección de envío</h6>
      <p class="mb-0">${order.direccionEnvio || 'No especificada'}</p>
    </div>
    
    <div class="d-flex justify-content-between align-items-center border-top pt-3">
      <strong>Total</strong>
      <h5 class="mb-0 text-success">${formatPrice(order.total)}</h5>
    </div>
  `;
  
  modalBody.innerHTML = html;
}

// ============================================================================
// FILTROS
// ============================================================================

/**
 * Filtra pedidos por estado
 * @param {string} status - Estado del pedido
 */
function filterByStatus(status) {
  if (!status || status === 'all') {
    renderOrders(allOrders);
  } else {
    const filtered = allOrders.filter(order => order.estado === status);
    renderOrders(filtered);
  }
}

// ============================================================================
// EVENTOS
// ============================================================================

/**
 * Configura todos los eventos de la página
 */
function setupEvents() {
  // Filtros de estado (si existen)
  const filterButtons = document.querySelectorAll('.btn-filter-status');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const status = this.dataset.status;
      filterByStatus(status);
      
      // Actualizar botón activo
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Botón de actualizar
  const btnRefresh = document.getElementById('btn-refresh-orders');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', loadOrders);
  }
}

// ============================================================================
// INICIAR AL CARGAR LA PÁGINA
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exports
export {
  init,
  loadOrders,
  viewOrderDetails
};