/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MARAZUL E-COMMERCE - PÁGINA DE CONTACTO
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Gestión completa del formulario de contacto con validaciones,
 * integración con backend y feedback visual para el usuario.
 * 
 * Funcionalidades:
 * - Validación en tiempo real de campos
 * - Envío al backend (/api/contact)
 * - Estados UI claros (loading, éxito, error)
 * - Contador de caracteres
 * - Limpieza de formulario
 * 
 * Fecha: 26 Noviembre 2025
 * Versión: 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

$(document).ready(function() {
  console.log('📧 Inicializando página de contacto...');
  
  // Cargar componentes dinámicos
  loadContactComponents();
});

/**
 * Carga los componentes dinámicos de la página
 */
function loadContactComponents() {
  // Cargar header (mismo directorio que contacto.html)
  UTILS.loadComponent('header-container', 'header.html', function() {
    if (typeof initHeader === 'function') {
      initHeader();
    }
  });
  
  // Cargar carrito (mismo directorio que contacto.html)
  UTILS.loadComponent('carrito-container', 'carrito.html', function() {
    console.log('✅ Carrito cargado');
  });
  
  // IMPORTANTE: Inicializar formulario SIEMPRE, aunque fallen los componentes
  // Esto asegura que el contador de caracteres y validaciones funcionen
  console.log('✅ Inicializando formulario de contacto...');
  initContactForm();
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN DEL FORMULARIO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa el formulario de contacto
 * Vincula event listeners y configura validaciones
 */
function initContactForm() {
  const $form = $('#contact-form');
  
  if ($form.length === 0) {
    console.warn('⚠️ Formulario de contacto no encontrado');
    return;
  }
  
  console.log('📋 Inicializando formulario de contacto...');
  
  // Event listener para submit del formulario
  $form.on('submit', handleSubmit);
  
  // Validación en tiempo real al perder foco (blur)
  $('#name').on('blur', function() {
    validateField('name', $(this).val());
  });
  
  $('#email').on('blur', function() {
    validateField('email', $(this).val());
  });
  
  $('#phone').on('blur', function() {
    const value = $(this).val();
    if (value) { // Solo validar si hay valor (campo opcional)
      validateField('phone', value);
    }
  });
  
  $('#subject').on('blur', function() {
    validateField('subject', $(this).val());
  });
  
  $('#message').on('blur', function() {
    validateField('message', $(this).val());
  });
  
  // Contador de caracteres para el mensaje
  $('#message').on('input', function() {
    const count = $(this).val().length;
    $('#char-count').text(count);
    
    // Cambiar color si se acerca al límite
    if (count > 900) {
      $('#char-count').addClass('text-danger');
    } else if (count > 700) {
      $('#char-count').addClass('text-warning').removeClass('text-danger');
    } else {
      $('#char-count').removeClass('text-warning text-danger');
    }
  });
  
  // Limpiar error al empezar a escribir
  $form.find('input, textarea').on('input', function() {
    const fieldId = $(this).attr('id');
    clearFieldError(fieldId);
  });
  
  console.log('✅ Formulario de contacto inicializado correctamente');
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE CAMPOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida un campo individual
 * 
 * @param {string} field - Nombre del campo (name, email, phone, subject, message)
 * @param {string} value - Valor del campo
 * @returns {Object} { valid: boolean, error: string }
 */
function validateField(field, value) {
  let valid = true;
  let error = '';
  
  // Trim del valor
  value = value ? value.trim() : '';
  
  switch(field) {
    case 'name':
      if (!value) {
        valid = false;
        error = 'El nombre es requerido';
      } else if (value.length < 3) {
        valid = false;
        error = 'El nombre debe tener al menos 3 caracteres';
      } else if (value.length > 100) {
        valid = false;
        error = 'El nombre no puede exceder 100 caracteres';
      } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) {
        valid = false;
        error = 'El nombre solo puede contener letras y espacios';
      }
      break;
      
    case 'email':
      if (!value) {
        valid = false;
        error = 'El email es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        valid = false;
        error = 'Por favor ingresa un email válido';
      } else if (value.length > 100) {
        valid = false;
        error = 'El email no puede exceder 100 caracteres';
      }
      break;
      
    case 'phone':
      // Campo opcional, solo validar si tiene valor
      if (value) {
        // Formato chileno: +56 9 XXXX XXXX o 9 XXXX XXXX o +56912345678
        const phoneRegex = /^(\+?56\s?)?9\s?\d{4}\s?\d{4}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          valid = false;
          error = 'Por favor ingresa un teléfono válido (formato chileno)';
        }
      }
      break;
      
    case 'subject':
      if (!value) {
        valid = false;
        error = 'El asunto es requerido';
      } else if (value.length < 5) {
        valid = false;
        error = 'El asunto debe tener al menos 5 caracteres';
      } else if (value.length > 200) {
        valid = false;
        error = 'El asunto no puede exceder 200 caracteres';
      }
      break;
      
    case 'message':
      if (!value) {
        valid = false;
        error = 'El mensaje es requerido';
      } else if (value.length < 10) {
        valid = false;
        error = 'El mensaje debe tener al menos 10 caracteres';
      } else if (value.length > 1000) {
        valid = false;
        error = 'El mensaje no puede exceder 1000 caracteres';
      }
      break;
  }
  
  // Mostrar u ocultar error
  if (!valid) {
    showFieldError(field, error);
  } else {
    clearFieldError(field);
  }
  
  return { valid, error };
}

