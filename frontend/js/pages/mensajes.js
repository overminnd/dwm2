/* ============================================================================
   MARAZUL - ADMIN MENSAJES DE CONTACTO
   ============================================================================
   Este módulo replica EXACTAMENTE la estructura de ordenes.js, pero adaptado
   a la gestión de mensajes del formulario de contacto.
   ============================================================================ */

$(document).ready(() => {
  console.log("📨 Cargando página de Mensajes...");

  // Cargar header
  UTILS.loadComponent("header-container", "header.html", () => {
    if (typeof initHeader === "function") initHeader();
  });

  // Cargar carrito (aunque no se usa, mantiene consistencia en diseño)
  UTILS.loadComponent("carrito-container", "carrito.html");

  // Cargar lista de mensajes
  loadMessages();
});

/* ============================================================================
   1. CARGAR MENSAJES DE CONTACTO
============================================================================ */
async function loadMessages() {
  const $list = $("#messages-list");
  $list.html(`<p class="text-muted">Cargando mensajes...</p>`);

  let response;

  try {
    response = await API.getAllMessagesAdmin();
  } catch (error) {
    console.error("❌ Error cargando mensajes:", error);
    $list.html(`<p class="text-danger">Error al cargar mensajes.</p>`);
    return;
  }

  if (!response.success || response.data.length === 0) {
    $list.html(`<p class="text-muted">No hay mensajes registrados.</p>`);
    return;
  }

  $list.html("");

  response.data.forEach((msg) => {
    const fecha = new Date(msg.createdAt).toLocaleString();

    const html = `
      <div class="card mb-3 shadow-sm border-primary message-card" 
           onclick="viewMessageDetails('${msg._id}')"
           style="cursor:pointer;">

        <div class="card-body d-flex justify-content-between align-items-center">

          <div>
            <h6 class="fw-bold" style="color:#003366;">
              ${msg.subject || "Sin asunto"}
            </h6>

            <p class="text-muted mb-0">
              <b>${msg.name}</b> - ${msg.email} <br>
              <small>${fecha}</small>
            </p>
          </div>

          <span class="badge ${msg.read ? "bg-secondary" : "bg-danger"}">
            ${msg.read ? "Leído" : "Nuevo"}
          </span>

        </div>
      </div>
    `;

    $list.append(html);
  });
}

/* ============================================================================
   2. VER DETALLES DE UN MENSAJE
============================================================================ */
async function viewMessageDetails(messageId) {
  const $details = $("#message-details");
  $details.html(`<p class="text-muted">Cargando detalles...</p>`);

  let response;

  try {
    response = await API.getMessageById(messageId);
  } catch (error) {
    console.error(error);
    $details.html(`<p class="text-danger">Error al cargar detalles.</p>`);
    return;
  }

  if (!response.success) {
    $details.html(`<p class="text-danger">Error cargando mensaje.</p>`);
    return;
  }

  const msg = response.data;
  const fecha = new Date(msg.createdAt).toLocaleString();

  $details.html(`
    <div class="card border-primary shadow-sm p-4">

      <h4 class="fw-bold mb-3" style="color:#003366;">
        ${msg.subject || "Sin asunto"}
      </h4>

      <p><b>Nombre:</b> ${msg.name}</p>
      <p><b>Email:</b> ${msg.email}</p>
      <p><b>Fecha:</b> ${fecha}</p>

      <h5 class="mt-4 mb-2">Mensaje</h5>
      <div class="border rounded p-3 mb-3" style="background:#f9f9f9;">
        ${msg.message}
      </div>

      <div class="d-grid gap-2">

        ${
          !msg.read
            ? `
        <button class="btn btn-success fw-bold"
          onclick="markMessageAsRead('${msg._id}')">
          ✔ Marcar como leído
        </button>
        `
            : ""
        }

        <button class="btn btn-danger fw-bold"
          onclick="deleteMessage('${msg._id}')">
          🗑 Eliminar mensaje
        </button>

      </div>

    </div>
  `);
}

/* ============================================================================
   3. MARCAR MENSAJE COMO LEÍDO
============================================================================ */
async function markMessageAsRead(messageId) {
  if (!confirm("¿Marcar este mensaje como leído?")) return;

  let result;

  try {
    result = await API.markMessageAsRead(messageId);
  } catch (err) {
    alert("❌ Error actualizando el mensaje.");
    return;
  }

  if (!result.success) {
    alert("❌ No se pudo completar la acción.");
    return;
  }

  alert("✔ Mensaje marcado como leído");

  $("#message-details").html("");
  loadMessages();
}

/* ============================================================================
   4. ELIMINAR MENSAJE
============================================================================ */
async function deleteMessage(messageId) {
  if (!confirm("⚠️ ¿Seguro que deseas eliminar este mensaje?")) return;

  let result;

  try {
    result = await API.deleteMessage(messageId);
  } catch (err) {
    alert("❌ Error eliminando mensaje.");
    return;
  }

  if (!result.success) {
    alert("❌ No se pudo eliminar.");
    return;
  }

  alert("🗑 Mensaje eliminado correctamente");

  $("#message-details").html("");
  loadMessages();
}
