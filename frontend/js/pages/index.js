/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MARAZUL - INDEX.JS (Página Principal)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Lógica específica para la página principal (index.html)
 * 
 * COMPONENTE 5: PRODUCTOS DESTACADOS
 * - Carga productos destacados desde backend
 * - Renderiza cards dinámicamente
 * 
 * COMPONENTE 6: CATÁLOGO COMPLETO
 * - Carga productos por categoría desde backend
 * - Renderiza 6 secciones de categorías
 * - Mantiene diseño visual 100%
 * 
 * @requires jQuery
 * @requires config.js
 * @requires utils.js
 * @requires api.js (getProducts, getFeaturedProducts, getProductsByCategory)
 * @requires cart.js (addToCart)
 * 
 * Fecha: 25 Noviembre 2025
 * Versión: 2.0.0 (Componente 5 + 6)
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE 5: PRODUCTOS DESTACADOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Carga y renderiza los productos destacados desde el backend
 * 
 * @async
 * @param {number} limit - Cantidad de productos a mostrar (default: 4)
 * @returns {Promise<void>}
 */
async function loadFeaturedProducts(limit = 4) {
  try {
    console.log('🌟 Cargando productos destacados...');
    
    // Mostrar loading spinner
    showLoadingSpinner('#productos-destacados-grid');
    
    // Llamar al backend para obtener productos destacados
    const result = await getProducts({ featured: true, limit: limit });
    
    // Validar respuesta
    if (!result.success) {
      console.error('❌ Error al cargar productos:', result.error);
      showErrorMessage('#productos-destacados-grid', result.error.message || 'Error al cargar productos destacados');
      return;
    }
    
    const products = result.data;
    
    // Validar que hay productos
    if (!products || products.length === 0) {
      console.warn('⚠️ No hay productos destacados disponibles');
      showEmptyMessage('#productos-destacados-grid', 'No hay productos destacados disponibles en este momento');
      return;
    }
    
    console.log(`✅ ${products.length} productos destacados cargados`, products);
    
    // Renderizar productos en el grid
    renderFeaturedProducts(products);
    
    // Inicializar eventos de las cards
    initProductCardEvents();
    
  } catch (error) {
    console.error('❌ Error cargando productos destacados:', error);
    showErrorMessage('#productos-destacados-grid', 'Error al cargar productos destacados');
  }
}

/**
 * Renderiza las cards de productos destacados en el grid
 * 
 * @param {Array} products - Array de productos desde el backend
 */
