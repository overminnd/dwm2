/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AJUSTES.JS - PÁGINA DE CUENTA DE USUARIO
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Maneja toda la funcionalidad de la página Mi Cuenta:
 * - Perfil: Ver y editar información personal
 * - Contraseña: Cambiar contraseña
 * - Direcciones: CRUD completo de direcciones
 * - Pedidos: Historial con búsqueda y paginación
 * 
 * Fecha: 27 Noviembre 2025
 * Versión: 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════════════════════

const ajustesState = {
  currentSection: 'perfil',
  addresses: [],
  orders: [],
  currentPage: 1,
  ordersPerPage: 10,
  searchQuery: '',
  editingAddressId: null
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVEGACIÓN ENTRE SECCIONES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa la navegación del sidebar
 */
function initNavigation() {
  console.log('🧭 Inicializando navegación...');
  
  $('.sidebar-link').on('click', function(e) {
    e.preventDefault();
    
    const section = $(this).data('section');
    navigateToSection(section);
  });
}

/**
 * Navega a una sección específica
 */
function navigateToSection(section) {
  console.log('📄 Navegando a sección:', section);
  
  // Actualizar estado
  ajustesState.currentSection = section;
  
  // Actualizar sidebar activo
  $('.sidebar-link').removeClass('active');
  $(`.sidebar-link[data-section="${section}"]`).addClass('active');
  
  // Mostrar sección correspondiente
  $('.content-section').removeClass('active');
  $(`#${section}-section`).addClass('active');
  
  // Cargar datos de la sección
  loadSectionData(section);
}

/**
 * Carga los datos de una sección
 */
function loadSectionData(section) {
  switch(section) {
    case 'perfil':
      loadProfile();
      break;
    case 'direcciones':
      loadAddresses();
      break;
    case 'pedidos':
      loadOrders();
      break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN: PERFIL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Carga los datos del perfil del usuario
 */
async function loadProfile() {
  console.log('👤 Cargando perfil...');
  
  try {
    const response = await apiRequest('GET', '/users/profile');
    
    if (response.success) {
      const user = response.user || response.data || response;
      
      // Llenar formulario
      $('#firstName').val(user.firstName || '');
      $('#lastName').val(user.lastName || '');
      $('#email').val(user.email || '');
      
      // Mostrar email en sidebar
      $('#user-email-sidebar').text(user.email || '');
      
      console.log('✅ Perfil cargado:', user.email);
    } else {
      showAlert('Error al cargar el perfil', 'danger');
    }
  } catch (error) {
    console.error('❌ Error cargando perfil:', error);
    showAlert('Error al cargar el perfil', 'danger');
  }
}

/**
 * Actualiza el perfil del usuario
 */
async function updateProfile(e) {
  e.preventDefault();
  console.log('💾 Actualizando perfil...');
  
  const firstName = $('#firstName').val().trim();
  const lastName = $('#lastName').val().trim();
  
  if (!firstName || !lastName) {
    showAlert('Por favor completa todos los campos', 'danger');
    return;
  }
  
  try {
    const response = await apiRequest('PUT', '/users/profile', {
      firstName,
      lastName
    });
    
    if (response.success) {
      showAlert('Perfil actualizado correctamente', 'success');
      
      // Actualizar usuario en localStorage
      const currentUser = getCurrentUser();
      if (currentUser) {
        currentUser.firstName = firstName;
        currentUser.lastName = lastName;
        setCurrentUser(currentUser);
      }
      
      // Actualizar header
      if (typeof initHeader === 'function') {
        initHeader();
      }
      
      console.log('✅ Perfil actualizado');
    } else {
      showAlert(response.error?.message || 'Error al actualizar el perfil', 'danger');
    }
  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);
    showAlert('Error al actualizar el perfil', 'danger');
  }
}

/**
 * Cambia la contraseña del usuario
 */
async function changePassword(e) {
  e.preventDefault();
  console.log('🔐 Cambiando contraseña...');
  
  const currentPassword = $('#currentPassword').val();
  const newPassword = $('#newPassword').val();
  const confirmPassword = $('#confirmPassword').val();
  
  // Validaciones
  if (!currentPassword || !newPassword || !confirmPassword) {
    showAlert('Por favor completa todos los campos', 'danger');
    return;
  }
  
  if (newPassword.length < 8) {
    showAlert('La nueva contraseña debe tener al menos 8 caracteres', 'danger');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showAlert('Las contraseñas no coinciden', 'danger');
    return;
  }
  
  try {
    const response = await apiRequest('PUT', '/users/change-password', {
      currentPassword,
      newPassword
    });
    
    if (response.success) {
      showAlert('Contraseña cambiada correctamente', 'success');
      
      // Limpiar formulario
      $('#password-form')[0].reset();
      
      console.log('✅ Contraseña cambiada');
    } else {
      showAlert(response.error?.message || 'Error al cambiar la contraseña', 'danger');
    }
  } catch (error) {
    console.error('❌ Error cambiando contraseña:', error);
    showAlert('Error al cambiar la contraseña', 'danger');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN: DIRECCIONES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Carga todas las direcciones del usuario
 */
async function loadAddresses() {
  console.log('📍 Cargando direcciones...');
  
  try {
    const response = await apiRequest('GET', '/addresses');
    
    if (response.success) {
      ajustesState.addresses = response.data || response.addresses || [];
      renderAddresses();
      console.log('✅ Direcciones cargadas:', ajustesState.addresses.length);
    } else {
      showAlert('Error al cargar las direcciones', 'danger');
    }
  } catch (error) {
    console.error('❌ Error cargando direcciones:', error);
    showAlert('Error al cargar las direcciones', 'danger');
  }
}

/**
 * Renderiza la lista de direcciones
 */
function renderAddresses() {
  const $container = $('#addresses-list');
  
  if (ajustesState.addresses.length === 0) {
    $container.html(`
      <div class="settings-card text-center py-5">
        <i class="bi bi-geo-alt text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3">No tienes direcciones guardadas</p>
        <button class="btn btn-primary" onclick="openAddressModal()">
          <i class="bi bi-plus-lg me-2"></i>
          Agregar primera dirección
        </button>
      </div>
    `);
    return;
  }
  
  const html = ajustesState.addresses.map(address => `
    <div class="settings-card mb-3">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-geo-alt-fill text-primary"></i>
            <strong>${address.street || ''}</strong>
            ${address.isDefault ? '<span class="badge bg-primary">Predeterminada</span>' : ''}
          </div>
          <p class="text-muted mb-1">
            ${address.city || ''}, ${address.region || ''}
            ${address.postalCode ? ', ' + address.postalCode : ''}
          </p>
          ${address.reference ? `<p class="text-muted small mb-0"><i class="bi bi-info-circle me-1"></i>${address.reference}</p>` : ''}
        </div>
        <div class="d-flex gap-2">
          ${!address.isDefault ? `
            <button class="btn btn-sm btn-outline-primary" onclick="setDefaultAddress('${address._id || address.id}')">
              <i class="bi bi-star"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-outline-secondary" onclick="editAddress('${address._id || address.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteAddress('${address._id || address.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  $container.html(html);
}

/**
 * Abre el modal para agregar/editar dirección
 */
function openAddressModal(addressId = null) {
  ajustesState.editingAddressId = addressId;
  
  if (addressId) {
    // Modo edición
    const address = ajustesState.addresses.find(a => (a._id || a.id) === addressId);
    if (address) {
      $('#addressModalLabel').text('Editar dirección');
      $('#address-id').val(address._id || address.id);
      $('#address-country').val(address.country || 'Chile');
      $('#address-street').val(address.street || '');
      $('#address-city').val(address.city || '');
      $('#address-region').val(address.region || '');
      $('#address-postalCode').val(address.postalCode || '');
      $('#address-reference').val(address.reference || '');
      $('#address-default').prop('checked', address.isDefault || false);
    }
  } else {
    // Modo creación
    $('#addressModalLabel').text('Agregar dirección');
    $('#address-form')[0].reset();
    $('#address-id').val('');
    $('#address-country').val('Chile');
  }
  
  const modal = new bootstrap.Modal(document.getElementById('addressModal'));
  modal.show();
}

/**
 * Guarda una dirección (crear o actualizar)
 */
async function saveAddress() {
  console.log('💾 Guardando dirección...');
  
  const addressId = $('#address-id').val();
  const addressData = {
    country: $('#address-country').val(),
    street: $('#address-street').val().trim(),
    city: $('#address-city').val().trim(),
    region: $('#address-region').val().trim(),
    postalCode: $('#address-postalCode').val().trim(),
    reference: $('#address-reference').val().trim(),
    isDefault: $('#address-default').is(':checked')
  };
  
  // Validaciones
  if (!addressData.street || !addressData.city || !addressData.region) {
    showAlert('Por favor completa los campos obligatorios', 'danger');
    return;
  }
  
  try {
    let response;
    
    if (addressId) {
      // Actualizar
      response = await apiRequest('PUT', `/addresses/${addressId}`, addressData);
    } else {
      // Crear
      response = await apiRequest('POST', '/addresses', addressData);
    }
    
    if (response.success) {
      showAlert(addressId ? 'Dirección actualizada' : 'Dirección agregada', 'success');
      
      // Cerrar modal
      bootstrap.Modal.getInstance(document.getElementById('addressModal')).hide();
      
      // Recargar direcciones
      await loadAddresses();
      
      console.log('✅ Dirección guardada');
    } else {
      showAlert(response.error?.message || 'Error al guardar la dirección', 'danger');
    }
  } catch (error) {
    console.error('❌ Error guardando dirección:', error);
    showAlert('Error al guardar la dirección', 'danger');
  }
}

/**
 * Marca una dirección como predeterminada
 */
async function setDefaultAddress(addressId) {
  console.log('⭐ Marcando dirección como predeterminada:', addressId);
  
  try {
    const response = await apiRequest('PUT', `/addresses/${addressId}/set-default`);
    
    if (response.success) {
      showAlert('Dirección predeterminada actualizada', 'success');
      await loadAddresses();
      console.log('✅ Dirección predeterminada actualizada');
    } else {
      showAlert(response.error?.message || 'Error al actualizar', 'danger');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    showAlert('Error al actualizar la dirección', 'danger');
  }
}

/**
 * Edita una dirección
 */
function editAddress(addressId) {
  openAddressModal(addressId);
}

/**
 * Elimina una dirección
 */
async function deleteAddress(addressId) {
  if (!confirm('¿Estás seguro de eliminar esta dirección?')) {
    return;
  }
  
  console.log('🗑️ Eliminando dirección:', addressId);
  
  try {
    const response = await apiRequest('DELETE', `/addresses/${addressId}`);
    
    if (response.success) {
      showAlert('Dirección eliminada', 'success');
      await loadAddresses();
      console.log('✅ Dirección eliminada');
    } else {
      showAlert(response.error?.message || 'Error al eliminar', 'danger');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    showAlert('Error al eliminar la dirección', 'danger');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN: PEDIDOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Carga el historial de pedidos
 */
async function loadOrders() {
  console.log('📦 Cargando pedidos...');
  
  try {
    const response = await apiRequest('GET', '/orders');
    
    if (response.success) {
      ajustesState.orders = response.data || response.orders || [];
      renderOrders();
      console.log('✅ Pedidos cargados:', ajustesState.orders.length);
    } else {
      showAlert('Error al cargar los pedidos', 'danger');
    }
  } catch (error) {
    console.error('❌ Error cargando pedidos:', error);
    showAlert('Error al cargar los pedidos', 'danger');
  }
}

/**
 * Renderiza la tabla de pedidos
 */
function renderOrders() {
  const $container = $('#orders-list');
  
  // Filtrar por búsqueda
  let filteredOrders = ajustesState.orders;
  
  if (ajustesState.searchQuery) {
    const query = ajustesState.searchQuery.toLowerCase();
    filteredOrders = ajustesState.orders.filter(order => {
      const orderNumber = (order.orderNumber || order._id || '').toLowerCase();
      const status = (order.status || '').toLowerCase();
      return orderNumber.includes(query) || status.includes(query);
    });
  }
  
  if (filteredOrders.length === 0) {
    $container.html(`
      <div class="text-center py-5">
        <i class="bi bi-bag-x text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3">No se encontraron pedidos</p>
      </div>
    `);
    return;
  }
  
  // Paginación
  const startIndex = (ajustesState.currentPage - 1) * ajustesState.ordersPerPage;
  const endIndex = startIndex + ajustesState.ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredOrders.length / ajustesState.ordersPerPage);
  
  // Tabla
  const tableHtml = `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${paginatedOrders.map(order => `
            <tr>
              <td><strong>#${order.orderNumber || (order._id || order.id).slice(-6)}</strong></td>
              <td>${formatDate(order.createdAt || order.orderDate)}</td>
              <td>${formatPrice(order.totalAmount || order.total)}</td>
              <td>${renderOrderStatus(order.status)}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetail('${order._id || order.id}')">
                  Ver detalle
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    ${totalPages > 1 ? renderPagination(totalPages) : ''}
  `;
  
  $container.html(tableHtml);
}

/**
 * Renderiza el estado del pedido con badge
 */
function renderOrderStatus(status) {
  const statusMap = {
    pending: { text: 'Pendiente', class: 'warning' },
    processing: { text: 'Procesando', class: 'info' },
    shipped: { text: 'Enviado', class: 'primary' },
    delivered: { text: 'Entregado', class: 'success' },
    cancelled: { text: 'Cancelado', class: 'danger' }
  };
  
  const statusInfo = statusMap[status] || { text: status, class: 'secondary' };
  return `<span class="badge bg-${statusInfo.class}">${statusInfo.text}</span>`;
}

/**
 * Renderiza la paginación
 */
function renderPagination(totalPages) {
  const currentPage = ajustesState.currentPage;
  
  let html = '<nav class="mt-3"><ul class="pagination justify-content-center">';
  
  // Botón anterior
  html += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="goToPage(${currentPage - 1})">Anterior</a>
    </li>
  `;
  
  // Números de página
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      html += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>
        </li>
      `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
  }
  
  // Botón siguiente
  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="goToPage(${currentPage + 1})">Siguiente</a>
    </li>
  `;
  
  html += '</ul></nav>';
  return html;
}

/**
 * Navega a una página específica
 */
function goToPage(page) {
  ajustesState.currentPage = page;
  renderOrders();
}

/**
 * Ve el detalle de un pedido
 */
// =============================
// VER DETALLE DE PEDIDO
// =============================
async function viewOrderDetail(orderId) {
  try {
    const token = getAuthToken();

    const res = await fetch(`${CONFIG.API_URL}/orders/${orderId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    console.log("🟦 Respuesta detalle pedido:", data);

    if (!data.success) {
      showAlert("No se pudo cargar el detalle del pedido", "danger");
      return;
    }

    const order = data.data.order;   // <--- AQUÍ ESTÁ LA ORDEN REAL
    const items = data.data.items;   // <--- AQUÍ ESTÁN LOS ITEMS

    renderOrderDetailModal(order, items);

  } catch (err) {
    console.error("❌ Error cargando detalle del pedido:", err);
    showAlert("Error cargando detalle del pedido", "danger");
  }
}



// =============================
// RENDERIZAR MODAL
// =============================
function renderOrderDetailModal(order, items) {
  const modalContent = document.getElementById("order-detail-content");

  const orderNumber = order.orderNumber || "SIN-CÓDIGO";
  const orderDate = order.createdAt ? formatDate(order.createdAt) : "-";
  const orderStatus = order.status || "-";
  const orderTotal = order.total ?? 0;

  const itemsHTML = items
    .map(item => `
      <div class="d-flex align-items-start mb-3 border-bottom pb-3">
        <img src="${item.productId?.mainImage || ""}" 
             class="rounded me-3" width="80" height="80">

        <div class="flex-grow-1">
          <strong>${item.productName || item.productId?.name}</strong>
          <p class="mb-1">Cantidad: ${item.quantity}</p>
          <p class="text-muted small">Subtotal: ${formatPrice(item.subtotal)}</p>
        </div>

        <strong>${formatPrice(item.unitPrice)}</strong>
      </div>
    `)
    .join("");

  modalContent.innerHTML = `
    <h5>Pedido #${orderNumber}</h5>
    <p><strong>Fecha:</strong> ${orderDate}</p>
    <p><strong>Estado:</strong> ${orderStatus}</p>

    <h6 class="mt-4">Productos</h6>
    ${itemsHTML}

    <div class="text-end mt-4">
      <h5>Total: ${formatPrice(orderTotal)}</h5>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById("orderDetailModal"));
  modal.show();
}





// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Muestra un mensaje de alerta
 */
function showAlert(message, type = 'info') {
  const $container = $('#alert-container');
  
  const alertHtml = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  $container.html(alertHtml);
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    $container.find('.alert').fadeOut(() => {
      $container.empty();
    });
  }, 5000);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Formatea una fecha
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Formatea un precio
 */
function formatPrice(price) {
  if (!price && price !== 0) return '-';
  return '$' + price.toLocaleString('es-CL');
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

$(document).ready(function() {
  console.log('🚀 Inicializando página de ajustes...');
  
  // Verificar autenticación
  if (!isAuthenticated()) {
    console.warn('⚠️ Usuario no autenticado, redirigiendo...');
    window.location.href = CONFIG.ROUTES.LOGIN;
    return;
  }
  
  // Cargar header
  UTILS.loadComponent('header-container', 'header.html', function() {
    if (typeof initHeader === 'function') {
      initHeader();
    }
  });
  
  // Inicializar navegación
  initNavigation();
  
  // Cargar datos iniciales
  loadProfile();
  
  // Event listeners
  $('#profile-form').on('submit', updateProfile);
  $('#password-form').on('submit', changePassword);
  $('#btn-add-address').on('click', () => openAddressModal());
  $('#btn-save-address').on('click', saveAddress);
  
  // Búsqueda de pedidos
  $('#search-orders').on('input', function() {
    ajustesState.searchQuery = $(this).val();
    ajustesState.currentPage = 1;
    renderOrders();
  });
  
  // Cambio de resultados por página
  $('#orders-per-page').on('change', function() {
    ajustesState.ordersPerPage = parseInt($(this).val());
    ajustesState.currentPage = 1;
    renderOrders();
  });
  
  console.log('✅ Página de ajustes inicializada');
});

// Hacer funciones disponibles globalmente
window.navigateToSection = navigateToSection;
window.openAddressModal = openAddressModal;
window.editAddress = editAddress;
window.deleteAddress = deleteAddress;
window.setDefaultAddress = setDefaultAddress;
window.viewOrderDetail = viewOrderDetail;
window.goToPage = goToPage;