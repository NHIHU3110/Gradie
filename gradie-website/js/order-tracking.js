// js/order-tracking.js
document.addEventListener('DOMContentLoaded', () => {
    if (!window.GradieStore) return;
    const trackForm = document.getElementById('track-form');
    if (trackForm) {
        trackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const orderNo = document.getElementById('track-order-no').value.trim();
            const order = window.GradieStore.getOrders().find(o => o.orderNumber === orderNo);
            const resultDiv = document.getElementById('track-result');
            
            if (!order) {
                resultDiv.innerHTML = '<p style="color:red; text-align:center;">Order not found. Please check your order number.</p>';
            } else {
                resultDiv.innerHTML = `
                    <div style="padding:20px; border:1px solid var(--border-gold); background:var(--white); border-radius:8px;">
                        <h3>Order ${order.orderNumber}</h3>
                        <p><strong>Status:</strong> <span style="color:var(--champagne); font-weight:bold;">${order.status}</span></p>
                        <p><strong>Customer:</strong> ${order.customer.name}</p>
                        <p><strong>Total:</strong> ${order.total.toLocaleString('vi-VN')} ₫</p>
                        <hr style="border:none; border-top:1px solid var(--border-gold); margin:15px 0;">
                        <h4>Timeline</h4>
                        <div style="margin-top:10px; padding:10px; background:var(--ivory); border-radius:4px;">
                            <p>🟢 Order Confirmed</p>
                            <p>${order.status === 'Dispatched' || order.status === 'Delivered' ? '🟢' : '⚪'} Dispatched</p>
                            <p>${order.status === 'Delivered' ? '🟢' : '⚪'} Delivered</p>
                        </div>
                    </div>
                `;
            }
        });
    }
});