function renderFeaturedProducts(products) {
  const $container = $('#productos-destacados-grid');
  
  // Limpiar contenedor
  $container.empty();
  
  // Renderizar cada producto
  products.forEach(product => {
    const $card = createProductCard(product);
    $container.append($card);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE 6: CATÁLOGO COMPLETO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mapeo de slugs a IDs de secciones HTML
 * Esto permite manejar categorías con nombres diferentes en BD vs HTML
 */
const CATEGORY_SLUG_TO_ID = {
  'pescados': 'pescado',
  'mariscos-frescos': 'mariscos',
  'mariscos': 'mariscos',
  'congelados': 'congelado',
  'conservas': 'conservas',
  'preparados': 'preparados',
  'especialidades': 'especialidades'
};

/**
 * Carga y renderiza el catálogo completo con todas las categorías
 * 
 * Flujo:
 * 1. Obtener categorías desde el backend
 * 2. Para cada categoría, obtener sus productos (por categoryId)
 * 3. Renderizar sección de categoría con sus productos
 * 4. Inicializar eventos
 * 
 * @async
 * @returns {Promise<void>}
 */
async function loadCatalog() {
  try {
    console.log('📚 Cargando catálogo completo...');
    
    const $container = $('#catalogo-sections-container');
    
    if (!$container.length) {
      console.error('❌ Contenedor #catalogo-sections-container no encontrado');
      return;
    }
    
    // Mostrar loading
    showLoadingSpinner('#catalogo-sections-container');
    
    // Limpiar contenedor
    $container.empty();
    
    // PASO 1: Obtener categorías desde backend
    console.log('🔍 Obteniendo categorías desde backend...');
    const categoriesResult = await getCategories();
    
    if (!categoriesResult.success) {
      console.error('❌ Error al obtener categorías:', categoriesResult.error);
      showErrorMessage('#catalogo-sections-container', 'Error al cargar las categorías');
      return;
    }
    
    const categories = categoriesResult.data;
    
    if (!categories || categories.length === 0) {
      console.warn('⚠️ No hay categorías disponibles');
      showEmptyMessage('#catalogo-sections-container', 'No hay categorías disponibles');
      return;
    }
    
    console.log(`✅ ${categories.length} categorías obtenidas`, categories);
    
    // PASO 2: Para cada categoría, cargar sus productos
    for (const category of categories) {
      await loadCategorySection(category);
    }
    
    // Inicializar eventos de las cards del catálogo
    initProductCardEvents();
    
    console.log('✅ Catálogo completo cargado');
    
  } catch (error) {
    console.error('❌ Error cargando catálogo:', error);
    showErrorMessage('#catalogo-sections-container', 'Error al cargar el catálogo');
  }
}

/**
 * Carga y renderiza una sección de categoría específica
 * 
 * @async
 * @param {Object} category - Objeto de categoría desde backend
 * @param {string} category._id - ObjectId de la categoría
 * @param {string} category.name - Nombre de la categoría
 * @param {string} category.slug - Slug de la categoría
 * @returns {Promise<void>}
 */
async function loadCategorySection(category) {
  try {
    console.log(`📦 Cargando categoría: ${category.name}...`);
    
    // Obtener productos de esta categoría usando su ObjectId
    const result = await getProducts({ 
      categoryId: category._id,
      limit: 12 
    });
    
    if (!result.success) {
      console.warn(`⚠️ Error al cargar categoría ${category.name}:`, result.error);
      // No renderizar la sección si hay error
      return;
    }
    
    const products = result.data;
    
    if (!products || products.length === 0) {
      console.warn(`⚠️ No hay productos en categoría: ${category.name}`);
      // Renderizar sección vacía con mensaje
      renderCategorySection(category, []);
      return;
    }
    
    console.log(`✅ ${products.length} productos en ${category.name}`);
    
    // Renderizar sección con productos
    renderCategorySection(category, products);
    
  } catch (error) {
    console.error(`❌ Error cargando categoría ${category.name}:`, error);
  }
}

/**
 * Renderiza una sección completa de categoría con sus productos
 * 
 * Estructura:
 * <section id="pescado" class="catalogo-section">
 *   <h3>Pescado</h3>
 *   <div class="row g-4">
 *     <!-- cards de productos -->
 *   </div>
 * </section>
 * 
 * @param {Object} category - Objeto de categoría desde backend
 * @param {string} category._id - ObjectId
 * @param {string} category.name - Nombre para mostrar
 * @param {string} category.slug - Slug de la categoría
 * @param {Array} products - Array de productos de esta categoría
 */
function renderCategorySection(category, products) {
  const $container = $('#catalogo-sections-container');
  
  // Mapear slug de BD a ID de HTML
  // Ejemplo: "mariscos-frescos" → "mariscos", "pescados" → "pescado"
  let sectionId = CATEGORY_SLUG_TO_ID[category.slug] || category.slug;
  
  // Si el slug termina en 's', quitarla para el ID (pescados → pescado)
  if (!CATEGORY_SLUG_TO_ID[category.slug] && category.slug.endsWith('s')) {
    sectionId = category.slug.slice(0, -1);
  }
  
  // Crear sección
  const $section = $(`
    <section id="${sectionId}" class="catalogo-section mb-5">
      <div class="container">
        <!-- Header de la categoría -->
        <h3 class="mb-4 text-uppercase fw-bold" style="color: #003366; border-bottom: 3px solid #4db6ac; padding-bottom: 10px;">
          ${escapeHtml(category.name)}
        </h3>
        
        <!-- Grid de productos -->
        <div class="row g-4" id="${sectionId}-grid">
        </div>
      </div>
    </section>
  `);
  
  // Agregar sección al contenedor
  $container.append($section);
  
  // Renderizar productos en el grid
  const $grid = $section.find(`#${sectionId}-grid`);
  
  if (products.length === 0) {
    // Mostrar mensaje de categoría vacía
    $grid.html(`
      <div class="col-12">
        <div class="alert alert-info text-center" role="alert">
          <i class="bi bi-inbox me-2"></i>
          No hay productos disponibles en esta categoría
        </div>
      </div>
    `);
  } else {
    // Renderizar cada producto
    products.forEach(product => {
      const $card = createProductCard(product);
      $grid.append($card);
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES COMPARTIDAS: CARDS DE PRODUCTO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Crea el HTML de una card de producto
 * (Compartida por Componente 5 y 6)
 * 
 * Diseño preservado 100%:
 * - Card horizontal (imagen 40% | contenido 60%)
 * - Imagen con object-fit: cover
 * - Título responsive con clamp()
 * - Precio en verde
 * - Botón "+" circular
 * 
 * @param {Object} product - Objeto producto desde backend
 * @returns {jQuery} Elemento jQuery con la card
 */
function createProductCard(product) {
  // Extraer datos del producto
  const id = product._id || '';
  const nombre = product.name || 'Producto sin nombre';
  const precio = product.price || 0;
  const shortDesc = product.shortDescription || '';
  const fullDesc = product.description || shortDesc;
  const imagen = product.mainImage || CONFIG.DEFAULT_IMAGE;
  const stock = product.stock || 0;
  
  // Formatear precio (ej: 12990 → "$12.990")
  const precioFormateado = formatPrice(precio);
  
  // Crear card HTML (DISEÑO ORIGINAL PRESERVADO 100%)
  const $card = $(`
    <div class="col-md-4">
      <div class="card h-100 shadow-sm producto-card"
           role="button"
           tabindex="0"
           data-product-id="${id}"
           data-title="${escapeHtml(nombre)}"
           data-short-desc="${escapeHtml(shortDesc)}"
           data-full-desc="${escapeHtml(fullDesc)}"
           data-price="${precio}"
           data-stock="${stock}"
           data-img="${imagen}">
        
        <!-- Layout: Imagen 40% | Contenido 60% -->
        <div class="row g-0 h-100">
          
          <!-- Imagen (40%) -->
          <div class="col-5">
            <img src="${imagen}"
                 class="img-fluid h-100 rounded-start object-fit-cover" 
                 alt="${escapeHtml(nombre)}"
                 onerror="this.src='${CONFIG.DEFAULT_IMAGE}'">
          </div>
          
          <!-- Contenido (60%) -->
          <div class="col-7 d-flex flex-column justify-content-between p-3">
            <div>
              <!-- Título responsive -->
              <h5 class="fw-bold mb-1 producto-title">${escapeHtml(nombre)}</h5>
              
              <!-- Descripción corta -->
              <p class="mb-2 small producto-short-desc">${escapeHtml(shortDesc)}</p>
            </div>
            
            <!-- Precio y botón agregar -->
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <!-- Precio en verde -->
              <span class="fw-bold text-success producto-precio" data-price="${precio}">
                ${precioFormateado}
              </span>
              
              <!-- Botón "+" circular -->
              <button class="btn btn-light rounded-circle btn-sm add-to-cart-quick" 
                      aria-label="Agregar rápido al carrito"
                      ${stock === 0 ? 'disabled' : ''}>
                +
              </button>
            </div>
            
            <!-- Indicador sin stock -->
            ${stock === 0 ? '<small class="text-danger">Sin stock</small>' : ''}
          </div>
        </div>
      </div>
    </div>
  `);
  
  return $card;
}

/**
 * Inicializa los eventos de las cards de productos
 * (Compartida por Componente 5 y 6)
 * 
 * Eventos:
 * - Click en card → Abrir modal con detalles
 * - Click en botón "+" → Agregar 1 unidad al carrito (sin modal)
 */
function initProductCardEvents() {
  // Evento: Click en card (excepto en botón "+") → Abrir modal
  $('.producto-card').off('click').on('click', function(e) {
    // Si hicieron click en el botón de agregar, no abrir modal
    if ($(e.target).hasClass('add-to-cart-quick') || 
        $(e.target).closest('.add-to-cart-quick').length) {
      return;
    }
    
    // Obtener datos del producto desde data-attributes
    const productData = {
      id: $(this).data('product-id'),
      title: $(this).data('title'),
      shortDesc: $(this).data('short-desc'),
      fullDesc: $(this).data('full-desc'),
      price: $(this).data('price'),
      stock: $(this).data('stock'),
      img: $(this).data('img')
    };
    
    // Abrir modal de producto
    openProductModal(productData);
  });
  
  // Evento: Click en botón "+" → Agregar 1 unidad rápidamente
  $('.add-to-cart-quick').off('click').on('click', function(e) {
    e.stopPropagation(); // Evitar que se abra el modal
    
    const $card = $(this).closest('.producto-card');
    const productData = {
      id: $card.data('product-id'),
      title: $card.data('title'),
      price: $card.data('price'),
      img: $card.data('img')
    };
    
    // Agregar 1 unidad al carrito
    addToCart(productData, 1);
    
    // Feedback visual temporal
    const $btn = $(this);
    const originalText = $btn.html();
    $btn.html('✓').prop('disabled', true);
    
    setTimeout(() => {
      $btn.html(originalText).prop('disabled', false);
    }, 1000);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
/**
 * Abre el modal de producto con los datos proporcionados
 * 
 * Modal: #productoModal (debe existir en index.html)
 * 
 * @param {Object} productData - Datos del producto
 */
function openProductModal(productData) {
  const modal = $('#productoModal');
  
  if (!modal.length) {
    console.error('❌ Modal #productoModal no encontrado');
    return;
  }
  
  // Guardar datos en el modal PRIMERO (antes de rellenar)
  modal.data('product', productData);
  
  // Rellenar datos en el modal
  modal.find('#modalProductTitle').text(productData.title);
  modal.find('#modalProductImage').attr('src', productData.img);
  modal.find('#modalProductDescription').text(productData.fullDesc || productData.shortDesc);
  modal.find('#modalProductPrice').text(formatPrice(productData.price));
  modal.find('#modalProductStock').text(productData.stock);
  
  // Resetear cantidad a 1
  modal.find('#modalQuantity').val(1);
  
  // Actualizar total
  updateModalTotal();
  
  // Inicializar eventos del modal (cada vez que se abre)
  initModalEvents();
  
  // Mostrar modal (Bootstrap 5)
  const modalInstance = new bootstrap.Modal(modal[0]);
  modalInstance.show();
}

/**
 * Actualiza el total en el modal según la cantidad seleccionada
 */
function updateModalTotal() {
  const modal = $('#productoModal');
  const productData = modal.data('product');
  
  if (!productData) return;
  
  const quantity = parseInt(modal.find('#modalQuantity').val()) || 1;
  const total = productData.price * quantity;
  
  modal.find('#modalTotal').text(formatPrice(total));
}

/**
 * Inicializa los eventos del modal de producto
 * Se llama cada vez que se abre el modal
 */
function initModalEvents() {
  const modal = $('#productoModal');
  
  if (!modal.length) {
    console.warn('⚠️ Modal #productoModal no encontrado');
    return;
  }
  
  console.log('🔧 Inicializando eventos del modal...');
  
  // Botón "-" (disminuir cantidad)
  modal.find('#modalQuantityMinus').off('click').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const $input = modal.find('#modalQuantity');
    let val = parseInt($input.val()) || 1;
    
    console.log('➖ Botón - presionado, valor actual:', val);
    
    if (val > 1) {
      $input.val(val - 1);
      updateModalTotal();
      console.log('✅ Nueva cantidad:', val - 1);
    }
  });
  
  // Botón "+" (aumentar cantidad)
  modal.find('#modalQuantityPlus').off('click').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const $input = modal.find('#modalQuantity');
    const productData = modal.data('product');
    let val = parseInt($input.val()) || 1;
    
    console.log('➕ Botón + presionado, valor actual:', val, 'stock:', productData.stock);
    
    if (productData && val < productData.stock) {
      $input.val(val + 1);
      updateModalTotal();
      console.log('✅ Nueva cantidad:', val + 1);
    } else {
      console.warn('⚠️ Stock máximo alcanzado');
    }
  });
  
  // Input de cantidad (validar al cambiar)
  modal.find('#modalQuantity').off('change').on('change', function() {
    const productData = modal.data('product');
    let val = parseInt($(this).val()) || 1;
    
    console.log('🔢 Input cambiado, valor:', val);
    
    // Validar límites
    if (val < 1) val = 1;
    if (productData && val > productData.stock) val = productData.stock;
    
    $(this).val(val);
    updateModalTotal();
  });
  
  // Botón "Agregar al Carrito"
  modal.find('#modalAddToCart').off('click').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const productData = modal.data('product');
    const quantity = parseInt(modal.find('#modalQuantity').val()) || 1;
    
    console.log('🛒 Agregando al carrito:', productData.title, 'x', quantity);
    
    // Agregar al carrito
    addToCart(productData, quantity);
    
    // Cerrar modal de manera robusta
    const modalElement = modal[0];
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    
    if (modalInstance) {
      modalInstance.hide();
    } else {
      // Si no hay instancia, crear una y cerrar
      const newInstance = new bootstrap.Modal(modalElement);
      newInstance.hide();
    }
    
    // Alternativa adicional: forzar cierre con jQuery
    modal.modal('hide');
    
    // Limpiar backdrop si queda
    setTimeout(() => {
      $('.modal-backdrop').remove();
      $('body').removeClass('modal-open').css('padding-right', '');
    }, 300);
    
    console.log(`✅ ${productData.title} x${quantity} agregado desde modal`);
  });
  
  console.log('✅ Eventos del modal inicializados');
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES DE UI
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Muestra un spinner de carga en un contenedor específico
 * @param {string} selector - Selector jQuery del contenedor
 */
function showLoadingSpinner(selector) {
  const $container = $(selector);
  $container.html(`
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3">Cargando productos...</p>
    </div>
  `);
}

/**
 * Muestra un mensaje de error en un contenedor
 * @param {string} selector - Selector jQuery del contenedor
 * @param {string} message - Mensaje de error
 */
function showErrorMessage(selector, message) {
  const $container = $(selector);
  $container.html(`
    <div class="col-12">
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        ${escapeHtml(message)}
      </div>
    </div>
  `);
}

/**
 * Muestra un mensaje cuando no hay productos
 * @param {string} selector - Selector jQuery del contenedor
 * @param {string} message - Mensaje a mostrar
 */
function showEmptyMessage(selector, message) {
  const $container = $(selector);
  $container.html(`
    <div class="col-12 text-center py-5">
      <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
      <p class="mt-3 text-muted">${escapeHtml(message)}</p>
    </div>
  `);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE 7: CATEGORÍAS (SCROLL SUAVE)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa los botones de categorías con scroll suave
 * 
 * Funcionalidad:
 * - Click en categoría → Scroll suave a la sección del catálogo
 * - Offset para header fijo
 * - Carga catálogo si no existe
 * 
 * Categorías esperadas:
 * - #pescado
 * - #mariscos
 * - #congelado
 * - #conservas
 * - #preparados
 * - #especialidades
 */
function initCategoryButtons() {
  console.log('🎯 Inicializando botones de categorías...');
  
  // Evento click en todos los links de categorías
  $('.category-link').off('click').on('click', function(e) {
    e.preventDefault();
    
    const targetId = $(this).attr('href');
    const categoryName = $(this).data('cat');
    
    console.log(`🔍 Click en categoría: ${categoryName} → ${targetId}`);
    
    // Verificar si la sección existe
    const $targetSection = $(targetId);
    
    if ($targetSection.length) {
      // Scroll suave a la sección
      scrollToElementById(targetId);
    } else {
      console.warn(`⚠️ Sección ${targetId} no encontrada. Cargando catálogo...`);
      
      // Si el catálogo no está cargado, cargarlo primero
      if ($('#catalogo-sections-container').length && $('#catalogo-sections-container').children().length === 0) {
        loadCatalog().then(() => {
          // Después de cargar, hacer scroll
          setTimeout(() => {
            scrollToElementById(targetId);
          }, 500);
        });
      } else {
        // Si el contenedor no existe, mostrar mensaje
        console.error('❌ Contenedor de catálogo no encontrado');
        alert('El catálogo no está disponible en esta página');
      }
    }
  });
  
  console.log('✅ Botones de categorías inicializados');
}

/**
 * Realiza scroll suave a un elemento por su ID
 * 
 * @param {string} elementId - ID del elemento (con #)
 * @param {number} offset - Offset adicional desde el top (default: 100px)
 */
function scrollToElementById(elementId, offset = 100) {
  const $element = $(elementId);
  
  if (!$element.length) {
    console.warn(`⚠️ Elemento ${elementId} no encontrado para scroll`);
    return;
  }
  
  // Calcular posición con offset para header fijo
  const elementPosition = $element.offset().top;
  const scrollPosition = elementPosition - offset;
  
  console.log(`🎯 Scroll a ${elementId} (posición: ${scrollPosition}px)`);
  
  // Scroll suave con jQuery
  $('html, body').animate({
    scrollTop: scrollPosition
  }, 800, 'swing', function() {
    console.log(`✅ Scroll completado a ${elementId}`);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS (para uso en otros módulos si es necesario)
// ═══════════════════════════════════════════════════════════════════════════

window.loadFeaturedProducts = loadFeaturedProducts;
window.loadCatalog = loadCatalog;
window.openProductModal = openProductModal;
window.scrollToElementById = scrollToElementById;

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN HELPER: ADD TO CART (Wrapper para CART.addItem)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrapper para agregar productos al carrito
 * Convierte formato de productData a formato esperado por cart.js
 */
function addToCart(productData, quantity = 1) {
  // Verificar que la función global addToCart existe
  if (typeof window.CART === 'undefined' || typeof window.CART.addToCart !== 'function') {
    console.error('❌ cart.js no está cargado - addToCart no disponible');
    return;
  }
  
  // Convertir formato de productData al formato esperado por cart.js
  const product = {
    id: productData.id,
    name: productData.title || productData.name || productData.nombre,
    price: productData.price || productData.precio,
    image: productData.img || productData.image || productData.imagen,
    category: productData.category || productData.categoria
  };
  
  // Llamar a la función global addToCart de cart.js
  const result = window.CART.addToCart(product, quantity);
  
  if (result.success) {
    console.log(`✅ ${product.name} x${quantity} agregado al carrito`);
    
    // Actualizar badge del carrito
    if (typeof updateCartBadge === 'function') {
      updateCartBadge();
    }
    
    // Renderizar carrito si está abierto
    if (typeof renderCartOffcanvas === 'function') {
      renderCartOffcanvas();
    }
  } else {
    console.error(`❌ Error al agregar al carrito: ${result.message}`);
  }
}