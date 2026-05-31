// js/checkout.js
document.addEventListener('DOMContentLoaded', () => {
  if (!window.GradieStore) return;

  // 0. Enforce user authentication
  const currentUser = window.GradieStore.getCurrentUser();
  if (!currentUser) {
    alert("Please log in or sign up to proceed to checkout.");
    window.location.href = "login.html?redirect=checkout";
    return;
  }

  const summaryList = document.getElementById('checkout-summary-list');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const shippingEl = document.getElementById('checkout-shipping');
  const grandTotalEl = document.getElementById('checkout-grand-total');
  
  // 1. Get Cart Data from both possible keys
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('GRADIE_CART')) || JSON.parse(localStorage.getItem('gradie_cart')) || [];
  } catch(e) { cart = []; }

  if (cart.length === 0) {
    alert("Your shopping cart is empty. Redirecting to shop...");
    window.location.href = "products.html";
    return;
  }

  // 2. Pre-fill user profile and saved addresses cards if logged in
  if (currentUser) {
    document.getElementById('shipping-email').value = currentUser.email || '';
    
    const addressesWrapper = document.getElementById('checkout-saved-addresses-wrapper');
    const cardsContainer = document.getElementById('checkout-address-cards-container');
    const saveAddressWrapper = document.getElementById('checkout-save-address-profile-wrapper');
    const savedAddrs = currentUser.addresses || [];

    if (savedAddrs.length > 0) {
      if (addressesWrapper && cardsContainer) {
        addressesWrapper.style.display = 'block';
        
        // Find default address
        const defaultAddr = savedAddrs.find(a => a.isDefault) || savedAddrs[0];

        // Declare global selectCheckoutAddressCard handler
        window.selectCheckoutAddressCard = function(selectedId) {
          const cards = document.querySelectorAll('.checkout-address-card');
          cards.forEach(card => {
            card.style.border = '1px solid #e2e8f0';
            card.style.background = '#fff';
            
            const indicator = card.querySelector('.circle-indicator');
            if (indicator) {
              indicator.style.background = 'transparent';
              indicator.style.borderColor = '#cbd5e1';
              indicator.innerHTML = '';
            }
          });

          // Highlight selected card
          const activeCard = document.getElementById('card-' + selectedId);
          if (activeCard) {
            activeCard.style.border = '2px solid var(--champagne, #d8a94f)';
            activeCard.style.background = '#faf8f5';
            
            const indicator = activeCard.querySelector('.circle-indicator');
            if (indicator) {
              indicator.style.background = 'var(--champagne, #d8a94f)';
              indicator.style.borderColor = 'var(--champagne, #d8a94f)';
              indicator.innerHTML = '<div style="width:8px; height:8px; border-radius:50%; background:#fff;"></div>';
            }
          }

          // Populate inputs
          if (selectedId === 'new') {
            document.getElementById('shipping-name').value = '';
            document.getElementById('shipping-phone').value = '';
            document.getElementById('shipping-address').value = '';
            if (saveAddressWrapper) saveAddressWrapper.style.display = 'block';
          } else {
            const selected = savedAddrs.find(a => a.id === selectedId);
            if (selected) {
              document.getElementById('shipping-name').value = selected.name || '';
              document.getElementById('shipping-phone').value = selected.phone || '';
              document.getElementById('shipping-address').value = selected.detail || '';
            }
            if (saveAddressWrapper) saveAddressWrapper.style.display = 'none';
          }
        };

        // Render card buttons
        let cardsHtml = '';
        savedAddrs.forEach(a => {
          const isSelected = defaultAddr && a.id === defaultAddr.id;
          cardsHtml += `
            <div class="checkout-address-card" onclick="selectCheckoutAddressCard('${a.id}')" id="card-${a.id}" style="border:${isSelected ? '2px solid #d8a94f' : '1px solid #e2e8f0'}; background:${isSelected ? '#faf8f5' : '#fff'}; padding:16px; border-radius:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.01);">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <strong style="font-size:0.95rem; color:#1a1a1a; font-family: inherit;">${a.label}</strong>
                  ${a.isDefault ? '<span style="background:var(--warm-cream, #fef4e8); color:var(--champagne, #d8a94f); font-size:0.7rem; font-weight:600; padding:2px 8px; border-radius:4px; border:1px solid #d8a94f; letter-spacing:0.5px;">DEFAULT</span>' : ''}
                </div>
                <div style="font-size:0.85rem; color:#666; margin-top:6px;">Receiver: <strong>${a.name}</strong> | Phone: ${a.phone}</div>
                <div style="font-size:0.85rem; color:#666; margin-top:3px;">Address: ${a.detail}</div>
              </div>
              <div class="circle-indicator" style="width:20px; height:20px; border-radius:50%; border:2px solid ${isSelected ? '#d8a94f' : '#cbd5e1'}; display:flex; align-items:center; justify-content:center; background:${isSelected ? '#d8a94f' : 'transparent'};">
                ${isSelected ? '<div style="width:8px; height:8px; border-radius:50%; background:#fff;"></div>' : ''}
              </div>
            </div>
          `;
        });

        cardsHtml += `
          <div class="checkout-address-card" onclick="selectCheckoutAddressCard('new')" id="card-new" style="border:1px solid #e2e8f0; background:#fff; padding:16px; border-radius:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.01);">
            <div>
              <strong style="font-size:0.95rem; color:#1a1a1a; font-family: inherit;">Use a new shipping address</strong>
              <div style="font-size:0.82rem; color:#666; margin-top:4px;">Enter a custom shipping name, phone number, and address details below.</div>
            </div>
            <div class="circle-indicator" style="width:20px; height:20px; border-radius:50%; border:2px solid #cbd5e1; display:flex; align-items:center; justify-content:center; background:transparent;">
            </div>
          </div>
        `;

        cardsContainer.innerHTML = cardsHtml;

        // Auto-fill inputs initially with default selection details
        if (defaultAddr) {
          document.getElementById('shipping-name').value = defaultAddr.name || '';
          document.getElementById('shipping-phone').value = defaultAddr.phone || '';
          document.getElementById('shipping-address').value = defaultAddr.detail || '';
        }
      }
    } else {
      // User has no saved addresses, prefill name and phone, show save address checkbox
      document.getElementById('shipping-name').value = currentUser.username || '';
      document.getElementById('shipping-phone').value = currentUser.phone || '';
      document.getElementById('shipping-address').value = currentUser.shippingAddress || '';
      if (saveAddressWrapper) saveAddressWrapper.style.display = 'block';
    }
  }

  // 3. Retrieve Shipping Settings
  const settings = window.GradieStore.getSettings();
  const shippingFee = settings.shippingFee !== undefined ? Number(settings.shippingFee) : 30000;

  // 4. Render Order Summary
  let subtotal = 0;
  summaryList.innerHTML = cart.map(item => {
    // Find base price
    const baseProduct = window.GradieStore.getProductById(item.id);
    const price = baseProduct ? baseProduct.price : (item.price || 0);
    const qty = parseInt(item.quantity || item.qty || 1);
    const itemTotal = price * qty;
    subtotal += itemTotal;

    let customDetails = '';
    if (item.customization) {
      const c = item.customization;
      if (c.threadColor || c.embroideryText) {
        customDetails += `<div style="font-size:0.8rem; color:#888; margin-top:3px;">Embroidery: "${c.embroideryText || 'None'}" (${c.threadColor || 'Default Color'})</div>`;
      }
      if (c.boxColor || c.ribbonColor || c.waxSeal) {
        customDetails += `<div style="font-size:0.8rem; color:#888;">Gift Wrap: Box (${c.boxColor || 'Cream'}), Ribbon (${c.ribbonColor || 'Gold'}), Seal (${c.waxSeal || 'None'})</div>`;
      }
    }

    return `
      <div class="summary-item-row">
        <div>
          <div style="font-weight:600; font-size:0.95rem; color:#1a1a1a;">${item.name}</div>
          <div style="font-size:0.85rem; color:#666;">Qty: ${qty} x ${price.toLocaleString('vi-VN')}đ</div>
          ${customDetails}
        </div>
        <div style="font-weight:600; color:#1a1a1a;">${itemTotal.toLocaleString('vi-VN')}đ</div>
      </div>
    `;
  }).join('');

  const grandTotal = subtotal + shippingFee;

  if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('vi-VN') + 'đ';
  if (shippingEl) shippingEl.textContent = shippingFee.toLocaleString('vi-VN') + 'đ';
  if (grandTotalEl) grandTotalEl.textContent = grandTotal.toLocaleString('vi-VN') + 'đ';

  // 5. Submit Order Action
  window.submitOrder = function() {
    const name = document.getElementById('shipping-name').value.trim();
    const phone = document.getElementById('shipping-phone').value.trim();
    const email = document.getElementById('shipping-email').value.trim().toLowerCase();
    const address = document.getElementById('shipping-address').value.trim();
    const notes = document.getElementById('shipping-notes').value.trim();

    if (!name || !phone || !email || !address) {
      alert("Please fill in all required shipping fields.");
      return;
    }

    // Optional: save address to user's profile
    const saveAddressCheckbox = document.getElementById('checkout-save-address-checkbox');
    const saveAddressWrapper = document.getElementById('checkout-save-address-profile-wrapper');
    if (saveAddressWrapper && saveAddressWrapper.style.display !== 'none' && saveAddressCheckbox && saveAddressCheckbox.checked) {
      let addrs = currentUser.addresses || [];
      addrs.forEach(a => a.isDefault = false);
      addrs.push({
        id: 'addr-chk-' + Date.now(),
        label: 'Saved Address ' + (addrs.length + 1),
        name: name,
        phone: phone,
        detail: address,
        isDefault: true
      });
      window.GradieStore.updateUserProfile(currentUser.email, { addresses: addrs });
    }

    // Generate unique order tracking code
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GRD-26-${randPart}`;

    // Prepare order object
    const orderObject = {
      orderNumber: orderNumber,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: address,
      notes: notes,
      paymentMethod: "COD",
      date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: parseInt(item.quantity || item.qty || 1),
        price: item.price,
        customization: item.customization || null
      })),
      subtotal: subtotal,
      shippingFee: shippingFee,
      total: grandTotal,
      status: "Pending" // Initial status in dashboard
    };

    // Deduct stock and record order
    cart.forEach(item => {
      const qty = parseInt(item.quantity || item.qty || 1);
      window.GradieStore.deductStock(item.id, qty);
    });

    window.GradieStore.addOrder(orderObject);

    // Clear cart across both possible keys
    localStorage.removeItem('GRADIE_CART');
    localStorage.removeItem('gradie_cart');
    if (window.updateCartCount) window.updateCartCount();

    // Render gorgeous Success Screen
    const mainEl = document.getElementById('checkout-main-content');
    mainEl.innerHTML = `
      <div class="success-container">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(216,169,79,0.1); color: #d8a94f; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 25px;">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 style="font-family:'Playfair Display', serif; font-size: 2.2rem; color: #1a1a1a; margin-bottom: 15px;">Order Placed Successfully!</h1>
        <p style="color: #666; font-size: 1.05rem; line-height: 1.6; margin-bottom: 30px;">
          Thank you for choosing Gradie. Your luxurious champagne gift box order has been recorded successfully. 
          Our delivery team will collect payment via <strong>Cash on Delivery (COD)</strong>.
        </p>
        <div style="background: #faf8f5; border: 1px dashed #d8a94f; padding: 20px; border-radius: 12px; margin-bottom: 35px;">
          <span style="font-size:0.85rem; color:#888; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:5px;">Your Order Tracking Code</span>
          <strong id="tracking-code-display" style="font-size: 1.6rem; letter-spacing: 1px; color: #1a1a1a;">${orderNumber}</strong>
          <button onclick="navigator.clipboard.writeText('${orderNumber}'); alert('Copied tracking code to clipboard!');" style="margin-left:12px; background:none; border:none; color:#d8a94f; font-weight:600; cursor:pointer; font-size:0.9rem;">Copy</button>
        </div>
        <div style="display:flex; gap:15px; justify-content:center;">
          <a href="order-tracking.html?code=${orderNumber}" class="btn-primary" style="padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:600;">Track Order Now</a>
          <a href="products.html" class="outline-button" style="padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:600;">Continue Shopping</a>
        </div>
      </div>
    `;
  };
});
