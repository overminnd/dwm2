import { Cart, CartItem } from '../models/Cart.js';
import storage from '../storage.js';

/**
 * Cart Service
 * Handles cart operations with localStorage
 */
class CartService {
  constructor() {
    this.cart = this.loadCart();
  }

  /**
   * Load cart from storage
   */
  loadCart() {
    const cartData = storage.getCart();
    return new Cart(cartData);
  }

  /**
   * Save cart to storage
   */
  saveCart() {
    storage.setCart(this.cart.toJSON());
    this.notifyUpdate();
  }

  /**
   * Get current cart
   */
  getCart() {
    return this.cart;
  }

  /**
   * Add item to cart
   */
  addItem(product, quantity = 1) {
    this.cart.addItem(product, quantity);
    this.saveCart();
    
    return {
      success: true,
      message: 'Producto agregado al carrito',
      data: this.cart
    };
  }

  /**
   * Remove item from cart
   */
  removeItem(productId) {
    this.cart.removeItem(productId);
    this.saveCart();
    
    return {
      success: true,
      message: 'Producto eliminado del carrito',
      data: this.cart
    };
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId, quantity) {
    this.cart.updateQuantity(productId, quantity);
    this.saveCart();
    
    return {
      success: true,
      data: this.cart
    };
  }

  /**
   * Increase item quantity
   */
  increaseQuantity(productId) {
    this.cart.increaseQuantity(productId);
    this.saveCart();
    
    return {
      success: true,
      data: this.cart
    };
  }

  /**
   * Decrease item quantity
   */
  decreaseQuantity(productId) {
    this.cart.decreaseQuantity(productId);
    this.saveCart();
    
    return {
      success: true,
      data: this.cart
    };
  }

  /**
   * Clear cart
   */
  clearCart() {
    this.cart.clear();
    this.saveCart();
    
    return {
      success: true,
      message: 'Carrito vacío',
      data: this.cart
    };
  }

  /**
   * Get cart count
   */
  getCount() {
    return this.cart.count;
  }

  /**
   * Get cart subtotal
   */
  getSubtotal() {
    return this.cart.subtotal;
  }

  /**
   * Check if product is in cart
   */
  hasItem(productId) {
    return this.cart.hasItem(productId);
  }

  /**
   * Notify cart update (for UI updates)
   */
  notifyUpdate() {
    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: {
        cart: this.cart,
        count: this.cart.count,
        subtotal: this.cart.subtotal
      }
    }));
  }
}

// Create singleton instance
const cartService = new CartService();
export default cartService;
export { CartService };