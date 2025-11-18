// ============================================
// AJUSTES - PÁGINA DE CONFIGURACIÓN DE USUARIO
// ============================================

import { initPage, getCurrentUser } from '../auth.js';
import { getUserProfile, updateUserProfile, getAddresses } from '../api.js';
import { showAlert, setButtonLoading } from '../utils.js';

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar página (requiere autenticación)
  initPage({ requireAuthentication: true });
  
  // Inicializar navegación entre secciones
  initSectionNavigation();
  
  // Cargar datos del perfil
  loadUserProfile();
  
  // Inicializar formularios
  initProfileForm();
  initPasswordForm();
  initAddressesSection();
});

// ============================================
// NAVEGACIÓN ENTRE SECCIONES
// ============================================

function initSectionNavigation() {
  const sidebarLinks = document.querySelectorAll('[data-section]');
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const section = link.dataset.section;
      
      // Actualizar estado activo del sidebar
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Mostrar/ocultar secciones
      document.querySelectorAll('[id^="section-"]').forEach(s => {
        s.classList.add('d-none');
      });
      
      const targetSection = document.getElementById(`section-${section}`);
      if (targetSection) {
        targetSection.classList.remove('d-none');
      }
    });
  });
}

// ============================================
// PERFIL
// ============================================

async function loadUserProfile() {
  const user = getCurrentUser();
  
  if (user) {
    // Llenar formulario con datos del usuario
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    if (firstNameInput) firstNameInput.value = user.firstName || user.name || '';
    if (lastNameInput) lastNameInput.value = user.lastName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
  }
}

function initProfileForm() {
  const profileForm = document.getElementById('perfilForm');
  
  if (!profileForm) return;
  
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value
    };
    
    const submitBtn = profileForm.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
      const result = await updateUserProfile(formData);
      
      if (result.success) {
        showAlert('ajustesAlerts', 
          '<i class="bi bi-check-circle me-2"></i>Perfil actualizado correctamente.', 
          'success');
      } else {
        throw new Error(result.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showAlert('ajustesAlerts', 
        '<i class="bi bi-exclamation-triangle me-2"></i>Error al actualizar perfil.', 
        'danger');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

// ============================================
// DIRECCIONES
// ============================================

async function initAddressesSection() {
  // Botón agregar dirección
  const addAddressBtn = document.getElementById('addAddressBtn');
  if (addAddressBtn) {
    addAddressBtn.addEventListener('click', () => {
      openAddressModal();
    });
  }
  
  // Formulario de dirección
  const addressForm = document.getElementById('addressForm');
  if (addressForm) {
    addressForm.addEventListener('submit', handleAddressSave);
  }
  
  // Cargar direcciones
  await loadAddresses();
}

async function loadAddresses() {
  const loading = document.getElementById('addressesLoading');
  const list = document.getElementById('addressesList');
  
  if (loading) loading.classList.remove('d-none');
  
  try {
    const result = await getAddresses();
    
    if (result.success) {
      renderAddresses(result.data);
    }
  } catch (error) {
    console.error('Error al cargar direcciones:', error);
  } finally {
    if (loading) loading.classList.add('d-none');
  }
}

function renderAddresses(addresses) {
  const list = document.getElementById('addressesList');
  const template = document.getElementById('addressTemplate');
  
  if (!list || !template) return;
  
  list.innerHTML = '';
  
  if (addresses.length === 0) {
    list.innerHTML = '<p class="text-muted text-center">No tienes direcciones guardadas</p>';
    return;
  }
  
  addresses.forEach(address => {
    const clone = template.content.cloneNode(true);
    
    const card = clone.querySelector('.address-card');
    if (card) {
      card.dataset.addressId = address._id;
    }
    
    const street = clone.querySelector('.address-street');
    if (street) {
      street.textContent = `${address.street} ${address.number}`;
    }
    
    const details = clone.querySelector('.address-details');
    if (details) {
      details.textContent = `${address.city}, ${address.region}`;
    }
    
    const defaultBadge = clone.querySelector('.address-default');
    if (defaultBadge && address.isDefault) {
      defaultBadge.classList.remove('d-none');
    }
    
    // Botón editar
    const editBtn = clone.querySelector('.edit-address-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => openAddressModal(address));
    }
    
    // Botón eliminar
    const deleteBtn = clone.querySelector('.delete-address-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deleteAddress(address._id));
    }
    
    list.appendChild(clone);
  });
}

function openAddressModal(address = null) {
  const modal = new bootstrap.Modal(document.getElementById('addressModal'));
  const title = document.getElementById('addressModalTitle');
  const form = document.getElementById('addressForm');
  
  if (title) {
    title.textContent = address ? 'Editar Dirección' : 'Nueva Dirección';
  }
  
  if (form) {
    if (address) {
      document.getElementById('addressId').value = address._id;
      document.getElementById('addressStreet').value = address.street;
      document.getElementById('addressNumber').value = address.number;
      document.getElementById('addressCity').value = address.city;
      document.getElementById('addressRegion').value = address.region;
      document.getElementById('addressDefault').checked = address.isDefault;
    } else {
      form.reset();
      document.getElementById('addressId').value = '';
    }
  }
  
  modal.show();
}

async function handleAddressSave(e) {
  e.preventDefault();
  
  const addressData = {
    street: document.getElementById('addressStreet').value,
    number: document.getElementById('addressNumber').value,
    city: document.getElementById('addressCity').value,
    region: document.getElementById('addressRegion').value,
    isDefault: document.getElementById('addressDefault').checked
  };
  
  // TODO: Guardar en backend
  console.log('Guardando dirección:', addressData);
  
  // Cerrar modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('addressModal'));
  if (modal) modal.hide();
  
  // Recargar direcciones
  await loadAddresses();
  
  showAlert('ajustesAlerts', 
    '<i class="bi bi-check-circle me-2"></i>Dirección guardada correctamente.', 
    'success');
}

async function deleteAddress(addressId) {
  if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;
  
  // TODO: Eliminar en backend
  console.log('Eliminando dirección:', addressId);
  
  await loadAddresses();
  
  showAlert('ajustesAlerts', 
    '<i class="bi bi-check-circle me-2"></i>Dirección eliminada.', 
    'success');
}

// ============================================
// CONTRASEÑA
// ============================================

function initPasswordForm() {
  const passwordForm = document.getElementById('passwordForm');
  
  if (!passwordForm) return;
  
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      showAlert('ajustesAlerts', 
        '<i class="bi bi-exclamation-triangle me-2"></i>Las contraseñas no coinciden.', 
        'danger');
      return;
    }
    
    // Validar longitud mínima
    if (newPassword.length < 6) {
      showAlert('ajustesAlerts', 
        '<i class="bi bi-exclamation-triangle me-2"></i>La contraseña debe tener al menos 6 caracteres.', 
        'danger');
      return;
    }
    
    const submitBtn = passwordForm.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
      // TODO: Cambiar contraseña en backend
      console.log('Cambiando contraseña');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showAlert('ajustesAlerts', 
        '<i class="bi bi-check-circle me-2"></i>Contraseña actualizada correctamente.', 
        'success');
      
      // Limpiar formulario
      passwordForm.reset();
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      showAlert('ajustesAlerts', 
        '<i class="bi bi-exclamation-triangle me-2"></i>Error al cambiar contraseña.', 
        'danger');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}