// ============================================
// CART - LÓGICA DEL CARRITO
// ============================================

import { STORAGE_KEYS } from './config.js';
import { addToCart as apiAddToCart } from './api.js';
import { updateCartBadge } from './auth.js';

// ============================================
// GESTIÓN DEL CARRITO
// ============================================

/**
 * Obtiene los items del carrito desde localStorage
 */
export function getCartItems() {
  const items = localStorage.getItem(STORAGE_KEYS.CART_ITEMS);
  return items ? JSON.parse(items) : [];
}

/**
 * Guarda los items del carrito en localStorage
 */
export function saveCartItems(items) {
  localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(items));
  localStorage.setItem(STORAGE_KEYS.CART_COUNT, items.length.toString());
  updateCartBadge();
}

/**
 * Agrega un producto al carrito
 * @param {string} productId - ID del producto
 * @param {number} quantity - Cantidad a agregar
 * @param {Object} productData - Datos del producto (nombre, precio, imagen)
 */
export async function addProductToCart(productId, quantity = 1, productData = {}) {
  try {
    // Obtener carrito actual
    const cartItems = getCartItems();
    
    // Buscar si el producto ya existe
    const existingIndex = cartItems.findIndex(item => item.productId === productId);
    
    if (existingIndex >= 0) {
      // Producto existe, incrementar cantidad
      cartItems[existingIndex].quantity += quantity;
    } else {
      // Producto nuevo, agregarlo
      cartItems.push({
        productId,
        quantity,
        name: productData.name || 'Producto',
        price: productData.price || 0,
        image: productData.image || '',
        addedAt: new Date().toISOString()
      });
    }
    
    // Guardar en localStorage
    saveCartItems(cartItems);
    
    // TODO: Sincronizar con backend cuando esté conectado
    // await apiAddToCart(productId, quantity);
    
    return { success: true, cartItems };
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza la cantidad de un producto en el carrito
 */
export function updateCartItemQuantity(productId, newQuantity) {
  const cartItems = getCartItems();
  const itemIndex = cartItems.findIndex(item => item.productId === productId);
  
  if (itemIndex >= 0) {
    if (newQuantity <= 0) {
      // Eliminar item si la cantidad es 0 o negativa
      cartItems.splice(itemIndex, 1);
    } else {
      // Actualizar cantidad
      cartItems[itemIndex].quantity = newQuantity;
    }
    
    saveCartItems(cartItems);
    return { success: true, cartItems };
  }
  
  return { success: false, error: 'Producto no encontrado' };
}

/**
 * Elimina un producto del carrito
 */
export function removeFromCart(productId) {
  const cartItems = getCartItems();
  const filteredItems = cartItems.filter(item => item.productId !== productId);
  saveCartItems(filteredItems);
  return { success: true, cartItems: filteredItems };
}

/**
 * Vacía completamente el carrito
 */
export function clearCart() {
  saveCartItems([]);
  return { success: true };
}

/**
 * Obtiene el total del carrito
 */
export function getCartTotal() {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Obtiene la cantidad total de items en el carrito
 */
export function getCartCount() {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

// ============================================
// RENDERIZADO DEL CARRITO
// ============================================

/**
 * Renderiza el contenido del carrito en el offcanvas
 */
export function renderCart() {
  const cartItems = getCartItems();
  const cartItemsContainer = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartFooter = document.getElementById('cartFooter');
  
  if (!cartItemsContainer) return;
  
  if (cartItems.length === 0) {
    // Mostrar estado vacío
    if (emptyCart) emptyCart.classList.remove('d-none');
    if (cartFooter) cartFooter.classList.add('d-none');
    return;
  }
  
  // Ocultar estado vacío
  if (emptyCart) emptyCart.classList.add('d-none');
  if (cartFooter) cartFooter.classList.remove('d-none');
  
  // Renderizar items
  const itemsHTML = cartItems.map(item => `
    <div class="cart-item mb-3 pb-3 border-bottom" data-product-id="${item.productId}">
      <div class="d-flex gap-3">
        <img src="${item.image}" 
             alt="${item.name}" 
             class="rounded" 
             style="width: 60px; height: 60px; object-fit: cover;">
        <div class="flex-grow-1">
          <h6 class="mb-1">${item.name}</h6>
          <div class="d-flex justify-content-between align-items-center">
            <div class="input-group input-group-sm" style="width: 100px;">
              <button class="btn btn-outline-secondary cart-qty-minus" type="button">-</button>
              <input type="text" 
                     class="form-control text-center cart-qty-input" 
                     value="${item.quantity}" 
                     readonly>
              <button class="btn btn-outline-secondary cart-qty-plus" type="button">+</button>
            </div>
            <span class="fw-bold text-success">$${(item.price * item.quantity).toLocaleString('es-CL')}</span>
          </div>
        </div>
        <button class="btn btn-sm btn-outline-danger cart-remove-btn" type="button">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
  
  cartItemsContainer.innerHTML = itemsHTML;
  
  // Actualizar totales
  updateCartTotals();
  
  // Agregar event listeners
  attachCartEventListeners();
}

/**
 * Actualiza los totales del carrito
 */
function updateCartTotals() {
  const subtotal = getCartTotal();
  const shipping = 0; // TODO: Calcular envío
  const total = subtotal + shipping;
  
  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingEl = document.getElementById('cartShipping');
  const totalEl = document.getElementById('cartTotal');
  
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString('es-CL')}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-CL')}`;
  if (totalEl) totalEl.textContent = `$${total.toLocaleString('es-CL')}`;
}

/**
 * Agrega event listeners a los botones del carrito
 */
function attachCartEventListeners() {
  // Botones de cantidad
  document.querySelectorAll('.cart-qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.cart-item');
      const productId = item.dataset.productId;
      const qtyInput = item.querySelector('.cart-qty-input');
      const currentQty = parseInt(qtyInput.value);
      
      if (currentQty > 1) {
        updateCartItemQuantity(productId, currentQty - 1);
        renderCart();
      }
    });
  });
  
  document.querySelectorAll('.cart-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.cart-item');
      const productId = item.dataset.productId;
      const qtyInput = item.querySelector('.cart-qty-input');
      const currentQty = parseInt(qtyInput.value);
      
      updateCartItemQuantity(productId, currentQty + 1);
      renderCart();
    });
  });
  
  // Botones de eliminar
  document.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.cart-item');
      const productId = item.dataset.productId;
      
      if (confirm('¿Eliminar este producto del carrito?')) {
        removeFromCart(productId);
        renderCart();
      }
    });
  });
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa el carrito cuando se abre el offcanvas
 */
export function initCart() {
  const carritoOffcanvas = document.getElementById('carritoOffcanvas');
  
  if (carritoOffcanvas) {
    carritoOffcanvas.addEventListener('shown.bs.offcanvas', () => {
      renderCart();
    });
  }
  
  // Botón de checkout
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      alert('Función de checkout próximamente');
      // TODO: Implementar checkout
    });
  }
}