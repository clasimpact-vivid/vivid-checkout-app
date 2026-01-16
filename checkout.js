// ===============================
//  PREORDER CHECKOUT LOGIC
//  Vivid Senses / Ecwid Custom App
// ===============================

// Detectăm dacă există produse care cer plata în avans
function cartRequiresPrepayment(cart) {
    let requires = false;

    if (!cart || !cart.items) return false;

    cart.items.forEach(function(item) {
        if (item.product && item.product.attributes) {
            item.product.attributes.forEach(function(attr) {
                if (attr.name === "RequiresPrepayment" && attr.value === "Yes") {
                    requires = true;
                }
            });
        }
    });

    return requires;
}

// ===============================
//  LOGICA PRINCIPALĂ
// ===============================

Ecwid.OnCartChanged.add(function(cart) {
    const requiresPrepayment = cartRequiresPrepayment(cart);

    // -------------------------------
    //  LOGICA METODE DE PLATĂ
    // -------------------------------

    if (requiresPrepayment) {
        // Ascundem metodele care NU sunt permise la preorder
        Ecwid.Payment.hidePaymentMethod("2026490594-1594808817133"); // Pay by cash/card la livrare
        Ecwid.Payment.hidePaymentMethod("211193-1669977876031");     // Cash la livrare
        Ecwid.Payment.hidePaymentMethod("20082-1594900114203");      // PayPal
        Ecwid.Payment.hidePaymentMethod("212269-1669977994171");     // Transfer bancar

        // Stripe rămâne vizibil (nu îl ascundem)
    } else {
        // Afișăm toate metodele când nu e preorder
        Ecwid.Payment.showPaymentMethod("2026490594-1594808817133");
        Ecwid.Payment.showPaymentMethod("211193-1669977876031");
        Ecwid.Payment.showPaymentMethod("20082-1594900114203");
        Ecwid.Payment.showPaymentMethod("212269-1669977994171");
    }

    // -------------------------------
    //  LOGICA METODE DE LIVRARE (opțional)
    //  Poți adăuga ID-urile tale aici
    // -------------------------------

    /*
    if (requiresPrepayment) {
        Ecwid.Delivery.hideShippingMethod("locker-id");
        Ecwid.Delivery.hideShippingMethod("cash-on-delivery-courier-id");
    } else {
        Ecwid.Delivery.showShippingMethod("locker-id");
        Ecwid.Delivery.showShippingMethod("cash-on-delivery-courier-id");
    }
    */
});

// ===============================
//  MESAJ ÎN CHECKOUT
// ===============================

Ecwid.OnPageLoaded.add(function(page) {
    if (page.type !== "CHECKOUT_PAYMENT_DETAILS") return;

    Ecwid.Cart.get(function(cart) {
        const requiresPrepayment = cartRequiresPrepayment(cart);

        if (!requiresPrepayment) return;

        // Injectăm mesajul în checkout
        const container = document.querySelector(".ec-cart-step__body");
        if (!container) return;

        const msg = document.createElement("div");
        msg.innerHTML = `
            <div style="
                padding: 12px;
                background: #fff3cd;
                border: 1px solid #ffeeba;
                color: #856404;
                margin-bottom: 15px;
                border-radius: 4px;
                font-size: 14px;
            ">
                Acest produs este în <strong>PRECOMANDĂ</strong>.  
                Livrare estimată: <strong>10–14 zile</strong>.  
                Plata online este necesară pentru confirmarea comenzii.
            </div>
        `;

        container.prepend(msg);
    });
});
