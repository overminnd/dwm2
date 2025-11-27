/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UTILS.JS - UTILIDADES GLOBALES MARAZUL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Módulo con funciones de utilidad compartidas en toda la aplicación.
 * Incluye: formateo, validaciones, scroll, carga de componentes, etc.
 * 
 * CRÍTICO: Este archivo debe cargarse ANTES de cualquier otro módulo.
 */

(function() {
  'use strict';

  console.log('🔧 Cargando UTILS...');

  // ═══════════════════════════════════════════════════════════════════════
  // FORMATEO DE PRECIOS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Formatea un número como precio chileno
   * @param {number} num - Precio a formatear
   * @returns {string} Precio formateado (ej: "$12.990")
   */
  function formatPrice(num) {
    if (!num || isNaN(num)) return '$0';
    return '$' + Math.round(num).toLocaleString('es-CL');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CARGA DE COMPONENTES HTML
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Carga un componente HTML dinámicamente usando jQuery
   * VERSIÓN CORREGIDA: Verifica contenedor ANTES de cargar
   * 
   * @param {string} containerId - ID del contenedor (sin #)
   * @param {string} filePath - Ruta al archivo HTML
   * @param {Function} callback - Función a ejecutar después de cargar (opcional)
   */
  function loadComponent(containerId, filePath, callback) {
    console.log(`📦 Intentando cargar: ${filePath} → #${containerId}`);
    
    // VERIFICACIÓN CRÍTICA: Contenedor debe existir ANTES de cargar
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.error(`❌ Contenedor no encontrado: ${containerId}`);
      console.error(`   📁 Intentaba cargar: ${filePath}`);
      console.error(`   💡 Verifica que el HTML tenga: <div id="${containerId}"></div>`);
      return;
    }

    // Cargar contenido usando fetch
    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.text();
      })
      .then(html => {
        // Insertar HTML en el contenedor
        container.innerHTML = html;
        console.log(`✅ Componente cargado: ${filePath}`);
        
        // Ejecutar callback si existe
        if (typeof callback === 'function') {
          console.log(`🔄 Ejecutando callback de: ${containerId}`);
          callback();
        }
      })
      .catch(error => {
        console.error(`❌ Error al cargar ${filePath}:`, error);
        container.innerHTML = `
          <div class="alert alert-danger m-3" role="alert">
            <strong>Error:</strong> No se pudo cargar el componente.
            <br><small>${error.message}</small>
          </div>
        `;
      });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SCROLL SUAVE CON OFFSET
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Hace scroll suave a un elemento por ID, considerando header fijo
   * @param {string} elementId - ID del elemento (sin #)
   */
  function scrollToElementById(elementId) {
    const element = document.getElementById(elementId);
    
    if (!element) {
      console.warn(`⚠️ Elemento no encontrado: #${elementId}`);
      return;
    }

    // Calcular offset del header fijo
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    
    // Posición con offset
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

    // Scroll suave
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Actualizar URL hash
    history.replaceState(null, '', `#${elementId}`);
    
    console.log(`📍 Scroll a: #${elementId}`);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VALIDACIÓN DE RUT CHILENO
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Valida un RUT chileno usando el algoritmo del dígito verificador
   * @param {string} rut - RUT a validar (puede tener formato)
   * @returns {boolean} true si es válido
   */
  function validateRUT(rut) {
    if (!rut) return false;
    
    // Limpiar RUT (quitar puntos, guiones, espacios)
    const cleanRut = rut.replace(/[.\-\s]/g, '').toUpperCase();
    
    // Verificar largo mínimo
    if (cleanRut.length < 2) return false;
    
    // Separar número y dígito verificador
    const rutNumber = cleanRut.slice(0, -1);
    const verificador = cleanRut.slice(-1);
    
    // Verificar que el número sea válido
    if (!/^\d+$/.test(rutNumber)) return false;
    
    // Calcular dígito verificador esperado
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = rutNumber.length - 1; i >= 0; i--) {
      suma += parseInt(rutNumber[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const dvEsperado = resto === 0 ? '0' : resto === 1 ? 'K' : String(11 - resto);
    
    return verificador === dvEsperado;
  }

  /**
   * Formatea un RUT chileno con puntos y guión
   * @param {string} rut - RUT a formatear
   * @returns {string} RUT formateado (ej: "12.345.678-9")
   */
  function formatRUT(rut) {
    if (!rut) return '';
    
    // Limpiar RUT
    const cleanRut = rut.replace(/[.\-\s]/g, '').toUpperCase();
    
    // Separar número y verificador
    const rutNumber = cleanRut.slice(0, -1);
    const verificador = cleanRut.slice(-1);
    
    // Formatear con puntos
    const formatted = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formatted}-${verificador}`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VALIDACIÓN DE EMAIL
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Valida un email
   * @param {string} email - Email a validar
   * @returns {boolean} true si es válido
   */
  function validateEmail(email) {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MENSAJES TOAST (NOTIFICACIONES)
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Muestra un mensaje toast/notificación
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duración en ms (default: 3000)
   */
  function showToast(message, type = 'info', duration = 3000) {
    // Colores según tipo
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };

    // Crear elemento toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;

    // Agregar animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Agregar al DOM
    document.body.appendChild(toast);

    // Remover después de duration
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DEBOUNCE (OPTIMIZACIÓN DE EVENTOS)
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Debounce: Retrasa la ejecución de una función
   * @param {Function} func - Función a ejecutar
   * @param {number} wait - Tiempo de espera en ms
   * @returns {Function} Función debounced
   */
  function debounce(func, wait = 300) {
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

  // ═══════════════════════════════════════════════════════════════════════
  // LOCALSTORAGE HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Obtiene datos del localStorage de forma segura
   * @param {string} key - Clave del localStorage
   * @param {*} defaultValue - Valor por defecto si no existe
   * @returns {*} Valor parseado o defaultValue
   */
  function getFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`⚠️ Error al leer localStorage[${key}]:`, error);
      return defaultValue;
    }
  }

  /**
   * Guarda datos en localStorage de forma segura
   * @param {string} key - Clave del localStorage
   * @param {*} value - Valor a guardar (se convierte a JSON)
   * @returns {boolean} true si se guardó correctamente
   */
  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`❌ Error al guardar localStorage[${key}]:`, error);
      return false;
    }
  }

  /**
   * Elimina una clave del localStorage
   * @param {string} key - Clave a eliminar
   * @returns {boolean} true si se eliminó correctamente
   */
  function removeFromStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`❌ Error al eliminar localStorage[${key}]:`, error);
      return false;
    }
  }

  /**
   * Limpia todo el localStorage
   * @returns {boolean} true si se limpió correctamente
   */
  function clearStorage() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('❌ Error al limpiar localStorage:', error);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXPORTAR FUNCIONES GLOBALES
  // ═══════════════════════════════════════════════════════════════════════

  // Exportar en namespace UTILS
  window.UTILS = {
    // Formateo
    formatPrice,
    formatRUT,
    
    // Componentes
    loadComponent,
    
    // Navegación
    scrollToElementById,
    
    // Validación
    validateRUT,
    validateEmail,
    
    // UI
    showToast,
    
    // Optimización
    debounce,
    
    // LocalStorage
    getFromStorage,
    saveToStorage,
    removeFromStorage,
    clearStorage
  };

  // ═══════════════════════════════════════════════════════════════════════
  // EXPORTAR FUNCIONES CRÍTICAS GLOBALMENTE (para compatibilidad con auth.js y cart.js)
  // ═══════════════════════════════════════════════════════════════════════
  
  window.getFromStorage = getFromStorage;
  window.saveToStorage = saveToStorage;
  window.removeFromStorage = removeFromStorage;
  window.clearStorage = clearStorage;
  window.formatPrice = formatPrice;
  window.loadComponent = loadComponent;

  console.log('✅ UTILS cargadas correctamente');
  console.log('   Funciones disponibles:', Object.keys(window.UTILS).length);
  console.log('   Funciones globales:', 'getFromStorage, saveToStorage, formatPrice, loadComponent');

})();