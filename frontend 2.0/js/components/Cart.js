import cartService from '../services/CartService.js';
import { formatCurrency } from '../utils.js';

/**
 * Cart Component
 * Manages cart offcanvas rendering and interactions
 */
class Cart {
  constructor() {
    this.container = null;
  }

  /**
   * Initialize cart
   */
  async init() {
    await this.loadCartHTML();
    this.container = document.getElementById('cartOffcanvas');
    this.setupEventListeners();
    this.render();
  }

  /**
   * Load cart HTML
   */
  async loadCartHTML() {
    try {
      const response = await fetch('/components/cart-offcanvas.html');
      const html = await response.text();
      const body = document.body;
      body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for cart updates
    window.addEventListener('cartUpdated', () => {
      this.render();
    });

    // Listen for offcanvas show event
    const offcanvas = document.getElementById('cartOffcanvas');
    if (offcanvas) {
      offcanvas.addEventListener('show.bs.offcanvas', () => {
        this.render();
      });
    }
  }

  /**
   * Render cart
   */
  render() {
    const cart = cartService.getCart();
    const itemsContainer = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    const summary = document.getElementById('cart-summary');

    if (!itemsContainer) return;

    if (cart.isEmpty) {
      // Show empty message
      if (emptyMessage) emptyMessage.style.display = 'block';
      if (summary) summary.style.display = 'none';
      
      // Clear items
      const existingItems = itemsContainer.querySelectorAll('.cart-item');
      existingItems.forEach(item => item.remove());
    } else {
      // Hide empty message
      if (emptyMessage) emptyMessage.style.display = 'none';
      if (summary) summary.style.display = 'block';

      // Render items
      const itemsHTML = cart.items.map(item => this.renderCartItem(item)).join('');
      
      // Find or create items wrapper
      let itemsWrapper = itemsContainer.querySelector('.cart-items-wrapper');
      if (!itemsWrapper) {
        itemsWrapper = document.createElement('div');
        itemsWrapper.className = 'cart-items-wrapper';
        itemsContainer.insertBefore(itemsWrapper, emptyMessage);
      }
      
      itemsWrapper.innerHTML = itemsHTML;

      // Update summary
      this.updateSummary(cart);

      // Attach item event listeners
      this.attachItemListeners();
    }
  }

  /**
   * Render cart item HTML
   */
  renderCartItem(item) {
    return `
      <div class="cart-item" data-product-id="${item.productId}">
        <img 
          src="${item.image}" 
          alt="${item.name}" 
          class="cart-item-image">
        <div class="cart-item-info">
          <h6 class="cart-item-name">${item.name}</h6>
          <div class="cart-item-price">${item.formattedPrice} / ${item.unit}</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn decrease-btn" data-product-id="${item.productId}">
              <i class="bi bi-dash"></i>
            </button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn increase-btn" data-product-id="${item.productId}">
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </div>
        <button class="cart-item-remove" data-product-id="${item.productId}">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
  }

  /**
   * Update cart summary
   */
  updateSummary(cart) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    if (subtotalEl) subtotalEl.textContent = cart.formattedSubtotal;
    if (totalEl) totalEl.textContent = cart.formattedSubtotal;
  }

  /**
   * Attach event listeners to cart items
   */
  attachItemListeners() {
    // Increase quantity buttons
    document.querySelectorAll('.increase-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = parseInt(btn.dataset.productId);
        cartService.increaseQuantity(productId);
      });
    });

    // Decrease quantity buttons
    document.querySelectorAll('.decrease-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = parseInt(btn.dataset.productId);
        cartService.decreaseQuantity(productId);
      });
    });

    // Remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = parseInt(btn.dataset.productId);
        cartService.removeItem(productId);
      });
    });
  }
}

export default Cart;