/**
 * ============================================================================
 * MARAZUL - Página de Ajustes/Perfil
 * ============================================================================
 * 
 * Archivo: pages/ajustes.js
 * Descripción: Lógica de la página de perfil y configuración de usuario
 * Versión: 1.0
 */

import { ROUTES, MESSAGES } from '../config.js';
import {
  requireAuth,
  getCurrentUser,
  updateUserData,
  logout,
  loadComponent,
  initHeader
} from '../auth.js';
import {
  getProfile,
  updateProfile,
  changePassword
} from '../api.js';
import {
  validateEmail,
  validatePhone,
  validateRUT,
  validatePassword,
  validateRequired,
  validateMatch,
  formatRUT,
  formatPhone,
  showToast,
  setButtonLoading,
  resetButton,
  log
} from '../utils.js';

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa la página de ajustes
 */
async function init() {
  try {
    log('info', 'Inicializando página de ajustes...');
    
    // Verificar autenticación
    if (!requireAuth()) {
      return;
    }
    
    // Cargar componentes
    await loadComponents();
    
    // Inicializar header
    initHeader();
    
    // Cargar datos del usuario
    await loadUserData();
    
    // Configurar eventos
    setupEvents();
    
    log('info', 'Página de ajustes inicializada');
  } catch (error) {
    log('error', 'Error inicializando ajustes:', error);
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
// CARGA DE DATOS
// ============================================================================

/**
 * Carga los datos del usuario en el formulario
 */
async function loadUserData() {
  try {
    // Primero intentar desde localStorage
    let user = getCurrentUser();
    
    // Si queremos datos actualizados, consultar API
    const shouldRefresh = true; // Cambiar según necesidad
    
    if (shouldRefresh) {
      try {
        const response = await getProfile();
        if (response.success) {
          user = response.user;
          updateUserData(user); // Actualizar localStorage
        }
      } catch (error) {
        log('warn', 'No se pudo obtener perfil del backend, usando datos locales');
      }
    }
    
    if (user) {
      fillProfileForm(user);
      displayUserInfo(user);
    }
  } catch (error) {
    log('error', 'Error cargando datos de usuario:', error);
  }
}

/**
 * Llena el formulario de perfil con los datos del usuario
 * @param {Object} user - Datos del usuario
 */
function fillProfileForm(user) {
  const nombreInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const telefonoInput = document.getElementById('telefono');
  const rutInput = document.getElementById('rut');
  const direccionInput = document.getElementById('direccion');
  
  if (nombreInput) nombreInput.value = user.nombre || '';
  if (emailInput) emailInput.value = user.email || '';
  if (telefonoInput) telefonoInput.value = user.telefono || '';
  if (rutInput) rutInput.value = formatRUT(user.rut || '');
  if (direccionInput) direccionInput.value = user.direccion || '';
}

/**
 * Muestra información del usuario en la página
 * @param {Object} user - Datos del usuario
 */
function displayUserInfo(user) {
  // Mostrar nombre en el encabezado
  const userNameDisplay = document.getElementById('user-name-display');
  if (userNameDisplay) {
    userNameDisplay.textContent = user.nombre || user.email;
  }
  
  // Mostrar email
  const userEmailDisplay = document.getElementById('user-email-display');
  if (userEmailDisplay) {
    userEmailDisplay.textContent = user.email;
  }
}

// ============================================================================
// ACTUALIZAR PERFIL
// ============================================================================

/**
 * Maneja la actualización del perfil
 */
async function handleUpdateProfile(e) {
  if (e) e.preventDefault();
  
  const btnUpdate = document.getElementById('btn-update-profile');
  
  // Obtener datos del formulario
  const profileData = {
    nombre: document.getElementById('nombre')?.value.trim(),
    email: document.getElementById('email')?.value.trim(),
    telefono: document.getElementById('telefono')?.value.trim(),
    rut: document.getElementById('rut')?.value.trim(),
    direccion: document.getElementById('direccion')?.value.trim()
  };
  
  // Validar datos
  if (!validateRequired(profileData.nombre)) {
    showToast('El nombre es obligatorio', 'warning');
    return;
  }
  
  if (!validateEmail(profileData.email)) {
    showToast(MESSAGES.VALIDATION.INVALID_EMAIL, 'warning');
    return;
  }
  
  if (profileData.telefono && !validatePhone(profileData.telefono)) {
    showToast(MESSAGES.VALIDATION.INVALID_PHONE, 'warning');
    return;
  }
  
  if (profileData.rut && !validateRUT(profileData.rut)) {
    showToast(MESSAGES.VALIDATION.INVALID_RUT, 'warning');
    return;
  }
  
  try {
    setButtonLoading(btnUpdate, 'Actualizando...');
    
    const response = await updateProfile(profileData);
    
    if (response.success) {
      // Actualizar datos locales
      updateUserData(response.user);
      
      showToast(MESSAGES.SUCCESS.PROFILE_UPDATED, 'success');
      log('info', 'Perfil actualizado correctamente');
      
      // Recargar datos
      await loadUserData();
    } else {
      showToast(response.message || MESSAGES.ERROR.GENERIC, 'error');
    }
    
    resetButton(btnUpdate);
  } catch (error) {
    resetButton(btnUpdate);
    showToast(error.message || MESSAGES.ERROR.GENERIC, 'error');
    log('error', 'Error actualizando perfil:', error);
  }
}

// ============================================================================
// CAMBIAR CONTRASEÑA
// ============================================================================

/**
 * Maneja el cambio de contraseña
 */
async function handleChangePassword(e) {
  if (e) e.preventDefault();
  
  const btnChangePassword = document.getElementById('btn-change-password');
  
  // Obtener datos del formulario
  const currentPassword = document.getElementById('current-password')?.value;
  const newPassword = document.getElementById('new-password')?.value;
  const confirmNewPassword = document.getElementById('confirm-new-password')?.value;
  
  // Validar
  if (!validateRequired(currentPassword)) {
    showToast('Ingresa tu contraseña actual', 'warning');
    return;
  }
  
  if (!validatePassword(newPassword)) {
    showToast(MESSAGES.VALIDATION.INVALID_PASSWORD, 'warning');
    return;
  }
  
  if (!validateMatch(newPassword, confirmNewPassword)) {
    showToast(MESSAGES.VALIDATION.PASSWORD_MISMATCH, 'warning');
    return;
  }
  
  try {
    setButtonLoading(btnChangePassword, 'Cambiando...');
    
    const response = await changePassword({
      currentPassword,
      newPassword
    });
    
    if (response.success) {
      showToast(MESSAGES.SUCCESS.PASSWORD_CHANGED, 'success');
      log('info', 'Contraseña cambiada correctamente');
      
      // Limpiar formulario
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-new-password').value = '';
    } else {
      showToast(response.message || MESSAGES.ERROR.GENERIC, 'error');
    }
    
    resetButton(btnChangePassword);
  } catch (error) {
    resetButton(btnChangePassword);
    showToast(error.message || MESSAGES.ERROR.GENERIC, 'error');
    log('error', 'Error cambiando contraseña:', error);
  }
}

// ============================================================================
// CERRAR SESIÓN
// ============================================================================

/**
 * Maneja el cierre de sesión
 */
function handleLogout() {
  if (confirm(MESSAGES.CONFIRM.LOGOUT)) {
    logout(true);
  }
}

// ============================================================================
// EVENTOS
// ============================================================================

/**
 * Configura todos los eventos de la página
 */
function setupEvents() {
  // Formulario de actualizar perfil
  const formProfile = document.getElementById('form-profile');
  if (formProfile) {
    formProfile.addEventListener('submit', handleUpdateProfile);
  }
  
  // Botón actualizar perfil
  const btnUpdateProfile = document.getElementById('btn-update-profile');
  if (btnUpdateProfile) {
    btnUpdateProfile.addEventListener('click', handleUpdateProfile);
  }
  
  // Formulario de cambiar contraseña
  const formPassword = document.getElementById('form-password');
  if (formPassword) {
    formPassword.addEventListener('submit', handleChangePassword);
  }
  
  // Botón cambiar contraseña
  const btnChangePassword = document.getElementById('btn-change-password');
  if (btnChangePassword) {
    btnChangePassword.addEventListener('click', handleChangePassword);
  }
  
  // Botón cerrar sesión
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }
  
  // Formateo de RUT
  const rutInput = document.getElementById('rut');
  if (rutInput) {
    rutInput.addEventListener('input', function() {
      this.value = formatRUT(this.value);
    });
  }
  
  // Formateo de teléfono
  const telefonoInput = document.getElementById('telefono');
  if (telefonoInput) {
    telefonoInput.addEventListener('blur', function() {
      this.value = formatPhone(this.value);
    });
  }
  
  // Toggle mostrar contraseñas
  setupPasswordToggles();
}

/**
 * Configura los toggles de mostrar/ocultar contraseña
 */
function setupPasswordToggles() {
  const toggles = [
    { btn: 'toggle-current-password', input: 'current-password' },
    { btn: 'toggle-new-password', input: 'new-password' },
    { btn: 'toggle-confirm-new-password', input: 'confirm-new-password' }
  ];
  
  toggles.forEach(({ btn, input }) => {
    const toggleBtn = document.getElementById(btn);
    const inputField = document.getElementById(input);
    
    if (toggleBtn && inputField) {
      toggleBtn.addEventListener('click', function() {
        const type = inputField.type === 'password' ? 'text' : 'password';
        inputField.type = type;
        
        const icon = this.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-eye');
          icon.classList.toggle('fa-eye-slash');
        }
      });
    }
  });
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
  loadUserData,
  handleUpdateProfile,
  handleChangePassword
};