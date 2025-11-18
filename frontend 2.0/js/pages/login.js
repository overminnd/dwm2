// ============================================
// LOGIN - PÁGINA DE INICIO DE SESIÓN
// ============================================

import { initPage, getCurrentUser, setCurrentUser, redirectIfAuthenticated } from '../auth.js';
import { login } from '../api.js';
import { ROUTES } from '../config.js';
import { showAlert, setButtonLoading, isValidEmail } from '../utils.js';

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Redirigir si ya está autenticado
  if (redirectIfAuthenticated()) return;
  
  // Inicializar página
  initPage({ loadCarrito: false });
  
  // Inicializar formularios
  initEmailForm();
  initPasswordForm();
  initBackButton();
});

// ============================================
// STEP 1: EMAIL
// ============================================

function initEmailForm() {
  const emailForm = document.getElementById('emailForm');
  const emailInput = document.getElementById('emailInput');
  const emailBtn = document.getElementById('emailContinueBtn');
  
  if (!emailForm) return;
  
  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    // Validar email
    if (!isValidEmail(email)) {
      emailInput.classList.add('is-invalid');
      return;
    }
    
    emailInput.classList.remove('is-invalid');
    
    // Mostrar loading
    setButtonLoading(emailBtn, true);
    
    // Simular verificación de email
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ocultar loading
    setButtonLoading(emailBtn, false);
    
    // Mostrar step 2
    showPasswordStep(email);
  });
  
  // Quitar error al escribir
  emailInput.addEventListener('input', () => {
    emailInput.classList.remove('is-invalid');
  });
}

// ============================================
// STEP 2: PASSWORD
// ============================================

function showPasswordStep(email) {
  const emailForm = document.getElementById('emailForm');
  const passwordForm = document.getElementById('passwordForm');
  const emailDisplay = document.getElementById('emailDisplay');
  
  if (!passwordForm) return;
  
  // Ocultar form de email
  emailForm.classList.add('d-none');
  
  // Mostrar form de password
  passwordForm.classList.remove('d-none');
  
  // Mostrar email
  if (emailDisplay) {
    emailDisplay.textContent = email;
  }
  
  // Focus en password
  const passwordInput = document.getElementById('passwordInput');
  if (passwordInput) {
    passwordInput.focus();
  }
}

function initPasswordForm() {
  const passwordForm = document.getElementById('passwordForm');
  const passwordInput = document.getElementById('passwordInput');
  const loginBtn = document.getElementById('loginBtn');
  
  if (!passwordForm) return;
  
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('emailDisplay')?.textContent || '';
    const password = passwordInput.value;
    
    // Validar password
    if (!password) {
      passwordInput.classList.add('is-invalid');
      return;
    }
    
    passwordInput.classList.remove('is-invalid');
    
    // Mostrar loading
    setButtonLoading(loginBtn, true);
    
    try {
      // Llamar a la API
      const result = await login(email, password);
      
      if (result.success) {
        // Guardar usuario
        setCurrentUser(result.data);
        
        // Mostrar mensaje de éxito
        showAlert('loginAlerts', 
          '<i class="bi bi-check-circle me-2"></i>¡Inicio de sesión exitoso! Redirigiendo...', 
          'success', 
          false);
        
        // Redirigir al home después de 1 segundo
        setTimeout(() => {
          window.location.href = ROUTES.HOME;
        }, 1000);
      } else {
        // Mostrar error
        showAlert('loginAlerts', 
          '<i class="bi bi-exclamation-triangle me-2"></i>Email o contraseña incorrectos.', 
          'danger');
        setButtonLoading(loginBtn, false);
      }
    } catch (error) {
      console.error('Error en login:', error);
      showAlert('loginAlerts', 
        '<i class="bi bi-exclamation-triangle me-2"></i>Error al iniciar sesión. Intenta nuevamente.', 
        'danger');
      setButtonLoading(loginBtn, false);
    }
  });
  
  // Quitar error al escribir
  passwordInput.addEventListener('input', () => {
    passwordInput.classList.remove('is-invalid');
  });
}

// ============================================
// BOTÓN VOLVER
// ============================================

function initBackButton() {
  const backBtn = document.getElementById('backToEmail');
  
  if (!backBtn) return;
  
  backBtn.addEventListener('click', () => {
    const emailForm = document.getElementById('emailForm');
    const passwordForm = document.getElementById('passwordForm');
    
    // Mostrar form de email
    emailForm.classList.remove('d-none');
    
    // Ocultar form de password
    passwordForm.classList.add('d-none');
    
    // Limpiar password
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.classList.remove('is-invalid');
    }
    
    // Limpiar alertas
    const alertsContainer = document.getElementById('loginAlerts');
    if (alertsContainer) {
      alertsContainer.innerHTML = '';
    }
  });
}