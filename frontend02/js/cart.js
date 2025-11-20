/**
 * ============================================================================
 * MARAZUL - Carrito de Compras
 * ============================================================================
 * 
 * Archivo: cart.js
 * Descripción: Lógica completa del carrito de compras con localStorage
 *              y sincronización con backend
 * Versión: 1.0
 */

import { STORAGE_KEYS, CART_CONFIG, MESSAGES } from './config.js';
import { isAuthenticated, getCurrentUser } from './auth.js';
import { 
  getCart as getCartAPI,
  addToCartAPI,
  updateCartItem as updateCartItemAPI,
  removeFromCartAPI as removeFromCartAPICall
} from './api.js';
import {
  saveToStorage,
  getFromStorage,
  formatPrice,
  showToast,
  log
} from './utils.js';

// ============================================================================
// GESTIÓN DE ITEMS DEL CARRITO
// ============================================================================

/**
 * Obtiene todos los items del carrito desde localStorage
 * @returns {Array} Array de items del carrito
 */
export function getCartItems() {
  try {
    const items = getFromStorage(STORAGE_KEYS.CART_ITEMS, []);
    log('debug', `Carrito tiene ${items.length} items`);
    return items;
  } catch (error) {
    log('error', 'Error obteniendo items del carrito:', error);
    return [];
  }
}

/**
 * Guarda items del carrito en localStorage
 * @param {Array} items - Array de items a guardar
 * @returns {boolean} True si se guardó correctamente
 */
function saveCartItems(items) {
  try {
    const success = saveToStorage(STORAGE_KEYS.CART_ITEMS, items);
    if (success) {
      // Disparar evento de actualización del carrito
      triggerCartUpdated();
    }
    return success;
  } catch (error) {
    log('error', 'Error guardando items del carrito:', error);
    return false;
  }
}

/**
 * Agrega un producto al carrito
 * @param {Object} product - Objeto del producto completo
 * @param {number} quantity - Cantidad a agregar
 * @returns {boolean} True si se agregó correctamente
 */
export function addToCart(product, quantity = 1) {
  try {
    if (!product || !product._id) {
      log('error', 'Producto inválido para agregar al carrito');
      return false;
    }
    
    // Validar cantidad
    if (quantity < CART_CONFIG.MIN_QUANTITY_PER_ITEM) {
      quantity = CART_CONFIG.MIN_QUANTITY_PER_ITEM;
    }
    
    if (quantity > CART_CONFIG.MAX_QUANTITY_PER_ITEM) {
      showToast(`Cantidad máxima: ${CART_CONFIG.MAX_QUANTITY_PER_ITEM}`, 'warning');
      quantity = CART_CONFIG.MAX_QUANTITY_PER_ITEM;
    }
    
    // Obtener items actuales
    const items = getCartItems();
    
    // Verificar si el producto ya existe en el carrito
    const existingItemIndex = items.findIndex(item => item.productId === product._id);
    
    if (existingItemIndex !== -1) {
      // Producto ya existe, actualizar cantidad
      const newQuantity = items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > CART_CONFIG.MAX_QUANTITY_PER_ITEM) {
        showToast(`Cantidad máxima: ${CART_CONFIG.MAX_QUANTITY_PER_ITEM}`, 'warning');
        items[existingItemIndex].quantity = CART_CONFIG.MAX_QUANTITY_PER_ITEM;
      } else {
        items[existingItemIndex].quantity = newQuantity;
      }
      
      // Actualizar subtotal
      items[existingItemIndex].subtotal = items[existingItemIndex].quantity * items[existingItemIndex].price;
    } else {
      // Producto nuevo, agregar al carrito
      const newItem = {
        productId: product._id,
        name: product.nombre,
        price: product.precio,
        image: product.imagen,
        quantity: quantity,
        subtotal: product.precio * quantity
      };
      
      items.push(newItem);
    }
    
    // Guardar items actualizados
    const success = saveCartItems(items);
    
    if (success) {
      showToast(MESSAGES.SUCCESS.ADDED_TO_CART, 'success');
      log('info', 'Producto agregado al carrito:', product.nombre);
      
      // Sincronizar con backend si usuario autenticado
      if (isAuthenticated()) {
        syncWithBackend();
      }
      
      // Renderizar carrito actualizado
      renderCart();
    }
    
    return success;
  } catch (error) {
    log('error', 'Error agregando producto al carrito:', error);
    showToast(MESSAGES.ERROR.GENERIC, 'error');
    return false;
  }
}

