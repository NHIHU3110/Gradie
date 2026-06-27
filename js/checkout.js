// js/checkout.js
document.addEventListener('DOMContentLoaded', async () => {
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

  // Address selectors
  const provinceSel = document.getElementById('shipping-province');
  const districtSel = document.getElementById('shipping-district');
  const wardSel = document.getElementById('shipping-ward');
  const streetInput = document.getElementById('shipping-street');
  const addressHidden = document.getElementById('shipping-address');

  let vnDivisions = null;

  // Fetch and cache Vietnam administrative divisions data
  async function loadVNDivisions() {
    const cached = localStorage.getItem('GRADIE_VN_DIVISIONS');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached divisions, refetching...');
      }
    }
    try {
      const res = await fetch('https://cdn.jsdelivr.net/gh/daohoangson/dvhcvn@master/data/dvhcvn.json');
      const json = await res.json();
      if (json && json.data) {
        localStorage.setItem('GRADIE_VN_DIVISIONS', JSON.stringify(json.data));
        return json.data;
      }
    } catch (err) {
      console.error('Failed to fetch Vietnam divisions:', err);
    }
    return null;
  }

  // Clean string for fuzzy comparison
  function cleanString(str) {
    if (!str) return '';
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Check if string contains standard administrative prefixes
  function getCoreName(str) {
    let clean = cleanString(str);
    const prefixes = [
      'thanh pho', 'tinh', 'quan', 'huyen', 'thi xa', 'phuong', 'xa', 'thi tran'
    ];
    for (const p of prefixes) {
      if (clean.startsWith(p + ' ')) {
        clean = clean.substring(p.length + 1).trim();
        break;
      }
    }
    return clean;
  }

  function populateDistricts(provinceId, selectId = '') {
    if (!districtSel || !wardSel) return;
    if (!provinceId) {
      districtSel.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>';
      districtSel.disabled = true;
      wardSel.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
      wardSel.disabled = true;
      return;
    }

    const province = vnDivisions.find(p => p.level1_id === provinceId);
    if (province && province.level2s) {
      districtSel.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>' +
        province.level2s.map(d => `<option value="${d.level2_id}">${d.name}</option>`).join('');
      districtSel.disabled = false;
      districtSel.value = selectId;
      
      if (!selectId) {
        wardSel.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
        wardSel.disabled = true;
      }
    }
  }

  function populateWards(provinceId, districtId, selectId = '') {
    if (!wardSel) return;
    if (!provinceId || !districtId) {
      wardSel.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
      wardSel.disabled = true;
      return;
    }

    const province = vnDivisions.find(p => p.level1_id === provinceId);
    if (province && province.level2s) {
      const district = province.level2s.find(d => d.level2_id === districtId);
      if (district && district.level3s) {
        wardSel.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>' +
          district.level3s.map(w => `<option value="${w.level3_id}">${w.name}</option>`).join('');
        wardSel.disabled = false;
        wardSel.value = selectId;
      }
    }
  }

  function updateCombinedAddress() {
    if (!provinceSel || !districtSel || !wardSel || !streetInput || !addressHidden) return;
    const provinceText = provinceSel.options[provinceSel.selectedIndex]?.text || '';
    const districtText = districtSel.options[districtSel.selectedIndex]?.text || '';
    const wardText = wardSel.options[wardSel.selectedIndex]?.text || '';
    const streetText = streetInput.value.trim();

    if (provinceSel.value && districtSel.value && wardSel.value && streetText) {
      addressHidden.value = `${streetText}, ${wardText}, ${districtText}, ${provinceText}`;
    } else {
      addressHidden.value = '';
    }

    if (provinceSel.value) {
      updateShippingByProvince(provinceText);
    }
  }

  function setDropdownsFromAddressString(addressStr) {
    if (!addressStr || !vnDivisions) return;
    
    const parts = addressStr.split(',').map(p => p.trim());
    if (parts.length < 3) {
      if (streetInput) streetInput.value = addressStr;
      if (addressHidden) addressHidden.value = addressStr;
      return;
    }

    const provName = parts[parts.length - 1];
    const distName = parts[parts.length - 2];
    const wardName = parts[parts.length - 3];
    
    const streetParts = parts.slice(0, parts.length - 3);
    const streetText = streetParts.join(', ');
    if (streetInput) streetInput.value = streetText;

    const cleanProv = getCoreName(provName);
    const matchedProv = vnDivisions.find(p => getCoreName(p.name) === cleanProv || cleanString(p.name).includes(cleanProv));
    
    if (matchedProv) {
      if (provinceSel) provinceSel.value = matchedProv.level1_id;
      populateDistricts(matchedProv.level1_id);

      const cleanDist = getCoreName(distName);
      const matchedDist = matchedProv.level2s.find(d => getCoreName(d.name) === cleanDist || cleanString(d.name).includes(cleanDist));
      
      if (matchedDist) {
        if (districtSel) districtSel.value = matchedDist.level2_id;
        populateWards(matchedProv.level1_id, matchedDist.level2_id);

        const cleanWard = getCoreName(wardName);
        const matchedWard = matchedDist.level3s.find(w => getCoreName(w.name) === cleanWard || cleanString(w.name).includes(cleanWard));
        if (matchedWard) {
          if (wardSel) wardSel.value = matchedWard.level3_id;
        }
      }
    }
    
    if (addressHidden) addressHidden.value = addressStr;
    updateShippingByProvince(provName);
  }

  async function initDropdowns() {
    vnDivisions = await loadVNDivisions();
    if (!vnDivisions) {
      showToast('Không tải được dữ liệu địa chính. Vui lòng tải lại trang.', 'error');
      return;
    }

    if (provinceSel) {
      provinceSel.innerHTML = '<option value="">-- Chọn Tỉnh / Thành phố --</option>' +
        vnDivisions.map(p => `<option value="${p.level1_id}">${p.name}</option>`).join('');

      provinceSel.addEventListener('change', () => {
        const provId = provinceSel.value;
        populateDistricts(provId);
        updateCombinedAddress();
      });
    }

    if (districtSel) {
      districtSel.addEventListener('change', () => {
        const provId = provinceSel.value;
        const distId = districtSel.value;
        populateWards(provId, distId);
        updateCombinedAddress();
      });
    }

    if (wardSel) {
      wardSel.addEventListener('change', updateCombinedAddress);
    }

    if (streetInput) {
      streetInput.addEventListener('input', updateCombinedAddress);
    }
  }

  // Initialize dropdowns first
  await initDropdowns();
  
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

  // 3. Dynamic Shipping Fee based on Province & Coupon Variables
  const settings = window.GradieStore.getSettings();
  let shippingFee = settings.shippingFee !== undefined ? Number(settings.shippingFee) : 30000;
  let activeCouponCode = '';
  let discountAmount = 0;
  let subtotal = 0;

  // 2. Pre-fill user profile and saved addresses cards if logged in
  if (currentUser) {
    document.getElementById('shipping-email').value = currentUser.email || '';
    
    const addressesWrapper = document.getElementById('checkout-saved-addresses-wrapper');
    const cardsContainer = document.getElementById('checkout-address-cards-container');
    const saveAddressWrapper = document.getElementById('checkout-save-address-profile-wrapper');
    const saveAddressCheckbox = document.getElementById('checkout-save-address-checkbox');
    const savedAddrs = currentUser.addresses || [];

    if (saveAddressCheckbox) saveAddressCheckbox.checked = true;

    if (savedAddrs.length > 0) {
      if (addressesWrapper && cardsContainer) {
        addressesWrapper.style.display = 'block';
        
        const defaultAddr = savedAddrs.find(a => a.isDefault) || savedAddrs[0];
        window._selectedCheckoutAddressId = defaultAddr ? defaultAddr.id : 'new';

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

          if (selectedId === 'new') {
            document.getElementById('shipping-name').value = '';
            document.getElementById('shipping-phone').value = '';
            if (provinceSel) provinceSel.value = '';
            if (districtSel) { districtSel.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>'; districtSel.disabled = true; }
            if (wardSel) { wardSel.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>'; wardSel.disabled = true; }
            if (streetInput) streetInput.value = '';
            if (addressHidden) addressHidden.value = '';
            document.getElementById('shipping-name').readOnly = false;
            document.getElementById('shipping-phone').readOnly = false;
          } else {
            const selected = savedAddrs.find(a => a.id === selectedId);
            if (selected) {
              document.getElementById('shipping-name').value = selected.name || '';
              document.getElementById('shipping-phone').value = selected.phone || '';
              setDropdownsFromAddressString(selected.detail || '');
            }
            document.getElementById('shipping-name').readOnly = false;
            document.getElementById('shipping-phone').readOnly = false;
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

        if (defaultAddr) {
          document.getElementById('shipping-name').value = defaultAddr.name || '';
          document.getElementById('shipping-phone').value = defaultAddr.phone || '';
          setDropdownsFromAddressString(defaultAddr.detail || '');
          document.getElementById('shipping-name').readOnly = false;
          document.getElementById('shipping-phone').readOnly = false;
        }
        if (saveAddressWrapper) saveAddressWrapper.style.display = 'block';
      }
    } else {
      window._selectedCheckoutAddressId = 'new';
      document.getElementById('shipping-name').value = currentUser.username || '';
      document.getElementById('shipping-phone').value = currentUser.phone || '';
      setDropdownsFromAddressString(currentUser.shippingAddress || '');
      document.getElementById('shipping-name').readOnly = false;
      document.getElementById('shipping-phone').readOnly = false;
      if (saveAddressWrapper) saveAddressWrapper.style.display = 'block';
    }
  }

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

  // Get shipping fee by province name
  function getShippingFeeByProvince(provinceName) {
    const cleanProv = getCoreName(provinceName);
    
    // 20k: Ho Chi Minh City
    if (cleanProv === 'ho chi minh') return 20000;
    
    // 25k: Southern neighboring provinces
    const southNeighbors = ['binh duong', 'dong nai', 'long an', 'tay ninh', 'ba ria vung tau', 'binh phuoc'];
    if (southNeighbors.some(prov => cleanProv.includes(prov) || prov.includes(cleanProv))) return 25000;
    
    // 30k: Mekong Delta provinces
    const mekongDelta = ['tien giang', 'ben tre', 'vinh long', 'tra vinh', 'can tho', 'hau giang', 'soc trang', 'bac lieu', 'ca mau', 'kien giang', 'an giang', 'dong thap'];
    if (mekongDelta.some(prov => cleanProv.includes(prov) || prov.includes(cleanProv))) return 30000;
    
    // 35k: Central Highlands & South Central Coast
    const centralHighlands = ['lam dong', 'dak nong', 'dak lak', 'dac lac', 'gia lai', 'kon tum', 'binh thuan', 'ninh thuan', 'khanh hoa', 'phu yen', 'binh dinh', 'quang ngai'];
    if (centralHighlands.some(prov => cleanProv.includes(prov) || prov.includes(cleanProv))) return 35000;
    
    // 38k: North Central Coast & Danang & Hue
    const northCentral = ['da nang', 'hue', 'quang nam', 'quang tri', 'quang binh', 'ha tinh', 'nghe an', 'thanh hoa'];
    if (northCentral.some(prov => cleanProv.includes(prov) || prov.includes(cleanProv))) return 38000;
    
    // 40k: Northern provinces & Hanoi
    const northern = ['ha noi', 'hai phong', 'hai duong', 'hung yen', 'bac ninh', 'vinh phuc', 'thai nguyen', 'phu tho', 'bac giang', 'quang ninh', 'nam dinh', 'thai binh', 'ha nam', 'ninh binh'];
    if (northern.some(prov => cleanProv.includes(prov) || prov.includes(cleanProv))) return 40000;
    
    // 45k: Far North / Mountainous provinces
    const farNorth = ['hoa binh', 'son la', 'dien bien', 'lai chau', 'lao cai', 'yen bai', 'ha giang', 'tuyen quang', 'cao bang', 'lang son', 'bac kan'];
    if (farNorth.some(prov => cleanProv.includes(prov) || prov.includes(cleanProv))) return 45000;
    
    return 35000; // Fallback default shipping fee
  }

  // Update shipping fee dynamically when address changes
  function updateShippingByProvince(address) {
    if (!address) return;
    const parts = address.split(',');
    const provincePart = parts[parts.length - 1].trim();
    const newFee = getShippingFeeByProvince(provincePart);
    
    if (newFee !== shippingFee) {
      shippingFee = newFee;
      recalculateTotals();
      showToast(`Cập nhật phí vận chuyển: ${newFee.toLocaleString('vi-VN')}đ (${provincePart})`, 'info');
    }
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
    const price = Number(item.price) || (baseProduct ? Number(baseProduct.price) : 0);
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
    if (item.variant) {
      customDetails = `<div style="font-size:0.8rem; color:#666; margin-top:3px;">Phân loại: ${item.variant}</div>` + customDetails;
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
        variant: item.variant || '',
        variantSku: item.variantSku || '',
        customization: item.customization || null
      })),
      subtotal: subtotal,
      shippingFee: shippingFee,
      couponApplied: activeCouponCode || null,
      discountAmount: discountAmount,
      total: finalTotal,
      status: "Pending", // Initial status in dashboard
      source: "Website"
    };

    // Deduct stock and record order
    cart.forEach(item => {
      const qty = parseInt(item.quantity || item.qty || 1);
      window.GradieStore.deductStock(item.id, qty, item.variantSku || '', item.variant || '');
    });

    window.GradieStore.addOrder(orderObject);

    // Send invoice email to customer (via EmailJS)
    sendOrderInvoiceEmail(orderObject, cart);

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
      // Fill info text
      const nameEl = document.getElementById('qr-name');
      const descEl = document.getElementById('qr-desc');
      if (nameEl) nameEl.textContent = data.accountName;
      if (descEl) descEl.textContent = data.description;
    }
  } catch (e) {
    if (qrLoading) qrLoading.textContent = 'Không thể tạo mã QR. Vui lòng chọn COD.';
    console.error('VietQR error:', e);
  }
};


