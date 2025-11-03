import authService from '../services/AuthService.js';
import categoryService from '../services/CategoryService.js';
import cartService from '../services/CartService.js';

/**
 * Header Component
 * Manages header rendering and interactions
 */
class Header {
  constructor() {
    this.container = document.getElementById('header-container');
    this.categories = [];
    this.currentUser = null;
  }

  /**
   * Initialize header
   */
  async init() {
    await this.loadHeaderHTML();
    await this.loadCategories();
    this.setupEventListeners();
    this.updateUserMenu();
    this.updateCartBadge();
  }

  /**
   * Load header HTML
   */
  async loadHeaderHTML() {
    try {
      const response = await fetch('/components/header.html');
      const html = await response.text();
      if (this.container) {
        this.container.innerHTML = html;
      }
    } catch (error) {
      console.error('Error loading header:', error);
    }
  }

  /**
   * Load categories for menu
   */
  async loadCategories() {
    const result = await categoryService.getCategories();
    if (result.success) {
      this.categories = result.data;
      this.renderCategoriesMenu();
    }
  }

  /**
   * Render categories menu
   */
  renderCategoriesMenu() {
    const menu = document.getElementById('categories-menu');
    if (!menu) return;

    const html = this.categories.map(category => `
      <li>
        <a class="dropdown-item" href="/index.html?category=${category.id}">
          <i class="${category.icon} me-2"></i>
          ${category.name}
        </a>
      </li>
    `).join('');

    menu.innerHTML = html;
  }

  /**
   * Update user menu based on auth status
   */
  updateUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (!userMenu) return;

    this.currentUser = authService.getCurrentUser();

    if (this.currentUser) {
      // User is logged in
      userMenu.innerHTML = `
        <li><h6 class="dropdown-header">¡Hola, ${this.currentUser.firstName}!</h6></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="/pages/ajustes.html">
          <i class="bi bi-person me-2"></i>Mi Perfil
        </a></li>
        <li><a class="dropdown-item" href="/pages/historial.html">
          <i class="bi bi-bag-check me-2"></i>Mis Pedidos
        </a></li>
        <li><a class="dropdown-item" href="/pages/ajustes.html#direcciones">
          <i class="bi bi-geo-alt me-2"></i>Mis Direcciones
        </a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#" id="logout-btn">
          <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
        </a></li>
      `;

      // Add logout handler
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          authService.logout();
        });
      }
    } else {
      // User is not logged in
      userMenu.innerHTML = `
        <li><a class="dropdown-item" href="/pages/login.html">
          <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
        </a></li>
        <li><a class="dropdown-item" href="/pages/registro.html">
          <i class="bi bi-person-plus me-2"></i>Crear Cuenta
        </a></li>
      `;
    }
  }

  /**
   * Update cart badge
   */
  updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    const count = cartService.getCount();
    
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('d-none');
    } else {
      badge.classList.add('d-none');
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Cart button
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        const cartOffcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
        cartOffcanvas.show();
      });
    }

    // Desktop search
    const searchBtn = document.getElementById('header-search-btn');
    const searchInput = document.getElementById('header-search-input');
    
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => this.handleSearch(searchInput.value));
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSearch(searchInput.value);
        }
      });
    }

    // Mobile search toggle
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const mobileSearchBar = document.getElementById('mobile-search-bar');
    
    if (mobileSearchBtn && mobileSearchBar) {
      mobileSearchBtn.addEventListener('click', () => {
        mobileSearchBar.style.display = mobileSearchBar.style.display === 'none' ? '' : 'none';
      });
    }

    // Mobile search submit
    const mobileSearchSubmit = document.getElementById('mobile-search-submit');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    
    if (mobileSearchSubmit && mobileSearchInput) {
      mobileSearchSubmit.addEventListener('click', () => this.handleSearch(mobileSearchInput.value));
      mobileSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSearch(mobileSearchInput.value);
        }
      });
    }

    // Listen for cart updates
    window.addEventListener('cartUpdated', () => {
      this.updateCartBadge();
    });
  }

  /**
   * Handle search
   */
  handleSearch(query) {
    if (query.trim()) {
      window.location.href = `/index.html?search=${encodeURIComponent(query.trim())}`;
    }
  }
}

export default Header;