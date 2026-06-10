// js/account.js
document.addEventListener('DOMContentLoaded', () => {
  if (!window.GradieStore) return;

  // 1. Login Handler
  const loginForm = document.getElementById('user-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-password').value;
      const msg = document.getElementById('login-message');

      if (!email || !pass) {
        msg.textContent = 'Vui lòng điền đầy đủ thông tin.';
        msg.style.color = 'red';
        return;
      }

      // ADMIN LOGIN INTERCEPT
      const staffList = window.GradieStore.getStaff() || [];
      const matchedStaff = staffList.find(s => s.email === email && (s.password === pass || (!s.password && pass === '123456')));

      if (matchedStaff) {
        localStorage.setItem('GRADIE_ADMIN_AUTH', 'true');
        localStorage.setItem('GRADIE_ACTIVE_ROLE', matchedStaff.role);
        localStorage.setItem('GRADIE_ACTIVE_USER', matchedStaff.name);
        msg.textContent = `Đăng nhập hệ thống thành công! Xin chào ${matchedStaff.name}...`;
        msg.style.color = 'var(--champagne)';
        setTimeout(() => window.location.href = 'admin-dashboard.html', 1000);
        return;
      }

      // User Authentication
      const result = window.GradieStore.loginUser(email, pass);
      if (result.success) {
        msg.textContent = `Chào mừng ${result.user.username || 'Khách'} đến với Gradie! Đang chuyển hướng...`;
        msg.style.color = 'green';
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        const target = redirect === 'checkout' ? 'checkout.html' : 'account.html';
        setTimeout(() => window.location.href = target, 1500);
      } else {
        msg.textContent = result.message;
        msg.style.color = 'red';
      }
    });
  }

  // 2. Signup Handler
  const signupForm = document.getElementById('user-signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const pass = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm-password').value;
      const msg = document.getElementById('signup-message');

      if (pass !== confirm) {
        msg.textContent = 'Mật khẩu xác nhận không khớp.';
        msg.style.color = 'red';
        return;
      }

      const phone = document.getElementById('signup-phone') ? document.getElementById('signup-phone').value.trim() : '';
      const result = window.GradieStore.registerUser(name, email, pass, phone);
      if (result.success) {
        msg.textContent = `Chào mừng ${result.user.username || 'Khách'} đến với Gradie! Đăng ký tài khoản thành công! Đang chuyển hướng...`;
        msg.style.color = 'green';
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        const target = redirect === 'checkout' ? 'checkout.html' : 'account.html';
        setTimeout(() => window.location.href = target, 1500);
      } else {
        msg.textContent = result.message;
        msg.style.color = 'red';
      }
    });
  }

  // Forward ?redirect=checkout query to login/signup toggles
  const queryParams = new URLSearchParams(window.location.search);
  const redirectVal = queryParams.get('redirect');
  if (redirectVal) {
    const signupLink = document.querySelector('a[href="signup.html"]');
    if (signupLink) signupLink.href = `signup.html?redirect=${redirectVal}`;
    const loginLink = document.querySelector('a[href="login.html"]');
    if (loginLink) loginLink.href = `login.html?redirect=${redirectVal}`;
  }

  // 3. Account Dashboard Rendering
  const dashboard = document.getElementById('account-dashboard');
  const prompt = document.getElementById('account-login-prompt');
  const logoutBtn = document.getElementById('user-logout-btn');

  if (dashboard && prompt) {
    const user = window.GradieStore.getCurrentUser();
    if (user) {
      dashboard.style.display = 'grid';
      prompt.style.display = 'none';
      
      // Show page titles
      const pageTitle = document.querySelector('.account-page-title');
      const pageSubtitle = document.querySelector('.account-page-subtitle');
      if (pageTitle) pageTitle.style.display = '';
      if (pageSubtitle) pageSubtitle.style.display = '';

      // Load Profile Fields & Avatar
      document.getElementById('dash-name').textContent = user.username || 'User';
      document.getElementById('dash-email').textContent = user.email || '';
      
      const avatarImg = document.getElementById('dash-avatar');
      if (avatarImg && user.avatar) {
        avatarImg.src = user.avatar;
      }
      
      // Avatar Upload Event
      const avatarUpload = document.getElementById('avatar-upload');
      if (avatarUpload) {
        avatarUpload.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
              const base64 = evt.target.result;
              const res = window.GradieStore.updateUserProfile(user.email, { avatar: base64 });
              if (res.success) {
                if (avatarImg) avatarImg.src = base64;
                showToast('Đã cập nhật ảnh đại diện!', 'success');
              }
            };
            reader.readAsDataURL(file);
          }
        });
      }

      const profileNameInput = document.getElementById('profile-name');
      const profileEmailInput = document.getElementById('profile-email');
      const profilePhoneInput = document.getElementById('profile-phone');

      if (profileNameInput) profileNameInput.value = user.username || '';
      if (profileEmailInput) profileEmailInput.value = user.email || '';
      if (profilePhoneInput) profilePhoneInput.value = user.phone || '';

      // Render their dynamic order history
      window.renderUserOrdersList = function() {
        const orders = window.GradieStore.getOrders();
        const myOrders = orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase());
        const orderList = document.getElementById('recent-orders-list');
        if (!orderList) return;

        if (myOrders.length > 0) {
          orderList.innerHTML = myOrders.map(o => {
            const itemsSummary = o.items.map(item => `${item.name} (x${item.quantity || item.qty || 1})`).join(', ');
            const statusStyle = o.status === 'Completed' ? 'background:#d1fae5; color:#047857;' :
                      o.status === 'Delivered' ? 'background:#dcfce7; color:#15803d;' :
                      o.status === 'Shipped' ? 'background:#dbeafe; color:#2563eb;' :
                      o.status === 'Processing' ? 'background:#fce7f3; color:#be185d;' :
                      o.status === 'Confirmed' ? 'background:#e0e7ff; color:#4338ca;' :
                      o.status === 'Cancelled' ? 'background:#fee2e2; color:#dc2626;' :
                      o.status === 'Refunded' ? 'background:#f3f4f6; color:#4b5563;' :
                      'background:#fef3c7; color:#d97706;';
            const statusVN = o.status === 'Completed' ? 'Hoàn Tất' :
                             o.status === 'Delivered' ? 'Đã Giao Hàng' :
                             o.status === 'Shipped' ? 'Đang Giao' :
                             o.status === 'Processing' ? 'Đang Xử Lý' :
                             o.status === 'Confirmed' ? 'Đã Xác Nhận' :
                             o.status === 'Cancelled' ? 'Đã Hủy' :
                             o.status === 'Refunded' ? 'Đã Hoàn Tiền' : 'Chờ Duyệt';
            return `
              <div class="order-card-clickable" onclick="openUserOrderModal('${o.orderNumber}')" style="border: 1px solid var(--border-gold); padding: 18px; border-radius: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; background: #fff; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.01);">
                <div>
                  <strong style="color: var(--black); font-size: 1.05rem; letter-spacing: 0.5px;">${o.orderNumber}</strong>
                  <div style="font-size: 0.82rem; color: var(--taupe); margin-top: 4px;">Ngày đặt: ${o.date}</div>
                  <div style="font-size: 0.82rem; color: #777; margin-top: 4px; max-width: 400px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${itemsSummary}">${itemsSummary}</div>
                </div>
                <div style="text-align: right; display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                  <strong style="color: var(--black); font-size: 1.05rem;">${Number(o.total).toLocaleString('vi-VN')}đ</strong>
                  <span class="om-status-badge" style="${statusStyle}">${statusVN}</span>
                  <span style="font-size:0.72rem; color:var(--champagne, #d8a94f); font-weight:500;">Nhấn để xem chi tiết →</span>
                </div>
              </div>
            `;
          }).join('');
        } else {
          orderList.innerHTML = '<p style="color: var(--taupe); font-style: italic;">Bạn chưa thực hiện đơn hàng nào.</p>';
        }
      };

      // Call it on page load
      window.renderUserOrdersList();

      // User Order Detail Modal Functions
      window.openUserOrderModal = function(orderNumber) {
        const allOrders = window.GradieStore.getOrders();
        const o = allOrders.find(ord => ord.orderNumber === orderNumber);
        if (!o) return;

        // Title
        document.getElementById('user-modal-title').textContent = 'Đơn Hàng ' + o.orderNumber;

        // Info Grid
        const statusStyle = o.status === 'Completed'  ? 'background:#d1fae5; color:#047857;'  :
                    o.status === 'Delivered'  ? 'background:#dcfce7; color:#15803d;'  :
                    o.status === 'Shipped'    ? 'background:#dbeafe; color:#2563eb;'  :
                    o.status === 'Processing' ? 'background:#fce7f3; color:#be185d;'  :
                    o.status === 'Confirmed'  ? 'background:#e0e7ff; color:#4338ca;'  :
                    o.status === 'Cancelled'  ? 'background:#fee2e2; color:#dc2626;'  :
                    o.status === 'Refunded'   ? 'background:#f3f4f6; color:#4b5563;'  :
                    'background:#fef3c7; color:#d97706;';
        const statusVN = o.status === 'Completed'  ? 'Hoàn Tất'       :
                         o.status === 'Delivered'  ? 'Đã Giao Hàng'   :
                         o.status === 'Shipped'    ? 'Đang Giao'       :
                         o.status === 'Processing' ? 'Đang Xử Lý'      :
                         o.status === 'Confirmed'  ? 'Đã Xác Nhận'    :
                         o.status === 'Cancelled'  ? 'Đã Hủy'         :
                         o.status === 'Refunded'   ? 'Đã Hoàn Tiền'   : 'Chờ Duyệt';

        const paymentMethodVN = o.paymentMethod === 'COD' || o.paymentMethod === 'COD (Cash on Delivery)' ? 'Thanh toán khi nhận hàng (COD)' : o.paymentMethod || 'COD';

        document.getElementById('user-order-info').innerHTML = `
          <div class="om-info-item">
            <div class="om-info-label">Mã Đơn Hàng</div>
            <div class="om-info-value">${o.orderNumber}</div>
          </div>
          <div class="om-info-item">
            <div class="om-info-label">Trạng Thái</div>
            <div class="om-info-value"><span class="om-status-badge" style="${statusStyle}">${statusVN}</span></div>
          </div>
          <div class="om-info-item">
            <div class="om-info-label">Ngày Đặt Hàng</div>
            <div class="om-info-value">${o.date || new Date(o.createdAt || Date.now()).toLocaleString('vi-VN')}</div>
          </div>
          <div class="om-info-item">
            <div class="om-info-label">Phương Thức Thanh Toán</div>
            <div class="om-info-value">${paymentMethodVN}</div>
          </div>
          <div class="om-info-item full-width">
            <div class="om-info-label">Địa Chỉ Giao Hàng</div>
            <div class="om-info-value">${o.shippingAddress || (o.customer && o.customer.address) || 'N/A'}</div>
          </div>
          ${o.notes || o.customerNotes ? `<div class="om-info-item full-width">
            <div class="om-info-label">Ghi Chú Giao Hàng</div>
            <div class="om-info-value" style="font-style:italic; color:#64748b;">${o.notes || o.customerNotes}</div>
          </div>` : ''}
        `;

        // Items
        const itemsContainer = document.getElementById('user-order-items');
        if (o.items && o.items.length > 0) {
          itemsContainer.innerHTML = o.items.map(item => {
            const price = Number(item.price) || 0;
            const qty = parseInt(item.quantity || item.qty || 1);
            const itemTotal = price * qty;

            let customHtml = '';
            if (item.customization) {
              const c = item.customization;
              let parts = [];
              if (c.embroideryText) parts.push('Thêu chữ: "' + c.embroideryText + '"');
              if (c.threadColor) parts.push('Màu chỉ: ' + c.threadColor);
              if (c.boxColor) parts.push('Hộp quà: ' + c.boxColor);
              if (c.ribbonColor) parts.push('Ruy băng: ' + c.ribbonColor);
              if (c.waxSeal) parts.push('Dấu sáp: ' + c.waxSeal);
              if (c.sashColor) parts.push('Dải băng: ' + c.sashColor);
              if (c.sashText) parts.push('Chữ dải băng: "' + c.sashText + '"');
              if (parts.length > 0) {
                customHtml = '<div class="om-item-custom">' + parts.join(' · ') + '</div>';
              }
            }

            return `
              <div class="om-item-card">
                <div style="flex:1;">
                  <div class="om-item-name">${item.name}</div>
                  <div class="om-item-qty">Số lượng: ${qty} × ${price.toLocaleString('vi-VN')}đ</div>
                  ${customHtml}
                </div>
                <div class="om-item-total">${itemTotal.toLocaleString('vi-VN')}đ</div>
              </div>
            `;
          }).join('');
        } else {
          itemsContainer.innerHTML = '<div style="color:#94a3b8; font-style:italic; padding:10px 0;">Không có thông tin chi tiết sản phẩm.</div>';
        }

        // Pricing
        const subtotal = Number(o.subtotal) || Number(o.total) || 0;
        const shipping = Number(o.shippingFee) || 0;
        const total = Number(o.total) || 0;
        document.getElementById('user-order-pricing').innerHTML = `
          <div class="om-price-row"><span>Tạm tính</span><span>${subtotal.toLocaleString('vi-VN')}đ</span></div>
          <div class="om-price-row"><span>Phí vận chuyển</span><span>${shipping.toLocaleString('vi-VN')}đ</span></div>
          <div class="om-price-row total"><span>Tổng cộng</span><span>${total.toLocaleString('vi-VN')}đ</span></div>
        `;

        // Show modal
        document.getElementById('userOrderModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
      };

      window.closeUserOrderModal = function() {
        document.getElementById('userOrderModal').style.display = 'none';
        document.body.style.overflow = '';
      };

      // Close on overlay click
      document.getElementById('userOrderModal').addEventListener('click', function(e) {
        if (e.target === this) closeUserOrderModal();
      });

      // Close on Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          const modal = document.getElementById('userOrderModal');
          if (modal && modal.style.display === 'block') closeUserOrderModal();
        }
      });

      // Address Book rendering methods
      window.renderAddressBook = function() {
        const latestUser = window.GradieStore.getCurrentUser();
        const addressesList = document.getElementById('addresses-list');
        const defaultCard = document.getElementById('profile-default-address-card');

        if (latestUser) {
          const addrs = latestUser.addresses || [];
          
          // Render default address preview card in profile tab
          const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
          if (defaultCard) {
            if (defaultAddr) {
              const labelVN = defaultAddr.label === 'Home' ? 'Nhà riêng' : defaultAddr.label === 'Office' ? 'Văn phòng' : defaultAddr.label;
              defaultCard.innerHTML = `
                <div style="font-size:0.88rem; color:#1e293b; line-height:1.4; text-align: left;">
                  <strong style="color:var(--champagne);">[${labelVN}]</strong> ${defaultAddr.name} (${defaultAddr.phone})<br>
                  <span style="color:#64748b; font-size:0.82rem;">${defaultAddr.detail}</span>
                </div>
                <a href="#" onclick="event.preventDefault(); document.getElementById('btn-tab-addresses').click();" style="font-size:0.82rem; color:var(--champagne); text-decoration:underline; font-weight:600; font-family:inherit; margin-left:15px; white-space:nowrap;">Thay đổi trong sổ</a>
              `;
            } else {
              defaultCard.innerHTML = `
                <span style="color:#888; font-style:italic; font-size:0.9rem;">Chưa thiết lập địa chỉ mặc định.</span>
                <a href="#" onclick="event.preventDefault(); document.getElementById('btn-tab-addresses').click();" style="font-size:0.82rem; color:var(--champagne); text-decoration:underline; font-weight:600; font-family:inherit; margin-left:15px; white-space:nowrap;">Thêm địa chỉ</a>
              `;
            }
          }

          // Render My Addresses panel list
          if (addressesList) {
            if (addrs.length === 0) {
              addressesList.innerHTML = '<p style="color:var(--taupe); font-style: italic; text-align: center; padding: 15px;">Chưa có địa chỉ nào được lưu trong sổ địa chỉ.</p>';
            } else {
              addressesList.innerHTML = addrs.map(a => {
                const labelVN = a.label === 'Home' ? 'Nhà riêng' : a.label === 'Office' ? 'Văn phòng' : a.label;
                const defaultBadge = a.isDefault ? `<span style="background:var(--warm-cream); color:var(--champagne); font-size:0.7rem; font-weight:600; padding:2px 8px; border-radius:4px; border:1px solid var(--border-gold); margin-left:10px; letter-spacing: 0.5px;">MẶC ĐỊNH</span>` : '';
                const setDefaultBtn = !a.isDefault ? `<button class="outline-button" onclick="setDefaultAddress('${a.id}')" style="padding:5px 10px; font-size:0.75rem; border-radius:6px; border:1px solid #cbd5e1; background:transparent; cursor:pointer; font-weight: 500;">Đặt mặc định</button>` : '';
                return `
                  <div style="border:1px solid #f0eeeb; padding:18px; border-radius:12px; background:#faf8f5; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 4px 12px rgba(0,0,0,0.01);">
                    <div>
                      <div style="display:flex; align-items:center;">
                        <strong style="color:var(--ink); font-size:1rem; font-family: inherit;">${labelVN}</strong>
                        ${defaultBadge}
                      </div>
                      <div style="font-size:0.85rem; color:#666; margin-top:6px;">Người nhận: <strong>${a.name}</strong> | SĐT: ${a.phone}</div>
                      <div style="font-size:0.85rem; color:#666; margin-top:3px;">Địa chỉ: ${a.detail}</div>
                    </div>
                    <div style="display:flex; gap:8px;">
                      ${setDefaultBtn}
                      <button class="outline-button" onclick="deleteAddress('${a.id}')" style="padding:5px 10px; font-size:0.75rem; border-radius:6px; border:1px solid #dc2626; color:#dc2626; background:transparent; cursor:pointer; font-weight: 500;">Xóa</button>
                    </div>
                  </div>
                `;
              }).join('');
            }
          }
        }
      };

      window.selectAddressLabel = function(label) {
        const hiddenInput = document.getElementById('new-address-label');
        const btnHome = document.getElementById('btn-label-home');
        const btnOffice = document.getElementById('btn-label-office');
        if (hiddenInput && btnHome && btnOffice) {
          hiddenInput.value = label;
          if (label === 'Home') {
            btnHome.style.background = 'var(--champagne)';
            btnHome.style.color = '#fff';
            btnOffice.style.background = '#fff';
            btnOffice.style.color = 'var(--champagne)';
          } else {
            btnOffice.style.background = 'var(--champagne)';
            btnOffice.style.color = '#fff';
            btnHome.style.background = '#fff';
            btnHome.style.color = 'var(--champagne)';
          }
        }
      };

      // Tab Switching Logic (4 Tabs: Profile, Addresses, Orders, Track Order)
      const btnProfile = document.getElementById('btn-tab-profile');
      const btnAddresses = document.getElementById('btn-tab-addresses');
      const btnOrders = document.getElementById('btn-tab-orders');
      const btnTracking = document.getElementById('btn-tab-tracking');
      const secProfile = document.getElementById('profile-edit-section');
      const secAddresses = document.getElementById('addresses-section');
      const secOrders = document.getElementById('orders-history-section');
      const secTracking = document.getElementById('track-order-section');

      const allBtns = [btnProfile, btnAddresses, btnOrders, btnTracking];
      const allSecs = [secProfile, secAddresses, secOrders, secTracking];

      function switchTab(activeBtn, activeSec) {
        allSecs.forEach(s => { if (s) s.style.display = 'none'; });
        allBtns.forEach(b => { if (b) b.classList.remove('active'); });
        if (activeSec) activeSec.style.display = 'block';
        if (activeBtn) activeBtn.classList.add('active');
      }

      if (btnProfile) btnProfile.addEventListener('click', () => switchTab(btnProfile, secProfile));
      if (btnAddresses) btnAddresses.addEventListener('click', () => {
        switchTab(btnAddresses, secAddresses);
        window.renderAddressBook();
      });
      if (btnOrders) btnOrders.addEventListener('click', () => switchTab(btnOrders, secOrders));
      if (btnTracking) btnTracking.addEventListener('click', () => switchTab(btnTracking, secTracking));

      // Track Order function inside profile
      window.profileTrackOrder = function() {
        const input = document.getElementById('profile-track-input');
        const resultDiv = document.getElementById('profile-track-result');
        const orderNo = input ? input.value.trim() : '';

        if (!orderNo) {
          resultDiv.innerHTML = '<p style="color:#dc2626; text-align:center; font-weight:500; margin-top:10px;">Vui lòng nhập mã đơn hàng.</p>';
          return;
        }

        const order = window.GradieStore.getOrders().find(o => o.orderNumber.toUpperCase() === orderNo.toUpperCase());

        if (!order) {
          resultDiv.innerHTML = `
            <div style="text-align:center; padding:30px; color:#64748b;">
              <div style="font-size:2.5rem; margin-bottom:10px;">🔍</div>
              <p style="font-weight:600; color:#1e293b; font-size:1rem; margin-bottom:5px;">Không Tìm Thấy Đơn Hàng</p>
              <p style="font-size:0.85rem;">Vui lòng kiểm tra lại mã đơn hàng và thử lại.</p>
            </div>
          `;
          return;
        }

        const status = order.status || 'Pending';
        const isCancelled = status === 'Cancelled';
        
        const statusVN = status === 'Completed' ? 'Hoàn Tất' :
                         status === 'Delivered' ? 'Đã Giao Hàng' :
                         status === 'Shipped' ? 'Đang Giao' :
                         status === 'Processing' ? 'Đang Xử Lý' :
                         status === 'Confirmed' ? 'Đã Xác Nhận' :
                         status === 'Cancelled' ? 'Đã Hủy' : 
                         status === 'Refunded' ? 'Đã Hoàn Tiền' : 'Chờ Duyệt';

        // Status badge styling
        const statusStyle = status === 'Completed' ? 'background:#d1fae5; color:#047857;' :
                    status === 'Delivered' ? 'background:#dcfce7; color:#15803d;' :
                    status === 'Shipped' ? 'background:#dbeafe; color:#2563eb;' :
                    status === 'Processing' ? 'background:#fce7f3; color:#be185d;' :
                    status === 'Confirmed' ? 'background:#e0e7ff; color:#4338ca;' :
                    isCancelled ? 'background:#fee2e2; color:#dc2626;' :
                    status === 'Refunded' ? 'background:#f3f4f6; color:#4b5563;' :
                    'background:#fef3c7; color:#d97706;';

        // Items list
        const itemsList = (order.items || []).map(item =>
          `<div style="font-size:0.85rem; color:#555; margin-top:4px;">• ${item.name} (x${item.quantity || item.qty || 1})</div>`
        ).join('');

        let timelineHtml = '';
        if (isCancelled || status === 'Refunded') {
            timelineHtml = `
                <div class="timeline-step">
                  <div>
                    <div class="timeline-dot cancelled">✕</div>
                  </div>
                  <div class="timeline-content">
                    <h4>Đơn Hàng Đã Hủy / Hoàn Tiền</h4>
                    <p>Đơn hàng này đã bị hủy hoặc hoàn tiền. Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.</p>
                  </div>
                </div>
            `;
        } else {
            const steps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Completed'];
            const titles = ['Chờ Duyệt', 'Đã Xác Nhận', 'Đang Xử Lý', 'Đang Giao Hàng', 'Đã Giao Thành Công', 'Hoàn Tất'];
            const desc = [
                'Đơn hàng của bạn đã được hệ thống tiếp nhận và đang chờ xử lý.',
                'Đơn hàng đã được xác nhận. Chúng tôi đang chuẩn bị các bước tiếp theo.',
                'Món quà của bạn đang được đóng gói cẩn thận tại kho của Gradie.',
                'Đơn hàng đang trên đường vận chuyển bởi đối tác giao hàng.',
                'Đơn hàng đã được giao thành công.',
                'Giao dịch đã hoàn tất và đối soát xong. Cảm ơn bạn!'
            ];
            const currentIndex = steps.indexOf(status) >= 0 ? steps.indexOf(status) : 0;
            
            steps.forEach((step, idx) => {
                const isCompleted = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                const isActiveLine = idx < currentIndex;
                
                timelineHtml += `
                <div class="timeline-step">
                  <div>
                    <div class="timeline-dot ${isCompleted ? 'active' : 'inactive'}">${isCompleted ? '✓' : idx + 1}</div>
                    <div class="timeline-line ${isActiveLine ? 'active' : ''}"></div>
                  </div>
                  <div class="timeline-content">
                    <h4 class="${isCompleted ? '' : 'inactive'}">${titles[idx]}</h4>
                    <p>${isCurrent || isCompleted ? desc[idx] : '...'}</p>
                  </div>
                </div>
                `;
            });
        }

        resultDiv.innerHTML = `
          <div class="track-result-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:14px; border-bottom:1.5px solid #f0eeeb;">
              <div>
                <h3 style="font-family:'Playfair Display', serif; font-size:1.3rem; margin:0; color:#1e293b;">${order.orderNumber}</h3>
                <span style="font-size:0.82rem; color:#94a3b8;">Ngày đặt: ${order.date || ''}</span>
              </div>
              <span class="om-status-badge" style="${statusStyle}">${statusVN}</span>
            </div>

            <div class="track-info-grid">
              <div class="track-info-cell">
                <div class="ti-label">Người nhận</div>
                <div class="ti-value">${order.customerName || 'N/A'}</div>
              </div>
              <div class="track-info-cell">
                <div class="ti-label">Tổng cộng</div>
                <div class="ti-value">${Number(order.total).toLocaleString('vi-VN')}đ</div>
              </div>
              <div class="track-info-cell full">
                <div class="ti-label">Địa chỉ giao hàng</div>
                <div class="ti-value">${order.shippingAddress || 'N/A'}</div>
              </div>
              <div class="track-info-cell full">
                <div class="ti-label">Sản phẩm</div>
                <div class="ti-value">${itemsList || '<span style="color:#94a3b8;">Không có sản phẩm</span>'}</div>
              </div>
            </div>

            <h4 style="font-family:'Playfair Display', serif; font-size:1.1rem; margin:0 0 8px; color:#1e293b;">Tiến Trình Đơn Hàng</h4>
            <div style="padding:10px 0;">
              ${timelineHtml}
            </div>
          </div>
        `;
      };

      // Allow Enter key to trigger search
      const trackInput = document.getElementById('profile-track-input');
      if (trackInput) {
        trackInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') profileTrackOrder();
        });
      }

      // Address actions
      window.addNewAddress = function() {
        const label = document.getElementById('new-address-label').value.trim();
        const name = document.getElementById('new-address-name').value.trim();
        const phone = document.getElementById('new-address-phone').value.trim();
        const detail = document.getElementById('new-address-detail').value.trim();
        const isDefault = document.getElementById('new-address-default').checked;
        
        const currentUser = window.GradieStore.getCurrentUser();
        if (!currentUser) return;
        
        let addrs = currentUser.addresses || [];
        if (isDefault) {
          addrs.forEach(a => a.isDefault = false);
        }
        
        const newAddr = {
          id: 'addr-' + Date.now(),
          label,
          name,
          phone,
          detail,
          isDefault: isDefault || addrs.length === 0
        };
        
        addrs.push(newAddr);
        
        const res = window.GradieStore.updateUserProfile(currentUser.email, { addresses: addrs });
        if (res.success) {
          showToast('Đã thêm địa chỉ mới thành công!', 'success');
          document.getElementById('address-add-form').reset();
          window.selectAddressLabel('Home'); // Reset active label to Home
          window.renderAddressBook();
        }
      };

      window.deleteAddress = function(addressId) {
        if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này không?")) {
          const currentUser = window.GradieStore.getCurrentUser();
          if (!currentUser) return;
          
          let addrs = currentUser.addresses || [];
          const wasDefault = addrs.some(a => a.id === addressId && a.isDefault);
          
          addrs = addrs.filter(a => a.id !== addressId);
          if (wasDefault && addrs.length > 0) {
            addrs[0].isDefault = true;
          }
          
          const res = window.GradieStore.updateUserProfile(currentUser.email, { addresses: addrs });
          if (res.success) {
            window.renderAddressBook();
          }
        }
      };

      window.setDefaultAddress = function(addressId) {
        const currentUser = window.GradieStore.getCurrentUser();
        if (!currentUser) return;
        
        let addrs = currentUser.addresses || [];
        addrs.forEach(a => {
          a.isDefault = (a.id === addressId);
        });
        
        const res = window.GradieStore.updateUserProfile(currentUser.email, { addresses: addrs });
        if (res.success) {
          window.renderAddressBook();
        }
      };

      // Profile Submission
      window.saveUserProfile = function() {
        const username = document.getElementById('profile-name').value.trim();
        const phone = document.getElementById('profile-phone').value.trim();
        const newPassword = document.getElementById('profile-password').value;
        const msgEl = document.getElementById('profile-save-message');
        const currentUser = window.GradieStore.getCurrentUser();

        const updatedData = { username, phone };
        
        // Save the details of the active default address to the core shippingAddress field for other modules
        const currentAddrs = currentUser.addresses || [];
        const defaultAddr = currentAddrs.find(a => a.isDefault) || currentAddrs[0];
        if (defaultAddr) {
          updatedData.shippingAddress = defaultAddr.detail;
        }

        if (newPassword) {
          updatedData.password = newPassword;
        }

        const res = window.GradieStore.updateUserProfile(user.email, updatedData);
        if (res.success) {
          msgEl.textContent = "Cập nhật thông tin hồ sơ thành công!";
          msgEl.style.color = "var(--champagne)";
          document.getElementById('dash-name').textContent = username;
          document.getElementById('profile-password').value = '';
          setTimeout(() => { msgEl.textContent = ''; }, 3000);
        } else {
          msgEl.textContent = res.message;
          msgEl.style.color = "red";
        }
      };

      // Load initial lists
      window.renderAddressBook();

      // Listen for database sync changes to re-render order status reactively
      window.addEventListener('gradie_data_synced', () => {
        // 1. Re-render order history list
        if (window.renderUserOrdersList) {
          window.renderUserOrdersList();
        }
        
        // 2. Re-render detail modal if currently open
        const userOrderModal = document.getElementById('userOrderModal');
        const userModalTitle = document.getElementById('user-modal-title');
        if (userOrderModal && userOrderModal.style.display === 'block' && userModalTitle) {
          const currentOrderNum = userModalTitle.textContent.replace('Đơn Hàng ', '').trim();
          if (currentOrderNum && window.openUserOrderModal) {
            window.openUserOrderModal(currentOrderNum);
          }
        }
        
        // 3. Re-run tracking lookup in account profile tab if tracking results are showing
        const profileTrackInput = document.getElementById('profile-track-input');
        const profileTrackResult = document.getElementById('profile-track-result');
        if (profileTrackInput && profileTrackResult && profileTrackResult.innerHTML.trim() !== '') {
          if (window.profileTrackOrder) {
            window.profileTrackOrder();
          }
        }
      });

    } else {
      dashboard.style.display = 'none';
      prompt.style.display = 'flex';
      
      // Hide page titles when not logged in to center the card perfectly
      const pageTitle = document.querySelector('.account-page-title');
      const pageSubtitle = document.querySelector('.account-page-subtitle');
      if (pageTitle) pageTitle.style.display = 'none';
      if (pageSubtitle) pageSubtitle.style.display = 'none';
    }
  }

  // 4. Logout Action
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.GradieStore.logoutUser();
      window.location.href = 'login.html';
    });
  }
});
