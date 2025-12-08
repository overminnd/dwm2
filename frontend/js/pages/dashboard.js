/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MARAZUL - PANEL ADMIN (PRODUCTOS Y CATEGORÍAS)
 * ═══════════════════════════════════════════════════════════════════════════
 */

let productModalInstance = null;
let categoryModalInstance = null;
let adminProductsCache = []; // cache con los productos cargados


$(document).ready(async () => {
  console.log("🛠️ Cargando Panel Admin...");

  // 1) Verificar autenticación
  if (!isAuthenticated()) {
    alert("Debes iniciar sesión como administrador.");
    navigateTo(CONFIG.ROUTES.LOGIN);
    return;
  }

  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    alert("Acceso solo para administradores.");
    navigateTo(CONFIG.ROUTES.HOME);
    return;
  }

  // 2) Cargar header y carrito usando UTILS + CONFIG.COMPONENTS
  UTILS.loadComponent("header-container", CONFIG.COMPONENTS.HEADER, function () {
    if (typeof initHeader === "function") initHeader();
  });

  UTILS.loadComponent("carrito-container", CONFIG.COMPONENTS.CARRITO, function () {
    console.log("🛒 Carrito cargado en admin (para pruebas).");
  });

  // 3) Inicializar modals (Bootstrap)
  productModalInstance = new bootstrap.Modal(document.getElementById("productModal"));
  categoryModalInstance = new bootstrap.Modal(document.getElementById("categoryModal"));

  // 4) Eventos de botones principales
  $("#btn-new-product").on("click", () => openProductModalForCreate());
  $("#btn-new-category").on("click", () => openCategoryModalForCreate());

  $("#product-form").on("submit", handleProductFormSubmit);
  $("#category-form").on("submit", handleCategoryFormSubmit);

  // 5) Cargar datos iniciales
  await Promise.all([loadAdminProducts(), loadAdminCategories()]);
});

/* =====================================================
   UTILIDAD PARA ALERTAS (productos / categorías)
===================================================== */
function showAlert(targetId, message, type = "danger") {
  const $target = $(`#${targetId}`);
  if ($target.length === 0) return;

  if (!message) {
    $target.html("");
    return;
  }

  const icon = type === "success" ? "bi-check-circle" : "bi-exclamation-triangle";

  const html = `
    <div class="alert alert-${type} d-flex align-items-center py-2 px-3" role="alert">
      <i class="bi ${icon} me-2"></i>
      <div>${message}</div>
    </div>
  `;
  $target.html(html);
}

/* =====================================================
   PRODUCTOS - LISTAR
===================================================== */

