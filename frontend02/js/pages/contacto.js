/**
 * ============================================================================
 * MARAZUL - Página de Contacto
 * ============================================================================
 * 
 * Archivo: pages/contacto.js
 * Descripción: Lógica del formulario de contacto
 * Versión: 1.0
 */

import { MESSAGES, VALIDATION } from '../config.js';
import {
  loadComponent,
  initHeader,
  getCurrentUser
} from '../auth.js';
import { sendContactMessage } from '../api.js';
import {
  validateEmail,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  showToast,
  setButtonLoading,
  resetButton,
  log
} from '../utils.js';

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa la página de contacto
 */
async function init() {
  try {
    log('info', 'Inicializando página de contacto...');
    
    // Cargar componentes
    await loadComponents();
    
    // Inicializar header
    initHeader();
    
    // Prellenar datos si hay usuario autenticado
    prefillUserData();
    
    // Configurar eventos
    setupEvents();
    
    log('info', 'Página de contacto inicializada');
  } catch (error) {
    log('error', 'Error inicializando contacto:', error);
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
// PRELLENADO DE DATOS
// ============================================================================

/**
 * Prellenar el formulario con datos del usuario autenticado
 */
function prefillUserData() {
  const user = getCurrentUser();
  
  if (user) {
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    
    if (nombreInput && !nombreInput.value) {
      nombreInput.value = user.nombre || '';
    }
    
    if (emailInput && !emailInput.value) {
      emailInput.value = user.email || '';
    }
  }
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

/**
 * Valida el formulario de contacto
 * @returns {Object} {isValid: boolean, errors: Object}
 */
function validateForm() {
  const errors = {};
  
  const nombre = document.getElementById('nombre')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const asunto = document.getElementById('asunto')?.value.trim();
  const mensaje = document.getElementById('mensaje')?.value.trim();
  
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
  
  // Validar asunto
  if (!validateRequired(asunto)) {
    errors.asunto = MESSAGES.VALIDATION.REQUIRED_FIELD;
  } else if (!validateMinLength(asunto, 3)) {
    errors.asunto = 'El asunto debe tener al menos 3 caracteres';
  }
  
  // Validar mensaje
  if (!validateRequired(mensaje)) {
    errors.mensaje = MESSAGES.VALIDATION.REQUIRED_FIELD;
  } else if (!validateMinLength(mensaje, 10)) {
    errors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
  } else if (!validateMaxLength(mensaje, 1000)) {
    errors.mensaje = 'El mensaje no puede exceder 1000 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Muestra errores de validación en el formulario
 * @param {Object} errors - Objeto con errores
 */
function showValidationErrors(errors) {
  // Limpiar errores previos
  clearValidationErrors();
  
  // Mostrar nuevos errores
  Object.keys(errors).forEach(field => {
    const input = document.getElementById(field);
    const errorMessage = errors[field];
    
    if (input) {
      input.classList.add('is-invalid');
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'invalid-feedback';
      errorDiv.textContent = errorMessage;
      
      input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
  });
  
  // Focus en primer error
  const firstError = document.querySelector('.is-invalid');
  if (firstError) {
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstError.focus();
  }
}

/**
 * Limpia mensajes de error
 */
function clearValidationErrors() {
  document.querySelectorAll('.is-invalid').forEach(input => {
    input.classList.remove('is-invalid');
  });
  
  document.querySelectorAll('.invalid-feedback').forEach(msg => {
    msg.remove();
  });
}

// ============================================================================
// ENVÍO DEL FORMULARIO
// ============================================================================

/**
 * Maneja el envío del formulario de contacto
 */
async function handleSubmit(e) {
  if (e) e.preventDefault();
  
  // Validar formulario
  const validation = validateForm();
  
  if (!validation.isValid) {
    showValidationErrors(validation.errors);
    showToast('Por favor completa todos los campos correctamente', 'warning');
    return;
  }
  
  // Obtener datos
  const contactData = {
    nombre: document.getElementById('nombre')?.value.trim(),
    email: document.getElementById('email')?.value.trim(),
    asunto: document.getElementById('asunto')?.value.trim(),
    mensaje: document.getElementById('mensaje')?.value.trim()
  };
  
  await sendMessage(contactData);
}

/**
 * Envía el mensaje de contacto al backend
 * @param {Object} contactData - Datos del formulario
 */
async function sendMessage(contactData) {
  const btnSend = document.getElementById('btn-send');
  
  if (!btnSend) return;
  
  try {
    setButtonLoading(btnSend, 'Enviando...');
    
    log('info', 'Enviando mensaje de contacto...');
    
    const response = await sendContactMessage(contactData);
    
    if (response.success) {
      log('info', 'Mensaje enviado correctamente');
      
      // Mostrar mensaje de éxito
      showToast(MESSAGES.SUCCESS.CONTACT_SENT, 'success', 4000);
      
      // Limpiar formulario
      clearForm();
      
      // Mostrar mensaje de confirmación en la página
      showSuccessMessage();
    } else {
      showToast(response.message || MESSAGES.ERROR.GENERIC, 'error');
    }
    
    resetButton(btnSend);
  } catch (error) {
    resetButton(btnSend);
    showToast(error.message || MESSAGES.ERROR.GENERIC, 'error');
    log('error', 'Error enviando mensaje:', error);
  }
}

/**
 * Muestra mensaje de éxito después de enviar
 */
function showSuccessMessage() {
  const formContainer = document.getElementById('contact-form-container');
  
  if (formContainer) {
    formContainer.innerHTML = `
      <div class="text-center py-5">
        <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
        <h4>¡Mensaje enviado!</h4>
        <p class="text-muted">Te responderemos a la brevedad.</p>
        <button class="btn btn-primary mt-3" onclick="location.reload()">
          Enviar otro mensaje
        </button>
      </div>
    `;
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Limpia el formulario
 */
function clearForm() {
  const form = document.getElementById('form-contacto');
  if (form) {
    form.reset();
  }
  
  clearValidationErrors();
  
  // Actualizar contador de caracteres
  updateCharCount();
}

/**
 * Actualiza el contador de caracteres del mensaje
 */
function updateCharCount() {
  const mensajeInput = document.getElementById('mensaje');
  const charCounter = document.getElementById('char-counter');
  
  if (mensajeInput && charCounter) {
    const currentLength = mensajeInput.value.length;
    const maxLength = 1000;
    charCounter.textContent = `${currentLength}/${maxLength}`;
    
    if (currentLength > maxLength * 0.9) {
      charCounter.classList.add('text-warning');
    } else {
      charCounter.classList.remove('text-warning');
    }
  }
}

// ============================================================================
// EVENTOS
// ============================================================================

/**
 * Configura todos los eventos de la página
 */
function setupEvents() {
  // Formulario
  const form = document.getElementById('form-contacto');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
  
  // Botón enviar
  const btnSend = document.getElementById('btn-send');
  if (btnSend) {
    btnSend.addEventListener('click', handleSubmit);
  }
  
  // Contador de caracteres en mensaje
  const mensajeInput = document.getElementById('mensaje');
  if (mensajeInput) {
    mensajeInput.addEventListener('input', updateCharCount);
    updateCharCount(); // Inicializar contador
  }
  
  // Limpiar errores al escribir
  document.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', function() {
      this.classList.remove('is-invalid');
      const errorMsg = this.nextElementSibling;
      if (errorMsg && errorMsg.classList.contains('invalid-feedback')) {
        errorMsg.remove();
      }
    });
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
  sendMessage,
  clearForm
};