/**
 * Main Application Entry Point
 */
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Cart from './components/Cart.js';

// Initialize app
class App {
  constructor() {
    this.header = null;
    this.footer = null;
    this.cart = null;
  }

  /**
   * Initialize application
   */
  async init() {
    console.log('Initializing MarAzul App...');
    
    try {
      // Initialize header
      this.header = new Header();
      await this.header.init();
      console.log('✓ Header initialized');

      // Initialize footer
      this.footer = new Footer();
      await this.footer.init();
      console.log('✓ Footer initialized');

      // Initialize cart
      this.cart = new Cart();
      await this.cart.init();
      console.log('✓ Cart initialized');

      console.log('✓ MarAzul App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  await app.init();
});

// Export for use in other modules
export default App;