// js/cart.js
document.addEventListener('DOMContentLoaded', () => {
    window.updateCartCount();
    const cartContainer = document.getElementById('cart-items-container');
    const checkoutContainer = document.getElementById('checkout-items-summary');
    const totalEl = document.getElementById('cart-total');
    const subtotalEl = document.getElementById('cart-subtotal');
    const shippingEl = document.getElementById('cart-shipping');
    
    let cart = JSON.parse(localStorage.getItem('gradie_cart') || '[]');
    let settings = window.GradieStore ? window.GradieStore.getSettings() : { shippingFee: 30000 };
    
    function renderCart() {
        cart = JSON.parse(localStorage.getItem('gradie_cart') || '[]');
        let subtotal = 0;
        
        if (cart.length === 0) {
            if(cartContainer) cartContainer.innerHTML = '<p style="text-align:center; padding:50px;">Your cart is empty.</p>';
            if(checkoutContainer) checkoutContainer.innerHTML = '<p>Your cart is empty.</p>';
            if(totalEl) totalEl.textContent = '0 ₫';
            if(subtotalEl) subtotalEl.textContent = '0 ₫';
            if(shippingEl) shippingEl.textContent = '0 ₫';
            return;
        }

        let html = '';
        cart.forEach((item, index) => {
            let itemTotal = (item.price * item.qty);
            subtotal += itemTotal;
            let variantHtml = '';
            if (item.variant) {
                const allProducts = window.GradieStore ? window.GradieStore.getProducts() : (window.GRADIE_DATA ? window.GRADIE_DATA.products : []);
                const p = allProducts.find(x => x.id === item.id);
                if (p && p.variants && p.variants.length > 0) {
                    variantHtml = `<select style="font-size:0.85rem; padding:6px 10px; margin-top:8px; border:1px solid var(--border-gold); border-radius:6px; outline:none; background: var(--off-white); font-family: inherit; color: var(--ink); cursor: pointer;" onchange="updateVariant(${index}, this.value)">`;
                    p.variants.forEach(v => {
                        const vLabel = v.name || v.color;
                        variantHtml += `<option value="${vLabel}" ${item.variant === vLabel ? 'selected' : ''}>${vLabel}</option>`;
                    });
                    variantHtml += `</select><br>`;
                } else {
                    variantHtml = `<span style="color:var(--taupe); display:inline-block; margin-top:6px; font-size: 0.9rem; padding: 4px 10px; background: var(--off-white); border-radius: 4px;">${item.variant}</span>`;
                }
            }

            html += `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(140, 132, 122, 0.15); padding: 25px 0;">
                    <div style="display:flex; gap: 20px; align-items:center;">
                        <img src="${item.image}" style="width: 100px; height: 100px; object-fit:cover; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <div style="display:flex; flex-direction: column; justify-content: center;">
                            <strong style="font-size: 1.15rem; color: var(--ink); font-family: 'Playfair Display', serif;">${item.name}</strong>
                            ${variantHtml}
                            <span style="font-size: 1rem; color: var(--peach); font-weight: 500; margin-top: ${item.variant ? '5px' : '10px'};">${item.price.toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </div>
                    <div style="display:flex; gap: 20px; align-items:center;">
                        <div style="display:flex; align-items: center; border: 1px solid var(--border-gold); border-radius: 8px; padding: 2px 5px; background: white;">
                            <input type="number" min="1" value="${item.qty}" style="width: 40px; padding: 8px 5px; border: none; text-align: center; outline: none; font-size: 1rem; color: var(--ink);" onchange="updateQty(${index}, this.value)">
                        </div>
                        <strong style="min-width: 90px; text-align: right; font-size: 1.15rem; color: var(--ink);">${itemTotal.toLocaleString('vi-VN')} ₫</strong>
                        <button onclick="removeCartItem(${index})" style="background:none; border:none; color: var(--taupe); cursor:pointer; padding: 5px; transition: color 0.2s;" onmouseover="this.style.color='var(--peach)'" onmouseout="this.style.color='var(--taupe)'">
                            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            `;
        });
        
        if (cartContainer) cartContainer.innerHTML = html;
        if (checkoutContainer) checkoutContainer.innerHTML = html;
        
        let shipping = settings.shippingFee || 30000;
        let total = subtotal + shipping;
        
        if(subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('vi-VN') + ' ₫';
        if(shippingEl) shippingEl.textContent = shipping.toLocaleString('vi-VN') + ' ₫';
        if(totalEl) totalEl.textContent = total.toLocaleString('vi-VN') + ' ₫';
    }
    
    renderCart();
    
    window.updateQty = function(index, qty) {
        cart[index].qty = parseInt(qty) || 1;
        localStorage.setItem('gradie_cart', JSON.stringify(cart));
        renderCart();
        window.updateCartCount();
    }
    
    window.updateVariant = function(index, newVariantName) {
        const products = window.GradieStore ? window.GradieStore.getProducts() : window.GRADIE_DATA.products;
        let p = products.find(x => x.id === cart[index].id);
        if (p && p.variants) {
            const vObj = p.variants.find(v => (v.name || v.color) === newVariantName);
            if (vObj) {
                cart[index].variant = newVariantName;
                cart[index].price = vObj.price || p.price;
                
                // Merge logic if another identical item exists
                let duplicateIndex = cart.findIndex((x, i) => i !== index && x.id === cart[index].id && x.variant === newVariantName);
                if (duplicateIndex !== -1) {
                    cart[duplicateIndex].qty += cart[index].qty;
                    cart.splice(index, 1);
                }
                
                localStorage.setItem('gradie_cart', JSON.stringify(cart));
                renderCart();
                window.updateCartCount();
            }
        }
    }
    
    window.removeCartItem = function(index) {
        cart.splice(index, 1);
        localStorage.setItem('gradie_cart', JSON.stringify(cart));
        renderCart();
        window.updateCartCount();
    }
    
    // Checkout Form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (cart.length === 0) { alert("Cart is empty!"); return; }
            
            let subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
            let total = subtotal + (settings.shippingFee || 30000);
            
            const newOrder = {
                orderNumber: 'GRADIE' + Date.now().toString().slice(-6),
                customer: {
                    name: document.getElementById('c-name').value,
                    email: document.getElementById('c-email').value,
                    phone: document.getElementById('c-phone').value,
                    address: document.getElementById('c-address').value
                },
                items: cart,
                subtotal: subtotal,
                shippingFee: settings.shippingFee || 30000,
                total: total,
                status: 'Order Confirmed',
                createdAt: new Date().toISOString()
            };
            
            if (window.GradieStore) window.GradieStore.addOrder(newOrder);
            localStorage.removeItem('gradie_cart');
            window.updateCartCount();
            
            alert('Order placed successfully! Your Order ID is: ' + newOrder.orderNumber);
            window.location.href = 'order-tracking.html';
        });
    }
});
