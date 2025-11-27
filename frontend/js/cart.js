/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MARAZUL E-COMMERCE - GESTIÓN DEL CARRITO DE COMPRAS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Sistema completo de gestión del carrito con jQuery.
 * 
 * Funcionalidades:
 * - Agregar/eliminar/actualizar productos
 * - Cálculo de subtotales y totales
 * - Renderizado del offcanvas de carrito
 * - Sincronización con localStorage
 * - Eventos personalizados para actualización de UI
 * - Preparado para sincronización con backend
 * 
 * Fecha: 24 Noviembre 2025
 * Versión: 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// GESTIÓN DE ITEMS DEL CARRITO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todos los items del carrito desde localStorage
 * 
 * @returns {Array} Array de items del carrito
 * 
 * @example
 * const items = getCartItems();
 * console.log('Items:', items.length);
 */
function getCartItems() {
  return getFromStorage(CONFIG.STORAGE_KEYS.CART, []);
}

/**
 * Guarda los items del carrito en localStorage
 * 
 * @param {Array} items - Array de items a guardar
 * @returns {boolean} true si se guardó correctamente
 * @private
 */
function saveCartItems(items) {
  return saveToStorage(CONFIG.STORAGE_KEYS.CART, items);
}

/**
 * Agrega un producto al carrito
 * Si el producto ya existe, incrementa la cantidad
 * 
 * @param {Object} product - Objeto producto con { id, name, price, image, ... }
 * @param {number} quantity - Cantidad a agregar (default: 1)
 * @returns {Object} { success: boolean, message: string, cartItem: Object }
 * 
 * @example
 * const product = {
 *   id: '123',
 *   name: 'Salmón Fresco',
 *   price: 12990,
 *   image: 'salmon.jpg'
 * };
 * 
 * const result = addToCart(product, 2);
 * if (result.success) {
 *   showToast(result.message, 'success');
 * }
 */
function addToCart(product, quantity = 1) {
  try {
    // Validar producto
    if (!product || !product.id) {
      return {
        success: false,
        message: 'Producto inválido',
        cartItem: null
      };
    }
    
    // Validar cantidad
    if (quantity < 1) {
      return {
        success: false,
        message: 'Cantidad debe ser mayor a 0',
        cartItem: null
      };
    }
    
    const items = getCartItems();
    
    // Verificar límite de items
    if (items.length >= CONFIG.UI_CONFIG.MAX_CART_ITEMS) {
      return {
        success: false,
        message: `Máximo ${CONFIG.UI_CONFIG.MAX_CART_ITEMS} items en el carrito`,
        cartItem: null
      };
    }
    
    // Buscar si el producto ya existe
    const existingIndex = items.findIndex(item => item.id === product.id);
    
    if (existingIndex !== -1) {
      // Producto existe: incrementar cantidad
      items[existingIndex].quantity += quantity;
      items[existingIndex].updatedAt = new Date().toISOString();
      
      saveCartItems(items);
      
      // Emitir evento
      $(document).trigger('cart:updated');
      $(document).trigger('cart:item-updated', [items[existingIndex]]);
      
      console.log('✅ Cantidad actualizada en carrito:', items[existingIndex]);
      
      return {
        success: true,
        message: `${product.name} actualizado en el carrito`,
        cartItem: items[existingIndex]
      };
      
    } else {
      // Producto nuevo: agregar
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || null,
        category: product.category || null,
        quantity: quantity,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      items.push(cartItem);
      saveCartItems(items);
      
      // Emitir evento
      $(document).trigger('cart:updated');
      $(document).trigger('cart:item-added', [cartItem]);
      
      console.log('✅ Producto agregado al carrito:', cartItem);
      
      return {
        success: true,
        message: CONFIG.MESSAGES.SUCCESS.CART_ADD,
        cartItem: cartItem
      };
    }
    
  } catch (error) {
    console.error('❌ Error agregando al carrito:', error);
    return {
      success: false,
      message: CONFIG.MESSAGES.ERROR.GENERIC,
      cartItem: null
    };
  }
}

/**
 * Elimina un item del carrito por su ID
 * 
 * @param {string} itemId - ID del producto a eliminar
 * @returns {Object} { success: boolean, message: string }
 * 
 * @example
 * const result = removeFromCart('123');
 * if (result.success) {
 *   showToast(result.message, 'success');
 * }
 */
