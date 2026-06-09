// js/checkout.js
document.addEventListener('DOMContentLoaded', () => {
  if (!window.GradieStore) return;

  // 0. Enforce user authentication
  const currentUser = window.GradieStore.getCurrentUser();
  if (!currentUser) {
    showToast('Vui lòng đăng nhập để tiến hành thanh toán.', 'warning');
    setTimeout(() => { window.location.href = 'login.html?redirect=checkout'; }, 1200);
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
    showToast('Giỏ hàng của bạn đang trống. Đang chuyển đến cửa hàng...', 'info');
    setTimeout(() => { window.location.href = 'products.html'; }, 1500);
    return;
  }

  // 2. Pre-fill user profile and saved addresses cards if logged in
  if (currentUser) {
    document.getElementById('shipping-email').value = currentUser.email || '';
    
    const addressesWrapper = document.getElementById('checkout-saved-addresses-wrapper');
    const cardsContainer = document.getElementById('checkout-address-cards-container');
    const saveAddressWrapper = document.getElementById('checkout-save-address-profile-wrapper');
    const saveAddressCheckbox = document.getElementById('checkout-save-address-checkbox');
    const savedAddrs = currentUser.addresses || [];

    // Checked by default for logged-in users to save changes automatically unless they opt-out
    if (saveAddressCheckbox) saveAddressCheckbox.checked = true;

    if (savedAddrs.length > 0) {
      if (addressesWrapper && cardsContainer) {
        addressesWrapper.style.display = 'block';
        
        // Find default address
        const defaultAddr = savedAddrs.find(a => a.isDefault) || savedAddrs[0];
        window._selectedCheckoutAddressId = defaultAddr ? defaultAddr.id : 'new';

        // Declare global selectCheckoutAddressCard handler
        window.selectCheckoutAddressCard = function(selectedId) {
          window._selectedCheckoutAddressId = selectedId;
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

          // Populate inputs and ensure they are never locked/readOnly
          if (selectedId === 'new') {
            document.getElementById('shipping-name').value = '';
            document.getElementById('shipping-phone').value = '';
            document.getElementById('shipping-address').value = '';
            document.getElementById('shipping-name').readOnly = false;
            document.getElementById('shipping-phone').readOnly = false;
            document.getElementById('shipping-address').readOnly = false;
          } else {
            const selected = savedAddrs.find(a => a.id === selectedId);
            if (selected) {
              document.getElementById('shipping-name').value = selected.name || '';
              document.getElementById('shipping-phone').value = selected.phone || '';
              document.getElementById('shipping-address').value = selected.detail || '';
            }
            document.getElementById('shipping-name').readOnly = false;
            document.getElementById('shipping-phone').readOnly = false;
            document.getElementById('shipping-address').readOnly = false;
          }
          if (saveAddressWrapper) saveAddressWrapper.style.display = 'block';
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
                  ${a.isDefault ? '<span style="background:var(--warm-cream, #fef4e8); color:var(--champagne, #d8a94f); font-size:0.7rem; font-weight:600; padding:2px 8px; border-radius:4px; border:1px solid #d8a94f; letter-spacing:0.5px;">MẶC ĐỊNH</span>' : ''}
                </div>
                <div style="font-size:0.85rem; color:#666; margin-top:6px;">Người nhận: <strong>${a.name}</strong> | SĐT: ${a.phone}</div>
                <div style="font-size:0.85rem; color:#666; margin-top:3px;">Địa chỉ: ${a.detail}</div>
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
              <strong style="font-size:0.95rem; color:#1a1a1a; font-family: inherit;">Sử dụng địa chỉ nhận hàng mới</strong>
              <div style="font-size:0.82rem; color:#666; margin-top:4px;">Nhập tên người nhận, số điện thoại và thông tin địa chỉ mới bên dưới.</div>
            </div>
            <div class="circle-indicator" style="width:20px; height:20px; border-radius:50%; border:2px solid #cbd5e1; display:flex; align-items:center; justify-content:center; background:transparent;">
            </div>
          </div>
        `;

        cardsContainer.innerHTML = cardsHtml;

        // Auto-fill inputs initially with default selection details and keep editable
        if (defaultAddr) {
          document.getElementById('shipping-name').value = defaultAddr.name || '';
          document.getElementById('shipping-phone').value = defaultAddr.phone || '';
          document.getElementById('shipping-address').value = defaultAddr.detail || '';
          document.getElementById('shipping-name').readOnly = false;
          document.getElementById('shipping-phone').readOnly = false;
          document.getElementById('shipping-address').readOnly = false;
        }
        if (saveAddressWrapper) saveAddressWrapper.style.display = 'block';
      }
    } else {
      // User has no saved addresses, prefill name and phone, show save address checkbox and keep editable
      window._selectedCheckoutAddressId = 'new';
      document.getElementById('shipping-name').value = currentUser.username || '';
      document.getElementById('shipping-phone').value = currentUser.phone || '';
      document.getElementById('shipping-address').value = currentUser.shippingAddress || '';
      document.getElementById('shipping-name').readOnly = false;
      document.getElementById('shipping-phone').readOnly = false;
      document.getElementById('shipping-address').readOnly = false;
      if (saveAddressWrapper) saveAddressWrapper.style.display = 'block';
    }
  }

  // 3. Dynamic Shipping Fee based on Province & Coupon Variables
  const settings = window.GradieStore.getSettings();
  let shippingFee = settings.shippingFee !== undefined ? Number(settings.shippingFee) : 30000;
  let activeCouponCode = '';
  let discountAmount = 0;
  let subtotal = 0;

  // Recalculate and update pricing layout
  function recalculateTotals() {
    let baseShipping = shippingFee;
    discountAmount = 0;

    if (activeCouponCode) {
      const upperCode = activeCouponCode.toUpperCase().trim();
      const dbPromoCode = (settings.promoCode || 'GRAD2026').toUpperCase().trim();

      if (upperCode === dbPromoCode) {
        // Flat discount from settings
        const flatDiscount = Number(settings.promoDiscount) || 50000;
        discountAmount = Math.min(flatDiscount, subtotal);
      } else if (upperCode === 'WELCOME10') {
        // 10% discount off subtotal
        discountAmount = Math.round(subtotal * 0.1);
      } else if (upperCode === 'FREESHIP') {
        // Waive shipping
        discountAmount = baseShipping;
      }
    }

    const finalTotal = Math.max(0, subtotal + baseShipping - discountAmount);

    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('vi-VN') + 'đ';
    if (shippingEl) shippingEl.textContent = baseShipping.toLocaleString('vi-VN') + 'đ';

    const discountRow = document.getElementById('discount-row');
    const activeCouponLabel = document.getElementById('active-coupon-label');
    const checkoutDiscount = document.getElementById('checkout-discount');

    if (discountAmount > 0 && activeCouponCode) {
      if (discountRow) discountRow.style.display = 'flex';
      if (activeCouponLabel) activeCouponLabel.textContent = activeCouponCode.toUpperCase();
      if (checkoutDiscount) checkoutDiscount.textContent = '-' + discountAmount.toLocaleString('vi-VN') + 'đ';
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }

    if (grandTotalEl) grandTotalEl.textContent = finalTotal.toLocaleString('vi-VN') + 'đ';

    // If QR code payment is active, regenerate VietQR code with correct amount
    if (window._currentPaymentMethod === 'qr') {
      window.generateVietQR();
    }
  }

  // Update shipping fee dynamically when address changes
  function updateShippingByProvince(address) {
    const hcmKeywords = ['hồ chí minh', 'hcm', 'ho chi minh', 'sài gòn', 'sai gon', 'quận', 'quan '];
    const isHCM = hcmKeywords.some(kw => address.toLowerCase().includes(kw));
    const newFee = isHCM ? 20000 : 40000;
    if (newFee !== shippingFee) {
      shippingFee = newFee;
      recalculateTotals();
      const label = isHCM ? 'Nội thành HCM (20.000đ)' : 'Ngoại tỉnh (40.000đ)';
      showToast('Phí vận chuyển: ' + label, 'info');
    }
  }

  // Watch address input for province detection
  const addrInput = document.getElementById('shipping-address');
  if (addrInput) {
    addrInput.addEventListener('blur', () => updateShippingByProvince(addrInput.value));
  }

  // Apply Coupon Function
  window.applyCoupon = function() {
    const input = document.getElementById('coupon-code-input');
    const msgEl = document.getElementById('coupon-message');
    if (!input || !msgEl) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      showToast('Vui lòng nhập mã giảm giá!', 'warning');
      return;
    }

    const dbPromoCode = (settings.promoCode || 'GRAD2026').toUpperCase().trim();
    let isValid = false;
    let message = '';
    let isSuccess = false;

    if (code === dbPromoCode) {
      isValid = true;
      const discountVal = Number(settings.promoDiscount) || 50000;
      message = `Áp dụng thành công mã giảm ${discountVal.toLocaleString('vi-VN')}đ!`;
      isSuccess = true;
    } else if (code === 'WELCOME10') {
      isValid = true;
      message = 'Áp dụng thành công mã giảm 10% tổng giá trị sản phẩm!';
      isSuccess = true;
    } else if (code === 'FREESHIP') {
      isValid = true;
      message = 'Áp dụng thành công mã miễn phí vận chuyển!';
      isSuccess = true;
    } else {
      message = 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
      isSuccess = false;
    }

    msgEl.style.display = 'block';
    if (isSuccess) {
      msgEl.style.color = '#15803d'; // green-700
      msgEl.textContent = '✓ ' + message;
      activeCouponCode = code;
      showToast('Áp dụng mã giảm giá thành công!', 'success');
    } else {
      msgEl.style.color = '#b91c1c'; // red-700
      msgEl.textContent = '✗ ' + message;
      activeCouponCode = '';
      showToast('Mã giảm giá không hợp lệ!', 'error');
    }

    recalculateTotals();
  };

  // 4. Render Order Summary
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
        customDetails += `<div style="font-size:0.8rem; color:#888; margin-top:3px;">Thêu chữ: "${c.embroideryText || 'Không'}" (${c.threadColor || 'Màu mặc định'})</div>`;
      }
      if (c.boxColor || c.ribbonColor || c.waxSeal) {
        customDetails += `<div style="font-size:0.8rem; color:#888;">Hộp quà: Hộp (${c.boxColor || 'Kem'}), Ruy băng (${c.ribbonColor || 'Vàng'}), Con dấu (${c.waxSeal || 'Không'})</div>`;
      }
    }

    return `
      <div class="summary-item-row">
        <div>
          <div style="font-weight:600; font-size:0.95rem; color:#1a1a1a;">${item.name}</div>
          <div style="font-size:0.85rem; color:#666;">Số lượng: ${qty} x ${price.toLocaleString('vi-VN')}đ</div>
          ${customDetails}
        </div>
        <div style="font-weight:600; color:#1a1a1a;">${itemTotal.toLocaleString('vi-VN')}đ</div>
      </div>
    `;
  }).join('');

  // Initial recalculation call to load values
  recalculateTotals();

  // 5. Submit Order Action
  window.submitOrder = function() {
    const name = document.getElementById('shipping-name').value.trim();
    const phone = document.getElementById('shipping-phone').value.trim();
    const email = document.getElementById('shipping-email').value.trim().toLowerCase();
    const address = document.getElementById('shipping-address').value.trim();
    const notes = document.getElementById('shipping-notes').value.trim();

    if (!name || !phone || !email || !address) {
      showToast('Vui lòng điền đầy đủ thông tin giao hàng!', 'error');
      return;
    }

    // Optional: save address to user's profile
    const saveAddressCheckbox = document.getElementById('checkout-save-address-checkbox');
    const saveAddressWrapper = document.getElementById('checkout-save-address-profile-wrapper');
    if (saveAddressWrapper && saveAddressWrapper.style.display !== 'none' && saveAddressCheckbox && saveAddressCheckbox.checked) {
      let addrs = currentUser.addresses || [];
      const selectedId = window._selectedCheckoutAddressId || 'new';

      const existingIndex = addrs.findIndex(a => a.id === selectedId);
      if (existingIndex !== -1 && selectedId !== 'new') {
        // Update existing address details
        addrs[existingIndex].name = name;
        addrs[existingIndex].phone = phone;
        addrs[existingIndex].detail = address;
        addrs.forEach(a => a.isDefault = false);
        addrs[existingIndex].isDefault = true;
      } else {
        // Add new address if exact match doesn't exist
        const exists = addrs.some(a => a.name.trim().toLowerCase() === name.trim().toLowerCase() && 
                                       a.phone.trim() === phone.trim() && 
                                       a.detail.trim().toLowerCase() === address.trim().toLowerCase());
        if (!exists) {
          addrs.forEach(a => a.isDefault = false);
          addrs.push({
            id: 'addr-chk-' + Date.now(),
            label: 'Địa chỉ đã lưu ' + (addrs.length + 1),
            name: name,
            phone: phone,
            detail: address,
            isDefault: true
          });
        } else {
          // Set existing matching address to default
          addrs.forEach(a => {
            a.isDefault = (a.name.trim().toLowerCase() === name.trim().toLowerCase() && 
                           a.phone.trim() === phone.trim() && 
                           a.detail.trim().toLowerCase() === address.trim().toLowerCase());
          });
        }
      }
      window.GradieStore.updateUserProfile(currentUser.email, { addresses: addrs });
    }

    // Generate unique order tracking code
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GRD-26-${randPart}`;

    const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);
    const paymentMethodText = window._currentPaymentMethod === 'qr' ? 'Chuyển khoản (QR Code)' : 'COD';

    // Prepare order object
    const orderObject = {
      orderNumber: orderNumber,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: address,
      notes: notes,
      paymentMethod: paymentMethodText,
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
      couponApplied: activeCouponCode || null,
      discountAmount: discountAmount,
      total: finalTotal,
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
    const paymentSuccessDesc = window._currentPaymentMethod === 'qr'
      ? 'Phương thức thanh toán: <strong>Chuyển khoản trực tuyến qua mã QR</strong>. Đơn hàng của bạn sẽ được xử lý ngay sau khi hệ thống xác nhận giao dịch.'
      : 'Đội ngũ giao hàng của chúng tôi sẽ thu tiền mặt khi giao hàng tận nơi: <strong>Thanh toán khi nhận hàng (COD)</strong>.';

    mainEl.innerHTML = `
      <div class="success-container">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(216,169,79,0.1); color: #d8a94f; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 25px;">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 style="font-family:'Playfair Display', serif; font-size: 2.2rem; color: #1a1a1a; margin-bottom: 15px;">Đặt Hàng Thành Công!</h1>
        <p style="color: #666; font-size: 1.05rem; line-height: 1.6; margin-bottom: 30px;">
          Cảm ơn bạn đã lựa chọn Gradie. Đơn hàng quà tặng tốt nghiệp sang trọng của bạn đã được lưu lại thành công.<br>
          ${paymentSuccessDesc}
        </p>
        <div style="background: #faf8f5; border: 1px dashed #d8a94f; padding: 20px; border-radius: 12px; margin-bottom: 35px;">
          <span style="font-size:0.85rem; color:#888; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:5px;">Mã Theo Dõi Đơn Hàng Của Bạn</span>
          <strong id="tracking-code-display" style="font-size: 1.6rem; letter-spacing: 1px; color: #1a1a1a;">${orderNumber}</strong>
          <button onclick="navigator.clipboard.writeText('${orderNumber}'); showToast('Đã sao chép mã đơn hàng!', 'success');" style="margin-left:12px; background:none; border:none; color:#d8a94f; font-weight:600; cursor:pointer; font-size:0.9rem;">Sao chép</button>
        </div>
        <div style="display:flex; gap:15px; justify-content:center;">
          <a href="order-tracking.html?code=${orderNumber}" class="btn-primary" style="padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:600; color: white; background: var(--champagne); display: inline-block;">Theo Dõi Đơn Hàng</a>
          <a href="products.html" class="outline-button" style="padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:600; border: 1.5px solid var(--champagne); color: var(--champagne); display: inline-block; background: transparent;">Tiếp Tục Mua Sắm</a>
        </div>
      </div>
    `;
  };
});

// ── VietQR Payment Selection ─────────────────────────────────────────────────
window._currentPaymentMethod = 'cod';

window.selectPayment = function(method) {
  window._currentPaymentMethod = method;
  const cardCod = document.getElementById('payment-card-cod');
  const cardQr  = document.getElementById('payment-card-qr');
  const qrSec   = document.getElementById('vietqr-section');
  const radioCod = document.getElementById('payment-cod');
  const radioQr  = document.getElementById('payment-qr');

  if (method === 'qr') {
    if (cardCod) cardCod.style.borderColor = '#e2e8f0';
    if (cardQr)  { cardQr.style.borderColor = 'var(--champagne)'; cardQr.style.background = 'linear-gradient(135deg, #fdfaf5 0%, #fff9f0 100%)'; }
    if (qrSec)   qrSec.style.display = 'block';
    if (radioQr) radioQr.checked = true;
    // Generate QR
    generateVietQR();
  } else {
    if (cardCod) cardCod.style.borderColor = 'var(--champagne)';
    if (cardQr)  { cardQr.style.borderColor = '#e2e8f0'; cardQr.style.background = '#fff'; }
    if (qrSec)   qrSec.style.display = 'none';
    if (radioCod) radioCod.checked = true;
  }
};

window.generateVietQR = async function() {
  const totalEl = document.getElementById('checkout-grand-total');
  const rawText = totalEl ? totalEl.textContent.replace(/[^\d]/g, '') : '0';
  const amount = parseInt(rawText) || 0;

  // Generate temp order number for QR (will be regenerated on submit)
  const tempOrder = 'GRD-' + Math.floor(1000 + Math.random() * 9000);
  window._tempOrderForQR = tempOrder;

  const qrImg     = document.getElementById('qr-image');
  const qrLoading = document.getElementById('qr-loading');
  const qrInfo    = document.getElementById('qr-info');

  if (qrLoading) qrLoading.style.display = 'block';
  if (qrImg)     qrImg.style.display = 'none';
  if (qrInfo)    qrInfo.style.display = 'none';

  try {
    const res = await fetch('/api/vietqr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, orderNumber: tempOrder })
    });
    const data = await res.json();

    if (data.qrUrl && qrImg) {
      qrImg.src = data.qrUrl;
      qrImg.onload = () => {
        if (qrLoading) qrLoading.style.display = 'none';
        qrImg.style.display = 'block';
        if (qrInfo) qrInfo.style.display = 'block';
      };
      qrImg.onerror = () => {
        if (qrLoading) qrLoading.textContent = 'Không tải được mã QR. Vui lòng chọn COD.';
      };
      // Fill info
      const bankEl = document.getElementById('qr-bank');
      const acctEl = document.getElementById('qr-acct');
      const nameEl = document.getElementById('qr-name');
      const descEl = document.getElementById('qr-desc');
      if (bankEl) bankEl.textContent = data.bankCode;
      if (acctEl) acctEl.textContent = data.accountNumber;
      if (nameEl) nameEl.textContent = data.accountName;
      if (descEl) descEl.textContent = data.description;
    }
  } catch (e) {
    if (qrLoading) qrLoading.textContent = 'Không thể tạo mã QR. Vui lòng chọn COD.';
    console.error('VietQR error:', e);
  }
};

