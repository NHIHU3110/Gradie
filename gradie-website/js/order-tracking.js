// js/order-tracking.js
document.addEventListener('DOMContentLoaded', () => {
  if (!window.GradieStore) return;

  const trackForm = document.getElementById('track-form');
  const trackInput = document.getElementById('track-order-no');
  const resultDiv = document.getElementById('track-result');

  // ── Shared helpers ──────────────────────────────────────────────────────────

  /** Map English status → Vietnamese label */
  function statusLabel(status) {
    return status === 'Completed'  ? 'Hoàn Tất'       :
           status === 'Delivered'  ? 'Đã Giao Hàng'   :
           status === 'Shipped'    ? 'Đang Giao'       :
           status === 'Processing' ? 'Đang Xử Lý'      :
           status === 'Confirmed'  ? 'Đã Xác Nhận'    :
           status === 'Cancelled'  ? 'Đã Hủy'         :
           status === 'Refunded'   ? 'Đã Hoàn Tiền'   : 'Chờ Duyệt';
  }

  /** Map English status → CSS badge style */
  function statusStyle(status) {
    return status === 'Completed'  ? 'background:#d1fae5; color:#047857;'  :
           status === 'Delivered'  ? 'background:#dcfce7; color:#15803d;'  :
           status === 'Shipped'    ? 'background:#dbeafe; color:#2563eb;'  :
           status === 'Processing' ? 'background:#fce7f3; color:#be185d;'  :
           status === 'Confirmed'  ? 'background:#e0e7ff; color:#4338ca;'  :
           status === 'Cancelled'  ? 'background:#fee2e2; color:#dc2626;'  :
           status === 'Refunded'   ? 'background:#f3f4f6; color:#4b5563;'  :
                                    'background:#fef3c7; color:#d97706;';
  }

  /** Build full 6-step timeline HTML matching admin steps */
  function buildTimeline(status) {
    const isCancelledOrRefunded = status === 'Cancelled' || status === 'Refunded';

    if (isCancelledOrRefunded) {
      return `
        <div style="display:flex; gap:14px; align-items:flex-start; background:#fef2f2; border:1px solid #fca5a5; padding:18px; border-radius:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:#ef4444; color:#fff; display:flex; align-items:center; justify-content:center; font-size:1rem; font-weight:700; flex-shrink:0;">✕</div>
          <div>
            <div style="font-weight:700; color:#b91c1c; font-size:0.95rem; margin-bottom:4px;">${statusLabel(status)}</div>
            <div style="font-size:0.82rem; color:#7f1d1d;">Đơn hàng này đã bị hủy hoặc hoàn tiền. Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.</div>
          </div>
        </div>
      `;
    }

    const steps  = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Completed'];
    const titles = ['Chờ Duyệt', 'Đã Xác Nhận', 'Đang Xử Lý', 'Đang Giao Hàng', 'Đã Giao Thành Công', 'Hoàn Tất'];
    const descs  = [
      'Đơn hàng của bạn đã được hệ thống tiếp nhận và đang chờ xử lý.',
      'Đơn hàng đã được xác nhận. Chúng tôi đang chuẩn bị các bước tiếp theo.',
      'Món quà của bạn đang được đóng gói cẩn thận tại kho của Gradie.',
      'Đơn hàng đang trên đường vận chuyển bởi đối tác giao hàng cao cấp.',
      'Đơn hàng đã được giao thành công tận tay người nhận.',
      'Giao dịch hoàn tất và đối soát xong. Cảm ơn bạn đã tin tưởng Gradie!'
    ];

    const currentIndex = steps.indexOf(status) >= 0 ? steps.indexOf(status) : 0;

    let html = `<div style="display:flex; flex-direction:column; gap:0;">`;

    steps.forEach((step, idx) => {
      const isCompleted = idx <= currentIndex;
      const isCurrent   = idx === currentIndex;
      const isLast      = idx === steps.length - 1;

      const dotBg    = isCompleted ? '#22c55e' : '#e2e8f0';
      const dotColor = isCompleted ? '#fff' : '#94a3b8';
      const dotShadow= isCurrent   ? '0 0 0 4px rgba(34,197,94,0.2)' : 'none';
      const lineBg   = idx < currentIndex ? '#22c55e' : '#e2e8f0';
      const titleColor = isCompleted ? '#1e293b' : '#94a3b8';
      const titleWeight= isCurrent ? '700' : (isCompleted ? '600' : '500');

      html += `
        <div style="display:flex; gap:14px; align-items:flex-start;">
          <div style="display:flex; flex-direction:column; align-items:center; flex-shrink:0;">
            <div style="width:30px; height:30px; border-radius:50%; background:${dotBg}; color:${dotColor};
              display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:700;
              box-shadow:${dotShadow}; border:2px solid ${isCompleted ? '#22c55e' : '#cbd5e1'}; transition:all 0.3s;">
              ${isCompleted ? '✓' : idx + 1}
            </div>
            ${!isLast ? `<div style="width:2px; height:36px; background:${lineBg}; margin:4px 0; transition:background 0.3s;"></div>` : ''}
          </div>
          <div style="padding-top:4px; padding-bottom:${isLast ? '0' : '8px'};">
            <div style="font-size:0.9rem; font-weight:${titleWeight}; color:${titleColor}; margin-bottom:3px;">${titles[idx]}</div>
            <div style="font-size:0.78rem; color:${isCompleted ? '#64748b' : '#cbd5e1'};">
              ${isCompleted ? descs[idx] : '...'}
            </div>
            ${isCurrent ? `<span style="display:inline-block; margin-top:5px; font-size:0.7rem; background:#22c55e; color:#fff; padding:2px 8px; border-radius:10px; font-weight:600;">Hiện tại</span>` : ''}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    return html;
  }

  // ── Main tracking function ─────────────────────────────────────────────────

  function doTrack(orderNo) {
    if (!orderNo) return;
    trackInput.value = orderNo;

    const order = window.GradieStore.getOrders().find(
      o => o.orderNumber.toUpperCase() === orderNo.toUpperCase()
    );

    if (!order) {
      resultDiv.innerHTML = `
        <div style="text-align:center; padding:40px 20px;">
          <div style="font-size:3rem; margin-bottom:10px;">🔍</div>
          <p style="font-weight:600; color:#1e293b; font-size:1rem; margin-bottom:5px;">Không Tìm Thấy Đơn Hàng</p>
          <p style="color:#64748b; font-size:0.85rem;">Vui lòng kiểm tra lại mã đơn hàng và thử lại.</p>
        </div>`;
      return;
    }

    const status     = order.status || 'Pending';
    const badgeStyle = statusStyle(status);
    const labelVN    = statusLabel(status);

    const itemsList = (order.items || []).map(item =>
      `<div style="font-size:0.85rem; color:#555; margin-top:4px;">• ${item.name} (x${item.quantity || item.qty || 1})</div>`
    ).join('');

    resultDiv.innerHTML = `
      <div style="padding:25px; border:1px solid var(--border-gold); background:#ffffff; border-radius:12px; margin-top:25px; box-shadow:0 8px 25px rgba(0,0,0,0.04);">

        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f0eeeb; padding-bottom:14px; margin-bottom:18px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="font-family:'Playfair Display', serif; font-size:1.3rem; margin:0 0 4px; color:#1a1a1a;">Chi Tiết Đơn Hàng</h3>
            <span style="font-size:0.82rem; color:#94a3b8;">Mã đơn: ${order.orderNumber} · Ngày đặt: ${order.date || ''}</span>
          </div>
          <span style="${badgeStyle} padding:6px 16px; border-radius:20px; font-weight:700; font-size:0.82rem; white-space:nowrap;">${labelVN}</span>
        </div>

        <!-- Info grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:22px; font-size:0.88rem; line-height:1.6;">
          <div>
            <div style="color:#888; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:3px;">Người nhận</div>
            <strong style="color:#1a1a1a;">${order.customerName || 'N/A'}</strong>
          </div>
          <div>
            <div style="color:#888; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:3px;">Tổng tiền</div>
            <strong style="color:#1a1a1a;">${Number(order.total).toLocaleString('vi-VN')}đ</strong>
          </div>
          <div style="grid-column:1/-1;">
            <div style="color:#888; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:3px;">Địa chỉ giao hàng</div>
            <span style="color:#1a1a1a;">${order.shippingAddress || 'N/A'}</span>
          </div>
          <div style="grid-column:1/-1;">
            <div style="color:#888; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:3px;">Sản phẩm</div>
            ${itemsList || '<span style="color:#94a3b8; font-style:italic;">Không có thông tin sản phẩm</span>'}
          </div>
        </div>

        <hr style="border:none; border-top:1px solid #f0eeeb; margin:0 0 18px;">

        <!-- Timeline -->
        <h4 style="font-family:'Playfair Display', serif; font-size:1.05rem; margin:0 0 16px; color:#1a1a1a;">Lịch Trình Vận Chuyển</h4>
        <div style="background:#faf8f5; border-radius:10px; padding:18px;">
          ${buildTimeline(status)}
        </div>
      </div>
    `;
  }

  // ── Triggers ───────────────────────────────────────────────────────────────

  // 1. Auto-fill from URL query param ?code=GRD-26-XXXX
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) doTrack(code);

  // 2. Form submission
  if (trackForm) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      doTrack(trackInput.value.trim());
    });
  }

  // 3. Listen for database sync changes to re-render tracked order status reactively
  window.addEventListener('gradie_data_synced', () => {
    if (trackInput && trackInput.value.trim() !== '') {
      doTrack(trackInput.value.trim());
    }
  });
});
