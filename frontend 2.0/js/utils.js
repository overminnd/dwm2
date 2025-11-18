// ============================================
// UTILS - FUNCIONES AUXILIARES
// ============================================

// ============================================
// FORMATO DE NÚMEROS Y MONEDA
// ============================================

/**
 * Formatea un número como precio en pesos chilenos
 */
export function formatPrice(price) {
  return `$${price.toLocaleString('es-CL')}`;
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(number) {
  return number.toLocaleString('es-CL');
}

// ============================================
// FORMATO DE FECHAS
// ============================================

/**
 * Formatea una fecha a formato DD/MM/YYYY
 */
export function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formatea una fecha con hora
 */
export function formatDateTime(date) {
  const d = new Date(date);
  const dateStr = formatDate(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Obtiene tiempo relativo (hace 2 días, hace 1 hora, etc.)
 */
export function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'Hace un momento';
}

// ============================================
// VALIDACIÓN
// ============================================

/**
 * Valida un email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida un teléfono chileno (8 o 9 dígitos)
 */
export function isValidPhone(phone) {
  const phoneRegex = /^[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Valida una contraseña (mínimo 6 caracteres)
 */
export function isValidPassword(password) {
  return password && password.length >= 6;
}

/**
 * Valida un RUT chileno
 */
export function isValidRut(rut) {
  // Remover puntos y guión
  rut = rut.replace(/\./g, '').replace(/-/g, '');
  
  // Separar número y dígito verificador
  const rutNum = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();
  
  // Calcular dígito verificador
  let suma = 0;
  let multiplo = 2;
  
  for (let i = rutNum.length - 1; i >= 0; i--) {
    suma += parseInt(rutNum.charAt(i)) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  
  const dvEsperado = 11 - (suma % 11);
  const dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado);
  
  return dv === dvFinal;
}

// ============================================
// MANIPULACIÓN DE STRINGS
// ============================================

/**
 * Capitaliza la primera letra de un string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Trunca un texto a cierta longitud
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Genera un slug a partir de un texto
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// ============================================
// ALERTAS Y NOTIFICACIONES
// ============================================

/**
 * Muestra una alerta de Bootstrap
 */
export function showAlert(containerId, message, type = 'info', dismissible = true) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const alertHTML = `
    <div class="alert alert-${type} ${dismissible ? 'alert-dismissible' : ''} fade show" role="alert">
      ${message}
      ${dismissible ? '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' : ''}
    </div>
  `;
  
  container.innerHTML = alertHTML;
  
  // Auto-cerrar después de 5 segundos si es dismissible
  if (dismissible) {
    setTimeout(() => {
      const alert = container.querySelector('.alert');
      if (alert) {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      }
    }, 5000);
  }
}

/**
 * Muestra un toast (requiere Bootstrap 5)
 */
export function showToast(message, type = 'info') {
  // TODO: Implementar sistema de toasts
  console.log(`[Toast ${type}]:`, message);
}

// ============================================
// LOADING STATES
// ============================================

/**
 * Muestra un spinner de loading
 */
export function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;
}

/**
 * Oculta el loading y muestra contenido
 */
export function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.innerHTML = '';
}

/**
 * Deshabilita un botón y muestra spinner
 */
export function setButtonLoading(button, loading = true) {
  if (!button) return;
  
  if (loading) {
    button.disabled = true;
    const originalText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner-border');
    
    if (originalText) originalText.classList.add('d-none');
    if (spinner) spinner.classList.remove('d-none');
  } else {
    button.disabled = false;
    const originalText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner-border');
    
    if (originalText) originalText.classList.remove('d-none');
    if (spinner) spinner.classList.add('d-none');
  }
}

// ============================================
// SCROLL
// ============================================

/**
 * Hace scroll suave a un elemento
 */
export function scrollToElement(elementId, offset = 0) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

/**
 * Hace scroll al top de la página
 */
export function scrollToTop(smooth = true) {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

// ============================================
// DEBOUNCE Y THROTTLE
// ============================================

/**
 * Debounce - Ejecuta una función después de cierto tiempo de inactividad
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle - Limita la frecuencia de ejecución de una función
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

/**
 * Guarda en localStorage de forma segura
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
    return false;
  }
}

/**
 * Obtiene de localStorage de forma segura
 */
export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error al leer de localStorage:', error);
    return defaultValue;
  }
}

/**
 * Elimina de localStorage
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error al eliminar de localStorage:', error);
    return false;
  }
}

// ============================================
// GENERADORES DE IDS
// ============================================

/**
 * Genera un ID único
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}