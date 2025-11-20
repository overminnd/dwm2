/**
 * ============================================================================
 * MARAZUL - Página de Login
 * ============================================================================
 * 
 * Archivo: pages/login.js
 * Descripción: Lógica de inicio de sesión y autenticación
 * Versión: 1.0
 */

import { ROUTES, MESSAGES } from '../config.js';
import { 
  redirectIfAuthenticated,
  setCurrentUser,
  loadComponent,
  initHeader
} from '../auth.js';
import { login as loginAPI } from '../api.js';
import {
  validateEmail,
  validateRequired,
  showToast,
  setButtonLoading,
  resetButton,
  redirect,
  log
} from '../utils.js';
import { loadCartFromBackend } from '../cart.js';

// ============================================================================
// VARIABLES GLOBALES
// ============================================================================

let currentStep = 1; // Paso actual del login (1: email, 2: password)
let userEmail = ''; // Email ingresado en paso 1

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa la página de login
 */
async function init() {
  try {
    log('info', 'Inicializando página de login...');
    
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
    
    // Mostrar paso 1
    showStep(1);
    
    log('info', 'Página de login inicializada');
  } catch (error) {
    log('error', 'Error inicializando login:', error);
  }
}

/**
 * Carga componentes HTML necesarios
 */
async function loadComponents() {
  try {
    // Cargar header si existe el contenedor
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      await loadComponent('header-container', '../components/header.html');
    }
  } catch (error) {
    log('error', 'Error cargando componentes:', error);
  }
}

// ============================================================================
// NAVEGACIÓN ENTRE PASOS
// ============================================================================

/**
 * Muestra un paso específico del login
 * @param {number} step - Número de paso (1 o 2)
 */
function showStep(step) {
  currentStep = step;
  
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  
  if (!step1 || !step2) {
    log('error', 'Contenedores de pasos no encontrados');
    return;
  }
  
  if (step === 1) {
    step1.style.display = 'block';
    step2.style.display = 'none';
    
    // Focus en email
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  } else if (step === 2) {
    step1.style.display = 'none';
    step2.style.display = 'block';
    
    // Mostrar email en paso 2
    const emailDisplay = document.getElementById('email-display');
    if (emailDisplay) {
      emailDisplay.textContent = userEmail;
    }
    
    // Focus en password
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.focus();
    }
  }
  
  log('debug', `Mostrando paso ${step}`);
}

/**
 * Avanza al siguiente paso
 */
function nextStep() {
  if (currentStep === 1) {
    handleStep1Submit();
  }
}

/**
 * Retrocede al paso anterior
 */
function previousStep() {
  if (currentStep === 2) {
    showStep(1);
  }
}

// ============================================================================
// MANEJO DE FORMULARIOS
// ============================================================================

/**
 * Maneja el submit del paso 1 (email)
 */
async function handleStep1Submit() {
  const emailInput = document.getElementById('email');
  const btnNext = document.getElementById('btn-next');
  
  if (!emailInput || !btnNext) return;
  
  const email = emailInput.value.trim();
  
  // Validar email
  if (!validateRequired(email)) {
    showToast(MESSAGES.VALIDATION.REQUIRED_FIELD, 'warning');
    emailInput.focus();
    return;
  }
  
  if (!validateEmail(email)) {
    showToast(MESSAGES.VALIDATION.INVALID_EMAIL, 'warning');
    emailInput.focus();
    return;
  }
  
  // Guardar email y avanzar
  userEmail = email;
  showStep(2);
}

/**
 * Maneja el submit del paso 2 (password)
 */
async function handleStep2Submit() {
  const passwordInput = document.getElementById('password');
  const btnLogin = document.getElementById('btn-login');
  
  if (!passwordInput || !btnLogin) return;
  
  const password = passwordInput.value;
  
  // Validar password
  if (!validateRequired(password)) {
    showToast(MESSAGES.VALIDATION.REQUIRED_FIELD, 'warning');
    passwordInput.focus();
    return;
  }
  
  // Intentar login
  await performLogin(userEmail, password);
}

/**
 * Realiza el login con el backend
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 */
async function performLogin(email, password) {
  const btnLogin = document.getElementById('btn-login');
  
  if (!btnLogin) return;
  
  try {
    // Mostrar loading
    setButtonLoading(btnLogin, 'Iniciando sesión...');
    
    log('info', 'Intentando login para:', email);
    
    // Llamar API
    const response = await loginAPI({ email, password });
    
    if (response.success) {
      log('info', 'Login exitoso');
      
      // Guardar datos de usuario y token
      setCurrentUser(response.user, response.token);
      
      // Cargar carrito del backend
      await loadCartFromBackend();
      
      // Mostrar mensaje de éxito
      showToast(MESSAGES.SUCCESS.LOGIN, 'success');
      
      // Redirigir al home
      setTimeout(() => {
        redirect(ROUTES.HOME);
      }, 1000);
    } else {
      // Error en login
      resetButton(btnLogin);
      showToast(response.message || MESSAGES.ERROR.INVALID_CREDENTIALS, 'error');
      log('warn', 'Login fallido:', response.message);
    }
  } catch (error) {
    resetButton(btnLogin);
    
    // Manejar errores específicos
    if (error.statusCode === 401) {
      showToast(MESSAGES.ERROR.INVALID_CREDENTIALS, 'error');
    } else if (error.statusCode === 0) {
      showToast(MESSAGES.ERROR.NETWORK, 'error');
    } else {
      showToast(error.message || MESSAGES.ERROR.GENERIC, 'error');
    }
    
    log('error', 'Error en login:', error);
  }
}

// ============================================================================
// EVENTOS
// ============================================================================

/**
 * Configura todos los eventos de la página
 */
function setupEvents() {
  // Formulario paso 1 (email)
  const form1 = document.getElementById('form-step-1');
  if (form1) {
    form1.addEventListener('submit', function(e) {
      e.preventDefault();
      handleStep1Submit();
    });
  }
  
  // Botón siguiente paso 1
  const btnNext = document.getElementById('btn-next');
  if (btnNext) {
    btnNext.addEventListener('click', function(e) {
      e.preventDefault();
      handleStep1Submit();
    });
  }
  
  // Formulario paso 2 (password)
  const form2 = document.getElementById('form-step-2');
  if (form2) {
    form2.addEventListener('submit', function(e) {
      e.preventDefault();
      handleStep2Submit();
    });
  }
  
  // Botón login paso 2
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', function(e) {
      e.preventDefault();
      handleStep2Submit();
    });
  }
  
  // Botón volver
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', function(e) {
      e.preventDefault();
      previousStep();
    });
  }
  
  // Enter en inputs
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleStep1Submit();
      }
    });
  }
  
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleStep2Submit();
      }
    });
  }
  
  // Toggle mostrar contraseña
  const togglePassword = document.getElementById('toggle-password');
  if (togglePassword) {
    togglePassword.addEventListener('click', function() {
      const passwordInput = document.getElementById('password');
      if (passwordInput) {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        const icon = this.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-eye');
          icon.classList.toggle('fa-eye-slash');
        }
      }
    });
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Limpia el formulario
 */
function clearForm() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
  
  userEmail = '';
  showStep(1);
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
  performLogin,
  clearForm
};