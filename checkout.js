Ecwid.OnAPILoaded.add(function() {

    console.log("Vivid Checkout Script: API Loaded");

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

    function hidePaymentMethod(methodName) {
        try {
            Ecwid.Payment.hidePaymentMethod(methodName);
            console.log("Hidden:", methodName);
        } catch (e) {
            console.warn("Cannot hide:", methodName, e);
        }
    }

    function showPaymentMethod(methodName) {
        try {
            Ecwid.Payment.showPaymentMethod(methodName);
            console.log("Shown:", methodName);
        } catch (e) {
            console.warn("Cannot show:", methodName, e);
        }
    }

    function injectPreorderMessage() {
        const id = "vivid-preorder-msg";
        if (document.getElementById(id)) return;

        const container = document.querySelector(".ecwid-PaymentMethodsBlock");
        if (!container) return;

        const div = document.createElement("div");
        div.id = id;
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

    function applyLogic() {
        Ecwid.Cart.get(function(cart) {
            const requires = cartRequiresPrepayment(cart);

            if (requires) {
                hidePaymentMethod("COD");
                hidePaymentMethod("CASH");
                hidePaymentMethod("PAYPAL");
                hidePaymentMethod("BANK_TRANSFER");
                showPaymentMethod("CREDIT_CARD");
                injectPreorderMessage();
            } else {
                showPaymentMethod("COD");
                showPaymentMethod("CASH");
                showPaymentMethod("PAYPAL");
                showPaymentMethod("BANK_TRANSFER");
                showPaymentMethod("CREDIT_CARD");
            }
        });
    }

    // Evenimentul care funcționează în checkout-ul nou
    Ecwid.OnCheckoutStepChanged.add(function(step) {
        console.log("Checkout step changed:", step);

        if (step.step === "payment") {
            setTimeout(applyLogic, 300);
        }
    });

    Ecwid.OnCartChanged.add(function() {
        applyLogic();
    });

});