function removeFromCart(itemId) {
  try {
    const items = getCartItems();
    const initialLength = items.length;
    
    // Filtrar el item a eliminar
    const newItems = items.filter(item => item.id !== itemId);
    
    if (newItems.length === initialLength) {
      return {
        success: false,
        message: 'Producto no encontrado en el carrito'
      };
    }
    
    saveCartItems(newItems);
    
    // Emitir evento
    $(document).trigger('cart:updated');
    $(document).trigger('cart:item-removed', [itemId]);
    
    console.log('✅ Producto eliminado del carrito:', itemId);
    
    return {
      success: true,
      message: CONFIG.MESSAGES.SUCCESS.CART_REMOVE
    };
    
  } catch (error) {
    console.error('❌ Error eliminando del carrito:', error);
    return {
      success: false,
      message: CONFIG.MESSAGES.ERROR.GENERIC
    };
  }
}

/**
 * Actualiza la cantidad de un item en el carrito
 * 
 * @param {string} itemId - ID del producto
 * @param {number} newQuantity - Nueva cantidad (si es 0, elimina el item)
 * @returns {Object} { success: boolean, message: string, cartItem: Object }
 * 
 * @example
 * const result = updateQuantity('123', 5);
 * if (result.success) {
 *   showToast(result.message, 'success');
 * }
 */
function updateQuantity(itemId, newQuantity) {
  try {
    // Si cantidad es 0, eliminar item
    if (newQuantity === 0) {
      return removeFromCart(itemId);
    }
    
    // Validar cantidad
    if (newQuantity < 0) {
      return {
        success: false,
        message: 'Cantidad no puede ser negativa',
        cartItem: null
      };
    }
    
    const items = getCartItems();
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return {
        success: false,
        message: 'Producto no encontrado en el carrito',
        cartItem: null
      };
    }
    
    // Actualizar cantidad
    items[itemIndex].quantity = newQuantity;
    items[itemIndex].updatedAt = new Date().toISOString();
    
    saveCartItems(items);
    
    // Emitir evento
    $(document).trigger('cart:updated');
    $(document).trigger('cart:item-updated', [items[itemIndex]]);
    
    console.log('✅ Cantidad actualizada:', items[itemIndex]);
    
    return {
      success: true,
      message: 'Cantidad actualizada',
      cartItem: items[itemIndex]
    };
    
  } catch (error) {
    console.error('❌ Error actualizando cantidad:', error);
    return {
      success: false,
      message: CONFIG.MESSAGES.ERROR.GENERIC,
      cartItem: null
    };
  }
}

/**
 * Vacía completamente el carrito
 * 
 * @returns {Object} { success: boolean, message: string }
 * 
 * @example
 * if (confirm('¿Vaciar el carrito?')) {
 *   const result = clearCart();
 * }
 */
function clearCart() {
  try {
    saveCartItems([]);
    
    // Emitir evento
    $(document).trigger('cart:updated');
    $(document).trigger('cart:cleared');
    
    console.log('✅ Carrito vaciado');
    
    return {
      success: true,
      message: 'Carrito vaciado correctamente'
    };
    
  } catch (error) {
    console.error('❌ Error vaciando carrito:', error);
    return {
      success: false,
      message: CONFIG.MESSAGES.ERROR.GENERIC
    };
  }
}

/**
 * Busca un item específico en el carrito por su ID
 * 
 * @param {string} itemId - ID del producto
 * @returns {Object|null} Item encontrado o null
 * 
 * @example
 * const item = findCartItem('123');
 * if (item) {
 *   console.log('Cantidad actual:', item.quantity);
 * }
 */
function findCartItem(itemId) {
  const items = getCartItems();
  return items.find(item => item.id === itemId) || null;
}

/**
 * Verifica si un producto está en el carrito
 * 
 * @param {string} productId - ID del producto
 * @returns {boolean} true si está en el carrito
 * 
 * @example
 * if (isInCart('123')) {
 *   console.log('Producto ya está en el carrito');
 * }
 */
