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
            html += `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-gold); padding:15px 0;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        <img src="${item.image}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">
                        <div>
                            <strong>${item.name}</strong><br>
                            <small>${item.price.toLocaleString('vi-VN')} ₫</small>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="number" min="1" value="${item.qty}" style="width:50px; padding:5px;" onchange="updateQty(${index}, this.value)">
                        <strong>${itemTotal.toLocaleString('vi-VN')} ₫</strong>
                        <button onclick="removeCartItem(${index})" style="background:none; border:none; color:red; cursor:pointer;"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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
