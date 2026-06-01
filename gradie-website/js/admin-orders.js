// js/admin-orders.js
document.addEventListener('DOMContentLoaded', () => {
    if(!window.GradieStore) return;
    const ordersBody = document.getElementById('admin-orders-list');
    
    if (ordersBody) {
        window.renderOrdersTable = function() {
            try {
                const ords = window.GradieStore.getOrders();
                if (!ords || ords.length === 0) {
                    ordersBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 30px; color: #64748b;">No orders yet.</td></tr>';
                } else {
                    // Updated orders table rendering with row click listeners
                    ordersBody.innerHTML = ords.map(o => {
                        const total = Number(o.total) || 0;
                        const cName = o.customerName || (o.customer && o.customer.name) ? (o.customerName || o.customer.name) : 'Unknown';
                        const oDate = o.date || new Date(o.createdAt || Date.now()).toLocaleDateString('vi-VN');
                        const status = o.status || 'Pending';
                        
                        // Gorgeous status badges
                        let badgeStyle = 'background: #fef3c7; color: #d97706;';
                        if (status === 'Shipped' || status === 'Dispatched') {
                            badgeStyle = 'background: #dbeafe; color: #2563eb;';
                        } else if (status === 'Delivered') {
                            badgeStyle = 'background: #dcfce7; color: #15803d;';
                        } else if (status === 'Cancelled') {
                            badgeStyle = 'background: #fee2e2; color: #dc2626;';
                        }
                        
                        return `
                        <tr style="cursor: pointer;">
                            <td class="clickable-order" onclick="openOrderDetailModal('${o.orderNumber}')" style="font-weight: 600;">
                                ${o.orderNumber}
                            </td>
                            <td>${oDate}</td>
                            <td>${cName}</td>
                            <td style="font-weight: 500;">${total.toLocaleString('vi-VN')} ₫</td>
                            <td>
                                <span style="${badgeStyle} padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; display: inline-block;">
                                    ${status}
                                </span>
                            </td>
                            <td>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <button class="outline-button" onclick="openOrderDetailModal('${o.orderNumber}')" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 4px; border: 1px solid #d8a94f; color: #d8a94f; background: transparent; cursor: pointer; font-weight: 500;">
                                        View Details
                                    </button>
                                    <select onchange="window.GradieStore.updateOrder('${o.orderNumber}', {status: this.value}); window.renderOrdersTable();" style="padding: 5px; border-radius: 4px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer;">
                                        <option value="Pending" ${status === 'Pending'?'selected':''}>Pending</option>
                                        <option value="Shipped" ${status === 'Shipped' || status === 'Dispatched'?'selected':''}>Shipped</option>
                                        <option value="Delivered" ${status === 'Delivered'?'selected':''}>Delivered</option>
                                        <option value="Cancelled" ${status === 'Cancelled'?'selected':''}>Cancelled</option>
                                    </select>
                                </div>
                            </td>
                        </tr>
                        `;
                    }).join('');
                    // Add row click listeners for entire row (excluding buttons/selects)
                    setTimeout(() => {
                        document.querySelectorAll('#admin-orders-list tr').forEach(row => {
                            const orderCell = row.querySelector('.clickable-order');
                            if (orderCell) {
                                const orderNum = orderCell.textContent.trim();
                                row.addEventListener('click', (e) => {
                                    if (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'select') return;
                                    openOrderDetailModal(orderNum);
                                });
                            }
                        });
                    }, 0);
                }
            } catch(e) { console.error("Error rendering orders:", e); }
        };

        // Modal Action Handlers
        window.openOrderDetailModal = function(orderNumber) {
            try {
                const ords = window.GradieStore.getOrders();
                const o = ords.find(order => order.orderNumber === orderNumber);
                if(!o) return;
                
                document.getElementById('detail-id').innerText = o.orderNumber;
                document.getElementById('detail-date').innerText = o.date || new Date(o.createdAt || Date.now()).toLocaleString('vi-VN');
                document.getElementById('detail-customer-name').innerText = o.customerName || (o.customer && o.customer.name) || 'Unknown';
                document.getElementById('detail-customer-email').innerText = o.customerEmail || (o.customer && o.customer.email) || 'N/A';
                document.getElementById('detail-customer-phone').innerText = o.customerPhone || (o.customer && o.customer.phone) || 'N/A';
                document.getElementById('detail-customer-address').innerText = o.shippingAddress || (o.customer && o.customer.address) || 'N/A';
                document.getElementById('detail-customer-notes').innerText = o.notes || o.customerNotes || 'None';
                
                // Render items list dynamically
                const itemsList = document.getElementById('detail-items-list');
                if (itemsList) {
                    if (!o.items || o.items.length === 0) {
                        itemsList.innerHTML = '<div style="color:#64748b; font-style:italic;">No items recorded for this order.</div>';
                    } else {
                        itemsList.innerHTML = o.items.map(item => {
                            const price = Number(item.price) || 0;
                            const qty = parseInt(item.quantity || item.qty || 1);
                            const itemTotal = price * qty;
                            
                            let customDetails = '';
                            if (item.customization) {
                                const c = item.customization;
                                if (c.threadColor || c.embroideryText) {
                                    customDetails += `<div style="font-size:0.8rem; color:#d8a94f; margin-top:4px; padding-left:10px; border-left:2px solid #d8a94f; font-family: inherit;">Monogram Embroidery: "${c.embroideryText || 'None'}" (${c.threadColor || 'Default Color'})</div>`;
                                }
                                if (c.boxColor || c.ribbonColor || c.waxSeal) {
                                    customDetails += `<div style="font-size:0.8rem; color:#8d6e63; margin-top:3px; padding-left:10px; border-left:2px solid #8d6e63; font-family: inherit;">Luxury Gift Wrapping: Box (${c.boxColor || 'Cream'}), Ribbon (${c.ribbonColor || 'Gold'}), Wax Seal (${c.waxSeal || 'None'})</div>`;
                                }
                            }
                            
                            return `
                            <div class="item-breakdown-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                                <div>
                                    <div style="font-weight:600; color:#1e293b; font-size: 0.95rem;">${item.name}</div>
                                    <div style="font-size:0.85rem; color:#64748b; margin-top: 2px;">Qty: ${qty} x ${price.toLocaleString('vi-VN')}đ</div>
                                    ${customDetails}
                                </div>
                                <div style="font-weight:600; color:#1e293b;">${itemTotal.toLocaleString('vi-VN')}đ</div>
                            </div>
                            `;
                        }).join('');
                    }
                }
                
                // Total breakdown
                const subtotal = Number(o.subtotal) || 0;
                const shippingFee = Number(o.shippingFee) || 0;
                const grandTotal = Number(o.total) || 0;
                
                document.getElementById('detail-subtotal').innerText = subtotal.toLocaleString('vi-VN') + 'đ';
                document.getElementById('detail-shipping').innerText = shippingFee.toLocaleString('vi-VN') + 'đ';
                document.getElementById('detail-total').innerText = grandTotal.toLocaleString('vi-VN') + 'đ';
                
                // Select active status dropdown
                const statusSelect = document.getElementById('detail-status');
                if (statusSelect) {
                    statusSelect.value = o.status || 'Pending';
                }
                
                // Show modal
                const modal = document.getElementById('orderDetailModal');
                if(modal) modal.style.display = 'block';
            } catch (err) {
                console.error("Error opening order details modal:", err);
            }
        };

        window.closeOrderDetailModal = function() {
            const modal = document.getElementById('orderDetailModal');
            if(modal) modal.style.display = 'none';
        };

        window.saveOrderDetailsStatus = function() {
            try {
                const orderNumber = document.getElementById('detail-id').innerText;
                const statusSelect = document.getElementById('detail-status');
                if (orderNumber && statusSelect) {
                    window.GradieStore.updateOrder(orderNumber, { status: statusSelect.value });
                    showToast('Đã cập nhật trạng thái đơn hàng!', 'success');
                    window.closeOrderDetailModal();
                    window.renderOrdersTable();
                }
            } catch (err) {
                console.error("Error saving status updates:", err);
            }
        };

        // Window click close behavior
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('orderDetailModal');
            if (event.target === modal) {
                window.closeOrderDetailModal();
            }
        });

        renderOrdersTable();
    }
});

