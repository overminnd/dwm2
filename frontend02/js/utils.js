/**
 * ============================================================================
 * MARAZUL - Utilidades y Funciones Helper
 * ============================================================================
 * 
 * Archivo: utils.js
 * Descripción: Funciones auxiliares compartidas en toda la aplicación
 * Versión: 1.0
 */

import { 
  VALIDATION, 
  MESSAGES, 
  shouldLog,
  STORAGE_KEYS 
} from './config.js';

// ============================================================================
// FORMATEO DE DATOS
// ============================================================================

/**
 * Formatea un número como precio en pesos chilenos
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Precio formateado (ej: "$12.990")
 */
export function formatPrice(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }
  
  // Convertir a número si es string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Formatear sin decimales
  return '$' + numAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formatea una fecha al formato chileno DD/MM/YYYY
 * @param {Date|string} date - Fecha a formatear
 * @param {boolean} includeTime - Incluir hora
 * @returns {string} Fecha formateada
 */
export function formatDate(date, includeTime = false) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  let formatted = `${day}/${month}/${year}`;
  
  if (includeTime) {
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    formatted += ` ${hours}:${minutes}`;
  }
  
  return formatted;
}

/**
 * Formatea un RUT chileno
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado (ej: 12.345.678-9)
 */
export function formatRUT(rut) {
  if (!rut) return '';
  
  // Limpiar RUT
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  
  if (cleanRut.length < 2) return cleanRut;
  
  // Separar dígito verificador
  const dv = cleanRut.slice(-1).toUpperCase();
  const numbers = cleanRut.slice(0, -1);
  
  // Formatear con puntos
  const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formatted}-${dv}`;
}

/**
 * Formatea un número de teléfono chileno
 * @param {string} phone - Teléfono sin formato
 * @returns {string} Teléfono formateado (ej: +56 9 1234 5678)
 */
export function formatPhone(phone) {
  if (!phone) return '';
  
  // Limpiar teléfono
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Si empieza con 569, formatear como +56 9 1234 5678
  if (cleanPhone.startsWith('569') && cleanPhone.length === 11) {
    return `+56 9 ${cleanPhone.slice(3, 7)} ${cleanPhone.slice(7)}`;
  }
  
  // Si empieza con 9 y tiene 9 dígitos, formatear como +56 9 1234 5678
  if (cleanPhone.startsWith('9') && cleanPhone.length === 9) {
    return `+56 9 ${cleanPhone.slice(1, 5)} ${cleanPhone.slice(5)}`;
  }
  
  return phone;
}

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo a agregar (por defecto '...')
 * @returns {string} Texto truncado
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + suffix;
}

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ============================================================================
// VALIDACIONES
// ============================================================================

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export function validateEmail(email) {
  if (!email) return false;
  return VALIDATION.EMAIL_REGEX.test(email.trim());
}

/**
 * Valida un teléfono chileno
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si es válido
 */
export function validatePhone(phone) {
  if (!phone) return false;
  const cleanPhone = phone.replace(/\D/g, '');
  return VALIDATION.PHONE_REGEX.test(cleanPhone);
}

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {boolean} True si es válido
 */
export function validateRUT(rut) {
  if (!rut) return false;
  
  // Limpiar RUT
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  
  if (cleanRut.length < 2) return false;
  
  // Separar dígito verificador
  const dv = cleanRut.slice(-1).toUpperCase();
  const numbers = cleanRut.slice(0, -1);
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = numbers.length - 1; i >= 0; i--) {
    sum += parseInt(numbers[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDv = 11 - (sum % 11);
  let calculatedDv = '';
  
  if (expectedDv === 11) {
    calculatedDv = '0';
  } else if (expectedDv === 10) {
    calculatedDv = 'K';
  } else {
    calculatedDv = expectedDv.toString();
  }
  
  return dv === calculatedDv;
}

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {boolean} True si es válida
 */
export function validatePassword(password) {
  if (!password) return false;
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH && 
         VALIDATION.PASSWORD_REGEX.test(password);
}

/**
 * Valida que un campo no esté vacío
 * @param {string} value - Valor a validar
 * @returns {boolean} True si no está vacío
 */
export function validateRequired(value) {
  if (value === null || value === undefined) return false;
  return value.toString().trim().length > 0;
}

/**
 * Valida longitud mínima
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima
 * @returns {boolean} True si cumple
 */
export function validateMinLength(value, minLength) {
  if (!value) return false;
  return value.toString().trim().length >= minLength;
}

/**
 * Valida longitud máxima
 * @param {string} value - Valor a validar
 * @param {number} maxLength - Longitud máxima
 * @returns {boolean} True si cumple
 */
export function validateMaxLength(value, maxLength) {
  if (!value) return true; // Si está vacío, no aplica validación de máximo
  return value.toString().trim().length <= maxLength;
}

/**
 * Valida que dos valores sean iguales (útil para confirmar contraseña)
 * @param {any} value1 - Primer valor
 * @param {any} value2 - Segundo valor
 * @returns {boolean} True si son iguales
 */
export function validateMatch(value1, value2) {
  return value1 === value2;
}

// ============================================================================
// UI - TOASTS Y ALERTAS
// ============================================================================

/**
 * Muestra un toast/notificación
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duración en ms (por defecto 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
  // Verificar si Bootstrap Toast está disponible
  if (typeof bootstrap === 'undefined') {
    console.warn('Bootstrap no está disponible. Usando alert()');
    alert(message);
    return;
  }
  
  // Crear estructura del toast si no existe
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  // Clases según tipo
  const typeClasses = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-dark',
    info: 'bg-info text-white'
  };
  
  // Iconos según tipo
  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  // Crear toast
  const toastId = 'toast-' + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center ${typeClasses[type] || typeClasses.info} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          <strong>${typeIcons[type] || ''}</strong> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: duration
  });
  
  // Eliminar del DOM después de ocultarse
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
  
  toast.show();
}

/**
 * Muestra un modal de confirmación
 * @param {string} message - Mensaje de confirmación
 * @param {Function} onConfirm - Callback al confirmar
 * @param {Function} onCancel - Callback al cancelar (opcional)
 */
export function showConfirm(message, onConfirm, onCancel = null) {
  if (confirm(message)) {
    if (onConfirm) onConfirm();
  } else {
    if (onCancel) onCancel();
  }
}

// ============================================================================
// UI - LOADING Y SPINNERS
// ============================================================================

/**
 * Muestra spinner de carga en un elemento
 * @param {string|HTMLElement} target - Selector o elemento donde mostrar el spinner
 * @param {string} size - Tamaño: 'sm', 'md', 'lg'
 */
export function showLoading(target, size = 'md') {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };
  
  const originalContent = element.innerHTML;
  element.setAttribute('data-original-content', originalContent);
  
  element.innerHTML = `
    <div class="text-center py-3">
      <div class="spinner-border ${sizeClasses[size] || ''}" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;
  
  element.style.pointerEvents = 'none';
}

