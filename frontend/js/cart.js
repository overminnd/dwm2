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

async function addToCart(product, quantity = 1) {
  // 0) Si NO está autenticado → mostramos modal y salimos
  if (typeof isAuthenticated === "function" && !isAuthenticated()) {
    if (typeof showAuthRequiredModal === "function") {
      showAuthRequiredModal();
    } else if (typeof showToast === "function") {
      showToast("Debes iniciar sesión para agregar productos al carrito", "warning");
    }
    return {
      success: false,
      message: "Usuario no autenticado"
    };
  }

  // 1) Usuario autenticado → usar backend SIEMPRE
  const response = await addToCartBackend(product._id, quantity);

  if (response.success) {
    // Sincronizar carrito local con backend
    await refreshLocalCartFromBackend();
    renderCartOffcanvas();
    updateCartBadge();

    return {
      success: true,
      message: "Producto agregado al carrito"
    };
  }

  return {
    success: false,
    message: response.error?.message || "Error en backend al agregar al carrito"
  };
}




function addToCartLocal(product, quantity) {
  const cart = getCartItems();
  let cartItem;

  // buscamos por productId (que usamos como id lógico)
  const existing = cart.find(item => item.productId === product._id);

  if (existing) {
    existing.quantity += quantity;
    cartItem = existing;
  } else {
    cartItem = {
      id: product._id,          // <-- ID que usa el offcanvas
      cartItemId: null,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.mainImage,
      quantity,
      addedAt: new Date().toISOString(),
    };
    cart.push(cartItem);
  }

  saveCartItems(cart);
  $(document).trigger('cart:updated');   // 🔔 avisar cambio

  return cartItem;
}


function removeLocalItem(itemId) {
  const cart = getCartItems().filter(item => {
    // puede llegar id lógico (id/productId) o cartItemId
    return item.id !== itemId && item.productId !== itemId && item.cartItemId !== itemId;
  });

  saveCartItems(cart);
  $(document).trigger('cart:updated');   // 🔔 avisar cambio
}

function updateLocalQuantity(itemId, newQuantity) {
  const cart = getCartItems();
  const item = cart.find(i =>
    i.id === itemId ||
    i.productId === itemId ||
    i.cartItemId === itemId
  );

  if (!item) return;

  if (newQuantity <= 0) {
    // si llega 0 o menos, eliminamos el item
    const index = cart.indexOf(item);
    if (index !== -1) cart.splice(index, 1);
  } else {
    item.quantity = newQuantity;
  }

  saveCartItems(cart);
  $(document).trigger('cart:updated');   // 🔔 avisar cambio
}


