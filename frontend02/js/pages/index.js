/**
 * ============================================================================
 * MARAZUL - Página Principal (Index)
 * ============================================================================
 * 
 * Archivo: pages/index.js
 * Descripción: Lógica de la página principal - productos destacados, 
 *              categorías, catálogo y modales
 * Versión: 1.0
 */

import { COMPONENTS } from '../config.js';
import { 
  loadComponent, 
  initHeader, 
  updateCartBadge 
} from '../auth.js';
import {
  getFeaturedProducts,
  getActiveCategories,
  getProducts,
  getProductById
} from '../api.js';
import {
  formatPrice,
  showToast,
  showLoading,
  hideLoading,
  log
} from '../utils.js';
import {
  addToCart,
  renderCart,
  initCart
} from '../cart.js';

// ============================================================================
// VARIABLES GLOBALES
// ============================================================================

let currentProduct = null; // Producto actual seleccionado para el modal
let allProducts = []; // Todos los productos para el catálogo

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa la página principal
 */
async function init() {
  try {
    log('info', 'Inicializando página principal...');
    
    // Cargar componentes HTML
    await loadComponents();
    
    // Inicializar header
    initHeader();
    
    // Inicializar carrito
    initCart();
    
    // Cargar categorías
    await loadCategories();
    
    // Cargar productos destacados
    await loadFeaturedProducts();
    
    // Cargar catálogo completo
    await loadCatalog();
    
    // Inicializar eventos
    initEvents();
    
    log('info', 'Página principal inicializada correctamente');
  } catch (error) {
    log('error', 'Error inicializando página principal:', error);
    showToast('Error cargando la página', 'error');
  }
}

/**
 * Carga todos los componentes HTML necesarios
 */
async function loadComponents() {
  try {
    // Cargar header
    await loadComponent('header-container', COMPONENTS.HEADER);
    
    // Cargar carrito offcanvas
    await loadComponent('carrito-container', COMPONENTS.CARRITO);
    
    // Cargar carrusel
    await loadComponent('carrusel-container', COMPONENTS.CARRUSEL);
    
    log('debug', 'Componentes HTML cargados');
  } catch (error) {
    log('error', 'Error cargando componentes:', error);
  }
}

// ============================================================================
// CATEGORÍAS
// ============================================================================

/**
 * Carga y renderiza las categorías
 */
async function loadCategories() {
  const container = document.getElementById('categorias-container');
  
  if (!container) {
    log('warn', 'Contenedor de categorías no encontrado');
    return;
  }
  
  try {
    showLoading(container, 'sm');
    
    const response = await getActiveCategories();
    
    if (response.success && response.categories.length > 0) {
      renderCategories(response.categories);
      log('info', `${response.categories.length} categorías cargadas`);
    } else {
      container.innerHTML = '<p class="text-center text-muted">No hay categorías disponibles</p>';
    }
  } catch (error) {
    log('error', 'Error cargando categorías:', error);
    container.innerHTML = '<p class="text-center text-danger">Error cargando categorías</p>';
  }
}

/**
 * Renderiza las categorías en el DOM
 * @param {Array} categories - Array de categorías
 */