/**
 * Valida el formulario completo
 * 
 * @param {Object} formData - Datos del formulario
 * @returns {Object} { valid: boolean, errors: object }
 */
function validateForm(formData) {
  const errors = {};
  
  // Validar cada campo
  const nameValidation = validateField('name', formData.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.error;
  }
  
  const emailValidation = validateField('email', formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }
  
  // Phone es opcional, solo validar si tiene valor
  if (formData.phone) {
    const phoneValidation = validateField('phone', formData.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error;
    }
  }
  
  const subjectValidation = validateField('subject', formData.subject);
  if (!subjectValidation.valid) {
    errors.subject = subjectValidation.error;
  }
  
  const messageValidation = validateField('message', formData.message);
  if (!messageValidation.valid) {
    errors.message = messageValidation.error;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MOSTRAR/OCULTAR ERRORES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Muestra un mensaje de error debajo de un campo
 * 
 * @param {string} fieldName - ID del campo
 * @param {string} errorMessage - Mensaje de error a mostrar
 */
function showFieldError(fieldName, errorMessage) {
  const $field = $(`#${fieldName}`);
  const $feedback = $field.next('.invalid-feedback');
  
  if ($field.length && $feedback.length) {
    $field.addClass('is-invalid');
    $feedback.text(errorMessage);
    $feedback.show();
  }
}

/**
 * Limpia el mensaje de error de un campo
 * 
 * @param {string} fieldName - ID del campo
 */
function clearFieldError(fieldName) {
  const $field = $(`#${fieldName}`);
  const $feedback = $field.next('.invalid-feedback');
  
  if ($field.length) {
    $field.removeClass('is-invalid');
    if ($feedback.length) {
      $feedback.text('');
      $feedback.hide();
    }
  }
}

/**
 * Muestra todos los errores de validación
 * 
 * @param {Object} errors - Objeto con errores { fieldName: errorMessage }
 */
function showValidationErrors(errors) {
  Object.keys(errors).forEach(fieldName => {
    showFieldError(fieldName, errors[fieldName]);
  });
  
  // Scroll al primer campo con error
  const $firstError = $('.is-invalid').first();
  if ($firstError.length) {
    $('html, body').animate({
      scrollTop: $firstError.offset().top - 100
    }, 300);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MANEJO DEL SUBMIT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Maneja el envío del formulario
 * 
 * @param {Event} event - Evento de submit
 */
async function handleSubmit(event) {
  event.preventDefault();
  
  console.log('📤 Procesando envío de formulario...');
  
  // Obtener datos del formulario
  const formData = getFormData();
  
  // Validar formulario completo
  const validation = validateForm(formData);
  
  if (!validation.valid) {
    console.warn('⚠️ Formulario tiene errores de validación');
    showValidationErrors(validation.errors);
    return;
  }
  
  // Formulario válido, enviar al backend
  console.log('✅ Formulario válido, enviando al backend...');
  await sendContactMessage(formData);
}

/**
 * Obtiene los datos del formulario
 * 
 * @returns {Object} Datos del formulario
 */
function getFormData() {
  return {
    name: $('#name').val().trim(),
    email: $('#email').val().trim(),
    phone: $('#phone').val().trim(),
    subject: $('#subject').val().trim(),
    message: $('#message').val().trim()
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMUNICACIÓN CON BACKEND
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Envía el mensaje de contacto al backend
 * 
 * @param {Object} data - Datos del formulario
 */
async function sendContactMessage(data) {
  try {
    // Activar estado de loading
    setLoadingState(true);
    
    // Enviar al backend usando jQuery AJAX
    const response = await $.ajax({
      url: `${CONFIG.API_BASE_URL}/contact`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      timeout: 10000 // 10 segundos de timeout
    });
    
    console.log('✅ Respuesta del backend:', response);
    
    // Verificar respuesta exitosa
    if (response.success || response['El éxito']) {
      showSuccessMessage();
      resetForm();
    } else {
      throw new Error(response.message || 'Error al enviar el mensaje');
    }
    
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error);
    
    let errorMessage = 'Error al enviar el mensaje. Por favor intenta nuevamente.';
    
    if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    } else if (error.status === 400) {
      errorMessage = 'Datos inválidos. Por favor revisa el formulario.';
    } else if (error.status === 500) {
      errorMessage = 'Error en el servidor. Por favor intenta más tarde.';
    } else if (error.statusText === 'timeout') {
      errorMessage = 'La solicitud tardó demasiado. Por favor intenta nuevamente.';
    }
    
    showErrorMessage(errorMessage);
    
  } finally {
    // Desactivar estado de loading
    setLoadingState(false);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ESTADOS DE UI
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Activa o desactiva el estado de loading
 * 
 * @param {boolean} isLoading - true para activar, false para desactivar
 */
function setLoadingState(isLoading) {
  const $button = $('#submit-button');
  const $form = $('#contact-form');
  
  if (isLoading) {
    // Estado loading
    $button.prop('disabled', true);
    $button.html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando...');
    $form.find('input, textarea').prop('disabled', true);
    
    console.log('⏳ Estado loading activado');
  } else {
    // Estado normal
    $button.prop('disabled', false);
    $button.html('<i class="bi bi-envelope me-2"></i>Enviar Mensaje');
    $form.find('input, textarea').prop('disabled', false);
    
    console.log('✅ Estado loading desactivado');
  }
}

/**
 * Muestra un mensaje de éxito
 */
function showSuccessMessage() {
  console.log('✅ Mostrando mensaje de éxito');
  
  // Alternativa con Bootstrap Toast
  showBootstrapToast('¡Mensaje enviado correctamente! Te responderemos pronto.', 'success');
}

/**
 * Muestra un mensaje de error
 * 
 * @param {string} message - Mensaje de error a mostrar
 */
function showErrorMessage(message) {
  console.error('❌ Mostrando mensaje de error:', message);
  
  // Alternativa con Bootstrap Toast
  showBootstrapToast(message, 'danger');
}

/**
 * Muestra un toast de Bootstrap
 * 
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast (success, danger, warning, info)
 */
function showBootstrapToast(message, type = 'success') {
  // Crear contenedor de toasts si no existe
  let $toastContainer = $('#toast-container');
  if ($toastContainer.length === 0) {
    $toastContainer = $('<div id="toast-container" class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;"></div>');
    $('body').append($toastContainer);
  }
  
  // Crear toast
  const bgClass = type === 'success' ? 'bg-success' : 
                  type === 'danger' ? 'bg-danger' : 
                  type === 'warning' ? 'bg-warning' : 'bg-info';
  
  const toastHtml = `
    <div class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  const $toast = $(toastHtml);
  $toastContainer.append($toast);
  
  // Mostrar toast
  const toast = new bootstrap.Toast($toast[0], {
    autohide: true,
    delay: 5000
  });
  toast.show();
  
  // Eliminar del DOM después de ocultar
  $toast.on('hidden.bs.toast', function() {
    $(this).remove();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Reinicia el formulario a su estado inicial
 */
function resetForm() {
  const $form = $('#contact-form');
  
  // Limpiar formulario
  $form[0].reset();
  
  // Limpiar todos los errores
  $form.find('.is-invalid').removeClass('is-invalid');
  $form.find('.invalid-feedback').text('').hide();
  
  // Resetear contador de caracteres
  $('#char-count').text('0').removeClass('text-warning text-danger');
  
  // Scroll al top del formulario
  $('html, body').animate({
    scrollTop: $form.offset().top - 100
  }, 300);
  
  console.log('🔄 Formulario reiniciado');
}

// ═══════════════════════════════════════════════════════════════════════════
// LOG DE INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

console.log('✅ contacto.js cargado correctamente');