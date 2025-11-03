import { APP_CONFIG, VALIDATION } from './config.js';

/**
 * Format currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat(APP_CONFIG.LOCALE, {
    style: 'currency',
    currency: APP_CONFIG.CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date, format = 'short') {
  const d = new Date(date);
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
  };
  
  return new Intl.DateTimeFormat(APP_CONFIG.LOCALE, options[format] || options.short).format(d);
}

/**
 * Validate email
 */
export function validateEmail(email) {
  return VALIDATION.EMAIL_REGEX.test(email);
}

/**
 * Validate phone
 */
export function validatePhone(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  return VALIDATION.PHONE_REGEX.test(cleanPhone);
}

/**
 * Validate password
 */
export function validatePassword(password) {
  return password && password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
}

/**
 * Show alert message
 */
export function showAlert(type, message, container = '#alert-container', duration = 5000) {
  const alertContainer = document.querySelector(container);
  if (!alertContainer) return;
  
  const alertId = `alert-${Date.now()}`;
  const alertHTML = `
    <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  alertContainer.insertAdjacentHTML('beforeend', alertHTML);
  
  if (duration > 0) {
    setTimeout(() => {
      const alert = document.getElementById(alertId);
      if (alert) {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      }
    }, duration);
  }
}

/**
 * Validate form
 */
export function validateForm(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return false;
  }
  return true;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
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
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Get query parameter from URL
 */
export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Set query parameter in URL
 */
export function setQueryParam(param, value) {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.pushState({}, '', url);
}

/**
 * Remove query parameter from URL
 */
export function removeQueryParam(param) {
  const url = new URL(window.location);
  url.searchParams.delete(param);
  window.history.pushState({}, '', url);
}

/**
 * Scroll to top
 */
export function scrollToTop(smooth = true) {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

/**
 * Scroll to element
 */
export function scrollToElement(element, offset = 0) {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (el) {
    const y = el.getBoundingClientRect().top + window.pageYOffset + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

/**
 * Generate unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Truncate text
 */
export function truncate(text, length = 100, suffix = '...') {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Load image
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Handle API Error
 */
export function handleApiError(error) {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error
    return {
      success: false,
      message: error.response.data?.message || 'Error en el servidor',
      status: error.response.status
    };
  } else if (error.request) {
    // Request made but no response
    return {
      success: false,
      message: 'No se pudo conectar con el servidor',
      status: 0
    };
  } else {
    // Something else happened
    return {
      success: false,
      message: error.message || 'Error desconocido',
      status: 0
    };
  }
}

export default {
  formatCurrency,
  formatDate,
  validateEmail,
  validatePhone,
  validatePassword,
  showAlert,
  validateForm,
  debounce,
  throttle,
  getQueryParam,
  setQueryParam,
  removeQueryParam,
  scrollToTop,
  scrollToElement,
  generateId,
  deepClone,
  isEmpty,
  truncate,
  capitalize,
  formatFileSize,
  isInViewport,
  copyToClipboard,
  loadImage,
  handleApiError
};