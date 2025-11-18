// ============================================
// HISTORIAL - PÁGINA DE HISTORIAL DE COMPRAS
// ============================================

import { initPage } from '../auth.js';
import { getOrders } from '../api.js';
import { formatDate, formatPrice, showLoading } from '../utils.js';

// Estado de la página
let currentPage = 1;
let totalPages = 1;

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar página (requiere autenticación)
  initPage({ requireAuthentication: true });
  
  // Cargar órdenes
  loadOrders();
  
  // Inicializar paginación
  initPagination();
});

// ============================================
// CARGAR ÓRDENES
// ============================================

async function loadOrders(page = 1) {
  const loading = document.getElementById('ordersLoading');
  const error = document.getElementById('ordersError');
  const empty = document.getElementById('ordersEmpty');
  const list = document.getElementById('ordersList');
  
  // Mostrar loading
  if (loading) loading.classList.remove('d-none');
  if (error) error.classList.add('d-none');
  if (empty) empty.classList.add('d-none');
  if (list) list.classList.add('d-none');
  
  try {
    const result = await getOrders(page);
    
    if (result.success) {
      const orders = result.data.orders || [];
      totalPages = result.data.totalPages || 1;
      currentPage = page;
      
      if (orders.length === 0) {
        // No hay órdenes
        if (loading) loading.classList.add('d-none');
        if (empty) empty.classList.remove('d-none');
      } else {
        // Renderizar órdenes
        renderOrders(orders);
        if (loading) loading.classList.add('d-none');
        if (list) list.classList.remove('d-none');
        
        // Actualizar paginación
        updatePagination();
      }
    } else {
      throw new Error(result.message || 'Error al cargar órdenes');
    }
  } catch (err) {
    console.error('Error al cargar órdenes:', err);
    if (loading) loading.classList.add('d-none');
    if (error) error.classList.remove('d-none');
  }
}

// ============================================
// RENDERIZAR ÓRDENES
// ============================================

function renderOrders(orders) {
  const list = document.getElementById('ordersList');
  const template = document.getElementById('orderTemplate');
  
  if (!list || !template) return;
  
  // Limpiar contenedor (excepto el template)
  const existingCards = list.querySelectorAll('.order-card');
  existingCards.forEach(card => card.remove());
  
  // Renderizar cada orden
  orders.forEach(order => {
    const clone = template.content.cloneNode(true);
    
    // Número de orden
    const orderNumber = clone.querySelector('.order-number');
    if (orderNumber) {
      orderNumber.textContent = `Orden #${order.orderNumber || order._id}`;
    }
    
    // Estado
    const orderStatus = clone.querySelector('.order-status');
    if (orderStatus) {
      orderStatus.textContent = getStatusText(order.status);
      orderStatus.className = `badge ${getStatusClass(order.status)}`;
    }
    
    // Fecha
    const orderDate = clone.querySelector('.order-date');
    if (orderDate) {
      orderDate.textContent = formatDate(order.createdAt);
    }
    
    // Preview de items
    const itemsPreview = clone.querySelector('.order-items-preview');
    if (itemsPreview && order.items) {
      const itemsText = order.items.slice(0, 3).map(item => 
        `${item.quantity}x ${item.productName}`
      ).join(', ');
      itemsPreview.textContent = itemsText + (order.items.length > 3 ? '...' : '');
    }
    
    // Total
    const orderTotal = clone.querySelector('.order-total');
    if (orderTotal) {
      orderTotal.textContent = formatPrice(order.total || 0);
    }
    
    // Botón ver detalles
    const viewBtn = clone.querySelector('.view-order-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => showOrderDetail(order));
    }
    
    list.appendChild(clone);
  });
}

// ============================================
// DETALLE DE ORDEN
// ============================================

function showOrderDetail(order) {
  const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
  const title = document.getElementById('orderDetailTitle');
  const content = document.getElementById('orderDetailContent');
  
  if (title) {
    title.textContent = `Orden #${order.orderNumber || order._id}`;
  }
  
  if (content) {
    content.innerHTML = `
      <div class="row">
        <div class="col-md-6 mb-3">
          <h6>Estado</h6>
          <span class="badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span>
        </div>
        <div class="col-md-6 mb-3">
          <h6>Fecha</h6>
          <p class="mb-0">${formatDate(order.createdAt)}</p>
        </div>
        <div class="col-12 mb-3">
          <h6>Productos</h6>
          <ul class="list-unstyled">
            ${order.items ? order.items.map(item => `
              <li class="mb-2">
                ${item.quantity}x ${item.productName} - ${formatPrice(item.price * item.quantity)}
              </li>
            `).join('') : ''}
          </ul>
        </div>
        <div class="col-12 mb-3">
          <h6>Dirección de envío</h6>
          <p class="mb-0">${order.shippingAddress || 'No especificada'}</p>
        </div>
        <div class="col-12">
          <h6>Total</h6>
          <p class="fw-bold fs-5 text-success mb-0">${formatPrice(order.total || 0)}</p>
        </div>
      </div>
    `;
  }
  
  modal.show();
}

// ============================================
// HELPERS DE ESTADO
// ============================================

function getStatusText(status) {
  const statusTexts = {
    'pending': 'Pendiente',
    'processing': 'En proceso',
    'shipped': 'Enviado',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
  };
  return statusTexts[status] || status;
}

function getStatusClass(status) {
  const statusClasses = {
    'pending': 'bg-warning',
    'processing': 'bg-info',
    'shipped': 'bg-primary',
    'delivered': 'bg-success',
    'cancelled': 'bg-danger'
  };
  return statusClasses[status] || 'bg-secondary';
}

// ============================================
// PAGINACIÓN
// ============================================

function initPagination() {
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        loadOrders(currentPage - 1);
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        loadOrders(currentPage + 1);
      }
    });
  }
}

function updatePagination() {
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const pagination = document.getElementById('ordersPagination');
  
  if (totalPages > 1) {
    if (pagination) pagination.classList.remove('d-none');
    
    if (prevBtn) {
      prevBtn.disabled = currentPage === 1;
    }
    
    if (nextBtn) {
      nextBtn.disabled = currentPage === totalPages;
    }
    
    if (pageInfo) {
      pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
  } else {
    if (pagination) pagination.classList.add('d-none');
  }
}