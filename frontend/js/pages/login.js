// ═══════════════════════════════════════════════════════════════════════════
// LOGIN.JS - COMPONENTE 9 (CORREGIDO)
// ═══════════════════════════════════════════════════════════════════════════
// 
// Archivo: /frontend/js/pages/login.js
// Propósito: Manejo del flujo de login de 2 pasos
// Versión: 1.1.0 (Corregido - localStorage directo)
// 
// Flujo:
// 1. Paso 1: Usuario ingresa email
// 2. Paso 2: Usuario ingresa contraseña
// 3. Login exitoso → Guarda en localStorage → Redirige a index.html
// 
// Dependencias:
// - jQuery
// - js/config.js
// - js/utils.js
// - js/auth.js
// - js/api.js (apiRequest())
// 
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Estado del flujo de login
 */
const loginState = {
  currentStep: 1,
  email: '',
  password: ''
};

// ═══════════════════════════════════════════════════════════════════════════
// PASO 1: EMAIL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Muestra el Paso 1 (ingresar email)
 */
function showStep1() {
  console.log('📧 Mostrando Paso 1: Email');
  
  loginState.currentStep = 1;
  
  // Mostrar/ocultar pasos
  $('#step1').removeClass('d-none').addClass('d-block');
  $('#step2').removeClass('d-block').addClass('d-none');
  
  // Limpiar mensajes de error
  clearErrorMessages();
  
  // Focus en el input de email
  $('#emailInput').focus();
}

/**
 * Valida el formato del email
 * 
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
function validateEmail(email) {
  console.log('🔍 Validando email:', email);
  
  if (!email || email.trim() === '') {
    showError('Por favor ingresa tu email');
    return false;
  }
  
  // Regex básico para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    showError('Por favor ingresa un email válido');
    return false;
  }
  
  console.log('✅ Email válido');
  return true;
}

/**
 * Maneja el clic en "Siguiente" del Paso 1
 */
