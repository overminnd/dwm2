/**
 * ---------------------------------------------------------
 * - Muestra dirección guardada en localStorage
 * - Muestra productos del carrito
 * - Calcula subtotal + envío
 * - Evita que entren al checkout sin dirección
 * - Prepara el botón para generar orden
 */

$(document).ready(function () {
    console.log("🧾 Checkout cargado");

    // 🚫 1) Si no está autenticado, sacar del checkout
    if (!isAuthenticated || typeof isAuthenticated !== "function" || !isAuthenticated()) {
        if (typeof showToast === "function") {
          showToast("Debes iniciar sesión o registrarte para finalizar tu compra.", "warning");
        } else {
          alert("Debes iniciar sesión o registrarte para finalizar tu compra.");
        }

        // Opcional: ajusta la ruta del login si es distinta
        setTimeout(() => {
            window.location.href = "../components/login.html";
        }, 1500);
        return;
    }

    // 2) Cargar header dinámico
    UTILS.loadComponent("header-container", "../components/header.html", function () {
        if (typeof initHeader === "function") initHeader();
    });

    // 3) Verificación: no permitir checkout sin dirección
    const address = getShippingAddress();
    if (!address) {
        showToast("Debes ingresar una dirección antes de continuar", "warning");
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1500);
        return;
    }

    // 4) Renderizar UI
    renderCheckoutAddress();
    renderCheckoutItems();
    renderCheckoutTotals();

    // 5) Botón confirmar pedido
    $("#btn-confirm-order").off("click").on("click", function () {
        confirmarPedido();
    });
});


/* ----------------------------
   MOSTRAR DIRECCIÓN
----------------------------- */
function renderCheckoutAddress() {
    const addr = getShippingAddress();
    if (!addr) return;

    // 🔥 FIX: incluir número junto a la calle
    $("#chk-street").text(`${addr.street} ${addr.number || ""}`);

    $("#chk-city-region").text(`${addr.city}, ${addr.region}`);
    $("#chk-reference").text(addr.reference || "");
}


/* ----------------------------
   MOSTRAR ITEMS DEL CARRITO
----------------------------- */
function renderCheckoutItems() {
    const cart = getCartSummary();
    let html = "";

    cart.items.forEach(item => {
        html += `
            <li class="list-group-item d-flex justify-content-between">
                <span>${item.name}</span>
                <span>x${item.quantity}</span>
            </li>
        `;
    });

    $("#checkout-items").html(html);
}

/* ----------------------------
   CALCULAR SUBTOTAL / ENVÍO / TOTAL
----------------------------- */
function renderCheckoutTotals() {
    const cart = getCartSummary();
    const shipping = CONFIG.SHIPPING_FLAT_FEE || 3500;
    const total = cart.subtotal + shipping;

    $("#checkout-subtotal").text(formatPrice(cart.subtotal));
    $("#checkout-shipping").text(formatPrice(shipping));
    $("#checkout-total").text(formatPrice(total));

    console.log("💰 Totales:", { subtotal: cart.subtotal, shipping, total });
}

/* ----------------------------
   CONFIRMAR PEDIDO
----------------------------- */
async function confirmarPedido() {
    // 🔄 Sincronizar carrito
    if (typeof refreshLocalCartFromBackend === "function") {
        await refreshLocalCartFromBackend();
    }
    // 0) Bloquear invitados
    if (typeof isAuthenticated === "function" && !isAuthenticated()) {
        if (typeof showAuthRequiredModal === "function") {
            showAuthRequiredModal();
        } else if (typeof showToast === "function") {
            showToast("Debes iniciar sesión para confirmar tu pedido", "warning");
        }
        return;
    }

    // 1) Obtener carrito
    const cart = getCartSummary();
    if (cart.isEmpty) {
        showToast("Tu carrito está vacío.", "warning");
        return;
    }

    // 2) Obtener dirección local
    const address = getShippingAddress();
    if (!address || !address.street || !address.number || !address.city || !address.region) {
        showToast("La dirección está incompleta. Debe incluir calle, número, ciudad y región.", "warning");
        return;
    }

    // 3) addressId desde localStorage o crear en backend
    let addressId = localStorage.getItem("marazul-address-id");

    if (!addressId) {
        console.log("📨 No existe addressId. Creando dirección en backend...");

        try {
            const response = await API.apiRequest("POST", "/addresses", {
                street: address.street,
                number: address.number,
                city: address.city,
                region: address.region,
                zipCode: address.zipCode || "",
                country: "Chile"
            });

            if (!response.success) {
                showToast("No se pudo guardar la dirección.", "danger");
                return;
            }

            addressId = response.data._id;
            localStorage.setItem("marazul-address-id", addressId);

            console.log("🏠 Dirección creada con ID:", addressId);

        } catch (error) {
            console.error("❌ Error creando dirección:", error);
            showToast("Error al crear dirección.", "danger");
            return;
        }
    }

    // 4) Crear orden con addressId
    console.log("📦 Creando orden con addressId:", addressId);

    try {
        const result = await API.createOrder({
            addressId: addressId
        });

        console.log("💾 Respuesta backend:", result);

        if (!result || !result.success) {
            showToast(result.error?.message || "Error al crear la orden", "danger");
            return;
        }

        const orderId = result.data.order?._id || result.data.orderId;

        if (!orderId) {
            showToast("No se recibió un ID de orden válido.", "danger");
            return;
        }

        // Limpiar carrito local porque el backend ya cerró el carrito
        localStorage.removeItem("marazul-cart");
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CART);

        // Forzar badge a 0
        if (typeof updateCartBadge === "function") {
            updateCartBadge();
        }


        // 5) Redirigir a página de éxito
        window.location.href = `../components/success.html?orderId=${orderId}`;

    } catch (error) {
        console.error("❌ Error enviando orden:", error);
        showToast("Error al enviar la orden.", "danger");
    }
}