function isInCart(productId) {
  return findCartItem(productId) !== null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CÁLCULOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula el subtotal de un item
 * 
 * @param {Object} item - Item del carrito
 * @returns {number} Subtotal (precio × cantidad)
 * 
 * @example
 * const item = { price: 12990, quantity: 2 };
 * const subtotal = calculateItemSubtotal(item); // 25980
 */
function calculateItemSubtotal(item) {
  if (!item || !item.price || !item.quantity) {
    return 0;
  }
  
  return item.price * item.quantity;
}

/**
 * Calcula el subtotal del carrito completo
 * 
 * @returns {number} Subtotal total de todos los items
 * 
 * @example
 * const subtotal = calculateCartSubtotal();
 * console.log('Subtotal:', formatPrice(subtotal));
 */
function calculateCartSubtotal() {
  const items = getCartItems();
  
  return items.reduce((total, item) => {
    return total + calculateItemSubtotal(item);
  }, 0);
}

/**
 * Calcula el total del carrito (por ahora igual al subtotal)
 * En el futuro se puede agregar descuentos, envío, etc.
 * 
 * @returns {number} Total a pagar
 * 
 * @example
 * const total = calculateCartTotal();
 * console.log('Total:', formatPrice(total));
 */
function calculateCartTotal() {
  // Por ahora, total = subtotal
  // En el futuro agregar:
  // - Descuentos
  // - Costos de envío
  // - Impuestos adicionales
  
  return calculateCartSubtotal();
}

/**
 * Obtiene la cantidad total de items en el carrito
 * (suma de todas las cantidades)
 * 
 * @returns {number} Cantidad total de items
 * 
 * @example
 * const count = getCartItemCount(); // 5 (si hay 2 items con qty 2 y 3)
 */
function getCartItemCount() {
  const items = getCartItems();
  
  return items.reduce((total, item) => {
    return total + (item.quantity || 0);
  }, 0);
}

/**
 * Obtiene un resumen del carrito
 * 
 * @returns {Object} Resumen con todas las métricas
 * 
 * @example
 * const summary = getCartSummary();
 * console.log(summary);
 * // {
 * //   items: [...],
 * //   itemCount: 5,
 * //   uniqueItems: 2,
 * //   subtotal: 25980,
 * //   total: 25980,
 * //   isEmpty: false
 * // }
 */
function getCartSummary() {
  const items = getCartItems();
  
  return {
    items: items,
    itemCount: getCartItemCount(),
    uniqueItems: items.length,
    subtotal: calculateCartSubtotal(),
    total: calculateCartTotal(),
    isEmpty: items.length === 0
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERIZADO DEL CARRITO (OFFCANVAS)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Renderiza el contenido del offcanvas del carrito
 * Se debe llamar después de abrir el offcanvas
 * 
 * @example
 * // Después de que el usuario hace click en el icono del carrito
 * renderCartOffcanvas();
 */
function renderCartOffcanvas() {
  const $cartItems = $('#cart-items');
  const $cartEmpty = $('#empty-cart-message');
  const $cartContent = $('#cart-footer');
  const $cartSubtotal = $('#cart-subtotal');
  const $cartTotal = $('#cart-total');
  
  if ($cartItems.length === 0) {
    console.warn('⚠️  Elemento #cart-items no encontrado. Asegúrate de tener el offcanvas en el HTML.');
    return;
  }
  
  const summary = getCartSummary();
  
  if (summary.isEmpty) {
    // Carrito vacío
    if ($cartEmpty.length) $cartEmpty.show();
    if ($cartContent.length) $cartContent.hide();
    
    console.log('🛒 Carrito vacío renderizado');
    
  } else {
    // Carrito con items
    if ($cartEmpty.length) $cartEmpty.hide();
    if ($cartContent.length) $cartContent.show();
    
    // Renderizar items
    let itemsHTML = '';
    
    summary.items.forEach(item => {
      const itemSubtotal = calculateItemSubtotal(item);
      
      itemsHTML += `
        <div class="cart-item border-bottom pb-3 mb-3" data-item-id="${item.id}">
          <div class="row align-items-center">
            ${item.image ? `
              <div class="col-3">
                <img src="${item.image}" alt="${escapeHtml(item.name)}" 
                     class="img-fluid rounded">
              </div>
            ` : ''}
            <div class="${item.image ? 'col-9' : 'col-12'}">
              <h6 class="mb-1">${escapeHtml(item.name)}</h6>
              <p class="text-muted small mb-2">${formatPrice(item.price)}</p>
              
              <div class="d-flex align-items-center justify-content-between">
                <!-- Quantity Controls -->
                <div class="btn-group btn-group-sm" role="group">
                  <button type="button" class="btn btn-outline-secondary btn-qty-minus" 
                          data-item-id="${item.id}">
                    <i class="bi bi-dash"></i>
                  </button>
                  <button type="button" class="btn btn-outline-secondary disabled" style="min-width: 40px;">
                    ${item.quantity}
                  </button>
                  <button type="button" class="btn btn-outline-secondary btn-qty-plus" 
                          data-item-id="${item.id}">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
                
                <!-- Subtotal and Remove -->
                <div class="d-flex align-items-center gap-2">
                  <strong class="text-primary">${formatPrice(itemSubtotal)}</strong>
                  <button type="button" class="btn btn-sm btn-outline-danger btn-remove-item" 
                          data-item-id="${item.id}" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    $cartItems.html(itemsHTML);
    
    // Actualizar totales
    if ($cartSubtotal.length) {
      $cartSubtotal.text(formatPrice(summary.subtotal));
    }
    
    if ($cartTotal.length) {
      $cartTotal.text(formatPrice(summary.total));
    }
    
    // Bind eventos de botones
    bindCartItemEvents();
    
    console.log('🛒 Carrito renderizado:', summary.uniqueItems, 'items');
  }
}

/**
 * Vincula eventos a los botones del carrito (incrementar, decrementar, eliminar)
 * @private
 */
function bindCartItemEvents() {
  // Botón incrementar cantidad
  $('.btn-qty-plus').off('click').on('click', function() {
    const itemId = $(this).data('item-id');
    const item = findCartItem(itemId);
    
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
      renderCartOffcanvas();
    }
  });
  
  // Botón decrementar cantidad
  $('.btn-qty-minus').off('click').on('click', function() {
    const itemId = $(this).data('item-id');
    const item = findCartItem(itemId);
    
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(itemId, item.quantity - 1);
      } else {
        // Si cantidad es 1, confirmar eliminación
        if (confirm('¿Eliminar este producto del carrito?')) {
          removeFromCart(itemId);
        }
      }
      renderCartOffcanvas();
    }
  });
  
  // Botón eliminar item
  $('.btn-remove-item').off('click').on('click', function() {
    const itemId = $(this).data('item-id');
    
    if (confirm('¿Eliminar este producto del carrito?')) {
      removeFromCart(itemId);
      renderCartOffcanvas();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SINCRONIZACIÓN CON BACKEND (Preparado para Fase 2)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sincroniza el carrito con el backend
 * Solo se ejecuta si el usuario está autenticado
 * 
 * @returns {Promise} Promesa que resuelve cuando se sincroniza
 * 
 * @example
 * syncCartWithBackend()
 *   .then(() => console.log('Carrito sincronizado'))
 *   .catch(err => console.error('Error sincronizando:', err));
 */
async function syncCartWithBackend() {
  // TODO: Implementar en Fase 2 cuando tengamos API client
  
  if (!isAuthenticated()) {
    console.log('ℹ️  Usuario no autenticado, no se sincroniza carrito');
    return Promise.resolve();
  }
  
  const items = getCartItems();
  
  console.log('🔄 Sincronizando carrito con backend...', items.length, 'items');
  
  // Placeholder para sincronización futura
  // await apiRequest('POST', CONFIG.ENDPOINTS.CART.SYNC, { items });
  
  return Promise.resolve();
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Escapa HTML para prevenir XSS (ya definida en auth.js pero la redefinimos por si acaso)
 * @private
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENTOS GLOBALES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Escuchar evento de actualización de carrito para re-renderizar
 */

/**
 * Listener para cuando se abre el offcanvas del carrito
 * Renderiza el contenido cada vez que se abre
 */
$('#carritoOffcanvas').on('show.bs.offcanvas', function() {
  console.log('🛒 Offcanvas abierto, renderizando carrito...');
  renderCartOffcanvas();
});

$(document).on('cart:updated', function() {
  // Si el offcanvas está abierto, re-renderizar
  if ($('#carritoOffcanvas').hasClass('show')) {
    renderCartOffcanvas();
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAR FUNCIONES
// ═══════════════════════════════════════════════════════════════════════════

// Hacer disponible globalmente (para compatibilidad con jQuery)
window.CART = {
  // Gestión de items
  getCartItems,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  findCartItem,
  isInCart,
  
  // Cálculos
  calculateItemSubtotal,
  calculateCartSubtotal,
  calculateCartTotal,
  getCartItemCount,
  getCartSummary,
  
  // Renderizado
  renderCartOffcanvas,
  
  // Sincronización
  syncCartWithBackend,
};

// Hacer funciones disponibles globalmente para fácil acceso
Object.assign(window, window.CART);

// Log en desarrollo
if (!CONFIG.isProduction) {
  console.log('✅ CART cargado correctamente');
  console.log('📦 Funciones disponibles:', Object.keys(window.CART).length);
  
  const summary = getCartSummary();
  console.log('🛒 Estado actual del carrito:', summary.uniqueItems, 'items distintos,', summary.itemCount, 'items totales');
}