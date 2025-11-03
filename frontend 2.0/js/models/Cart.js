import { formatCurrency } from '../utils.js';

/**
 * Cart Item Model
 */
export class CartItem {
  constructor(data = {}) {
    this.productId = data.productId || null;
    this.name = data.name || '';
    this.price = data.price || 0;
    this.quantity = data.quantity || 1;
    this.image = data.image || '/assets/images/placeholder.jpg';
    this.unit = data.unit || 'kg';
    this.stock = data.stock || 0;
  }

  get subtotal() {
    return this.price * this.quantity;
  }

  get formattedPrice() {
    return formatCurrency(this.price);
  }

  get formattedSubtotal() {
    return formatCurrency(this.subtotal);
  }

  toJSON() {
    return {
      productId: this.productId,
      name: this.name,
      price: this.price,
      quantity: this.quantity,
      image: this.image,
      unit: this.unit,
      stock: this.stock
    };
  }
}

/**
 * Cart Model
 */
export class Cart {
  constructor(items = []) {
    this.items = items.map(item => new CartItem(item));
  }

  get count() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  get subtotal() {
    return this.items.reduce((total, item) => total + item.subtotal, 0);
  }

  get formattedSubtotal() {
    return formatCurrency(this.subtotal);
  }

  get isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Add item to cart
   */
  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.productId === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const cartItem = new CartItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.mainImage,
        unit: product.unit,
        stock: product.stock
      });
      this.items.push(cartItem);
    }
  }

  /**
   * Remove item from cart
   */
  removeItem(productId) {
    this.items = this.items.filter(item => item.productId !== productId);
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = Math.min(quantity, item.stock);
      }
    }
  }

  /**
   * Increase item quantity
   */
  increaseQuantity(productId) {
    const item = this.items.find(item => item.productId === productId);
    if (item && item.quantity < item.stock) {
      item.quantity++;
    }
  }

  /**
   * Decrease item quantity
   */
  decreaseQuantity(productId) {
    const item = this.items.find(item => item.productId === productId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.removeItem(productId);
      }
    }
  }

  /**
   * Clear cart
   */
  clear() {
    this.items = [];
  }

  /**
   * Get item by product ID
   */
  getItem(productId) {
    return this.items.find(item => item.productId === productId);
  }

  /**
   * Check if product is in cart
   */
  hasItem(productId) {
    return this.items.some(item => item.productId === productId);
  }

  toJSON() {
    return this.items.map(item => item.toJSON());
  }

  toArray() {
    return this.items;
  }
}

export default Cart;