// ============================================
// CONTACTO - PÁGINA DE CONTACTO
// ============================================

import { initPage } from '../auth.js';
import { sendContactMessage } from '../api.js';
import { showAlert, setButtonLoading, isValidEmail } from '../utils.js';

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar página
  initPage();
  
  // Inicializar formulario
  initContactForm();
});

// ============================================
// FORMULARIO DE CONTACTO
// ============================================

function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', handleContactSubmit);
}

async function handleContactSubmit(e) {
  e.preventDefault();
  
  const formMessage = document.getElementById('formMessage');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  // Obtener datos del formulario
  const messageData = {
    name: document.getElementById('contactName').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    phone: document.getElementById('contactPhone')?.value.trim() || '',
    subject: document.getElementById('contactSubject').value,
    message: document.getElementById('contactMessage').value.trim()
  };
  
  // Validar datos
  const validation = validateContactData(messageData);
  if (!validation.isValid) {
    if (formMessage) {
      showAlert('formMessage', 
        `<i class="bi bi-exclamation-triangle me-2"></i>${validation.message}`, 
        'danger');
    }
    return;
  }
  
  // Mostrar loading
  setButtonLoading(submitBtn, true);
  
  try {
    // Enviar mensaje
    const result = await sendContactMessage(messageData);
    
    if (result.success) {
      // Mostrar mensaje de éxito
      if (formMessage) {
        formMessage.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i>
            <strong>¡Mensaje enviado con éxito!</strong> Te responderemos a la brevedad a ${messageData.email}.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          </div>
        `;
      }
      
      // Limpiar formulario
      e.target.reset();
      
      // Scroll al mensaje
      if (formMessage) {
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      throw new Error(result.message || 'Error al enviar mensaje');
    }
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    
    if (formMessage) {
      formMessage.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i>
          <strong>Error:</strong> No se pudo enviar el mensaje. Por favor, intenta nuevamente.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    }
  } finally {
    // Ocultar loading
    setButtonLoading(submitBtn, false);
  }
}

// ============================================
// VALIDACIÓN
// ============================================

function validateContactData(data) {
  // Nombre
  if (!data.name) {
    return { isValid: false, message: 'El nombre es obligatorio.' };
  }
  
  // Email
  if (!data.email) {
    return { isValid: false, message: 'El email es obligatorio.' };
  }
  if (!isValidEmail(data.email)) {
    return { isValid: false, message: 'El email no es válido.' };
  }
  
  // Asunto
  if (!data.subject) {
    return { isValid: false, message: 'Debes seleccionar un asunto.' };
  }
  
  // Mensaje
  if (!data.message) {
    return { isValid: false, message: 'El mensaje es obligatorio.' };
  }
  if (data.message.length < 10) {
    return { isValid: false, message: 'El mensaje debe tener al menos 10 caracteres.' };
  }
  
  return { isValid: true };
}