/**
 * Actualiza la cantidad de un item del carrito
 * @param {string} productId - ID del producto
 * @param {number} newQuantity - Nueva cantidad
 * @returns {boolean} True si se actualizó correctamente
 */
export function updateCartItemQuantity(productId, newQuantity) {
  try {
    // Validar cantidad
    if (newQuantity < CART_CONFIG.MIN_QUANTITY_PER_ITEM) {
      newQuantity = CART_CONFIG.MIN_QUANTITY_PER_ITEM;
    }
    
    if (newQuantity > CART_CONFIG.MAX_QUANTITY_PER_ITEM) {
      showToast(`Cantidad máxima: ${CART_CONFIG.MAX_QUANTITY_PER_ITEM}`, 'warning');
      newQuantity = CART_CONFIG.MAX_QUANTITY_PER_ITEM;
    }
    
    const items = getCartItems();
    const itemIndex = items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      log('warn', 'Producto no encontrado en el carrito');
      return false;
    }
    
    // Actualizar cantidad y subtotal
    items[itemIndex].quantity = newQuantity;
    items[itemIndex].subtotal = items[itemIndex].price * newQuantity;
    
    const success = saveCartItems(items);
    
    if (success) {
      log('info', 'Cantidad actualizada en el carrito');
      
      // Sincronizar con backend si usuario autenticado
      if (isAuthenticated()) {
        syncWithBackend();
      }
      
      // Renderizar carrito actualizado
      renderCart();
    }
    
    return success;
  } catch (error) {
    log('error', 'Error actualizando cantidad:', error);
    return false;
  }
}

/**
 * Elimina un producto del carrito
 * @param {string} productId - ID del producto a eliminar
 * @returns {boolean} True si se eliminó correctamente
 */
export function removeFromCart(productId) {
  try {
    const items = getCartItems();
    const filteredItems = items.filter(item => item.productId !== productId);
    
    if (items.length === filteredItems.length) {
      log('warn', 'Producto no encontrado en el carrito');
      return false;
    }
    
    const success = saveCartItems(filteredItems);
    
    if (success) {
      showToast('Producto eliminado del carrito', 'info');
      log('info', 'Producto eliminado del carrito');
      
      // Sincronizar con backend si usuario autenticado
      if (isAuthenticated()) {
        syncWithBackend();
      }
      
      // Renderizar carrito actualizado
      renderCart();
    }
    
    return success;
  } catch (error) {
    log('error', 'Error eliminando producto del carrito:', error);
    return false;
  }
}

/**
 * Vacía completamente el carrito
 * @returns {boolean} True si se vació correctamente
 */
export function clearCartLocal() {
  try {
    const success = saveCartItems([]);
    
    if (success) {
      showToast('Carrito vaciado', 'info');
      log('info', 'Carrito vaciado');
      
      // Sincronizar con backend si usuario autenticado
      if (isAuthenticated()) {
        syncWithBackend();
      }
      
      // Renderizar carrito vacío
      renderCart();
    }
    
    return success;
  } catch (error) {
    log('error', 'Error vaciando el carrito:', error);
    return false;
  }
}

// ============================================================================
// CÁLCULOS
// ============================================================================

/**
 * Calcula el total del carrito
 * @returns {number} Total del carrito
 */
export function calculateTotal() {
  const items = getCartItems();
  return items.reduce((total, item) => total + (item.subtotal || 0), 0);
}

/**
 * Calcula la cantidad total de items en el carrito
 * @returns {number} Cantidad total de items
 */
export function getTotalItems() {
  const items = getCartItems();
  return items.reduce((total, item) => total + (item.quantity || 0), 0);
}

/**
 * Calcula información resumida del carrito
 * @returns {Object} {items, totalItems, subtotal, shipping, total}
 */
