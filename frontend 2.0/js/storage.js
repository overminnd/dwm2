import { STORAGE_KEYS } from './config.js';

/**
 * Storage utility class
 */
class Storage {
  constructor() {
    this.storage = window.localStorage;
  }

  /**
   * Get item from storage
   */
  get(key) {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  /**
   * Set item in storage
   */
  set(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all storage
   */
  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.storage.getItem(key) !== null;
  }

  // Auth methods
  getToken() {
    return this.get(STORAGE_KEYS.AUTH_TOKEN);
  }

  setToken(token) {
    return this.set(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  removeToken() {
    return this.remove(STORAGE_KEYS.AUTH_TOKEN);
  }

  getUser() {
    return this.get(STORAGE_KEYS.USER);
  }

  setUser(user) {
    return this.set(STORAGE_KEYS.USER, user);
  }

  removeUser() {
    return this.remove(STORAGE_KEYS.USER);
  }

  // Cart methods
  getCart() {
    return this.get(STORAGE_KEYS.CART) || [];
  }

  setCart(cart) {
    return this.set(STORAGE_KEYS.CART, cart);
  }

  clearCart() {
    return this.remove(STORAGE_KEYS.CART);
  }

  // Wishlist methods
  getWishlist() {
    return this.get(STORAGE_KEYS.WISHLIST) || [];
  }

  setWishlist(wishlist) {
    return this.set(STORAGE_KEYS.WISHLIST, wishlist);
  }

  clearWishlist() {
    return this.remove(STORAGE_KEYS.WISHLIST);
  }

  // Theme methods
  getTheme() {
    return this.get(STORAGE_KEYS.THEME) || 'light';
  }

  setTheme(theme) {
    return this.set(STORAGE_KEYS.THEME, theme);
  }

  // Language methods
  getLanguage() {
    return this.get(STORAGE_KEYS.LANGUAGE) || 'es';
  }

  setLanguage(language) {
    return this.set(STORAGE_KEYS.LANGUAGE, language);
  }
}

// Create singleton instance
const storage = new Storage();

export default storage;