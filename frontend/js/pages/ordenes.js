/**
 * MARAZUL - ÓRDENES (ADMIN)
 * Versión simplificada: solo restringir acceso por rol admin
 * y redirigir al cerrar sesión.
 */

$(document).ready(function () {
  console.log("📦 Cargando página de Órdenes...");

  // 1) Verificar autenticación y rol ADMIN
  try {
    if (typeof isAuthenticated === "function" && !isAuthenticated()) {
      console.warn("⚠️ Usuario no autenticado, redirigiendo...");
      window.location.href = CONFIG.ROUTES.HOME;
      return;
    }

    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      console.warn("⚠️ Acceso denegado: se requiere rol ADMIN.");
      window.location.href = CONFIG.ROUTES.HOME;
      return;
    }
  } catch (err) {
    console.error("❌ Error verificando acceso a órdenes:", err);
    window.location.href = CONFIG.ROUTES.HOME;
    return;
  }

  // 2) Cargar HEADER
  UTILS.loadComponent("header-container", "header.html", () => {
    if (typeof initHeader === "function") initHeader();
  });

  // 3) Cargar carrito con normalidad (YA NO LO BLOQUEAMOS)
  UTILS.loadComponent("carrito-container", "carrito.html");

  // 4) Cargar órdenes
  loadPendingOrders();
});

/* =====================================================
   1. CARGAR ÓRDENES PENDIENTES (ADMIN)
===================================================== */
async function loadPendingOrders() {
  const $list = $("#orders-list");
  $list.html(`<p class="text-muted">Cargando órdenes...</p>`);

  let response;

  try {
    response = await API.getAdminOrders("pending_payment");
  } catch (error) {
    console.error(error);
    $list.html(`<p class="text-danger">Error al cargar órdenes.</p>`);
    return;
  }

  if (!response.success || response.data.length === 0) {
    $list.html(`<p class="text-muted">No hay órdenes pendientes.</p>`);
    return;
  }

  $list.html("");

  response.data.forEach(order => {
    // 🛡 PREVENCIÓN TOTAL DE ERRORES
    const fecha = order.createdAt
      ? new Date(order.createdAt).toLocaleString()
      : "Fecha no disponible";

    const first = order.userId?.firstName ?? "Usuario";
    const last = order.userId?.lastName ?? "";

    const html = `
      <div class="card mb-3 shadow-sm border-primary">
        <div class="card-body d-flex justify-content-between align-items-center">
          
          <div>
            <h5 class="fw-bold" style="color:#003366;">Orden #${order.orderNumber}</h5>
            <p class="text-muted mb-0">
              Cliente: ${first} ${last}<br>
              Total: <b>$${order.total}</b><br>
              Fecha: ${fecha}
            </p>
          </div>

          <button class="btn btn-outline-primary" onclick="viewOrderDetails('${order._id}')">
            Ver Detalles
          </button>

        </div>
      </div>
    `;

    $list.append(html);
  });
}


/* =====================================================
   2. MOSTRAR DETALLE EN MODAL
===================================================== */
async function viewOrderDetails(orderId) {

  let response;
  try {
    response = await getOrderById(orderId);
  } catch (err) {
    console.error(err);
    alert("Error cargando detalles");
    return;
  }

  if (!response.success) {
    alert("Error cargando detalles");
    return;
  }

  const { order, items } = response.data;

  const fecha = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "Fecha desconocida";

  const first = order.userId?.firstName ?? "Usuario";
  const last = order.userId?.lastName ?? "";
  const email = order.userId?.email ?? "Sin email";

  let itemsHTML = "";
  items.forEach(it => {
    itemsHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <span>${it.productName} × ${it.quantity}</span>
        <b>$${it.subtotal}</b>
      </li>
    `;
  });

  const html = `
    <div class="p-2">
      <h4 class="fw-bold mb-3" style="color:#003366;">
        Detalle de Orden #${order.orderNumber}
      </h4>

      <p><b>Cliente:</b> ${first} ${last}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Fecha:</b> ${fecha}</p>

      <h5 class="mt-4 mb-2">Productos</h5>
      <ul class="list-group mb-3">
        ${itemsHTML}
      </ul>

      <p class="fs-5"><b>Total:</b> $${order.total}</p>

      <button class="btn btn-success w-100 fw-bold"
        onclick="markDelivered('${order._id}')">
        ✔ Marcar como Entregada
      </button>
    </div>
  `;

  $("#orderModalBody").html(html);

  // ABRIR MODAL CORRECTAMENTE
  const modal = new bootstrap.Modal(document.getElementById("orderModal"));
  modal.show();
}


/* =====================================================
   3. MARCAR ORDEN COMO ENTREGADA
===================================================== */
async function markDelivered(orderId) {
  if (!confirm("¿Confirmar entrega?")) return;

  try {
    const result = await API.updateOrderStatus(orderId, "delivered");

    if (!result.success) {
      alert("No se pudo marcar como entregada.");
      return;
    }

    alert("✔ Orden entregada");

    // cerrar modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("orderDetailsModal")
    );
    if (modal) modal.hide();

    loadPendingOrders();
  } catch (err) {
    console.error(err);
    alert("Error al actualizar estado.");
  }
}

/* =====================================================
   4. CUANDO HAYA LOGOUT → REDIRECCIÓN OBLIGATORIA AL HOME
===================================================== */
$(document).on("auth:logout", function () {
  window.location.href = CONFIG.ROUTES.HOME;
});
