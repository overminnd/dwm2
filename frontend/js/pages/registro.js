// ═══════════════════════════════════════════════════════════════════════════
// REGISTRO.JS - COMPONENTE 9
// ═══════════════════════════════════════════════════════════════════════════
// 
// Archivo: /frontend/js/pages/registro.js
// Propósito: Manejo del formulario de registro
// 
// Funcionalidades:
// - Validación de formulario completo
// - Validación de RUT chileno
// - Validación de contraseñas coincidentes
// - Registro con backend
// - Auto-login después de registro exitoso
// 
// Dependencias:
// - jQuery
// - js/config.js
// - js/utils.js
// - js/auth.js (saveToken(), saveUser())
// - js/api.js (register())
// 
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE RUT CHILENO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida un RUT chileno
 * 
 * @param {string} rut - RUT en formato XX.XXX.XXX-X o XXXXXXXXX
 * @returns {boolean} - true si es válido
 */
function validateRUT(rut) {
  console.log('🔍 Validando RUT:', rut);
  
  if (!rut || rut.trim() === '') {
    return false;
  }
  
  // Limpiar el RUT (quitar puntos y guión)
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').trim();
  
  // Verificar longitud (mínimo 8 caracteres: 7 dígitos + 1 verificador)
  if (cleanRut.length < 8) {
    return false;
  }
  
  // Separar número y dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const verificador = cleanRut.slice(-1).toUpperCase();
  
  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    suma += parseInt(rutNumber[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
  
  const esValido = verificador === dvCalculado;
  
  if (esValido) {
    console.log('✅ RUT válido');
  } else {
    console.log('❌ RUT inválido');
  }
  
  return esValido;
}

/**
 * Formatea un RUT chileno con puntos y guión
 * 
 * @param {string} rut - RUT sin formato
 * @returns {string} - RUT formateado (XX.XXX.XXX-X)
 */
function formatRUT(rut) {
  // Limpiar el RUT
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').trim();
  
  if (cleanRut.length < 2) {
    return cleanRut;
  }
  
  // Separar número y dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const verificador = cleanRut.slice(-1);
  
  // Agregar puntos cada 3 dígitos (de derecha a izquierda)
  const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedNumber}-${verificador}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE CONTRASEÑA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida la fortaleza de una contraseña
 * 
 * Requisitos:
 * - Mínimo 6 caracteres
 * - Al menos una letra
 * - Al menos un número
 * 
 * @param {string} password - Contraseña a validar
 * @returns {object} - {valid: boolean, message: string}
 */
function validatePassword(password) {
  console.log('🔍 Validando contraseña...');
  
  if (!password || password.length < 6) {
    return {
      valid: false,
      message: 'La contraseña debe tener al menos 6 caracteres'
    };
  }
  
  // Verificar que tenga al menos una letra
  if (!/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe contener al menos una letra'
    };
  }
  
  // Verificar que tenga al menos un número
  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe contener al menos un número'
    };
  }
  
  console.log('✅ Contraseña válida');
  return {
    valid: true,
    message: 'Contraseña válida'
  };
}

/**
 * Verifica que las contraseñas coincidan
 * 
 * @param {string} password - Contraseña
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {boolean} - true si coinciden
 */
function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE FORMULARIO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida el formulario completo de registro
 * 
 * @returns {object|null} - Datos del formulario si es válido, null si no
 */
