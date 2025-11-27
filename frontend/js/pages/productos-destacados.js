/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PRODUCTOS DESTACADOS - LÓGICA DE CARGA Y RENDERIZADO
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Maneja 3 estados:
 * 1. Cargando (spinner)
 * 2. Vacío (no hay productos destacados)
 * 3. Con productos (renderiza cards)
 */

/**
 * Inicializa la sección de productos destacados
 * Se llama desde index.html después de cargar el componente
 */
async function initProductosDestacados() {
  console.log('🎨 Inicializando Productos Destacados...');
  
  try {
    // Obtener productos destacados del backend
    const productos = await API.getProductosDestacados();
    
    // Verificar si hay productos
    if (!productos || productos.length === 0) {
      mostrarEstadoVacio();
      return;
    }
    
    // Renderizar productos
    renderizarProductosDestacados(productos);
    
  } catch (error) {
    console.error('❌ Error cargando productos destacados:', error);
    mostrarError();
  }
}

/**
 * Muestra el estado vacío (sin productos destacados)
 */
function mostrarEstadoVacio() {
  console.log('📭 No hay productos destacados disponibles');
  
  const loading = document.getElementById('productos-loading');
  const empty = document.getElementById('productos-empty');
  const grid = document.getElementById('productos-grid');
  
  if (loading) loading.style.display = 'none';
  if (empty) empty.style.display = 'block';
  if (grid) grid.style.display = 'none';
}

/**
 * Muestra error al cargar productos
 */
function mostrarError() {
  console.log('❌ Error al cargar productos');
  
  const loading = document.getElementById('productos-loading');
  const empty = document.getElementById('productos-empty');
  const grid = document.getElementById('productos-grid');
  
  if (loading) loading.style.display = 'none';
  if (grid) grid.style.display = 'none';
  
  if (empty) {
    empty.style.display = 'block';
    empty.innerHTML = `
      <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
      <h4 class="mt-3">Error al cargar productos</h4>
      <p class="text-muted">No pudimos conectar con el servidor. Por favor, intenta más tarde.</p>
      <button class="btn btn-primary mt-2" onclick="initProductosDestacados()">
        <i class="bi bi-arrow-clockwise me-2"></i>
        Reintentar
      </button>
    `;
  }
}

/**
 * Renderiza los productos destacados en el grid
 * @param {Array} productos - Array de productos del backend
 */
function renderizarProductosDestacados(productos) {
  console.log(`✅ Renderizando ${productos.length} productos destacados`);
  
  const loading = document.getElementById('productos-loading');
  const empty = document.getElementById('productos-empty');
  const grid = document.getElementById('productos-grid');
  const template = document.getElementById('producto-destacado-template');
  
  if (!grid || !template) {
    console.error('❌ No se encontró el grid o template');
    return;
  }
  
  // Ocultar loading y empty
  if (loading) loading.style.display = 'none';
  if (empty) empty.style.display = 'none';
  
  // Mostrar grid
  grid.style.display = 'flex';
  grid.innerHTML = ''; // Limpiar contenido previo
  
  // Renderizar cada producto
  productos.forEach(producto => {
    const card = crearCardProducto(producto, template);
    grid.appendChild(card);
  });
  
  console.log('✅ Productos destacados renderizados correctamente');
}

/**
 * Crea una card de producto desde el template
 * @param {Object} producto - Datos del producto
 * @param {HTMLTemplateElement} template - Template de la card
 * @returns {HTMLElement} Card del producto
 */
function crearCardProducto(producto, template) {
  // Clonar template
  const clone = template.content.cloneNode(true);
  
  // Obtener elementos
  const card = clone.querySelector('.producto-card');
  const img = clone.querySelector('.producto-img');
  const nombre = clone.querySelector('.producto-nombre');
  const descripcion = clone.querySelector('.producto-descripcion');
  const precio = clone.querySelector('.producto-precio');
  const btnAgregar = clone.querySelector('.btn-agregar-carrito');
  
  // Llenar datos
  if (img) img.src = producto.imagen || producto.imageUrl || 'https://picsum.photos/seed/default/400/300';
  if (img) img.alt = producto.nombre || producto.name;
  if (nombre) nombre.textContent = producto.nombre || producto.name;
  if (descripcion) descripcion.textContent = producto.descripcion || producto.description || '';
  if (precio) precio.textContent = formatPrice(producto.precio || producto.price);
  
  // Guardar datos en el elemento para el modal
  if (card) {
    card.dataset.id = producto._id || producto.id;
    card.dataset.nombre = producto.nombre || producto.name;
    card.dataset.descripcion = producto.descripcion || producto.description || '';
    card.dataset.precio = producto.precio || producto.price;
    card.dataset.imagen = producto.imagen || producto.imageUrl || '';
    card.dataset.stock = producto.stock || 0;
    
    // Click en la card abre el modal
    card.addEventListener('click', (e) => {
      // Si el click fue en el botón, no abrir modal
      if (e.target.closest('.btn-agregar-carrito')) return;
      abrirModalProducto(producto);
    });
  }
  
  // Botón agregar al carrito
  if (btnAgregar) {
    btnAgregar.addEventListener('click', (e) => {
      e.stopPropagation(); // Evitar que se abra el modal
      agregarAlCarritoDesdeDestacados(producto);
    });
  }
  
  return clone;
}

/**
 * Agrega un producto al carrito desde la sección de destacados
 * @param {Object} producto - Datos del producto
 */
function agregarAlCarritoDesdeDestacados(producto) {
  console.log('🛒 Agregando producto destacado al carrito:', producto.nombre || producto.name);
  
  // Usar la función global de cart.js
  if (typeof CART !== 'undefined' && typeof CART.addItem === 'function') {
    CART.addItem({
      id: producto._id || producto.id,
      nombre: producto.nombre || producto.name,
      precio: producto.precio || producto.price,
      imagen: producto.imagen || producto.imageUrl,
      cantidad: 1
    });
    
    // Mostrar mensaje de éxito
    if (typeof UTILS !== 'undefined' && typeof UTILS.showToast === 'function') {
      UTILS.showToast('Producto agregado al carrito', 'success');
    }
  } else {
    console.error('❌ CART no está disponible');
  }
}

/**
 * Abre el modal de producto con los datos
 * @param {Object} producto - Datos del producto
 */
function abrirModalProducto(producto) {
  console.log('🔍 Abriendo modal de producto:', producto.nombre || producto.name);
  
  // Usar la función global del modal si existe
  if (typeof window.openProductModal === 'function') {
    window.openProductModal(producto);
  } else {
    console.warn('⚠️ Modal de producto no disponible');
  }
}

// Exportar función para uso global
window.initProductosDestacados = initProductosDestacados;