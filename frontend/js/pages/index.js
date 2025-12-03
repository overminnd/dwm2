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
 * Normaliza slugs para evitar errores cuando una categoría es nueva,
 * tiene caracteres especiales, acentos o espacios.
 * Esto lo deja Admin-Ready.
 */
function normalizeSlug(slug) {
  if (!slug || typeof slug !== "string") return "categoria";

  return slug
    .toLowerCase()
    .trim()
    .normalize("NFD")                  // separar acentos
    .replace(/[\u0300-\u036f]/g, "")   // remover acentos
    .replace(/[^a-z0-9-]/g, "-")       // caracteres inválidos → guion
    .replace(/--+/g, "-")              // colapsar múltiples guiones
    .replace(/^-+|-+$/g, "");          // remover guiones extremos
}


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
    console.log('📚 Cargando catálogo completo…');

    const $container = $('#catalogo-sections-container');

    if (!$container.length) {
      console.error('❌ Contenedor #catalogo-sections-container no encontrado');
      return;
    }

    // -------------------------------------------------------------------------------------------------------------------
    // 1) Mostrar loader (pero SIN eliminar el contenedor)
    // -------------------------------------------------------------------------------------------------------------------
    // Limpia SOLO contenido dinámico, pero mantiene loader si ya existe
    $container.children(':not(#catalogo-loader)').remove();

    // Crear loader si no existe
    if (!$('#catalogo-loader').length) {
      $container.prepend(`
        <div id="catalogo-loader" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Cargando catálogo…</p>
        </div>
      `);
    } else {
      $('#catalogo-loader').show();
    }

    // -------------------------------------------------------------------------------------------------------------------
    // 2) Obtener categorías desde backend
    // -------------------------------------------------------------------------------------------------------------------
    console.log('🔍 Obteniendo categorías desde backend…');
    const categoriesResult = await getCategories();

    if (!categoriesResult || !categoriesResult.success) {
      console.error('❌ Error al obtener categorías:', categoriesResult?.error);
      showErrorMessage('#catalogo-sections-container', 'Error al cargar las categorías');
      return;
    }

    const categories = categoriesResult.data;

    if (!Array.isArray(categories) || categories.length === 0) {
      console.warn('⚠️ No hay categorías disponibles');
      showEmptyMessage('#catalogo-sections-container', 'No hay categorías disponibles');
      return;
    }

    console.log(`✅ ${categories.length} categorías obtenidas`, categories);

    // -------------------------------------------------------------------------------------------------------------------
    // 3) Limpiar resultados previos y preparar render dinámico
    // -------------------------------------------------------------------------------------------------------------------
    // Importante: aquí SÍ limpiamos, pero dejamos el loader arriba.
    $container.children(':not(#catalogo-loader)').remove();

    // -------------------------------------------------------------------------------------------------------------------
    // 4) Cargar productos por categoría
    // -------------------------------------------------------------------------------------------------------------------
    for (const category of categories) {
      try {
        await loadCategorySection(category);
      } catch (errCat) {
        console.warn(`⚠️ Error en categoría ${category.name}:`, errCat);
      }
    }

    // -------------------------------------------------------------------------------------------------------------------
    // 5) Inicializar eventos de productos
    // -------------------------------------------------------------------------------------------------------------------
    try {
      initProductCardEvents();
    } catch (errEvents) {
      console.error("❌ Error inicializando eventos de cards:", errEvents);
    }

    // -------------------------------------------------------------------------------------------------------------------
    // 6) Ocultar loader
    // -------------------------------------------------------------------------------------------------------------------
    $('#catalogo-loader').fadeOut(300);

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
    const sectionId = CATEGORY_SLUG_TO_ID[category.slug] 
                   || normalizeSlug(category.slug)
                   || normalizeSlug(category.name);

    if (!category || !category._id) {
      renderCategoryErrorSection({ slug: sectionId, name: "Categoría inválida" }, "Datos incompletos en backend");
      return;
    }

    // Obtener productos
    const productsResult = await getProducts({ categoryId: category._id });

    if (!productsResult || !productsResult.success) {
      console.error(`❌ Error obteniendo productos de ${category.name}:`, productsResult?.error);

      // Mostrar mensaje en vez de silenciar el error
      renderCategoryErrorSection(category, "Error cargando los productos de esta categoría");
      return;
    }

    const products = productsResult.data;

    if (!products || products.length === 0) {
      console.warn(`⚠️ No hay productos en la categoría: ${category.name}`);
      renderEmptyCategorySection(category);
      return;
    }

    console.log(`✅ ${products.length} productos cargados para ${category.name}`);

    // Renderizar sección normalmente
    renderCategorySection(category, products);

  } catch (error) {
    console.error(`❌ Excepción al cargar categoría ${category?.name}:`, error);

    // Fallback visual
    renderCategoryErrorSection(category, "Ocurrió un error inesperado");
  }
}

