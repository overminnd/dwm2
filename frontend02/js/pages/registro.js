/**
 * ============================================================================
 * MARAZUL - Página de Registro
 * ============================================================================
 * 
 * Archivo: pages/registro.js
 * Descripción: Lógica de registro de nuevos usuarios
 * Versión: 1.0
 */

import { ROUTES, MESSAGES, VALIDATION } from '../config.js';
import {
  redirectIfAuthenticated,
  loadComponent,
  initHeader
} from '../auth.js';
import { register as registerAPI } from '../api.js';
import {
  validateEmail,
  validatePhone,
  validateRUT,
  validatePassword,
  validateRequired,
  validateMatch,
  validateMinLength,
  formatRUT,
  formatPhone,
  showToast,
  setButtonLoading,
  resetButton,
  redirect,
  log
} from '../utils.js';

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa la página de registro
 */
async function init() {
  try {
    log('info', 'Inicializando página de registro...');
    
    // Redirigir si ya está autenticado
    if (redirectIfAuthenticated()) {
      return;
    }
    
    // Cargar componentes
    await loadComponents();
    
    // Inicializar header
    initHeader();
    
    // Configurar eventos
    setupEvents();
    
    log('info', 'Página de registro inicializada');
  } catch (error) {
    log('error', 'Error inicializando registro:', error);
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
// VALIDACIÓN DEL FORMULARIO
// ============================================================================

/**
 * Valida todo el formulario antes de enviar
 * @returns {Object} {isValid: boolean, errors: Object}
 */
function validateForm() {
  const errors = {};
  
  // Obtener valores
  const nombre = document.getElementById('nombre')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const telefono = document.getElementById('telefono')?.value.trim();
  const rut = document.getElementById('rut')?.value.trim();
  const password = document.getElementById('password')?.value;
  const confirmPassword = document.getElementById('confirm-password')?.value;
  const terms = document.getElementById('terms')?.checked;
  
  // Validar nombre
  if (!validateRequired(nombre)) {
    errors.nombre = MESSAGES.VALIDATION.REQUIRED_FIELD;
  } else if (!validateMinLength(nombre, VALIDATION.MIN_NAME_LENGTH)) {
    errors.nombre = MESSAGES.VALIDATION.MIN_LENGTH(VALIDATION.MIN_NAME_LENGTH);
  }
  
  // Validar email
  if (!validateRequired(email)) {
    errors.email = MESSAGES.VALIDATION.REQUIRED_FIELD;
  } else if (!validateEmail(email)) {
    errors.email = MESSAGES.VALIDATION.INVALID_EMAIL;
  }
  
  // Validar teléfono
  if (!validateRequired(telefono)) {
    errors.telefono = MESSAGES.VALIDATION.REQUIRED_FIELD;
  } else if (!validatePhone(telefono)) {
    errors.telefono = MESSAGES.VALIDATION.INVALID_PHONE;
  }
  
  // Validar RUT
  if (!validateRequired(rut)) {
    errors.rut = MESSAGES.VALIDATION.REQUIRED_FIELD;
  } else if (!validateRUT(rut)) {
    errors.rut = MESSAGES.VALIDATION.INVALID_RUT;
  }
  
  // Validar contraseña
  if (!validateRequired(password)) {
    errors.password = MESSAGES.VALIDATION.REQUIRED_FIELD;
  } else if (!validatePassword(password)) {
    errors.password = MESSAGES.VALIDATION.INVALID_PASSWORD;
  }
  
  // Validar confirmación de contraseña
  if (!validateRequired(confirmPassword)) {
    errors.confirmPassword = MESSAGES.VALIDATION.REQUIRED_FIELD;
  } else if (!validateMatch(password, confirmPassword)) {
    errors.confirmPassword = MESSAGES.VALIDATION.PASSWORD_MISMATCH;
  }
  
  // Validar términos
  if (!terms) {
    errors.terms = 'Debes aceptar los términos y condiciones';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Muestra errores de validación en el formulario
 * @param {Object} errors - Objeto con errores {campo: mensaje}
 */
function showValidationErrors(errors) {
  // Limpiar errores previos
  clearValidationErrors();
  
  // Mostrar nuevos errores
  Object.keys(errors).forEach(field => {
    const input = document.getElementById(field);
    const errorMessage = errors[field];
    
    if (input) {
      // Agregar clase de error al input
      input.classList.add('is-invalid');
      
      // Crear y agregar mensaje de error
      const errorDiv = document.createElement('div');
      errorDiv.className = 'invalid-feedback';
      errorDiv.textContent = errorMessage;
      
      // Insertar después del input
      input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
  });
  
  // Scroll al primer error
  const firstError = document.querySelector('.is-invalid');
  if (firstError) {
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstError.focus();
  }
}

/**
 * Limpia todos los mensajes de error de validación
 */
function clearValidationErrors() {
  // Remover clases de error
  document.querySelectorAll('.is-invalid').forEach(input => {
    input.classList.remove('is-invalid');
  });
  
  // Remover mensajes de error
  document.querySelectorAll('.invalid-feedback').forEach(msg => {
    msg.remove();
  });
}

// ============================================================================
// MANEJO DEL FORMULARIO
// ============================================================================

/**
 * Maneja el submit del formulario de registro
 */
async function handleSubmit(e) {
  if (e) e.preventDefault();
  
  // Validar formulario
  const validation = validateForm();
  
  if (!validation.isValid) {
    showValidationErrors(validation.errors);
    showToast('Por favor corrige los errores en el formulario', 'warning');
    return;
  }
  
  // Obtener datos del formulario
  const formData = getFormData();
  
  // Realizar registro
  await performRegistration(formData);
}

/**
 * Obtiene los datos del formulario
 * @returns {Object} Datos del formulario
 */
function getFormData() {
  return {
    nombre: document.getElementById('nombre')?.value.trim(),
    email: document.getElementById('email')?.value.trim(),
    telefono: document.getElementById('telefono')?.value.trim(),
    rut: document.getElementById('rut')?.value.trim(),
    password: document.getElementById('password')?.value,
    direccion: document.getElementById('direccion')?.value.trim() || null
  };
}

/**
 * Realiza el registro con el backend
 * @param {Object} userData - Datos del usuario
 */
async function performRegistration(userData) {
  const btnRegister = document.getElementById('btn-register');
  
  if (!btnRegister) return;
  
  try {
    // Mostrar loading
    setButtonLoading(btnRegister, 'Registrando...');
    
    log('info', 'Intentando registro para:', userData.email);
    
    // Llamar API
    const response = await registerAPI(userData);
    
    if (response.success) {
      log('info', 'Registro exitoso');
      
      // Limpiar formulario
      clearForm();
      
      // Mostrar mensaje de éxito
      showToast(MESSAGES.SUCCESS.REGISTER, 'success', 4000);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        redirect(ROUTES.LOGIN);
      }, 2000);
    } else {
      // Error en registro
      resetButton(btnRegister);
      showToast(response.message || MESSAGES.ERROR.GENERIC, 'error');
      log('warn', 'Registro fallido:', response.message);
    }
  } catch (error) {
    resetButton(btnRegister);
    
    // Manejar errores específicos
    if (error.statusCode === 409) {
      showToast(MESSAGES.ERROR.EMAIL_EXISTS, 'error');
    } else if (error.statusCode === 0) {
      showToast(MESSAGES.ERROR.NETWORK, 'error');
    } else {
      showToast(error.message || MESSAGES.ERROR.GENERIC, 'error');
    }
    
    log('error', 'Error en registro:', error);
  }
}

// ============================================================================
// EVENTOS
// ============================================================================

/**
 * Configura todos los eventos de la página
 */
function setupEvents() {
  // Formulario de registro
  const form = document.getElementById('form-registro');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
  
  // Botón de registro
  const btnRegister = document.getElementById('btn-register');
  if (btnRegister) {
    btnRegister.addEventListener('click', function(e) {
      e.preventDefault();
      handleSubmit();
    });
  }
  
  // Formateo automático de RUT
  const rutInput = document.getElementById('rut');
  if (rutInput) {
    rutInput.addEventListener('input', function() {
      this.value = formatRUT(this.value);
    });
    
    rutInput.addEventListener('blur', function() {
      if (this.value && !validateRUT(this.value)) {
        this.classList.add('is-invalid');
        showToast(MESSAGES.VALIDATION.INVALID_RUT, 'warning');
      } else {
        this.classList.remove('is-invalid');
      }
    });
  }
  
  // Formateo automático de teléfono
  const telefonoInput = document.getElementById('telefono');
  if (telefonoInput) {
    telefonoInput.addEventListener('blur', function() {
      this.value = formatPhone(this.value);
      
      if (this.value && !validatePhone(this.value)) {
        this.classList.add('is-invalid');
        showToast(MESSAGES.VALIDATION.INVALID_PHONE, 'warning');
      } else {
        this.classList.remove('is-invalid');
      }
    });
  }
  
  // Validación de email en tiempo real
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('blur', function() {
      if (this.value && !validateEmail(this.value)) {
        this.classList.add('is-invalid');
      } else {
        this.classList.remove('is-invalid');
      }
    });
  }
  
  // Validación de contraseña en tiempo real
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      updatePasswordStrength(this.value);
    });
    
    passwordInput.addEventListener('blur', function() {
      if (this.value && !validatePassword(this.value)) {
        this.classList.add('is-invalid');
      } else {
        this.classList.remove('is-invalid');
      }
    });
  }
  
  // Validación de confirmación de contraseña
  const confirmPasswordInput = document.getElementById('confirm-password');
  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener('input', function() {
      if (this.value && !validateMatch(passwordInput.value, this.value)) {
        this.classList.add('is-invalid');
      } else {
        this.classList.remove('is-invalid');
      }
    });
  }
  
  // Toggle mostrar contraseña
  const togglePassword = document.getElementById('toggle-password');
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      
      const icon = this.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      }
    });
  }
  
  // Toggle mostrar confirmar contraseña
  const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
  if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener('click', function() {
      const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
      confirmPasswordInput.type = type;
      
      const icon = this.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      }
    });
  }
  
  // Limpiar errores al empezar a escribir
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() {
      this.classList.remove('is-invalid');
      const errorMsg = this.nextElementSibling;
      if (errorMsg && errorMsg.classList.contains('invalid-feedback')) {
        errorMsg.remove();
      }
    });
  });
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Actualiza el indicador de fortaleza de contraseña
 * @param {string} password - Contraseña a evaluar
 */
function updatePasswordStrength(password) {
  const strengthIndicator = document.getElementById('password-strength');
  
  if (!strengthIndicator) return;
  
  let strength = 0;
  let strengthText = '';
  let strengthClass = '';
  
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  switch (strength) {
    case 0:
    case 1:
      strengthText = 'Muy débil';
      strengthClass = 'text-danger';
      break;
    case 2:
      strengthText = 'Débil';
      strengthClass = 'text-warning';
      break;
    case 3:
      strengthText = 'Media';
      strengthClass = 'text-info';
      break;
    case 4:
      strengthText = 'Fuerte';
      strengthClass = 'text-primary';
      break;
    case 5:
      strengthText = 'Muy fuerte';
      strengthClass = 'text-success';
      break;
  }
  
  strengthIndicator.textContent = strengthText;
  strengthIndicator.className = `small ${strengthClass}`;
}

/**
 * Limpia el formulario
 */
function clearForm() {
  const form = document.getElementById('form-registro');
  if (form) {
    form.reset();
  }
  
  clearValidationErrors();
  
  const strengthIndicator = document.getElementById('password-strength');
  if (strengthIndicator) {
    strengthIndicator.textContent = '';
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
  validateForm,
  performRegistration,
  clearForm
};