// ============================================
// INDEX.JS - PÁGINA PRINCIPAL
// ============================================

import { initPage } from '../auth.js';
import { getFeaturedProducts, getActiveCategories } from '../api.js';

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar componentes comunes (header, carrito)
  initPage({
    loadHeader: true,
    loadCarrito: true,
    requireAuthentication: false
  });

  // Cargar contenido de la página
  loadCategories();
  loadFeaturedProducts();
});

// ============================================
// CATEGORÍAS
// ============================================

function loadCategories() {
  const container = $('#categorias-container');
  
  if (!container.length) return;

  // Mostrar spinner
  container.html('<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>');

  getActiveCategories()
    .done((response) => {
      const categories = response.data || response;
      
      if (!categories || categories.length === 0) {
        container.html('<p class="text-center text-muted">No hay categorías disponibles</p>');
        return;
      }

      let html = '<div class="row g-4">';
      
      categories.forEach(cat => {
        html += `
          <div class="col-6 col-md-4 col-lg-3">
            <div class="card h-100 category-card">
              <img src="${cat.image || 'https://via.placeholder.com/300x200?text=' + cat.name}" 
                   class="card-img-top" 
                   alt="${cat.name}">
              <div class="card-body text-center">
                <h5 class="card-title">${cat.name}</h5>
                <p class="card-text text-muted small">${cat.description || ''}</p>
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      container.html(html);
    })
    .fail((error) => {
      console.error('Error al cargar categorías:', error);
      container.html('<p class="text-center text-danger">Error al cargar categorías</p>');
    });
}

// ============================================
// PRODUCTOS DESTACADOS
// ============================================

function loadFeaturedProducts() {
  const container = $('#productos-destacados-container');
  
  if (!container.length) return;

  // Mostrar spinner
  container.html('<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>');

  getFeaturedProducts(6)
    .done((response) => {
      const products = response.data || response;
      
      if (!products || products.length === 0) {
        container.html('<p class="text-center text-muted">No hay productos destacados</p>');
        return;
      }

      let html = '<div class="row g-4">';
      
      products.forEach(product => {
        const price = product.price ? `$${product.price.toLocaleString('es-CL')}` : 'Precio no disponible';
        const image = product.image || 'https://via.placeholder.com/300x300?text=' + product.name;
        
        html += `
          <div class="col-6 col-md-4 col-lg-2">
            <div class="card h-100 product-card">
              <img src="${image}" 
                   class="card-img-top" 
                   alt="${product.name}"
                   style="height: 200px; object-fit: cover;">
              <div class="card-body d-flex flex-column">
                <h6 class="card-title">${product.name}</h6>
                <p class="card-text text-muted small mb-2">${product.description ? product.description.substring(0, 50) + '...' : ''}</p>
                <div class="mt-auto">
                  <p class="fw-bold mb-2">${price}</p>
                  <button class="btn btn-primary btn-sm w-100" 
                          onclick="addToCart('${product._id}')">
                    <i class="bi bi-cart-plus"></i> Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      container.html(html);
    })
    .fail((error) => {
      console.error('Error al cargar productos:', error);
      container.html('<p class="text-center text-danger">Error al cargar productos</p>');
    });
}

// ============================================
// AGREGAR AL CARRITO
// ============================================

window.addToCart = function(productId) {
  // Por ahora solo guarda en localStorage
  // Después conectaremos con el backend
  console.log('Agregando producto al carrito:', productId);
  
  const cartItems = JSON.parse(localStorage.getItem('marazul_cart_items') || '[]');
  
  const existingItem = cartItems.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      productId: productId,
      quantity: 1
    });
  }
  
  localStorage.setItem('marazul_cart_items', JSON.stringify(cartItems));
  
  // Actualizar badge
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
  
  // Mostrar mensaje
  alert('Producto agregado al carrito');
};