function renderEmptyCategorySection(category) {
  let sectionId = CATEGORY_SLUG_TO_ID[category.slug] 
             || normalizeSlug(category.slug)
             || normalizeSlug(category.name);

  $('#catalogo-sections-container').append(`
    <section id="${sectionId}" class="catalogo-section mb-5">
      <div class="container">

        <!-- Header idéntico al de renderCategorySection -->
        <h3 class="mb-4 text-uppercase fw-bold"
            style="color: #003366; border-bottom: 3px solid #4db6ac; padding-bottom: 10px;">
          ${escapeHtml(category.name)}
        </h3>

        <!-- Grid idéntico, pero mostrando mensaje vacío -->
        <div class="row g-4" id="${sectionId}-grid">
          <div class="col-12">
            <p class="text-center text-muted fs-5 py-4">
              No hay productos disponibles en esta categoría.
            </p>
          </div>
        </div>

      </div>
    </section>
  `);
}



function renderCategoryErrorSection(category, message) {
  // Normalizar ID de la sección para que sea compatible con el resto
  let sectionId = CATEGORY_SLUG_TO_ID[category?.slug] 
               || normalizeSlug(category?.slug)
               || normalizeSlug(category?.name || 'categoria');

  const $container = $('#catalogo-sections-container');
  if (!$container.length) {
    console.error('❌ Contenedor #catalogo-sections-container no encontrado en renderCategoryErrorSection');
    return;
  }

  const safeName = escapeHtml(category?.name || 'Categoría');
  const safeMessage = escapeHtml(message || 'Ocurrió un error al cargar esta categoría.');

  $container.append(`
    <section id="${sectionId}" class="catalogo-section mb-5">
      <div class="container">
        
        <!-- Header similar, pero marcado como error -->
        <h3 class="mb-4 text-uppercase fw-bold text-danger"
            style="border-bottom: 3px solid #dc3545; padding-bottom: 10px;">
          ${safeName}
        </h3>

        <div class="row g-4">
          <div class="col-12">
            <div class="alert alert-danger text-center" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              ${safeMessage}
            </div>
          </div>
        </div>

      </div>
    </section>
  `);
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
  let sectionId = CATEGORY_SLUG_TO_ID[category.slug] 
             || normalizeSlug(category.slug)
             || normalizeSlug(category.name);
  
  // Si el slug termina en 's', quitarla para el ID (pescados → pescado)
  if (!CATEGORY_SLUG_TO_ID[category.slug] && category.slug.endsWith('s')) {
    sectionId = category.slug.slice(0, -1);
  }

  // Contenedor principal del catálogo
  const $container = $('#catalogo-sections-container');
  if (!$container.length) {
    console.error('❌ Contenedor #catalogo-sections-container no encontrado en renderCategorySection');
    return;
  }
  
  // Crear sección
  const $section = $(`
    <section id="${sectionId}" class="catalogo-section mb-5">
      <div class="container">
        <!-- Header de la categoría -->
        <h3 class="mb-4 text-uppercase fw-bold" 
            style="color: #003366; border-bottom: 3px solid #4db6ac; padding-bottom: 10px;">
          ${escapeHtml(category.name)}
        </h3>
        
        <!-- Grid de productos -->
        <div class="row g-4" id="${sectionId}-grid"></div>
      </div>
    </section>
  `);
  
  // Agregar sección al contenedor
  $container.append($section);
  
  // Renderizar productos en el grid
  const $grid = $section.find(`#${sectionId}-grid`);
  
  if (!products || products.length === 0) {
    // Mostrar mensaje de categoría vacía (fallback)
    $grid.html(`
      <div class="col-12">
        <div class="alert alert-info text-center" role="alert">
          <i class="bi bi-inbox me-2"></i>
          No hay productos disponibles en esta categoría
        </div>
      </div>
    `);
  } else {
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
  const id = product._id || '';
  const nombre = product.name || 'Producto sin nombre';
  const precio = product.price || 0;
  const shortDesc = product.shortDescription || '';
  const fullDesc = product.description || shortDesc;
  const imagen = product.mainImage || CONFIG.DEFAULT_IMAGE;
  const stock = product.stock || 0;

  const precioFormateado = formatPrice(precio);

  return $(`
    <div class="col-md-4">
      <div class="card h-100 shadow-sm producto-card"
           role="button"
           tabindex="0"
           data-product-id="${id}">

        <div class="row g-0 h-100">

          <!-- Imagen -->
          <div class="col-5">
            <img src="${imagen}"
                 class="img-fluid h-100 rounded-start object-fit-cover"
                 alt="${escapeHtml(nombre)}"
                 onerror="this.src='${CONFIG.DEFAULT_IMAGE}'">
          </div>

          <!-- Contenido -->
          <div class="col-7 d-flex flex-column justify-content-between p-3">
            <div>
              <h5 class="fw-bold mb-1 producto-title">${escapeHtml(nombre)}</h5>
              <p class="mb-2 small producto-short-desc">${escapeHtml(shortDesc)}</p>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-auto">
              <span class="fw-bold text-success producto-precio" data-price="${precio}">
                ${precioFormateado}
              </span>

              <button class="btn btn-light rounded-circle btn-sm add-to-cart-quick"
                      aria-label="Agregar rápido al carrito"
                      ${stock === 0 ? 'disabled' : ''}>
                +
              </button>
            </div>

            ${stock === 0 ? '<small class="text-danger">Sin stock</small>' : ''}
          </div>

        </div>
      </div>
    </div>
  `);
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
  
  // Click en card: abrir modal (solo enviamos el ID al modal)
  $('.producto-card').off('click').on('click', function(e) {

    // Evitar apertura si se hace click en "+"
    if ($(e.target).hasClass('add-to-cart-quick') ||
        $(e.target).closest('.add-to-cart-quick').length) {
      return;
    }

    const productId = $(this).data('product-id');
    openProductModal(productId);  // <--- ahora enviamos SOLO el ID
  });

  // Botón "+": agregar rápido
  $('.add-to-cart-quick').off('click').on('click', async function(e) {
    e.stopPropagation();

    const productId = $(this).closest('.producto-card').data('product-id');

    // 1) Consultar datos reales al backend
    const result = await getProductById(productId);

    if (!result.success) {
      console.error("❌ No se pudo obtener el producto rápido:", result.error);
      return;
    }

    const p = result.data;

    // 2) Formato que el carrito espera
    const product = {
      _id: p._id,
      name: p.name,
      price: p.price,
      mainImage: p.mainImage,
      stock: p.stock
    };

    // 3) Agregar al carrito
    addToCart(product, 1);

    // 4) Feedback visual
    const $btn = $(this);
    const originalText = $btn.html();
    $btn.html('✓').prop('disabled', true);

    setTimeout(() => {
      $btn.html(originalText).prop('disabled', false);
    }, 800);
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
async function openProductModal(productId) {

  const modal = $('#productoModal');

  if (!modal.length) {
    console.error('❌ Modal #productoModal no encontrado');
    return;
  }

  // Mostrar modal inmediatamente con loader
  const modalInstance = new bootstrap.Modal(modal[0]);
  modalInstance.show();

  // Loader temporal dentro del modal
  modal.find('#modalProductTitle').text('Cargando...');
  modal.find('#modalProductImage').attr(
    'src',
    'https://i.gifer.com/ZZ5H.gif'
  );

  modal.find('#modalProductDescription').text('');
  modal.find('#modalProductPrice').text('');
  modal.find('#modalProductStock').text('');
  modal.find('#modalTotal').text('$0');

  try {
    console.log('🔍 Consultando backend…', productId);

    const result = await getProductById(productId);

    if (!result.success) {
      console.error('❌ Error backend:', result.error);
      modal.find('#modalProductTitle').text('Error al cargar producto');
      modal.find('#modalProductDescription').text(result.error.message);
      return;
    }

    const p = result.data;

    // Guardar datos para cálculos posteriores
    modal.data('product', {
      id: p._id,
      title: p.name,
      fullDesc: p.description,
      price: p.price,
      stock: p.stock,
      img: p.mainImage
    });

    // Rellenar modal
    modal.find('#modalProductTitle').text(p.name);
    modal.find('#modalProductImage').attr('src', p.mainImage);
    modal.find('#modalProductDescription').text(p.description || '');
    modal.find('#modalProductPrice').text(formatPrice(p.price));
    modal.find('#modalProductStock').text(p.stock);

    // Cantidad inicial
    modal.find('#modalQuantity').val(1);
    updateModalTotal();

    // Activar eventos del modal
    initModalEvents();

  } catch (error) {
    console.error('❌ Error inesperado:', error);

    modal.find('#modalProductTitle').text('Error al cargar');
    modal.find('#modalProductDescription').text('No se pudo cargar este producto.');
  }
}


/**
 * Actualiza el total en el modal según la cantidad seleccionada
 */
function updateModalTotal() {
  const modal = $('#productoModal');
  const productData = modal.data('product');

  if (!productData) return;

  const quantity = parseInt(modal.find('#modalQuantity').val()) || 1;
  modal.find('#modalTotal').text(formatPrice(productData.price * quantity));
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
 * Asegura que cart.js reciba la estructura correcta
 */
/**
 * Wrapper para agregar productos al carrito
 * Asegura que cart.js reciba la estructura correcta
 */

function addToCart(productData, quantity = 1) {
  if (!window.CART || typeof window.CART.addToCart !== "function") {
    console.error("❌ CART.addToCart no está disponible.");
    return;
  }

  // 1) Bloquear invitados desde aquí también (doble seguridad)
  if (typeof isAuthenticated === "function" && !isAuthenticated()) {
    if (typeof showAuthRequiredModal === "function") {
      showAuthRequiredModal();
    } else if (typeof showToast === "function") {
      showToast("Debes iniciar sesión para agregar productos al carrito", "warning");
    }
    return;
  }

  // 2) Convertir formato a lo que cart.js espera
  const product = {
    _id: productData.id || productData._id,
    name: productData.title || productData.name,
    price: productData.price,
    mainImage: productData.img || productData.mainImage,
    stock: productData.stock
  };

  // 3) Delegar en cart.js
  window.CART.addToCart(product, quantity);
}





$(document).ready(function () {
  UTILS.loadComponent("header-container", "components/header.html", function () {
    if (typeof initHeader === "function") initHeader();
    updateHeaderCartVisibility(); // MOSTRAR / OCULTAR botón del carrito
  });


    UTILS.loadComponent("carrito-container", "components/carrito.html", function () {
    if (typeof initCartUI === 'function') {
      initCartUI();
    }
    // Inicializar badge con lo que haya en localStorage
    if (typeof updateCartBadge === 'function') {
      updateCartBadge();
    }
  });

  UTILS.loadComponent("carrusel-container", "components/carrusel.html");

  UTILS.loadComponent("categorias-container", "components/categorias.html", function() {
    if (typeof initCategoryButtons === 'function') {
      initCategoryButtons();
    } else {
      console.error("❌ initCategoryButtons no está definida.");
    }
  });


  UTILS.loadComponent("productos-destacados-container", "components/ProductoDestacado.html", function() {
    if (typeof loadFeaturedProducts === 'function') loadFeaturedProducts(4);
  });

  UTILS.loadComponent("catalogo-container", "components/catalogo.html", function() {
    if (typeof loadCatalog === 'function') loadCatalog();
  });

  
});


