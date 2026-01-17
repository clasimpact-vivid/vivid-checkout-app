Ecwid.OnAPILoaded.add(function() {

    console.log("Vivid Checkout Script: API Loaded");

    // -----------------------------------------
    // 1. Funcție: verifică dacă produsul cere preplată
    // -----------------------------------------
    function cartRequiresPrepayment(cart) {
        if (!cart || !cart.items) return false;

        return cart.items.some(item => {
            if (!item.product || !item.product.attributes) return false;

            return item.product.attributes.some(attr =>
                attr.name === "RequiresPrepayment" &&
                String(attr.value).toLowerCase() === "yes"
            );
        });
    }

    // -----------------------------------------
    // 2. Funcție: ascunde metodele de plată
    // -----------------------------------------
    function hidePaymentMethod(methodName) {
        try {
            Ecwid.Payment.hidePaymentMethod(methodName);
            console.log("Hidden payment method:", methodName);
        } catch (e) {
            console.warn("Cannot hide payment method:", methodName, e);
        }
    }

    // -----------------------------------------
    // 3. Funcție: afișează metodele de plată
    // -----------------------------------------
    function showPaymentMethod(methodName) {
        try {
            Ecwid.Payment.showPaymentMethod(methodName);
            console.log("Shown payment method:", methodName);
        } catch (e) {
            console.warn("Cannot show payment method:", methodName, e);
        }
    }

    // -----------------------------------------
    // 4. Funcție: injectează mesajul de preorder
    // -----------------------------------------
    function injectPreorderMessage() {
        const msgId = "vivid-preorder-msg";

        if (document.getElementById(msgId)) return;

        const container = document.querySelector(".ecwid-PaymentMethodsBlock");
        if (!container) return;

        const div = document.createElement("div");
        div.id = msgId;
        div.style.background = "#fff3cd";
        div.style.border = "1px solid #ffeeba";
        div.style.padding = "12px";
        div.style.marginBottom = "15px";
        div.style.borderRadius = "6px";
        div.style.fontSize = "14px";
        div.style.color = "#856404";
        div.innerText = "Acest produs este disponibil doar în regim de precomandă. Plata online este necesară pentru procesarea comenzii.";

        container.prepend(div);
    }

    // -----------------------------------------
    // 5. Logica principală — rulează la schimbarea coșului
    // -----------------------------------------
    Ecwid.OnCartChanged.add(function(cart) {

        console.log("Vivid Checkout Script: Cart changed", cart);

        const requiresPrepay = cartRequiresPrepayment(cart);

        if (requiresPrepay) {
            console.log("Prepayment required — applying restrictions");

            hidePaymentMethod("COD");
            hidePaymentMethod("CASH");
            hidePaymentMethod("PAYPAL");
            hidePaymentMethod("BANK_TRANSFER");

            showPaymentMethod("CREDIT_CARD");

            injectPreorderMessage();

        } else {
            console.log("No prepayment required — restoring all methods");

            showPaymentMethod("COD");
            showPaymentMethod("CASH");
            showPaymentMethod("PAYPAL");
            showPaymentMethod("BANK_TRANSFER");
            showPaymentMethod("CREDIT_CARD");
        }
    });

    // -----------------------------------------
    // 6. Rulează și la încărcarea paginii
    // -----------------------------------------
    Ecwid.OnPageLoaded.add(function(page) {
        console.log("Vivid Checkout Script: Page loaded", page);

        if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
            Ecwid.Cart.get(function(cart) {
                Ecwid.OnCartChanged.call(cart);
            });
        }
    });

});
