// js/admin-orders.js
document.addEventListener('DOMContentLoaded', () => {
    if(!window.GradieStore) return;
    const ordersBody = document.getElementById('admin-orders-list');
    if (ordersBody) {
        window.renderOrdersTable = function() {
            try {
                const ords = window.GradieStore.getOrders();
                if (!ords || ords.length === 0) {
                    ordersBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No orders yet.</td></tr>';
                } else {
                    ordersBody.innerHTML = ords.map(o => {
                        const total = Number(o.total) || 0;
                        const cName = (o.customer && o.customer.name) ? o.customer.name : 'Unknown';
                        return `
                        <tr>
                            <td><strong>${o.orderNumber}</strong></td>
                            <td>${new Date(o.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td>${cName}</td>
                            <td>${total.toLocaleString('vi-VN')} ₫</td>
                            <td>
                                <select onchange="window.GradieStore.updateOrder('${o.orderNumber}', {status: this.value}); alert('Status Updated!');" style="padding:5px;">
                                    <option value="Order Confirmed" ${o.status === 'Order Confirmed'?'selected':''}>Confirmed</option>
                                    <option value="Dispatched" ${o.status === 'Dispatched'?'selected':''}>Dispatched</option>
                                    <option value="Delivered" ${o.status === 'Delivered'?'selected':''}>Delivered</option>
                                    <option value="Cancelled" ${o.status === 'Cancelled'?'selected':''}>Cancelled</option>
                                </select>
                            </td>
                        </tr>
                        `;
                    }).join('');
                }
            } catch(e) { console.error("Error rendering orders:", e); }
        };
        renderOrdersTable();
    }
});