/**
 * Oculta spinner de carga
 * @param {string|HTMLElement} target - Selector o elemento
 */
export function hideLoading(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  const originalContent = element.getAttribute('data-original-content');
  if (originalContent) {
    element.innerHTML = originalContent;
    element.removeAttribute('data-original-content');
  }
  
  element.style.pointerEvents = '';
}

/**
 * Deshabilita un botón y muestra spinner
 * @param {string|HTMLElement} button - Selector o elemento del botón
 * @param {string} loadingText - Texto mientras carga (opcional)
 */
export function setButtonLoading(button, loadingText = 'Cargando...') {
  const btn = typeof button === 'string' ? document.querySelector(button) : button;
  if (!btn) return;
  
  btn.setAttribute('data-original-text', btn.innerHTML);
  btn.disabled = true;
  btn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2"></span>
    ${loadingText}
  `;
}

/**
 * Restaura un botón al estado original
 * @param {string|HTMLElement} button - Selector o elemento del botón
 */
export function resetButton(button) {
  const btn = typeof button === 'string' ? document.querySelector(button) : button;
  if (!btn) return;
  
  const originalText = btn.getAttribute('data-original-text');
  if (originalText) {
    btn.innerHTML = originalText;
    btn.removeAttribute('data-original-text');
  }
  btn.disabled = false;
}

// ============================================================================
// NAVEGACIÓN Y SCROLL
// ============================================================================

/**
 * Hace scroll suave a un elemento
 * @param {string|HTMLElement} target - Selector o elemento
 * @param {number} offset - Offset desde el top (por defecto 80px para header)
 */
export function scrollToElement(target, offset = 80) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

/**
 * Redirige a una página
 * @param {string} url - URL de destino
 * @param {number} delay - Delay en ms antes de redirigir (opcional)
 */
export function redirect(url, delay = 0) {
  if (delay > 0) {
    setTimeout(() => {
      window.location.href = url;
    }, delay);
  } else {
    window.location.href = url;
  }
}

/**
 * Recarga la página actual
 * @param {boolean} forceReload - Forzar recarga desde servidor
 */
export function reloadPage(forceReload = false) {
  window.location.reload(forceReload);
}

// ============================================================================
// LOCAL STORAGE
// ============================================================================

/**
 * Guarda datos en localStorage con manejo de errores
 * @param {string} key - Clave
 * @param {any} data - Datos a guardar
 * @returns {boolean} True si se guardó correctamente
 */
export function saveToStorage(key, data) {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
    return false;
  }
}

/**
 * Obtiene datos de localStorage con manejo de errores
 * @param {string} key - Clave
 * @param {any} defaultValue - Valor por defecto si no existe
 * @returns {any} Datos recuperados o valor por defecto
 */
export function getFromStorage(key, defaultValue = null) {
  try {
    const jsonData = localStorage.getItem(key);
    if (jsonData === null) return defaultValue;
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error leyendo de localStorage:', error);
    return defaultValue;
  }
}

/**
 * Elimina datos de localStorage
 * @param {string} key - Clave a eliminar
 * @returns {boolean} True si se eliminó correctamente
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error eliminando de localStorage:', error);
    return false;
  }
}

/**
 * Limpia todo el localStorage de MarAzul
 */
export function clearStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error limpiando localStorage:', error);
    return false;
  }
}

// ============================================================================
// UTILIDADES GENERALES
// ============================================================================

/**
 * Genera un ID único
 * @returns {string} ID único
 */
export function generateId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce: Retrasa la ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
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
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} True si se copió correctamente
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copiado al portapapeles', 'success', 2000);
    return true;
  } catch (error) {
    console.error('Error copiando al portapapeles:', error);
    showToast('Error al copiar', 'error', 2000);
    return false;
  }
}

/**
 * Verifica si un objeto está vacío
 * @param {Object} obj - Objeto a verificar
 * @returns {boolean} True si está vacío
 */
export function isEmpty(obj) {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  if (typeof obj === 'string') return obj.trim().length === 0;
  return false;
}

/**
 * Logger personalizado que respeta nivel de configuración
 * @param {string} level - Nivel: 'error', 'warn', 'info', 'debug'
 * @param {string} message - Mensaje
 * @param {any} data - Datos adicionales
 */
export function log(level, message, data = null) {
  const levels = { error: 1, warn: 2, info: 3, debug: 4 };
  const numLevel = levels[level] || 3;
  
  if (!shouldLog(numLevel)) return;
  
  const prefix = `[MarAzul ${level.toUpperCase()}]`;
  
  if (data) {
    console[level] || console.log(prefix, message, data);
  } else {
    console[level] || console.log(prefix, message);
  }
}

// ============================================================================
// EXPORTS DEFAULT
// ============================================================================

export default {
  formatPrice,
  formatDate,
  formatRUT,
  formatPhone,
  truncateText,
  capitalize,
  validateEmail,
  validatePhone,
  validateRUT,
  validatePassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateMatch,
  showToast,
  showConfirm,
  showLoading,
  hideLoading,
  setButtonLoading,
  resetButton,
  scrollToElement,
  redirect,
  reloadPage,
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearStorage,
  generateId,
  debounce,
  copyToClipboard,
  isEmpty,
  log
};