function validateForm() {
  console.log('📋 Validando formulario de registro...');
  
  // Limpiar mensajes de error previos
  clearErrorMessages();
  
  // Obtener valores del formulario
  const nombre = $('#nombreInput').val().trim();
  const apellido = $('#apellidoInput').val().trim();
  const rut = $('#rutInput').val().trim();
  const email = $('#emailInput').val().trim();
  const telefono = $('#telefonoInput').val().trim();
  const direccion = $('#direccionInput').val().trim();
  const password = $('#passwordInput').val();
  const confirmPassword = $('#confirmPasswordInput').val();
  
  // ═══════════════════════════════════════════════════════════════════════
  // VALIDAR CAMPOS OBLIGATORIOS
  // ═══════════════════════════════════════════════════════════════════════
  
  if (!nombre) {
    showError('El nombre es obligatorio');
    $('#nombreInput').focus();
    return null;
  }
  
  if (!apellido) {
    showError('El apellido es obligatorio');
    $('#apellidoInput').focus();
    return null;
  }
  
  if (!rut) {
    showError('El RUT es obligatorio');
    $('#rutInput').focus();
    return null;
  }
  
  if (!email) {
    showError('El email es obligatorio');
    $('#emailInput').focus();
    return null;
  }
  
  if (!telefono) {
    showError('El teléfono es obligatorio');
    $('#telefonoInput').focus();
    return null;
  }
  
  if (!direccion) {
    showError('La dirección es obligatoria');
    $('#direccionInput').focus();
    return null;
  }
  
  if (!password) {
    showError('La contraseña es obligatoria');
    $('#passwordInput').focus();
    return null;
  }
  
  if (!confirmPassword) {
    showError('Debes confirmar tu contraseña');
    $('#confirmPasswordInput').focus();
    return null;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // VALIDAR RUT
  // ═══════════════════════════════════════════════════════════════════════
  
  if (!validateRUT(rut)) {
    showError('El RUT ingresado no es válido');
    $('#rutInput').focus();
    return null;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // VALIDAR EMAIL
  // ═══════════════════════════════════════════════════════════════════════
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('El email ingresado no es válido');
    $('#emailInput').focus();
    return null;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // VALIDAR TELÉFONO (backend espera 8-9 dígitos)
  // ═══════════════════════════════════════════════════════════════════════
  
  // Limpiar teléfono (quitar +56, espacios, etc)
  const cleanPhone = telefono.replace(/\+56/g, '').replace(/\s/g, '').replace(/-/g, '');
  
  if (!/^[0-9]{8,9}$/.test(cleanPhone)) {
    showError('El teléfono debe tener 8-9 dígitos (ej: 912345678)');
    $('#telefonoInput').focus();
    return null;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // VALIDAR CONTRASEÑA
  // ═══════════════════════════════════════════════════════════════════════
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    showError(passwordValidation.message);
    $('#passwordInput').focus();
    return null;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // VALIDAR QUE LAS CONTRASEÑAS COINCIDAN
  // ═══════════════════════════════════════════════════════════════════════
  
  if (!passwordsMatch(password, confirmPassword)) {
    showError('Las contraseñas no coinciden');
    $('#confirmPasswordInput').focus();
    return null;
  }
  
  console.log('✅ Formulario válido');
  
  // Retornar datos en formato que espera el backend
  // Backend espera: { email, password, firstName, lastName, phone }
  return {
    email,
    password,
    firstName: nombre,      // nombre → firstName
    lastName: apellido,     // apellido → lastName
    phone: telefono.replace(/\+56/g, '').replace(/\s/g, '')  // Limpiar formato de teléfono
    // Nota: rut y direccion NO se envían porque el backend no los espera
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Maneja el proceso de registro
 */
async function handleRegistro() {
  console.log('📝 Iniciando proceso de registro...');
  
  // Validar formulario
  const formData = validateForm();
  
  if (!formData) {
    return; // Hay errores de validación
  }
  
  // Deshabilitar botón de registro
  const $registerBtn = $('#registerBtn');
  $registerBtn.prop('disabled', true);
  $registerBtn.html('<span class="spinner-border spinner-border-sm me-2"></span>Registrando...');
  
  try {
    // Llamar a la API de registro
    const response = await register(formData);
    
    if (response.success) {
      console.log('✅ Registro exitoso');
      
      // Guardar token y usuario (auto-login)
      // NOTE: register() de api.js ya guarda automáticamente el token y usuario
      // No necesitamos hacerlo manualmente aquí
      
      // Mostrar mensaje de éxito
      showSuccess('¡Registro exitoso! Redirigiendo...');
      
      // Redirigir a index.html después de 1.5 segundos
      setTimeout(() => {
        window.location.href = CONFIG.BASE_PATH + '/index.html';
      }, 1500);
      
    } else {
      console.error('❌ Registro fallido:', response.message);
      showError(response.message || 'Error al registrar usuario');
      
      // Re-habilitar botón
      $registerBtn.prop('disabled', false);
      $registerBtn.html('<i class="bi bi-person-plus me-2"></i>Registrarse');
    }
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    showError('Error al registrar usuario. Por favor intenta nuevamente.');
    
    // Re-habilitar botón
    $registerBtn.prop('disabled', false);
    $registerBtn.html('<i class="bi bi-person-plus me-2"></i>Registrarse');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Muestra un mensaje de error
 * 
 * @param {string} message - Mensaje a mostrar
 */
function showError(message) {
  const $errorDiv = $('#errorMessage');
  $errorDiv.html(`
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `);
  
  // Scroll al mensaje de error
  $errorDiv[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Muestra un mensaje de éxito
 * 
 * @param {string} message - Mensaje a mostrar
 */
function showSuccess(message) {
  const $errorDiv = $('#errorMessage');
  $errorDiv.html(`
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `);
  
  // Scroll al mensaje de éxito
  $errorDiv[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Limpia todos los mensajes de error/éxito
 */
function clearErrorMessages() {
  $('#errorMessage').empty();
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa los eventos del formulario de registro
 */
function initRegistroForm() {
  console.log('🎬 Inicializando formulario de registro...');
  
  // ═══════════════════════════════════════════════════════════════════════
  // FORMATEO AUTOMÁTICO DE RUT
  // ═══════════════════════════════════════════════════════════════════════
  
  $('#rutInput').on('blur', function() {
    const rut = $(this).val().trim();
    if (rut) {
      $(this).val(formatRUT(rut));
    }
  });
  
  // ═══════════════════════════════════════════════════════════════════════
  // TOGGLE MOSTRAR/OCULTAR CONTRASEÑAS
  // ═══════════════════════════════════════════════════════════════════════
  
  $('#togglePassword').on('click', function() {
    const $passwordInput = $('#passwordInput');
    const $icon = $(this).find('i');
    
    if ($passwordInput.attr('type') === 'password') {
      $passwordInput.attr('type', 'text');
      $icon.removeClass('bi-eye').addClass('bi-eye-slash');
    } else {
      $passwordInput.attr('type', 'password');
      $icon.removeClass('bi-eye-slash').addClass('bi-eye');
    }
  });
  
  $('#toggleConfirmPassword').on('click', function() {
    const $confirmPasswordInput = $('#confirmPasswordInput');
    const $icon = $(this).find('i');
    
    if ($confirmPasswordInput.attr('type') === 'password') {
      $confirmPasswordInput.attr('type', 'text');
      $icon.removeClass('bi-eye').addClass('bi-eye-slash');
    } else {
      $confirmPasswordInput.attr('type', 'password');
      $icon.removeClass('bi-eye-slash').addClass('bi-eye');
    }
  });
  
  // ═══════════════════════════════════════════════════════════════════════
  // SUBMIT DEL FORMULARIO
  // ═══════════════════════════════════════════════════════════════════════
  
  $('#registroForm').on('submit', function(e) {
    e.preventDefault();
    handleRegistro();
  });
  
  console.log('✅ Formulario de registro inicializado');
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTO READY
// ═══════════════════════════════════════════════════════════════════════════

$(document).ready(function() {
  console.log('📄 Inicializando página de registro...');
  
  // Verificar si el usuario ya está autenticado
  if (isAuthenticated()) {
    console.log('⚠️ Usuario ya autenticado, redirigiendo...');
    window.location.href = CONFIG.BASE_PATH + '/index.html';
    return;
  }
  
  // Inicializar formulario
  initRegistroForm();
  
  console.log('✅ Página de registro inicializada correctamente');
});

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS (para testing o uso en otros módulos)
// ═══════════════════════════════════════════════════════════════════════════

window.validateRUT = validateRUT;
window.formatRUT = formatRUT;
window.validatePassword = validatePassword;
window.validateForm = validateForm;
window.handleRegistro = handleRegistro;