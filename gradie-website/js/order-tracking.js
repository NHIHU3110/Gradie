// js/order-tracking.js
document.addEventListener('DOMContentLoaded', () => {
  if (!window.GradieStore) return;

  const trackForm = document.getElementById('track-form');
  const trackInput = document.getElementById('track-order-no');
  const resultDiv = document.getElementById('track-result');

  // Helper to trigger tracking
  function doTrack(orderNo) {
    if (!orderNo) return;
    trackInput.value = orderNo;
    
    const order = window.GradieStore.getOrders().find(o => o.orderNumber.toUpperCase() === orderNo.toUpperCase());
    
    if (!order) {
      resultDiv.innerHTML = '<p style="color:red; text-align:center; font-weight:500; margin-top:20px;">Order not found. Please verify your tracking code.</p>';
    } else {
      const itemsList = order.items.map(item => `<div style="font-size:0.85rem; color:#666; margin-top:4px;">• ${item.name} (x${item.quantity})</div>`).join('');
      
      resultDiv.innerHTML = `
        <div style="padding:25px; border:1px solid var(--border-gold); background:#ffffff; border-radius:12px; margin-top:25px; box-shadow:0 8px 25px rgba(0,0,0,0.02);">
          <div style="border-bottom:1px solid #f0eeeb; padding-bottom:12px; margin-bottom:15px;">
            <h3 style="font-family:'Playfair Display', serif; font-size:1.3rem; margin:0; color:#1a1a1a;">Order Details</h3>
            <span style="font-size:0.85rem; color:#888;">Code: ${order.orderNumber}</span>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px; font-size:0.9rem; line-height:1.5;">
            <div>
              <div style="color:#888;">Recipient:</div>
              <strong style="color:#1a1a1a;">${order.customerName}</strong>
            </div>
            <div>
              <div style="color:#888;">Total Price:</div>
              <strong style="color:#1a1a1a;">${order.total.toLocaleString('vi-VN')}đ</strong>
            </div>
            <div style="grid-column:1/-1;">
              <div style="color:#888;">Shipping Address:</div>
              <span style="color:#1a1a1a;">${order.shippingAddress}</span>
            </div>
            <div style="grid-column:1/-1;">
              <div style="color:#888;">Items Summary:</div>
              ${itemsList}
            </div>
          </div>

          <hr style="border:none; border-top:1px solid #f0eeeb; margin:20px 0;">
          
          <h4 style="font-family:'Playfair Display', serif; font-size:1.1rem; margin-bottom:15px; color:#1a1a1a;">Fulfillment Timeline</h4>
          <div style="display:flex; flex-direction:column; gap:15px; padding:15px; background:#faf8f5; border-radius:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.2rem; color:#137333;">🟢</span>
              <div>
                <strong style="font-size:0.9rem; color:#1a1a1a;">Order Confirmed & COD Verified</strong>
                <div style="font-size:0.75rem; color:#666;">We have successfully verified your champagne details.</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.2rem; color:${order.status === 'Shipped' || order.status === 'Delivered' ? '#137333' : '#b0b0b0'};">${order.status === 'Shipped' || order.status === 'Delivered' ? '🟢' : '⚪'}</span>
              <div>
                <strong style="font-size:0.9rem; color:${order.status === 'Shipped' || order.status === 'Delivered' ? '#1a1a1a' : '#888'};">Shipped (In Transit)</strong>
                <div style="font-size:0.75rem; color:#666;">Your custom gift is currently being carried by our premium COD partner.</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.2rem; color:${order.status === 'Delivered' ? '#137333' : '#b0b0b0'};">${order.status === 'Delivered' ? '🟢' : '⚪'}</span>
              <div>
                <strong style="font-size:0.9rem; color:${order.status === 'Delivered' ? '#1a1a1a' : '#888'};">Delivered Successfully</strong>
                <div style="font-size:0.75rem; color:#666;">Payment collected and champagne gift successfully hand-delivered. Enjoy your Gradie moment!</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // 1. Auto-fill from URL query param `?code=GRD-26-XXXX`
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    doTrack(code);
  }

  // 2. Form submission trigger
  if (trackForm) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const orderNo = trackInput.value.trim();
      doTrack(orderNo);
    });
  }
});