async function refreshLocalCartFromBackend() {
  const response = await getCartFromBackend();

  if (!response.success) {
    console.error("❌ No se pudo leer carrito del backend");
    return;
  }

  const backendItems = response.data.items || response.data;

  const normalized = backendItems.map(item => {
    const product = item.productId;

    // 🔥 productId puede venir como String o como objeto
    const productId = typeof product === "string" ? product : product?._id;

    return {
      id: item._id,                    // id del cartItem real
      cartItemId: item._id,
      productId: productId,           // id correcto
      name: product?.name || "Producto sin nombre",
      price: item.unitPrice,
      image: product?.mainImage || CONFIG.DEFAULT_IMAGE,
      quantity: item.quantity,
    };
  });

  saveCartItems(normalized);
  $(document).trigger('cart:updated');
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
async function removeFromCart(itemId) {

  if (isAuthenticated()) {
    const response = await removeFromCartBackend(itemId);

    if (response.success) {
      await refreshLocalCartFromBackend();
      renderCartOffcanvas();
      updateCartBadge();
    }
    return;
  }

  removeLocalItem(itemId);
  renderCartOffcanvas();
  updateCartBadge();
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
async function updateQuantity(itemId, newQuantity) {

  if (isAuthenticated()) {
    const response = await updateCartItemBackend(itemId, newQuantity);

    if (response.success) {
      await refreshLocalCartFromBackend();
      renderCartOffcanvas();
      updateCartBadge();
    }
    return;
  }

  updateLocalQuantity(itemId, newQuantity);
  renderCartOffcanvas();
  updateCartBadge();
}

/**
 * Actualiza la cantidad de un item en localStorage
 */
function updateLocalQuantity(itemId, newQuantity) {
  const cart = getCartItems();

  cart.forEach(item => {
    if (item.id === itemId || item.productId === itemId) {
      item.quantity = newQuantity;

      // Si la cantidad queda en 0, se elimina
      if (item.quantity <= 0) {
        const index = cart.indexOf(item);
        cart.splice(index, 1);
      }
    }
  });

  saveCartItems(cart);
  $(document).trigger("cart:updated");
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
// Reemplaza toda la función clearCart por esta
async function clearCart() {
  try {
    // Caso 1: Usuario autenticado → vaciar backend + sync local
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
      const token = (typeof getAuthToken === 'function') ? getAuthToken() : null;

      const response = await fetch(`${CONFIG.API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const data = await response.json();

      if (!data.success) {
        console.error('❌ Error vaciando carrito en backend:', data.message || data);
      }

      // Refrescar desde backend (debería venir vacío)
      if (typeof refreshLocalCartFromBackend === 'function') {
        await refreshLocalCartFromBackend();
      } else {
        saveCartItems([]);
      }

    } else {
      // Caso 2: Invitado → solo localStorage
      saveCartItems([]);
    }

    // Actualizar UI en ambos casos
    renderCartOffcanvas();
    updateCartBadge();

    // Emitir eventos globales
    $(document).trigger('cart:updated');
    $(document).trigger('cart:cleared');

    console.log('✅ Carrito vaciado correctamente (backend + local)');
    return {
      success: true,
      message: 'Carrito vaciado correctamente'
    };

  } catch (error) {
    console.error('❌ Error vaciando carrito:', error);
    return {
      success: false,
      message: 'Error al vaciar el carrito'
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

function updateCartBadge() {
  const cart = getCartItems();
  const count = cart.length; // 🔥 productos distintos

  $(".cart-count").text(count);
  $("#cart-badge").text(count);

  if (count > 0) {
    $("#cart-badge").show();
  } else {
    $("#cart-badge").hide();
  }
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
  // Carrito vacío → pintamos el mensaje vacío de cero
    $cartItems.html(`
      <div id="empty-cart-message" class="text-center py-5">
        <i class="bi bi-cart-x display-1 text-muted"></i>
        <p class="text-muted mt-3">Tu carrito está vacío</p>
        <button class="btn btn-primary btn-sm" data-bs-dismiss="offcanvas">
          Ir a comprar
        </button>
      </div>
    `);

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

// Compatibilidad con código antiguo que llama a syncCart()
window.syncCart = syncCartWithBackend;


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

function updateCartAddressUI() {
  const addr = getShippingAddress();

  const $section = $("#cart-address-selected");
  const $text = $("#cart-address-text");
  const $btnProcesar = $("#btn-procesar-pedido");

  if (!addr) {
    $section.hide();
    $btnProcesar.prop("disabled", true);   // 🔥 IMPORTANTE
    return;
  }

  $text.text(`${addr.street} ${addr.number || ""}, ${addr.city}, ${addr.region}`);

  $section.show();

  // Si hay dirección → habilitar botón
  $btnProcesar.prop("disabled", false);
}


// Guardar dirección desde el modal del carrito (solo localStorage)
$(document).on("click", "#btn-save-cart-address", async function () {

    const street = $("#cart-address-street").val().trim();
    const number = $("#cart-address-number").val().trim();
    const city = "Santiago";
    const region = $("#cart-address-region").val().trim();
    const reference = $("#cart-address-ref").val().trim();

    if (!street || !number || !region) {
        showToast("Completa calle, número y comuna", "warning");
        return;
    }

    // 🔵 Si NO está logueado, guardar solo local
    if (!isAuthenticated()) {
        saveShippingAddress({ street, number, city, region, reference });
        updateCartAddressUI();
        bootstrap.Modal.getInstance(document.getElementById("addressModal")).hide();
        return;
    }

    // 🔵 SI está logueado → CREAR dirección en backend
    try {
        const result = await apiRequest("POST", "/addresses", {
            street,
            number,
            city,
            region,
            reference,
            isDefault: true
        });

        if (!result.success) {
            showToast(result.error?.message || "Error guardando dirección", "danger");
            return;
        }

        const addr = result.data;

        // Guardar dirección con addressId real
        saveShippingAddress({
            id: addr._id,
            street: addr.street,
            number: addr.number,
            city: addr.city,
            region: addr.region,
            reference: addr.reference
        });

        updateCartAddressUI();
        bootstrap.Modal.getInstance(document.getElementById("addressModal")).hide();

        showToast("Dirección guardada", "success");

    } catch (err) {
        console.error("❌ Error backend dirección:", err);
        showToast("No se pudo guardar la dirección", "danger");
    }
});





// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZAR UI DEL CARRITO (Offcanvas + botones)
// ═══════════════════════════════════════════════════════════════════════════

function initCartUI() {

  const $offcanvas = $('#carritoOffcanvas');

  if ($offcanvas.length) {
    // Al abrir el offcanvas, verificamos si está logueado
    $offcanvas.off('show.bs.offcanvas').on('show.bs.offcanvas', function (e) {

      // 🚫 Invitado → no dejar abrir el carrito
      if (!isAuthenticated || typeof isAuthenticated !== "function" || !isAuthenticated()) {
        e.preventDefault(); // Cancela la apertura del offcanvas

        if (typeof showToast === "function") {
          showToast("Debes iniciar sesión o registrarte para ver el carrito.", "warning");
        } else {
          alert("Debes iniciar sesión o registrarte para ver el carrito.");
        }
        return;
      }

      // ✅ Usuario logueado → renderizamos normal
      console.log('🛒 Offcanvas abierto, renderizando carrito...');
      renderCartOffcanvas();
    });
  }

  $('#btn-edit-address-cart').off('click').on('click', function () {
    const modal = new bootstrap.Modal(document.getElementById('addressModal'));
    modal.show();
  });


  // Botón "Vaciar carrito"
$('#btn-vaciar-carrito').off('click').on('click', async function () {

  if (!confirm("¿Vaciar el carrito?")) return;

  // Caso 1: usuario invitado → solo localStorage
  if (!isAuthenticated()) {
    saveCartItems([]);           // limpiar carrito local
    renderCartOffcanvas();
    updateCartBadge();
    console.log("🧹 Carrito vaciado (usuario invitado)");
    return;
  }

  // Caso 2: usuario logueado → limpiar backend y sincronizar
  try {
    const response = await fetch(`${CONFIG.API_URL}/cart/clear`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getAuthToken()}`,  // ← ESTA ES LA LÍNEA CORRECTA
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log("🧹 Carrito vaciado en backend");

      // Sincronizar backend → local
      await refreshLocalCartFromBackend();

      renderCartOffcanvas();
      updateCartBadge();

      console.log("🧹 Carrito vaciado correctamente (backend + local)");

    } else {
      console.error("❌ Error del backend al vaciar carrito:", data.message);
    }

  } catch (err) {
    console.error("❌ Error inesperado al vaciar carrito:", err);
  }
});



// Botón "Procesar pedido"
$('#btn-procesar-pedido').off('click').on('click', function () {

    // 1) Bloquear invitados
    if (typeof isAuthenticated === "function" && !isAuthenticated()) {
        if (typeof showAuthRequiredModal === "function") {
            showAuthRequiredModal();
        } else if (typeof showToast === "function") {
            showToast("Debes iniciar sesión para continuar con la compra", "warning");
        }
        return;
    }

    // 2) Validar dirección
    const addr = getShippingAddress();

    if (!addr) {
        showToast("Debes ingresar una dirección antes de continuar", "warning");
        return;
    }

    // 3) Redirigir al checkout
    window.location.href = `${CONFIG.BASE_PATH}/components/checkout.html`;
});




    }





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

  // UI
  initCartUI,
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

$("#clear-cart").on("click", function () {
    clearCart();
    renderCartOffcanvas();
    updateCartBadge();
});



