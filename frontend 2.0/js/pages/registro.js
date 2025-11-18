// ============================================
// REGISTRO - PÁGINA DE REGISTRO DE USUARIO
// ============================================

import { initPage, setCurrentUser, redirectIfAuthenticated } from '../auth.js';
import { register } from '../api.js';
import { ROUTES } from '../config.js';
import { showAlert, setButtonLoading, isValidEmail, isValidPhone, isValidPassword } from '../utils.js';

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Redirigir si ya está autenticado
  if (redirectIfAuthenticated()) return;
  
  // Inicializar página
  initPage({ loadCarrito: false });
  
  // Inicializar formulario
  initRegisterForm();
});

// ============================================
// FORMULARIO DE REGISTRO
// ============================================

function initRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  
  if (!registerForm) return;
  
  // Validación en tiempo real
  setupRealtimeValidation();
  
  // Submit del formulario
  registerForm.addEventListener('submit', handleRegisterSubmit);
}

// ============================================
// VALIDACIÓN EN TIEMPO REAL
// ============================================

function setupRealtimeValidation() {
  // Email
  const emailInput = document.getElementById('regEmail');
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      if (emailInput.value && !isValidEmail(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        emailInput.nextElementSibling.textContent = 'Email inválido';
      } else {
        emailInput.classList.remove('is-invalid');
      }
    });
  }
  
  // Teléfono
  const phoneInput = document.getElementById('regPhone');
  if (phoneInput) {
    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value && !isValidPhone(phoneInput.value)) {
        phoneInput.classList.add('is-invalid');
      } else {
        phoneInput.classList.remove('is-invalid');
      }
    });
  }
  
  // Contraseñas
  const pass1 = document.getElementById('regPass');
  const pass2 = document.getElementById('regPass2');
  
  if (pass1 && pass2) {
    pass2.addEventListener('input', () => {
      if (pass2.value && pass1.value !== pass2.value) {
        pass2.classList.add('is-invalid');
      } else {
        pass2.classList.remove('is-invalid');
      }
    });
  }
}

// ============================================
// MANEJO DEL SUBMIT
// ============================================

async function handleRegisterSubmit(e) {
  e.preventDefault();
  
  // Obtener datos del formulario
  const formData = {
    email: document.getElementById('regEmail').value.trim(),
    firstName: document.getElementById('regFirstName').value.trim(),
    lastName: document.getElementById('regLastName').value.trim(),
    phone: document.getElementById('regPhone').value.trim(),
    password: document.getElementById('regPass').value,
    password2: document.getElementById('regPass2').value
  };
  
  // Validar
  const validation = validateRegistrationData(formData);
  if (!validation.isValid) {
    showAlert('registerAlerts', validation.message, 'danger');
    return;
  }
  
  // Botón de submit
  const registerBtn = document.getElementById('registerBtn');
  setButtonLoading(registerBtn, true);
  
  try {
    // Llamar a la API
    const result = await register(formData);
    
    if (result.success) {
      // Guardar usuario
      setCurrentUser(result.data);
      
      // Mostrar mensaje de éxito
      showAlert('registerAlerts', 
        '<i class="bi bi-check-circle me-2"></i>¡Registro exitoso! Redirigiendo...', 
        'success', 
        false);
      
      // Redirigir al home después de 1.5 segundos
      setTimeout(() => {
        window.location.href = ROUTES.HOME;
      }, 1500);
    } else {
      // Mostrar error
      showAlert('registerAlerts', 
        `<i class="bi bi-exclamation-triangle me-2"></i>${result.message || 'Error al registrar usuario.'}`, 
        'danger');
      setButtonLoading(registerBtn, false);
    }
  } catch (error) {
    console.error('Error en registro:', error);
    showAlert('registerAlerts', 
      '<i class="bi bi-exclamation-triangle me-2"></i>Error al registrar. Intenta nuevamente.', 
      'danger');
    setButtonLoading(registerBtn, false);
  }
}

// ============================================
// VALIDACIÓN DE DATOS
// ============================================

function validateRegistrationData(data) {
  // Email
  if (!data.email) {
    return { isValid: false, message: 'El email es obligatorio.' };
  }
  if (!isValidEmail(data.email)) {
    return { isValid: false, message: 'El email no es válido.' };
  }
  
  // Nombre
  if (!data.firstName) {
    return { isValid: false, message: 'El nombre es obligatorio.' };
  }
  
  // Apellido
  if (!data.lastName) {
    return { isValid: false, message: 'El apellido es obligatorio.' };
  }
  
  // Teléfono
  if (!data.phone) {
    return { isValid: false, message: 'El teléfono es obligatorio.' };
  }
  if (!isValidPhone(data.phone)) {
    return { isValid: false, message: 'El teléfono debe tener 8 o 9 dígitos.' };
  }
  
  // Contraseña
  if (!data.password) {
    return { isValid: false, message: 'La contraseña es obligatoria.' };
  }
  if (!isValidPassword(data.password)) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  
  // Confirmar contraseña
  if (data.password !== data.password2) {
    return { isValid: false, message: 'Las contraseñas no coinciden.' };
  }
  
  return { isValid: true };
}