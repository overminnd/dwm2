/**
 * Footer Component
 * Manages footer rendering
 */
class Footer {
  constructor() {
    this.container = document.getElementById('footer-container');
  }

  /**
   * Initialize footer
   */
  async init() {
    await this.loadFooterHTML();
  }

  /**
   * Load footer HTML
   */
  async loadFooterHTML() {
    try {
      const response = await fetch('/components/footer.html');
      const html = await response.text();
      if (this.container) {
        this.container.innerHTML = html;
      }
    } catch (error) {
      console.error('Error loading footer:', error);
    }
  }
}

export default Footer;