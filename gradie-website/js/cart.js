// js/cart.js
document.addEventListener('DOMContentLoaded', () => {
  if (window.updateCartCount) window.updateCartCount();

  const cartContainer = document.getElementById('cart-items-container');
  const totalEl = document.getElementById('cart-total');
  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping');
  
  // Dual-key cart reader
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('GRADIE_CART')) || JSON.parse(localStorage.getItem('gradie_cart')) || [];
  } catch(e) { cart = []; }

  const settings = window.GradieStore ? window.GradieStore.getSettings() : { shippingFee: 30000 };
  const shippingFee = settings.shippingFee !== undefined ? Number(settings.shippingFee) : 30000;
  
  function saveCartState() {
    localStorage.setItem('GRADIE_CART', JSON.stringify(cart));
    localStorage.setItem('gradie_cart', JSON.stringify(cart));
    if (window.updateCartCount) window.updateCartCount();
  }

  function renderCart() {
    try {
      cart = JSON.parse(localStorage.getItem('GRADIE_CART')) || JSON.parse(localStorage.getItem('gradie_cart')) || [];
    } catch(e) { cart = []; }

    let subtotal = 0;
    
    if (cart.length === 0) {
      if (cartContainer) {
        cartContainer.innerHTML = `
          <div style="text-align:center; padding:60px 20px;">
            <p style="color:var(--taupe); font-size:1.1rem; margin-bottom:20px; font-style:italic;">Your shopping cart is currently empty.</p>
            <a href="products.html" class="btn-primary" style="padding:10px 25px; border-radius:8px; text-decoration:none; font-weight:600; font-size:0.9rem;">Start Shopping</a>
          </div>
        `;
      }
      if (totalEl) totalEl.textContent = '0đ';
      if (subtotalEl) subtotalEl.textContent = '0đ';
      if (shippingEl) shippingEl.textContent = '0đ';
      return;
    }

    let html = '';
    cart.forEach((item, index) => {
      const qty = parseInt(item.quantity || item.qty || 1);
      let itemTotal = item.price * qty;
      subtotal += itemTotal;

      let variantHtml = '';
      if (item.variant) {
        const allProducts = window.GradieStore ? window.GradieStore.getProducts() : [];
        const p = allProducts.find(x => x.id === item.id);
        if (p && p.variants && p.variants.length > 0) {
          variantHtml = `
            <select style="font-size:0.8rem; padding:4px 8px; margin-top:8px; border:1px solid var(--border-gold); border-radius:6px; outline:none; background:#faf8f5; font-family:inherit; color:var(--ink); cursor:pointer;" onchange="updateVariant(${index}, this.value)">
          `;
          p.variants.forEach(v => {
            const vLabel = v.name || v.color;
            variantHtml += `<option value="${vLabel}" ${item.variant === vLabel ? 'selected' : ''}>${vLabel}</option>`;
          });
          variantHtml += `</select><br>`;
        } else {
          variantHtml = `<span style="color:var(--taupe); display:inline-block; margin-top:6px; font-size:0.8rem; padding:4px 10px; background:#faf8f5; border-radius:4px; border:1px solid #eee;">${item.variant}</span>`;
        }
      }

      let customDetails = '';
      if (item.customization) {
        const c = item.customization;
        if (c.threadColor || c.embroideryText) {
          customDetails += `<div style="font-size:0.75rem; color:#888; margin-top:5px;">Embroidery: "${c.embroideryText || 'None'}" (${c.threadColor || 'Default Color'})</div>`;
        }
        if (c.boxColor || c.ribbonColor || c.waxSeal) {
          customDetails += `<div style="font-size:0.75rem; color:#888; margin-top:2px;">Wrap: Box (${c.boxColor || 'Cream'}), Ribbon (${c.ribbonColor || 'Gold'}), Seal (${c.waxSeal || 'None'})</div>`;
        }
      }

      html += `
        <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f0eeeb; padding:25px 0;">
          <div class="cart-item-left" style="display:flex; gap:20px; align-items:center;">
            <img src="${item.image}" style="width:90px; height:90px; object-fit:cover; border-radius:12px; border:1px solid #eee; box-shadow:0 4px 15px rgba(0,0,0,0.02);">
            <div style="display:flex; flex-direction:column; justify-content:center;">
              <strong style="font-size:1.1rem; color:var(--ink); font-family:'Playfair Display', serif;">${item.name}</strong>
              ${variantHtml}
              ${customDetails}
              <span style="font-size:0.95rem; color:var(--peach); font-weight:500; margin-top:5px;">${item.price.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
          <div class="cart-item-right" style="display:flex; gap:25px; align-items:center;">
            <!-- Luxury Qty Adjuster -->
            <div style="display:flex; align-items:center; border:1px solid var(--border-gold); border-radius:8px; overflow:hidden; background:white;">
              <button onclick="changeQty(${index}, -1)" style="border:none; background:none; padding:8px 12px; cursor:pointer; font-weight:600; color:#555; transition:background 0.2s;" onmouseover="this.style.background='#faf8f5'" onmouseout="this.style.background='none'">−</button>
              <span style="min-width:30px; text-align:center; font-weight:600; font-size:0.9rem; color:var(--ink);">${qty}</span>
              <button onclick="changeQty(${index}, 1)" style="border:none; background:none; padding:8px 12px; cursor:pointer; font-weight:600; color:#555; transition:background 0.2s;" onmouseover="this.style.background='#faf8f5'" onmouseout="this.style.background='none'">+</button>
            </div>
            
            <strong style="min-width:100px; text-align:right; font-size:1.1rem; color:var(--ink); font-weight:600;">${itemTotal.toLocaleString('vi-VN')}đ</strong>
            
            <!-- Elegant Typographic Delete Link (No Icons) -->
            <button onclick="removeCartItem(${index})" style="background:none; border:none; color:#999; font-family:'Montserrat',sans-serif; font-size:0.68rem; font-weight:600; letter-spacing:1.2px; cursor:pointer; padding:5px 8px; transition:all 0.2s; text-transform:uppercase; border-bottom:1px solid transparent;" onmouseover="this.style.color='#c28b8b'; this.style.borderBottomColor='#c28b8b';" onmouseout="this.style.color='#999'; this.style.borderBottomColor='transparent';">
              Remove
            </button>
          </div>
        </div>
      `;
    });
    
    if (cartContainer) cartContainer.innerHTML = html;
    
    const grandTotal = subtotal + shippingFee;
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('vi-VN') + 'đ';
    if (shippingEl) shippingEl.textContent = shippingFee.toLocaleString('vi-VN') + 'đ';
    if (totalEl) totalEl.textContent = grandTotal.toLocaleString('vi-VN') + 'đ';
  }
  
  renderCart();
  
  window.changeQty = function(index, delta) {
    let currentQty = parseInt(cart[index].quantity || cart[index].qty || 1);
    currentQty = Math.max(1, currentQty + delta);
    cart[index].quantity = currentQty;
    cart[index].qty = currentQty;
    saveCartState();
    renderCart();
  };

  window.updateVariant = function(index, newVariantName) {
    const products = window.GradieStore ? window.GradieStore.getProducts() : [];
    let p = products.find(x => x.id === cart[index].id);
    if (p && p.variants) {
      const vObj = p.variants.find(v => (v.name || v.color) === newVariantName);
      if (vObj) {
        cart[index].variant = newVariantName;
        cart[index].price = vObj.price || p.price;
        
        let duplicateIndex = cart.findIndex((x, i) => i !== index && x.id === cart[index].id && x.variant === newVariantName);
        if (duplicateIndex !== -1) {
          const mainQty = parseInt(cart[duplicateIndex].quantity || cart[duplicateIndex].qty || 1);
          const currentQty = parseInt(cart[index].quantity || cart[index].qty || 1);
          cart[duplicateIndex].quantity = mainQty + currentQty;
          cart[duplicateIndex].qty = mainQty + currentQty;
          cart.splice(index, 1);
        }
        
        saveCartState();
        renderCart();
      }
    }
  };
  
  window.removeCartItem = function(index) {
    cart.splice(index, 1);
    saveCartState();
    renderCart();
  };

  window.handleProceedCheckout = function() {
    const user = window.GradieStore ? window.GradieStore.getCurrentUser() : null;
    if (!user) {
      alert("Please log in or register to proceed to checkout.");
      window.location.href = "login.html?redirect=checkout";
    } else {
      window.location.href = "checkout.html";
    }
  };
});