export function getCartSummary() {
  const items = getCartItems();
  const subtotal = calculateTotal();
  const shipping = 0; // Por ahora envío gratis
  const total = subtotal + shipping;
  const totalItems = getTotalItems();
  
  return {
    items: items.length,
    totalItems,
    subtotal,
    shipping,
    total
  };
}

// ============================================================================
// RENDERIZADO DEL CARRITO
// ============================================================================

/**
 * Renderiza el carrito en el offcanvas
 */
export function renderCart() {
  try {
    const carritoBody = document.getElementById('carrito-body');
    const carritoTotal = document.getElementById('carrito-total');
    
    if (!carritoBody) {
      log('warn', 'Contenedor del carrito no encontrado');
      return;
    }
    
    const items = getCartItems();
    
    // Si el carrito está vacío
    if (items.length === 0) {
      carritoBody.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
          <p class="text-muted">Tu carrito está vacío</p>
          <a href="/MARAZUL/MARAZUL/frontend02/index.html" class="btn btn-primary btn-sm">
            Ver productos
          </a>
        </div>
      `;
      
      if (carritoTotal) {
        carritoTotal.textContent = '$0';
      }
      
      // Actualizar badge
      updateCartBadge();
      return;
    }
    
    // Renderizar items del carrito
    let html = '<div class="list-group list-group-flush">';
    
    items.forEach(item => {
      html += `
        <div class="list-group-item" data-product-id="${item.productId}">
          <div class="row align-items-center">
            <div class="col-3">
              <img src="${item.image || '/MARAZUL/MARAZUL/frontend02/assets/images/placeholder-product.jpg'}" 
                   class="img-fluid rounded" 
                   alt="${item.name}">
            </div>
            <div class="col-6">
              <h6 class="mb-1">${item.name}</h6>
              <p class="mb-1 text-muted small">${formatPrice(item.price)}</p>
              <div class="input-group input-group-sm" style="max-width: 120px;">
                <button class="btn btn-outline-secondary btn-decrease" 
                        data-product-id="${item.productId}" 
                        type="button">
                  <i class="fas fa-minus"></i>
                </button>
                <input type="number" 
                       class="form-control text-center cart-quantity" 
                       value="${item.quantity}" 
                       min="${CART_CONFIG.MIN_QUANTITY_PER_ITEM}"
                       max="${CART_CONFIG.MAX_QUANTITY_PER_ITEM}"
                       data-product-id="${item.productId}">
                <button class="btn btn-outline-secondary btn-increase" 
                        data-product-id="${item.productId}" 
                        type="button">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            <div class="col-3 text-end">
              <p class="mb-2 fw-bold">${formatPrice(item.subtotal)}</p>
              <button class="btn btn-sm btn-outline-danger btn-remove" 
                      data-product-id="${item.productId}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    carritoBody.innerHTML = html;
    
    // Actualizar total
    const total = calculateTotal();
    if (carritoTotal) {
      carritoTotal.textContent = formatPrice(total);
    }
    
    // Configurar eventos de los botones
    setupCartEvents();
    
    // Actualizar badge
    updateCartBadge();
    
    log('debug', 'Carrito renderizado correctamente');
  } catch (error) {
    log('error', 'Error renderizando carrito:', error);
  }
}

/**
 * Configura los eventos de los botones del carrito
 */
function setupCartEvents() {
  // Botones de incrementar cantidad
  document.querySelectorAll('.btn-increase').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.dataset.productId;
      const input = document.querySelector(`input.cart-quantity[data-product-id="${productId}"]`);
      const currentValue = parseInt(input.value);
      const newValue = Math.min(currentValue + 1, CART_CONFIG.MAX_QUANTITY_PER_ITEM);
      input.value = newValue;
      updateCartItemQuantity(productId, newValue);
    });
  });
  
  // Botones de decrementar cantidad
  document.querySelectorAll('.btn-decrease').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.dataset.productId;
      const input = document.querySelector(`input.cart-quantity[data-product-id="${productId}"]`);
      const currentValue = parseInt(input.value);
      const newValue = Math.max(currentValue - 1, CART_CONFIG.MIN_QUANTITY_PER_ITEM);
      input.value = newValue;
      updateCartItemQuantity(productId, newValue);
    });
  });
  
  // Inputs de cantidad (cambio manual)
  document.querySelectorAll('input.cart-quantity').forEach(input => {
    input.addEventListener('change', function() {
      const productId = this.dataset.productId;
      let newValue = parseInt(this.value);
      
      // Validar rango
      if (isNaN(newValue) || newValue < CART_CONFIG.MIN_QUANTITY_PER_ITEM) {
        newValue = CART_CONFIG.MIN_QUANTITY_PER_ITEM;
      } else if (newValue > CART_CONFIG.MAX_QUANTITY_PER_ITEM) {
        newValue = CART_CONFIG.MAX_QUANTITY_PER_ITEM;
      }
      
      this.value = newValue;
      updateCartItemQuantity(productId, newValue);
    });
  });
  
  // Botones de eliminar
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.dataset.productId;
      
      if (confirm('¿Eliminar este producto del carrito?')) {
        removeFromCart(productId);
      }
    });
  });
}

