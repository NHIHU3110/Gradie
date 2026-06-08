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
          <div class="cart-empty-state">
            <p class="cart-empty-msg">Giỏ hàng của bạn đang trống.</p>
            <a href="products.html" class="btn-primary">Khám Phá Sản Phẩm</a>
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
          variantHtml = `<select class="cart-item-variant" onchange="updateVariant(${index}, this.value)">`;
          p.variants.forEach(v => {
            let vLabel = "Mặc định";
            if (v.options && v.options.length) {
              vLabel = v.options.map((val, idx) => {
                if (val) {
                  const optName = (p.options && p.options[idx] && p.options[idx].name) ? p.options[idx].name : "";
                  return optName ? `${optName}: ${val}` : val;
                }
                return null;
              }).filter(Boolean).join(' | ');
            } else {
              vLabel = v.name || v.color || v.title || v.sku || "Mặc định";
            }
            variantHtml += `<option value="${vLabel}" ${item.variant === vLabel ? 'selected' : ''}>${vLabel}</option>`;
          });
          variantHtml += `</select>`;
        } else {
          variantHtml = `<span class="cart-item-variant-label">${item.variant}</span>`;
        }
      }

      let customDetails = '';
      if (item.customization) {
        const c = item.customization;
        if (c.threadColor || c.embroideryText) {
          customDetails += `<div class="cart-item-customization">Thêu tên: "${c.embroideryText || 'Không'}" (Chỉ: ${c.threadColor || 'Mặc định'})</div>`;
        }
        if (c.engraveText) {
          const fontLabel = c.engraveFont ? (c.engraveFont.includes('Serif') ? 'Cổ điển' : c.engraveFont.includes('Sans') ? 'Hiện đại' : 'Nghệ thuật') : 'Cổ điển';
          customDetails += `<div class="cart-item-customization">Khắc tên: "${c.engraveText}" (Font: ${fontLabel})</div>`;
        }
        if (c.boxColor || c.ribbonColor || c.waxSeal) {
          customDetails += `<div class="cart-item-customization">Gói quà: Hộp (${c.boxColor || 'Kem'}), Nơ (${c.ribbonColor || 'Vàng'}), Sáp (${c.waxSeal || 'Không'})</div>`;
        }
      }

      html += `
        <div class="cart-item">
          <div class="cart-item-left">
            <img src="${item.image}" class="cart-item-img" alt="${item.name}">
            <div class="cart-item-info">
              <span class="cart-item-name">${item.name}</span>
              ${customDetails}
              <span class="cart-item-price">${item.price.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
          <div class="cart-item-right">
            ${variantHtml}
            <div class="cart-qty-adjuster">
              <button class="cart-qty-btn" onclick="changeQty(${index}, -1)">−</button>
              <span class="cart-qty-value">${qty}</span>
              <button class="cart-qty-btn" onclick="changeQty(${index}, 1)">+</button>
            </div>
            <span class="cart-item-total">${itemTotal.toLocaleString('vi-VN')}đ</span>
            <button class="cart-item-remove" onclick="removeCartItem(${index})" title="Xóa khỏi giỏ hàng">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
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
      const vObj = p.variants.find(v => {
        let label = "Mặc định";
        if (v.options && v.options.length) {
          label = v.options.map((val, idx) => {
            if (val) {
              const optName = (p.options && p.options[idx] && p.options[idx].name) ? p.options[idx].name : "";
              return optName ? `${optName}: ${val}` : val;
            }
            return null;
          }).filter(Boolean).join(' | ');
        } else {
          label = v.name || v.color || v.title || v.sku || "Mặc định";
        }
        return label === newVariantName;
      });
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
      showToast('Vui lòng đăng nhập để tiến hành thanh toán.', 'warning');
      setTimeout(() => {
        window.location.href = "login.html?redirect=checkout";
      }, 1500);
    } else {
      window.location.href = "checkout.html";
    }
  };
});