function handleStep1Next() {
  console.log('➡️ Avanzando a Paso 2...');
  
  const email = $('#emailInput').val().trim();
  
  // Validar email
  if (!validateEmail(email)) {
    return;
  }
  
  // Guardar email en el estado
  loginState.email = email;
  
  // Avanzar a paso 2
  showStep2();
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 2: CONTRASEÑA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Muestra el Paso 2 (ingresar contraseña)
 */
function showStep2() {
  console.log('🔒 Mostrando Paso 2: Contraseña');
  
  loginState.currentStep = 2;
  
  // Mostrar/ocultar pasos
  $('#step1').removeClass('d-block').addClass('d-none');
  $('#step2').removeClass('d-none').addClass('d-block');
  
  // Mostrar el email ingresado
  $('#displayEmail').text(loginState.email);
  
  // Limpiar mensajes de error
  clearErrorMessages();
  
  // Focus en el input de contraseña
  $('#passwordInput').focus();
}

/**
 * Maneja el clic en "Volver" del Paso 2
 */
function handleStep2Back() {
  console.log('⬅️ Volviendo a Paso 1...');
  
  // Limpiar contraseña
  $('#passwordInput').val('');
  
  // Volver a paso 1
  showStep1();
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Maneja el proceso de login
 * CORREGIDO: Guarda directamente en localStorage con las claves correctas
 */
async function handleLogin() {
  console.log('🔐 Iniciando proceso de login...');
  
  const email = loginState.email;
  const password = $('#passwordInput').val();
  
  // Validar contraseña
  if (!password || password.trim() === '') {
    showError('Por favor ingresa tu contraseña');
    return;
  }
  
  // Deshabilitar botón de login
  const $loginBtn = $('#loginBtn');
  $loginBtn.prop('disabled', true);
  $loginBtn.html('<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...');
  
  try {
    // Llamar a la API de login usando apiRequest con firma correcta
    console.log('📡 API Request: POST /auth/login');
    
    // FIRMA CORRECTA: apiRequest(method, endpoint, data)
    const response = await apiRequest('POST', '/auth/login', { email, password });
    
    console.log('📦 Respuesta completa:', response);
    
    if (response.success) {
      console.log('✅ Login exitoso - Guardando datos...');
      
      // IMPORTANTE: apiRequest puede normalizar la respuesta de 2 formas:
      // Forma 1: { success: true, token: "...", user: {...} }
      // Forma 2: { success: true, data: { token: "...", user: {...} } }
      
      // Extraer token y user de ambas formas posibles
      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user;
      
      console.log('🔍 Token extraído:', token ? 'OK' : 'FALLO');
      console.log('🔍 Usuario extraído:', user ? 'OK' : 'FALLO');
      
      if (!token || !user) {
        console.error('❌ Respuesta del backend no tiene token o user:', response);
        showError('Error en la respuesta del servidor. Intenta nuevamente.');
        
        // Re-habilitar botón
        $loginBtn.prop('disabled', false);
        $loginBtn.html('Iniciar Sesión');
        return;
      }
      
      // GUARDAR DIRECTAMENTE en localStorage con las claves correctas
      localStorage.setItem('marazul_auth_token', token);
      localStorage.setItem('marazul_current_user', JSON.stringify(user));
      localStorage.setItem('marazul_recent_login', 'true');
      
      console.log('💾 Token guardado:', token.substring(0, 20) + '...');
      console.log('💾 Usuario guardado:', user.email);
      console.log('💾 Flag login reciente: true');
      
      // Verificar que se guardó correctamente
      const savedUser = localStorage.getItem('marazul_current_user');
      const savedToken = localStorage.getItem('marazul_auth_token');
      console.log('✅ Verificación - Usuario guardado:', savedUser ? 'OK' : 'FALLO');
      console.log('✅ Verificación - Token guardado:', savedToken ? 'OK' : 'FALLO');
      
      // Emitir evento de login
      $(document).trigger('auth:login', [user]);
      
      // Mostrar mensaje de éxito
      showSuccess('¡Bienvenido! Redirigiendo...');
      
      // Esperar 1.5 segundos antes de redirigir (dar tiempo a que localStorage se sincronice)
      setTimeout(() => {
        console.log('🔄 Redirigiendo a index.html...');
        window.location.href = '/MARAZUL/MARAZUL/frontend/index.html';
      }, 1500);
      
    } else {
      console.error('❌ Login fallido:', response.message);
      showError(response.message || 'Email o contraseña incorrectos');
      
      // Re-habilitar botón
      $loginBtn.prop('disabled', false);
      $loginBtn.html('Iniciar Sesión');
    }
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    showError('Error al iniciar sesión. Por favor intenta nuevamente.');
    
    // Re-habilitar botón
    $loginBtn.prop('disabled', false);
    $loginBtn.html('Iniciar Sesión');
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
}

/**
 * Limpia todos los mensajes de error/éxito
 */
function clearErrorMessages() {
  $('#errorMessage').empty();
}

/**
 * Maneja la tecla Enter en los inputs
 * 
 * @param {Event} event - Evento de teclado
 * @param {Function} callback - Función a ejecutar
 */
function handleEnterKey(event, callback) {
  if (event.key === 'Enter' || event.keyCode === 13) {
    event.preventDefault();
    callback();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa los eventos del formulario de login
 */
function initLoginForm() {
  console.log('🎬 Inicializando formulario de login...');
  
  // ═══════════════════════════════════════════════════════════════════════
  // PASO 1: Email
  // ═══════════════════════════════════════════════════════════════════════
  
  // Botón "Siguiente"
  $('#step1NextBtn').on('click', function(e) {
    e.preventDefault();
    handleStep1Next();
  });
  
  // Enter en el input de email
  $('#emailInput').on('keypress', function(e) {
    handleEnterKey(e, handleStep1Next);
  });
  
  // ═══════════════════════════════════════════════════════════════════════
  // PASO 2: Contraseña
  // ═══════════════════════════════════════════════════════════════════════
  
  // Botón "Volver"
  $('#step2BackBtn').on('click', function(e) {
    e.preventDefault();
    handleStep2Back();
  });
  
  // Botón "Iniciar Sesión"
  $('#loginBtn').on('click', function(e) {
    e.preventDefault();
    handleLogin();
  });
  
  // Enter en el input de contraseña
  $('#passwordInput').on('keypress', function(e) {
    handleEnterKey(e, handleLogin);
  });
  
  // ═══════════════════════════════════════════════════════════════════════
  // TOGGLE MOSTRAR/OCULTAR CONTRASEÑA
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
  
  console.log('✅ Formulario de login inicializado');
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTO READY
// ═══════════════════════════════════════════════════════════════════════════

$(document).ready(function() {
  console.log('📄 Inicializando página de login...');
  
  // Verificar si el usuario ya está autenticado
  if (isAuthenticated()) {
    console.log('⚠️ Usuario ya autenticado, redirigiendo...');
    window.location.href = '/MARAZUL/MARAZUL/frontend/index.html';
    return;
  }
  
  // Inicializar formulario
  initLoginForm();
  
  // Mostrar paso 1
  showStep1();
  
  console.log('✅ Página de login inicializada correctamente');
});

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS (para testing o uso en otros módulos)
// ═══════════════════════════════════════════════════════════════════════════

window.showStep1 = showStep1;
window.showStep2 = showStep2;
window.validateEmail = validateEmail;
window.handleLogin = handleLogin;