async function loadAdminProducts() {
  const $tbody = $("#products-tbody");
  $tbody.html(`
    <tr>
      <td colspan="6" class="text-center text-muted py-3">
        Cargando productos...
      </td>
    </tr>`);

  showAlert("products-alert", "");

  let response;
  try {
    response = await API.adminGetProducts();
  } catch (error) {
    console.error("❌ Error adminGetProducts:", error);
    $tbody.html(`
      <tr>
        <td colspan="6" class="text-center text-danger py-3">
          Error al cargar productos.
        </td>
      </tr>`);
    showAlert("products-alert", "No se pudieron cargar los productos.", "danger");
    return;
  }

  if (!response || !response.success) {
    $tbody.html(`
      <tr>
        <td colspan="6" class="text-center text-danger py-3">
          Error al cargar productos.
        </td>
      </tr>`);
    showAlert("products-alert", response?.message || "Error desconocido.", "danger");
    return;
  }

  const products = response.data || response.products || [];
  adminProductsCache = products; // 👈 guardamos los productos en cache

  if (products.length === 0) {
    $tbody.html(`
      <tr>
        <td colspan="6" class="text-center text-muted py-3">
          No hay productos registrados.
        </td>
      </tr>`);
    return;
  }

  $tbody.html("");

  products.forEach((p) => {
    const categoryName = p.categoryId?.name || p.category?.name || "Sin categoría";

    // 👇 usamos active para mostrar estado y togglear
        // 👇 usamos status REAL del backend
    const status = p.status || "draft";
    const isActive = status === "published";

    const statusLabel = isActive
      ? '<span class="badge bg-success">Activo</span>'
      : '<span class="badge bg-secondary">Deshabilitado</span>';

    const toggleLabel = isActive ? "Deshabilitar" : "Habilitar";
    const nextStatus = isActive ? "retired" : "published";


    // 👇 obtenemos imagen (seguro con fallback)
    const imgUrl =
      p.mainImage ||
      p.image ||
      (Array.isArray(p.images) && p.images[0]) ||
      CONFIG.IMAGES?.PLACEHOLDER_PRODUCT ||
      CONFIG.DEFAULT_IMAGE;

    const row = `
      <tr data-id="${p._id}">
        <td>
          <div class="d-flex align-items-center">
            <img 
              src="${imgUrl}" 
              alt="${escapeHtml(p.name || "")}" 
              class="me-2 rounded" 
              style="width:50px;height:50px;object-fit:cover;"
              onerror="this.src='${CONFIG.IMAGES?.PLACEHOLDER_PRODUCT || CONFIG.DEFAULT_IMAGE}'"
            >
            <div class="d-flex flex-column">
              <span>${escapeHtml(p.name || "")}</span>
              <small class="text-muted">${escapeHtml(categoryName)}</small>
            </div>
          </div>
        </td>
        <td>${escapeHtml(categoryName)}</td>
        <td class="text-end">$${Number(p.price || 0).toLocaleString("es-CL")}</td>
        <td class="text-center">${p.stock ?? 0}</td>
        <td class="text-center">${statusLabel}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" 
                  data-action="edit-product">
            <i class="bi bi-pencil"></i>
          </button>

          <button class="btn btn-sm btn-outline-danger" 
                  data-action="delete-product">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
    $tbody.append(row);
  });

  // Delegar eventos sobre el tbody
  $tbody.off("click").on("click", "button[data-action]", async function () {
    const $btn = $(this);
    const action = $btn.data("action");
    const $tr = $btn.closest("tr");
    const productId = $tr.data("id");
    if (!productId) return;

    if (action === "edit-product") {
      openProductModalForEdit(productId);


    } else if (action === "delete-product") {
      await handleDeleteProduct(productId);
    }
  });
}


/* =====================================================
   PRODUCTOS - MODAL CREAR/EDITAR
===================================================== */

function resetProductForm() {
  $("#product-id").val("");
  $("#product-name").val("");
  $("#product-price").val("");
  $("#product-stock").val("0");
  $("#product-short-description").val("");
  $("#product-long-description").val("");
  $("#product-category").val("");
}


/**
 * Carga categorías en el select del modal de producto
 * Se apoya en adminGetCategories (puede reutilizar el resultado en memoria luego).
 */
async function populateProductCategoriesSelect() {
  const $select = $("#product-category");
  $select.html('<option value="">Sin categoría</option>');

  let response;
  try {
    response = await API.adminGetCategories();
  } catch (error) {
    console.error("❌ Error adminGetCategories (para producto):", error);
    return;
  }

  if (!response || !response.success) return;

  const categories = response.data || [];
  categories.forEach((c) => {
    $select.append(
      `<option value="${c._id}">${escapeHtml(c.name || "Categoría")}</option>`
    );
  });
}

async function openProductModalForCreate() {
  resetProductForm();
  $("#productModalLabel").text("Nuevo producto");
  $("#product-save-btn").text("Crear");
  await populateProductCategoriesSelect();
  productModalInstance.show();
}

async function openProductModalForEdit(productId) {
  resetProductForm();
  $("#productModalLabel").text("Editar producto");
  $("#product-save-btn").text("Guardar cambios");

  await populateProductCategoriesSelect();

  // 👇 buscar producto EN LA CACHE
  const product = adminProductsCache.find((p) => p._id === productId);
  if (!product) {
    console.warn("Producto no encontrado en cache, recargando lista...");
    await loadAdminProducts();
    return;
  }

  // Nombre, precio, stock
  $("#product-id").val(productId);
  $("#product-name").val(product.name || "");
  $("#product-price").val(Number(product.price || 0));
  $("#product-stock").val(Number(product.stock || 0));
  $("#product-featured").prop("checked", product.featured === true);
  $("#product-mainImage").val(product.mainImage || "");


  // Categoría: probamos varios formatos posibles
  const catId =
  product.categoryId?._id ||
  product.categoryId ||
  product.category?._id ||
  null;

if (catId) {
  $("#product-category").val(catId.toString());
}


  // Descripciones: intentamos mapear a los nombres más comunes
  const shortDesc =
    product.shortDescription ||
    product.summary ||
    "";
  const longDesc =
    product.description ||
    product.longDescription ||
    product.detailedDescription ||
    "";

  $("#product-short-description").val(shortDesc);
  $("#product-long-description").val(longDesc);

  productModalInstance.show();
}


/* =====================================================
   PRODUCTOS - SUBMIT FORM
===================================================== */

async function handleProductFormSubmit(event) {
  event.preventDefault();

  const productId = $("#product-id").val();
  const name = $("#product-name").val().trim();
  const price = parseInt($("#product-price").val(), 10);
  const stock = parseInt($("#product-stock").val(), 10);
  const categoryId = $("#product-category").val() || null;
  const shortDescription = $("#product-short-description").val().trim();
  const longDescription = $("#product-long-description").val().trim();
  const featured = $("#product-featured").is(":checked");
  const mainImage = $("#product-mainImage").val().trim();

  if (!name) return alert("El nombre es obligatorio.");
  if (!Number.isInteger(price) || price < 0) return alert("Precio inválido");
  if (!Number.isInteger(stock) || stock < 0) return alert("Stock inválido");

  const payload = {
    name,
    price,
    stock,
    status: "published",       // 👈 SIEMPRE PUBLICADO
    featured: featured,        // 👈 NUEVO
    mainImage: mainImage       // 👈 NUEVO
  };

  if (categoryId) payload.categoryId = categoryId;
  if (shortDescription) payload.shortDescription = shortDescription;
  if (longDescription) payload.description = longDescription;

  const $btn = $("#product-save-btn");
  $btn.prop("disabled", true).text("Guardando...");

  try {
    let response = productId
      ? await API.adminUpdateProduct(productId, payload)
      : await API.adminCreateProduct(payload);

    if (!response || !response.success) {
      console.error("❌ Error:", response);
      alert(response?.message || "Error al guardar el producto.");
      return;
    }

    showAlert("products-alert",
      productId ? "Producto actualizado correctamente." : "Producto creado correctamente.",
      "success"
    );

    productModalInstance.hide();
    await loadAdminProducts();

  } catch (error) {
    console.error("❌ Error en handleProductFormSubmit:", error);
    alert("Error al guardar el producto.");
  } finally {
    $btn.prop("disabled", false).text(productId ? "Guardar cambios" : "Crear");
  }
}



/* =====================================================
   PRODUCTOS - TOGGLE STATUS / DELETE
===================================================== */




async function handleDeleteProduct(productId) {
  if (!confirm("¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
    return;
  }

  try {
    const response = await API.adminDeleteProduct(productId);
    if (!response || !response.success) {
      alert(response?.message || "No se pudo eliminar el producto.");
      return;
    }
    showAlert("products-alert", "Producto eliminado correctamente.", "success");
    await loadAdminProducts();
  } catch (error) {
    console.error("❌ Error handleDeleteProduct:", error);
    alert("Error al eliminar el producto.");
  }
}

/* =====================================================
   CATEGORÍAS - LISTAR
===================================================== */

async function loadAdminCategories() {
  const $tbody = $("#categories-tbody");
  $tbody.html(`
    <tr>
      <td colspan="4" class="text-center text-muted py-3">
        Cargando categorías...
      </td>
    </tr>`);

  showAlert("categories-alert", "");

  let response;
  try {
    response = await API.adminGetCategories();
  } catch (error) {
    console.error("❌ Error adminGetCategories:", error);
    $tbody.html(`
      <tr>
        <td colspan="4" class="text-center text-danger py-3">
          Error al cargar categorías.
        </td>
      </tr>`);
    showAlert("categories-alert", "No se pudieron cargar las categorías.", "danger");
    return;
  }

  if (!response || !response.success) {
    $tbody.html(`
      <tr>
        <td colspan="4" class="text-center text-danger py-3">
          Error al cargar categorías.
        </td>
      </tr>`);
    showAlert("categories-alert", response?.message || "Error desconocido.", "danger");
    return;
  }

  const categories = response.data || [];
  if (categories.length === 0) {
    $tbody.html(`
      <tr>
        <td colspan="4" class="text-center text-muted py-3">
          No hay categorías registradas.
        </td>
      </tr>`);
    return;
  }

  $tbody.html("");

  categories.forEach((c) => {
    const isActive = c.active !== false; // si no existe active, asumimos true
    const badge = isActive
      ? '<span class="badge bg-success">Activa</span>'
      : '<span class="badge bg-secondary">Inactiva</span>';

    const toggleLabel = isActive ? "Desactivar" : "Activar";

    const row = `
    <tr data-id="${c._id}">
      <td>${escapeHtml(c.name || "")}</td>
      <td>${escapeHtml(c.description || "")}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1" data-action="edit-category">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete-category">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
`;

    $tbody.append(row);
  });

  $tbody.off("click").on("click", "button[data-action]", async function () {
    const $btn = $(this);
    const action = $btn.data("action");
    const $tr = $btn.closest("tr");
    const categoryId = $tr.data("id");
    if (!categoryId) return;

    if (action === "edit-category") {
      openCategoryModalForEdit(categoryId);
    } else if (action === "toggle-category") {
      const currentText = $btn.text().trim();
      const makeActive = currentText === "Activar";
      await handleToggleCategory(categoryId, makeActive);
    } else if (action === "delete-category") {
      await handleDeleteCategory(categoryId);
    }
  });
}

/* =====================================================
   CATEGORÍAS - MODAL CREAR/EDITAR
===================================================== */

function resetCategoryForm() {
  $("#category-id").val("");
  $("#category-name").val("");
  $("#category-description").val("");
  $("#category-active").prop("checked", true);
}

function openCategoryModalForCreate() {
  resetCategoryForm();
  $("#categoryModalLabel").text("Nueva categoría");
  $("#category-save-btn").text("Crear");
  categoryModalInstance.show();
}

function openCategoryModalForEdit(categoryId) {
  resetCategoryForm();
  $("#categoryModalLabel").text("Editar categoría");
  $("#category-save-btn").text("Guardar cambios");

  const $row = $(`#categories-tbody tr[data-id="${categoryId}"]`);
  if ($row.length === 0) {
    console.warn("Categoría no encontrada en tabla, recargando lista...");
    loadAdminCategories();
    return;
  }

  const name = $row.children().eq(0).text().trim();
  const description = $row.children().eq(1).text().trim();
  const badgeText = $row.children().eq(2).text().trim();
  const isActive = badgeText === "Activa";

  $("#category-id").val(categoryId);
  $("#category-name").val(name);
  $("#category-description").val(description);
  $("#category-active").prop("checked", isActive);

  categoryModalInstance.show();
}

/* =====================================================
   CATEGORÍAS - SUBMIT FORM
===================================================== */

async function handleCategoryFormSubmit(event) {
  event.preventDefault();

  const categoryId = $("#category-id").val();
  const name = $("#category-name").val().trim();
  const description = $("#category-description").val().trim();
  const active = $("#category-active").is(":checked");

  if (!name) {
    alert("El nombre de la categoría es obligatorio.");
    return;
  }

  const payload = { name, description, active };

  const $btn = $("#category-save-btn");
  $btn.prop("disabled", true).text("Guardando...");

  try {
    let response;
    if (categoryId) {
      response = await API.adminUpdateCategory(categoryId, payload);
    } else {
      response = await API.adminCreateCategory(payload);
    }

    if (!response || !response.success) {
      console.error("❌ Error en guardar categoría:", response);
      alert(response?.message || "Error al guardar la categoría.");
      return;
    }

    showAlert(
      "categories-alert",
      categoryId ? "Categoría actualizada correctamente." : "Categoría creada correctamente.",
      "success"
    );
    categoryModalInstance.hide();
    await loadAdminCategories();
  } catch (error) {
    console.error("❌ Error handleCategoryFormSubmit:", error);
    alert("Error al guardar la categoría.");
  } finally {
    $btn.prop("disabled", false).text(categoryId ? "Guardar cambios" : "Crear");
  }
}

/* =====================================================
   CATEGORÍAS - TOGGLE / DELETE
===================================================== */

async function handleToggleCategory(categoryId, makeActive) {
  const msg = makeActive
    ? "¿Seguro que quieres ACTIVAR esta categoría?"
    : "¿Seguro que quieres DESACTIVAR esta categoría?";

  if (!confirm(msg)) return;

  try {
    const response = await API.adminToggleCategoryActive(categoryId, makeActive);
    if (!response || !response.success) {
      alert(response?.message || "No se pudo actualizar la categoría.");
      return;
    }
    showAlert("categories-alert", "Categoría actualizada correctamente.", "success");
    await loadAdminCategories();
  } catch (error) {
    console.error("❌ Error handleToggleCategory:", error);
    alert("Error al actualizar la categoría.");
  }
}

async function handleDeleteCategory(categoryId) {
  if (!confirm("¿Seguro que quieres eliminar esta categoría?")) return;

  try {
    const response = await API.adminDeleteCategory(categoryId);
    if (!response || !response.success) {
      alert(response?.message || "No se pudo eliminar la categoría.");
      return;
    }
    showAlert("categories-alert", "Categoría eliminada correctamente.", "success");
    await loadAdminCategories();
  } catch (error) {
    console.error("❌ Error handleDeleteCategory:", error);
    alert("Error al eliminar la categoría.");
  }
}

// Impedir letras en inputs numéricos
$(document).on("input", ".no-letters", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

$(document).on("input", "#product-mainImage", function () {
  const url = $(this).val().trim();
  const preview = $("#preview-mainImage");

  if (!url) {
    preview.addClass("d-none");
    return;
  }

  preview.attr("src", url).removeClass("d-none");
});