/**
 * Actualiza el badge del carrito en el header
 */
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  
  if (!badge) {
    log('debug', 'Badge del carrito no encontrado');
    return;
  }
  
  const totalItems = getTotalItems();
  
  if (totalItems > 0) {
    badge.textContent = totalItems > 99 ? '99+' : totalItems;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

// ============================================================================
// SINCRONIZACIÓN CON BACKEND
// ============================================================================

/**
 * Sincroniza el carrito local con el backend
 * Solo funciona si el usuario está autenticado
 */
export async function syncWithBackend() {
  if (!isAuthenticated()) {
    log('debug', 'Usuario no autenticado, no se sincroniza carrito');
    return;
  }
  
  try {
    log('debug', 'Sincronizando carrito con backend...');
    
    const localItems = getCartItems();
    
    // Por ahora solo obtenemos el carrito del backend
    // En una implementación completa, aquí enviaríamos los items locales
    const response = await getCartAPI();
    
    if (response.success && response.items) {
      log('info', 'Carrito sincronizado con backend');
      // Aquí podrías actualizar el carrito local con los datos del backend
      // si es necesario
    }
  } catch (error) {
    log('error', 'Error sincronizando carrito:', error);
    // No mostrar error al usuario, es una operación en background
  }
}

/**
 * Carga el carrito del backend al localStorage
 * Útil al iniciar sesión
 */
export async function loadCartFromBackend() {
  if (!isAuthenticated()) {
    return;
  }
  
  try {
    log('debug', 'Cargando carrito desde backend...');
    
    const response = await getCartAPI();
    
    if (response.success && response.items) {
      // Guardar items del backend en localStorage
      saveCartItems(response.items);
      renderCart();
      log('info', 'Carrito cargado desde backend');
    }
  } catch (error) {
    log('error', 'Error cargando carrito desde backend:', error);
  }
}

// ============================================================================
// EVENTOS PERSONALIZADOS
// ============================================================================

/**
 * Evento que se dispara cuando el carrito se actualiza
 */
export const CART_UPDATED_EVENT = 'cart-updated';

/**
 * Dispara evento de actualización del carrito
 */
function triggerCartUpdated() {
  const summary = getCartSummary();
  const event = new CustomEvent(CART_UPDATED_EVENT, {
    detail: summary
  });
  window.dispatchEvent(event);
}

/**
 * Escucha cambios en el carrito
 * @param {Function} callback - Función a ejecutar cuando cambia
 */
export function onCartUpdated(callback) {
  window.addEventListener(CART_UPDATED_EVENT, (e) => {
    callback(e.detail);
  });
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa el módulo del carrito
 * Debe llamarse al cargar la página
 */
export function initCart() {
  try {
    log('debug', 'Inicializando carrito...');
    
    // Renderizar carrito
    renderCart();
    
    // Si hay usuario autenticado, sincronizar con backend
    if (isAuthenticated()) {
      loadCartFromBackend();
    }
    
    log('debug', 'Carrito inicializado');
  } catch (error) {
    log('error', 'Error inicializando carrito:', error);
  }
}

// ============================================================================
// EXPORTS DEFAULT
// ============================================================================

export default {
  getCartItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCartLocal,
  calculateTotal,
  getTotalItems,
  getCartSummary,
  renderCart,
  syncWithBackend,
  loadCartFromBackend,
  initCart,
  onCartUpdated
};