function renderCategories(categories) {
  const container = document.getElementById('categorias-container');
  
  if (!container) return;
  
  let html = '<div class="row g-3">';
  
  categories.forEach(category => {
    // Colores predefinidos para categorías
    const colors = {
      'PESCADO': '#4db6ac',
      'MARISCOS': '#2e7d32',
      'CONSERVAS': '#c62828',
      'CONGELADOS': '#f9a825',
      'OTROS': '#ab47bc',
      'default': '#d4e157'
    };
    
    const bgColor = colors[category.nombre.toUpperCase()] || colors['default'];
    
    html += `
      <div class="col-6 col-md-4">
        <div class="card category-card h-100 border-0 shadow-sm" 
             data-category-id="${category._id}"
             style="cursor: pointer; transition: transform 0.2s;">
          <div class="card-body text-center" style="background-color: ${bgColor}; color: white;">
            <i class="fas fa-fish fa-2x mb-2"></i>
            <h6 class="mb-0">${category.nombre}</h6>
            ${category.descripcion ? `<p class="small mb-0 mt-1">${category.descripcion}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  container.innerHTML = html;
  
  // Agregar eventos a las categorías
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function() {
      const categoryId = this.dataset.categoryId;
      filterByCategoryId(categoryId);
    });
    
    // Efecto hover
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
}

/**
 * Filtra productos por categoría
 * @param {string} categoryId - ID de la categoría
 */
async function filterByCategoryId(categoryId) {
  try {
    log('debug', 'Filtrando por categoría:', categoryId);
    
    // Scroll al catálogo
    const catalogoSection = document.getElementById('catalogo-container');
    if (catalogoSection) {
      catalogoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Filtrar productos
    const filteredProducts = allProducts.filter(p => p.categoria === categoryId);
    
    if (filteredProducts.length > 0) {
      renderCatalog(filteredProducts);
      showToast(`${filteredProducts.length} productos encontrados`, 'info');
    } else {
      const catalogContainer = document.getElementById('catalogo-container');
      if (catalogContainer) {
        catalogContainer.innerHTML = '<p class="text-center text-muted py-5">No hay productos en esta categoría</p>';
      }
    }
  } catch (error) {
    log('error', 'Error filtrando por categoría:', error);
  }
}

// ============================================================================
// PRODUCTOS DESTACADOS
// ============================================================================

/**
 * Carga y renderiza productos destacados
 */
async function loadFeaturedProducts() {
  const container = document.getElementById('productos-container');
  
  if (!container) {
    log('warn', 'Contenedor de productos destacados no encontrado');
    return;
  }
  
  try {
    showLoading(container);
    
    const response = await getFeaturedProducts(6);
    
    if (response.success && response.products.length > 0) {
      renderFeaturedProducts(response.products);
      log('info', `${response.products.length} productos destacados cargados`);
    } else {
      container.innerHTML = '<p class="text-center text-muted">No hay productos destacados disponibles</p>';
    }
  } catch (error) {
    log('error', 'Error cargando productos destacados:', error);
    container.innerHTML = '<p class="text-center text-danger">Error cargando productos</p>';
  }
}

/**
 * Renderiza productos destacados
 * @param {Array} products - Array de productos
 */
function renderFeaturedProducts(products) {
  const container = document.getElementById('productos-container');
  
  if (!container) return;
  
  let html = '<div class="row g-3">';
  
  products.forEach(product => {
    html += createProductCard(product);
  });
  
  html += '</div>';
  
  container.innerHTML = html;
  
  // Agregar eventos a los botones
  setupProductButtons();
}

// ============================================================================
// CATÁLOGO
// ============================================================================

/**
 * Carga y renderiza el catálogo completo
 */
async function loadCatalog() {
  const container = document.getElementById('catalogo-container');
  
  if (!container) {
    log('warn', 'Contenedor de catálogo no encontrado');
    return;
  }
  
  try {
    showLoading(container);
    
    const response = await getProducts({ limit: 50 });
    
    if (response.success && response.products.length > 0) {
      allProducts = response.products; // Guardar para filtros
      renderCatalog(response.products);
      log('info', `${response.products.length} productos en catálogo cargados`);
    } else {
      container.innerHTML = '<p class="text-center text-muted">No hay productos disponibles</p>';
    }
  } catch (error) {
    log('error', 'Error cargando catálogo:', error);
    container.innerHTML = '<p class="text-center text-danger">Error cargando catálogo</p>';
  }
}

/**
 * Renderiza el catálogo de productos
 * @param {Array} products - Array de productos
 */
function renderCatalog(products) {
  const container = document.getElementById('catalogo-container');
  
  if (!container) return;
  
  let html = '<div class="row g-3">';
  
  products.forEach(product => {
    html += createProductCard(product, true); // true para cards horizontales
  });
  
  html += '</div>';
  
  container.innerHTML = html;
  
  // Agregar eventos a los botones
  setupProductButtons();
}

/**
 * Crea el HTML de una card de producto
 * @param {Object} product - Objeto del producto
 * @param {boolean} horizontal - Si la card es horizontal (para catálogo)
 * @returns {string} HTML de la card
 */
function createProductCard(product, horizontal = false) {
  const imageUrl = product.imagen || '/MARAZUL/MARAZUL/frontend02/assets/images/placeholder-product.jpg';
  const disponible = product.stock > 0;
  
  if (horizontal) {
    // Card horizontal para catálogo
    return `
      <div class="col-12">
        <div class="card product-card h-100 border-0 shadow-sm ${!disponible ? 'opacity-75' : ''}">
          <div class="row g-0">
            <div class="col-4">
              <img src="${imageUrl}" 
                   class="img-fluid rounded-start h-100 object-fit-cover" 
                   alt="${product.nombre}"
                   style="max-height: 180px;">
            </div>
            <div class="col-8">
              <div class="card-body d-flex flex-column h-100">
                <h6 class="card-title mb-2">${product.nombre}</h6>
                <p class="card-text text-muted small mb-2">${product.descripcion || 'Producto fresco del mar'}</p>
                <div class="mt-auto">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="h5 mb-0 text-success">${formatPrice(product.precio)}</span>
                    ${disponible ? `
                      <button class="btn btn-primary btn-sm rounded-circle btn-add-to-cart" 
                              data-product-id="${product._id}"
                              style="width: 36px; height: 36px;">
                        <i class="fas fa-plus"></i>
                      </button>
                    ` : `
                      <span class="badge bg-secondary">Agotado</span>
                    `}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // Card vertical para destacados
    return `
      <div class="col-6 col-md-4">
        <div class="card product-card h-100 border-0 shadow-sm ${!disponible ? 'opacity-75' : ''}">
          <img src="${imageUrl}" 
               class="card-img-top" 
               alt="${product.nombre}"
               style="height: 180px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h6 class="card-title mb-2">${product.nombre}</h6>
            <p class="card-text text-muted small mb-2 flex-grow-1">${product.descripcion || 'Producto fresco'}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <span class="h6 mb-0 text-success">${formatPrice(product.precio)}</span>
              ${disponible ? `
                <button class="btn btn-primary btn-sm rounded-circle btn-add-to-cart" 
                        data-product-id="${product._id}"
                        style="width: 32px; height: 32px;">
                  <i class="fas fa-plus"></i>
                </button>
              ` : `
                <span class="badge bg-secondary">Agotado</span>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Configura eventos de los botones de productos
 */
function setupProductButtons() {
  // Botones de agregar al carrito
  document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const productId = this.dataset.productId;
      await handleAddToCart(productId);
    });
  });
  
  // Click en las cards para ver detalles (abrir modal)
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.cursor = 'pointer';
    
    card.addEventListener('click', function(e) {
      // No abrir modal si se hizo click en el botón
      if (e.target.closest('.btn-add-to-cart')) {
        return;
      }
      
      const productId = this.querySelector('.btn-add-to-cart')?.dataset.productId;
      if (productId) {
        openProductModal(productId);
      }
    });
  });
}

// ============================================================================
// MODAL DE PRODUCTO
// ============================================================================

/**
 * Abre el modal con los detalles del producto
 * @param {string} productId - ID del producto
 */
async function openProductModal(productId) {
  try {
    log('debug', 'Abriendo modal para producto:', productId);
    
    // Buscar producto en los arrays locales primero
    let product = allProducts.find(p => p._id === productId);
    
    // Si no está en local, buscar en productos destacados
    if (!product) {
      const response = await getProductById(productId);
      if (response.success) {
        product = response.product;
      }
    }
    
    if (!product) {
      showToast('Producto no encontrado', 'error');
      return;
    }
    
    currentProduct = product;
    
    // Renderizar contenido del modal
    renderProductModal(product);
    
    // Abrir modal
    const modalElement = document.getElementById('productoModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  } catch (error) {
    log('error', 'Error abriendo modal:', error);
    showToast('Error cargando producto', 'error');
  }
}

/**
 * Renderiza el contenido del modal de producto
 * @param {Object} product - Objeto del producto
 */
function renderProductModal(product) {
  // Imagen
  const modalImage = document.getElementById('modal-product-image');
  if (modalImage) {
    modalImage.src = product.imagen || '/MARAZUL/MARAZUL/frontend02/assets/images/placeholder-product.jpg';
    modalImage.alt = product.nombre;
  }
  
  // Nombre
  const modalName = document.getElementById('modal-product-name');
  if (modalName) {
    modalName.textContent = product.nombre;
  }
  
  // Descripción
  const modalDesc = document.getElementById('modal-product-description');
  if (modalDesc) {
    modalDesc.textContent = product.descripcion || 'Producto fresco del mar';
  }
  
  // Precio
  const modalPrice = document.getElementById('modal-product-price');
  if (modalPrice) {
    modalPrice.textContent = formatPrice(product.precio);
  }
  
  // Stock
  const modalStock = document.getElementById('modal-product-stock');
  if (modalStock) {
    if (product.stock > 0) {
      modalStock.textContent = `Disponible (${product.stock} unidades)`;
      modalStock.className = 'text-success';
    } else {
      modalStock.textContent = 'Agotado';
      modalStock.className = 'text-danger';
    }
  }
  
  // Resetear cantidad a 1
  const quantityInput = document.getElementById('modal-quantity');
  if (quantityInput) {
    quantityInput.value = 1;
  }
  
  // Actualizar total
  updateModalTotal();
}

/**
 * Actualiza el total en el modal según la cantidad
 */
function updateModalTotal() {
  if (!currentProduct) return;
  
  const quantityInput = document.getElementById('modal-quantity');
  const totalElement = document.getElementById('modal-total');
  
  if (!quantityInput || !totalElement) return;
  
  const quantity = parseInt(quantityInput.value) || 1;
  const total = currentProduct.precio * quantity;
  
  totalElement.textContent = formatPrice(total);
}

/**
 * Maneja el agregar al carrito desde el modal
 */
function handleModalAddToCart() {
  if (!currentProduct) return;
  
  const quantityInput = document.getElementById('modal-quantity');
  const quantity = parseInt(quantityInput.value) || 1;
  
  // Agregar al carrito
  const success = addToCart(currentProduct, quantity);
  
  if (success) {
    // Cerrar modal
    const modalElement = document.getElementById('productoModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    
    // Abrir carrito offcanvas
    setTimeout(() => {
      const carritoOffcanvas = document.getElementById('carritoOffcanvas');
      if (carritoOffcanvas) {
        const offcanvas = new bootstrap.Offcanvas(carritoOffcanvas);
        offcanvas.show();
      }
    }, 300);
  }
}

/**
 * Maneja agregar al carrito directamente (sin modal)
 * @param {string} productId - ID del producto
 */
async function handleAddToCart(productId) {
  try {
    // Buscar producto
    let product = allProducts.find(p => p._id === productId);
    
    if (!product) {
      const response = await getProductById(productId);
      if (response.success) {
        product = response.product;
      }
    }
    
    if (!product) {
      showToast('Producto no encontrado', 'error');
      return;
    }
    
    // Agregar al carrito con cantidad 1
    addToCart(product, 1);
  } catch (error) {
    log('error', 'Error agregando producto al carrito:', error);
    showToast('Error agregando producto', 'error');
  }
}

// ============================================================================
// EVENTOS
// ============================================================================

/**
 * Inicializa todos los eventos de la página
 */
function initEvents() {
  // Eventos del modal
  setupModalEvents();
  
  // Evento del botón de búsqueda (si existe)
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
  
  // Botón de mostrar todos los productos
  const showAllBtn = document.getElementById('btn-show-all');
  if (showAllBtn) {
    showAllBtn.addEventListener('click', function() {
      renderCatalog(allProducts);
      showToast('Mostrando todos los productos', 'info');
    });
  }
}

/**
 * Configura eventos del modal de producto
 */
function setupModalEvents() {
  // Botones de cantidad en el modal
  const btnDecrease = document.getElementById('modal-btn-decrease');
  const btnIncrease = document.getElementById('modal-btn-increase');
  const quantityInput = document.getElementById('modal-quantity');
  
  if (btnDecrease) {
    btnDecrease.addEventListener('click', function() {
      if (quantityInput) {
        let value = parseInt(quantityInput.value) || 1;
        if (value > 1) {
          quantityInput.value = value - 1;
          updateModalTotal();
        }
      }
    });
  }
  
  if (btnIncrease) {
    btnIncrease.addEventListener('click', function() {
      if (quantityInput) {
        let value = parseInt(quantityInput.value) || 1;
        if (value < 99) {
          quantityInput.value = value + 1;
          updateModalTotal();
        }
      }
    });
  }
  
  if (quantityInput) {
    quantityInput.addEventListener('change', function() {
      let value = parseInt(this.value) || 1;
      if (value < 1) value = 1;
      if (value > 99) value = 99;
      this.value = value;
      updateModalTotal();
    });
  }
  
  // Botón de agregar al carrito en el modal
  const btnAddToCart = document.getElementById('modal-btn-add-to-cart');
  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', handleModalAddToCart);
  }
}

/**
 * Maneja la búsqueda de productos
 * @param {Event} e - Evento del formulario
 */
function handleSearch(e) {
  e.preventDefault();
  
  const searchInput = document.querySelector('input[name="search"]');
  const searchTerm = searchInput?.value.trim();
  
  if (!searchTerm) {
    renderCatalog(allProducts);
    return;
  }
  
  // Filtrar productos localmente
  const filtered = allProducts.filter(product => 
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  if (filtered.length > 0) {
    renderCatalog(filtered);
    showToast(`${filtered.length} productos encontrados`, 'info');
  } else {
    const catalogContainer = document.getElementById('catalogo-container');
    if (catalogContainer) {
      catalogContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-search fa-3x text-muted mb-3"></i>
          <p class="text-muted">No se encontraron productos con "${searchTerm}"</p>
          <button class="btn btn-primary btn-sm" onclick="window.location.reload()">
            Ver todos los productos
          </button>
        </div>
      `;
    }
  }
}

// ============================================================================
// INICIAR AL CARGAR LA PÁGINA
// ============================================================================

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exports para uso externo si es necesario
export {
  init,
  loadCategories,
  loadFeaturedProducts,
  loadCatalog,
  openProductModal
};