// ── Send Order Invoice Email (via EmailJS) ────────────────────────────────────
// Để bật tính năng: vào emailjs.com, tạo account miễn phí, lấy các key và điền vào đây.
const EMAILJS_PUBLIC_KEY  = 'YOUR_EMAILJS_PUBLIC_KEY';   // Public Key
const EMAILJS_SERVICE_ID  = 'YOUR_EMAILJS_SERVICE_ID';   // Service ID (Gmail)
const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';  // Template ID

async function sendOrderInvoiceEmail(order, cartItems) {
  // Skip if EmailJS is not configured
  if (!window.emailjs || EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
    console.info('[Gradie] EmailJS chưa được cấu hình. Bỏ qua gửi email hóa đơn.');
    return;
  }

  try {
    window.emailjs.init(EMAILJS_PUBLIC_KEY);

    // Build items HTML table rows for email
    let itemsHtml = '';
    cartItems.forEach(item => {
      const baseProduct = window.GradieStore ? window.GradieStore.getProductById(item.id) : null;
      const price = Number(item.price) || (baseProduct ? Number(baseProduct.price) : 0);
      const qty   = parseInt(item.quantity || item.qty || 1);
      const total = price * qty;
      const imgSrc = (baseProduct && baseProduct.image) ? baseProduct.image : '';

      itemsHtml += `
        <tr style="border-bottom: 1px solid #f0ebe0;">
          <td style="padding: 12px 10px; vertical-align: middle;">
            ${imgSrc
              ? `<img src="${imgSrc}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; border:1px solid #eee;">`
              : '<div style="width:60px;height:60px;background:#f5f0e8;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">🎁</div>'}
          </td>
          <td style="padding: 12px 10px; vertical-align: middle;">
            <div style="font-weight: 600; color: #1a1a1a; font-size: 0.95rem;">${item.name}</div>
            ${item.customization && item.customization.embroideryText
              ? `<div style="font-size:0.8rem; color:#888; margin-top:3px;">Thêu: "${item.customization.embroideryText}"</div>`
              : ''}
          </td>
          <td style="padding: 12px 10px; text-align: center; vertical-align: middle; color: #555;">${qty}</td>
          <td style="padding: 12px 10px; text-align: right; vertical-align: middle; color: #555;">${price.toLocaleString('vi-VN')}đ</td>
          <td style="padding: 12px 10px; text-align: right; vertical-align: middle; font-weight: 700; color: #d8a94f;">${total.toLocaleString('vi-VN')}đ</td>
        </tr>
      `;
    });

    const discountRow = order.discountAmount > 0
      ? `<tr><td colspan="4" style="text-align:right; padding:8px 10px; color:#555;">Giảm giá (${order.couponApplied || ''}):</td><td style="text-align:right; padding:8px 10px; color:#dc2626; font-weight:600;">-${order.discountAmount.toLocaleString('vi-VN')}đ</td></tr>`
      : '';

    // Build beautiful HTML email body
    const emailBody = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f8f5f0;font-family:Arial,sans-serif;"><div style="max-width:600px;margin:20px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);"><div style="background:linear-gradient(135deg,#1a1a1a,#2d2010);padding:35px 40px;text-align:center;"><div style="font-family:Georgia,serif;font-size:2.2rem;color:#d8a94f;letter-spacing:4px;font-weight:700;">GRADIE</div><div style="color:rgba(216,169,79,0.7);font-size:0.8rem;letter-spacing:3px;margin-top:4px;">QUÀ TẶNG TỐT NGHIỆP</div></div><div style="background:linear-gradient(135deg,#d8a94f,#c4932a);padding:20px 40px;text-align:center;"><div style="font-size:1.1rem;color:#fff;font-weight:600;">🎉 Cảm ơn bạn đã đặt hàng tại Gradie!</div><div style="font-size:0.85rem;color:rgba(255,255,255,0.85);margin-top:5px;">Đơn hàng đã được tiếp nhận và đang được xử lý.</div></div><div style="padding:30px 40px;"><div style="background:#faf8f5;border:1px dashed #d8a94f;border-radius:12px;padding:18px 22px;margin-bottom:28px;"><div style="font-size:0.75rem;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Mã Đơn Hàng</div><div style="font-size:1.4rem;font-weight:800;color:#1a1a1a;letter-spacing:1px;">${order.orderNumber}</div><div style="font-size:0.85rem;color:#888;margin-top:6px;">Ngày đặt: ${order.date}</div></div><div style="margin-bottom:24px;"><div style="font-size:0.75rem;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #f0ebe0;">Chi Tiết Sản Phẩm</div><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#faf8f5;"><th style="padding:10px;text-align:left;font-size:0.78rem;color:#999;width:70px;">Ảnh</th><th style="padding:10px;text-align:left;font-size:0.78rem;color:#999;">Sản Phẩm</th><th style="padding:10px;text-align:center;font-size:0.78rem;color:#999;">SL</th><th style="padding:10px;text-align:right;font-size:0.78rem;color:#999;">Đơn giá</th><th style="padding:10px;text-align:right;font-size:0.78rem;color:#999;">Thành tiền</th></tr></thead><tbody>${itemsHtml}</tbody></table></div><div style="background:#faf8f5;border-radius:10px;padding:18px 22px;margin-bottom:24px;"><table style="width:100%;border-collapse:collapse;"><tr><td style="padding:6px 0;color:#666;">Tạm tính:</td><td style="text-align:right;padding:6px 0;color:#333;">${order.subtotal.toLocaleString('vi-VN')}đ</td></tr><tr><td style="padding:6px 0;color:#666;">Phí vận chuyển:</td><td style="text-align:right;padding:6px 0;color:#333;">${order.shippingFee.toLocaleString('vi-VN')}đ</td></tr>${discountRow}<tr style="border-top:2px solid #e5e2dd;"><td style="padding:12px 0 6px;font-weight:800;color:#1a1a1a;font-size:1.05rem;">Tổng Thanh Toán:</td><td style="text-align:right;padding:12px 0 6px;font-weight:800;color:#d8a94f;font-size:1.2rem;">${order.total.toLocaleString('vi-VN')}đ</td></tr></table></div><div style="margin-bottom:24px;"><div style="font-size:0.75rem;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #f0ebe0;">Thông Tin Giao Hàng</div><table style="width:100%;"><tr><td style="padding:5px 0;color:#888;font-size:0.85rem;width:140px;">Người nhận:</td><td style="padding:5px 0;font-weight:600;color:#1a1a1a;">${order.customerName}</td></tr><tr><td style="padding:5px 0;color:#888;font-size:0.85rem;">Điện thoại:</td><td style="padding:5px 0;font-weight:600;color:#1a1a1a;">${order.customerPhone}</td></tr><tr><td style="padding:5px 0;color:#888;font-size:0.85rem;">Địa chỉ:</td><td style="padding:5px 0;font-weight:600;color:#1a1a1a;">${order.shippingAddress}</td></tr><tr><td style="padding:5px 0;color:#888;font-size:0.85rem;">Thanh toán:</td><td style="padding:5px 0;font-weight:600;color:#1a1a1a;">${order.paymentMethod}</td></tr></table></div><div style="text-align:center;margin:30px 0;"><a href="https://gradie-website.vercel.app/order-tracking.html?code=${order.orderNumber}" style="display:inline-block;background:linear-gradient(135deg,#d8a94f,#c4932a);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:0.95rem;box-shadow:0 4px 15px rgba(216,169,79,0.35);">📦 Theo Dõi Đơn Hàng</a></div></div><div style="background:#1a1a1a;padding:24px 40px;text-align:center;"><div style="font-family:Georgia,serif;font-size:1.3rem;color:#d8a94f;margin-bottom:8px;">Gradie</div><div style="color:#888;font-size:0.78rem;line-height:1.8;">Kỷ niệm hôm nay, trân quý mãi về sau.<br>Cảm ơn bạn đã tin tưởng chọn Gradie! 💛</div></div></div></body></html>`;

    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email:         order.customerEmail,
      to_name:          order.customerName,
      order_number:     order.orderNumber,
      order_date:       order.date,
      grand_total:      order.total.toLocaleString('vi-VN') + 'đ',
      payment_method:   order.paymentMethod,
      shipping_address: order.shippingAddress,
      email_body_html:  emailBody,  // Dùng {{{email_body_html}}} trong EmailJS template
    });

    console.info('[Gradie] Email hóa đơn đã gửi thành công tới', order.customerEmail);
  } catch (err) {
    console.warn('[Gradie] Không thể gửi email hóa đơn:', err.message || err);
    // KHÔNG block luồng đặt hàng — bỏ qua lỗi email
  }
}
