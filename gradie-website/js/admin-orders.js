// js/admin-orders.js
document.addEventListener('DOMContentLoaded', () => {
    // Initial setup and bindings
    window.addEventListener('gradie_data_synced', () => {
        if (window.renderOrdersTable) window.renderOrdersTable();
    });

    // Helper to display modern custom status confirmation modal
    window.showStatusConfirmModal = function(message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('statusConfirmModal');
            const msgEl = document.getElementById('statusConfirmMessage');
            const btnOk = document.getElementById('btnStatusConfirmOk');
            const btnCancel = document.getElementById('btnStatusConfirmCancel');
            
            if (!modal || !msgEl || !btnOk || !btnCancel) {
                // Fallback to standard confirm if modal elements are missing
                resolve(confirm(message));
                return;
            }
            
            msgEl.innerText = message;
            modal.style.display = 'block';
            
            const cleanup = () => {
                modal.style.display = 'none';
                btnOk.removeEventListener('click', onOk);
                btnCancel.removeEventListener('click', onCancel);
            };
            
            const onOk = () => {
                cleanup();
                resolve(true);
            };
            
            const onCancel = () => {
                cleanup();
                resolve(false);
            };
            
            btnOk.addEventListener('click', onOk);
            btnCancel.addEventListener('click', onCancel);
        });
    };

    window.changeOrderStatusFromSelect = async function(sel, orderNum, currentStatus) {
        const newStatus = sel.value;
        const confirmed = await window.showStatusConfirmModal(`Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng ${orderNum} thành '${newStatus}'?`);
        if (confirmed) {
            try {
                window.GradieStore.updateOrder(orderNum, { status: newStatus });
                window.GradieStore.addActivityLog('Cập nhật trạng thái đơn hàng', 'Đã thay đổi trạng thái đơn ' + orderNum + ' thành ' + newStatus);
                if (typeof showToast === 'function') {
                    showToast('Đã cập nhật trạng thái đơn ' + orderNum + ' thành ' + newStatus, 'success');
                }
                window.renderOrdersTable();
            } catch (err) {
                console.error(err);
                if (typeof showToast === 'function') showToast('Lỗi cập nhật trạng thái!', 'error');
                sel.value = currentStatus;
            }
        } else {
            sel.value = currentStatus;
        }
    };

    function initAdminOrders() {
        if(!window.GradieStore) {
            console.warn('GradieStore not ready, retrying in 300ms...');
            setTimeout(initAdminOrders, 300);
            return;
        }
        setupOrdersUI();
    }

    function setupOrdersUI() {
        let currentStatusFilter = 'all';

        // Add Event Listener for Status Filter
        const filterEl = document.getElementById('order-status-filter');
        if (filterEl) {
            filterEl.addEventListener('change', (e) => {
                currentStatusFilter = e.target.value;
                window.renderOrdersTable();
            });
        }

        window.renderOrdersTable = function() {
            try {
                // Always re-query so we don't rely on a stale closure reference
                const ordersBody = document.getElementById('admin-orders-list');
                if (!ordersBody) {
                    console.warn('renderOrdersTable: #admin-orders-list not found in DOM');
                    return;
                }

                let ords = window.GradieStore.getOrders();

                // Sort orders from newest to oldest
                const getOrderTimestamp = (o) => {
                    if (o.createdAt) {
                        const t = new Date(o.createdAt).getTime();
                        if (!isNaN(t)) return t;
                    }
                    if (o.date) {
                        const cleanDate = o.date.replace(/,/g, '').trim();
                        const parts = cleanDate.split(' ');
                        if (parts.length >= 1) {
                            const datePart = parts[0];
                            const timePart = parts[1] || '00:00:00';
                            const dParts = datePart.split('/');
                            const tParts = timePart.split(':');
                            if (dParts.length === 3) {
                                const day = parseInt(dParts[0], 10);
                                const month = parseInt(dParts[1], 10) - 1;
                                const year = parseInt(dParts[2], 10);
                                const hour = tParts[0] ? parseInt(tParts[0], 10) : 0;
                                const minute = tParts[1] ? parseInt(tParts[1], 10) : 0;
                                const second = tParts[2] ? parseInt(tParts[2], 10) : 0;
                                const d = new Date(year, month, day, hour, minute, second);
                                if (!isNaN(d.getTime())) return d.getTime();
                            }
                        }
                        const t = new Date(o.date).getTime();
                        if (!isNaN(t)) return t;
                    }
                    return 0;
                };
                ords.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
                
                // Apply status filter
                if (currentStatusFilter !== 'all') {
                    ords = ords.filter(o => {
                        const status = (o.status || 'Pending').toLowerCase();
                        return status === currentStatusFilter.toLowerCase();
                    });
                }

                if (!ords || ords.length === 0) {
                    ordersBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 30px; color: #64748b;">Không có đơn hàng nào.</td></tr>';
                } else {
                    // Updated orders table rendering with row click listeners
                    ordersBody.innerHTML = ords.map(o => {
                        const total = Number(o.total) || 0;
                        const cName = o.customerName || (o.customer && o.customer.name) ? (o.customerName || o.customer.name) : 'Unknown';
                        const oDate = o.date || new Date(o.createdAt || Date.now()).toLocaleDateString('vi-VN');
                        const status = o.status || 'Pending';
                        
                        // Gorgeous status badges
                        let badgeStyle = 'background: #fef3c7; color: #d97706;'; // Pending
                        if (status === 'Confirmed') {
                            badgeStyle = 'background: #e0e7ff; color: #4338ca;';
                        } else if (status === 'Processing') {
                            badgeStyle = 'background: #fce7f3; color: #be185d;';
                        } else if (status === 'Shipped' || status === 'Dispatched') {
                            badgeStyle = 'background: #dbeafe; color: #2563eb;';
                        } else if (status === 'Delivered') {
                            badgeStyle = 'background: #dcfce7; color: #15803d;';
                        } else if (status === 'Cancelled') {
                            badgeStyle = 'background: #fee2e2; color: #dc2626;';
                        } else if (status === 'Completed') {
                            badgeStyle = 'background: #d1fae5; color: #047857;';
                        } else if (status === 'Refunded') {
                            badgeStyle = 'background: #f3f4f6; color: #4b5563;';
                        } else if (status === 'Cancel Requested') {
                            badgeStyle = 'background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; font-weight: 700;';
                        }

                        const source = o.source || 'Website';
                        let sourceBadgeStyle = 'background: #e2e8f0; color: #475569;';
                        if (source === 'TikTok Shop') {
                            sourceBadgeStyle = 'background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;';
                        }
                        
                        return `
                        <tr style="cursor: pointer;">
                            <td style="text-align:center;" onclick="event.stopPropagation();">
                                <input type="checkbox" class="order-select-cb" value="${o.orderNumber}">
                            </td>
                            <td class="clickable-order" onclick="openOrderDetailModal('${o.orderNumber}')" style="font-weight: 600;">
                                ${o.orderNumber}
                            </td>
                            <td>
                                <span style="${sourceBadgeStyle} padding: 4px 8px; border-radius: 12px; font-weight: 600; font-size: 0.75rem; display: inline-block;">
                                    ${source}
                                </span>
                            </td>
                            <td>${oDate}</td>
                            <td>${cName}</td>
                            <td style="font-weight: 500;">${total.toLocaleString('vi-VN')} ₫</td>
                            <td>
                                <span style="${badgeStyle} padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; display: inline-block;">
                                    ${status === 'Cancel Requested' ? 'Yêu Cầu Hủy' : status}
                                </span>
                            </td>
                            <td>
                                <div style="display: flex; gap: 10px; align-items: center;" onclick="event.stopPropagation();">
                                    <button class="outline-button" onclick="openOrderDetailModal('${o.orderNumber}')" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 4px; border: 1px solid #d8a94f; color: #d8a94f; background: transparent; cursor: pointer; font-weight: 500;">
                                        View Details
                                    </button>
                                    <select onchange="window.changeOrderStatusFromSelect(this, '${o.orderNumber}', '${status}')" style="padding: 5px; border-radius: 4px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer;">
                                        <option value="Pending" ${status === 'Pending'?'selected':''}>Pending</option>
                                        <option value="Cancel Requested" ${status === 'Cancel Requested'?'selected':''}>Cancel Requested</option>
                                        <option value="Confirmed" ${status === 'Confirmed'?'selected':''}>Confirmed</option>
                                        <option value="Processing" ${status === 'Processing'?'selected':''}>Processing</option>
                                        <option value="Shipped" ${status === 'Shipped' || status === 'Dispatched'?'selected':''}>Shipped</option>
                                        <option value="Delivered" ${status === 'Delivered'?'selected':''}>Delivered</option>
                                        <option value="Completed" ${status === 'Completed'?'selected':''}>Completed</option>
                                        <option value="Cancelled" ${status === 'Cancelled'?'selected':''}>Cancelled</option>
                                        <option value="Refunded" ${status === 'Refunded'?'selected':''}>Refunded</option>
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
                                    if (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'select' || e.target.tagName.toLowerCase() === 'input') return;
                                    openOrderDetailModal(orderNum);
                                });
                            }
                        });

                        // Attach Bulk Checkbox Listeners
                        const selectAllCb = document.getElementById('select-all-orders');
                        const itemCbs = document.querySelectorAll('.order-select-cb');
                        const bulkContainer = document.getElementById('bulk-actions-container-orders');
                        const selectedCountEl = document.getElementById('selected-count-orders');

                        const updateBulkUI = () => {
                            const checkedCount = document.querySelectorAll('.order-select-cb:checked').length;
                            if (checkedCount > 0) {
                                if(bulkContainer) bulkContainer.style.display = 'flex';
                                if(selectedCountEl) selectedCountEl.innerText = checkedCount;
                            } else {
                                if(bulkContainer) bulkContainer.style.display = 'none';
                                if(selectAllCb) selectAllCb.checked = false;
                            }
                        };

                        if (selectAllCb) {
                            // remove old listener to avoid dupes (cheap way: clone node, but here we just assign onclick to avoid dupes)
                            selectAllCb.onclick = (e) => {
                                itemCbs.forEach(cb => cb.checked = e.target.checked);
                                updateBulkUI();
                            };
                        }

                        itemCbs.forEach(cb => {
                            cb.onclick = updateBulkUI;
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
                document.getElementById('detail-source').innerText = o.source || 'Website';
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
                
                // Render Timeline
                const timelineContainer = document.getElementById('admin-order-timeline');
                if (timelineContainer) {
                    const st = o.status || 'Pending';
                    const isCancelled = st === 'Cancelled' || st === 'Refunded';
                    
                    if (isCancelled) {
                        timelineContainer.innerHTML = `
                            <div style="display:flex; gap:15px; align-items:center; background:#fef2f2; border:1px solid #fca5a5; padding:15px; border-radius:8px;">
                                <div style="width:30px; height:30px; border-radius:50%; background:#ef4444; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold;">✕</div>
                                <div>
                                    <div style="font-weight:600; color:#b91c1c;">${st} (Đã Hủy/Hoàn Tiền)</div>
                                    <div style="font-size:0.85rem; color:#7f1d1d;">Đơn hàng này đã bị hủy hoặc hoàn tiền.</div>
                                </div>
                            </div>
                        `;
                    } else {
                        const steps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Completed'];
                        const currentIndex = steps.indexOf(st) >= 0 ? steps.indexOf(st) : 0;
                        const labels = ['Chờ duyệt', 'Đã xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Hoàn tất'];
                        
                        let timelineHtml = '<div style="display:flex; justify-content:space-between; position:relative; padding-bottom:10px;">';
                        timelineHtml += '<div style="position:absolute; top:12px; left:15px; right:15px; height:2px; background:#e2e8f0; z-index:1;"></div>';
                        
                        steps.forEach((step, idx) => {
                            const isCompleted = idx <= currentIndex;
                            const isCurrent = idx === currentIndex;
                            const color = isCompleted ? '#22c55e' : '#cbd5e1';
                            const bgColor = isCompleted ? '#22c55e' : '#f1f5f9';
                            const textColor = isCurrent ? '#15803d' : (isCompleted ? '#16a34a' : '#94a3b8');
                            const fw = isCurrent ? '700' : (isCompleted ? '600' : '500');
                            
                            // progress line override
                            if (idx < steps.length - 1 && isCompleted && idx < currentIndex) {
                                const w = 100 / (steps.length - 1);
                                timelineHtml += `<div style="position:absolute; top:12px; left:${idx * w}%; width:${w}%; height:2px; background:#22c55e; z-index:2;"></div>`;
                            }

                            timelineHtml += `
                                <div style="display:flex; flex-direction:column; align-items:center; position:relative; z-index:3; width:20%;">
                                    <div style="width:26px; height:26px; border-radius:50%; background:${bgColor}; color:${isCompleted ? '#fff' : '#cbd5e1'}; border:2px solid ${color}; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:bold; box-shadow:${isCurrent ? '0 0 0 4px rgba(34,197,94,0.2)' : 'none'};">
                                        ${isCompleted ? '✓' : idx + 1}
                                    </div>
                                    <div style="font-size:0.75rem; color:${textColor}; font-weight:${fw}; margin-top:8px; text-align:center;">${step}</div>
                                    <div style="font-size:0.65rem; color:#64748b; text-align:center;">${labels[idx]}</div>
                                </div>
                            `;
                        });
                        timelineHtml += '</div>';
                        timelineContainer.innerHTML = timelineHtml;
                    }
                }

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

        window.saveOrderDetailsStatus = async function() {
            try {
                const orderNumber = document.getElementById('detail-id').innerText;
                const statusSelect = document.getElementById('detail-status');
                if (orderNumber && statusSelect) {
                    const confirmed = await window.showStatusConfirmModal(`Bạn có chắc chắn muốn cập nhật trạng thái đơn ${orderNumber} thành '${statusSelect.value}'?`);
                    if (!confirmed) return;
                    window.GradieStore.updateOrder(orderNumber, { status: statusSelect.value });
                    window.GradieStore.addActivityLog('Cập nhật trạng thái đơn hàng', 'Đã thay đổi trạng thái đơn ' + orderNumber + ' thành ' + statusSelect.value);
                    if (typeof showToast === 'function') {
                        showToast('✅ Đã cập nhật trạng thái đơn hàng thành công!', 'success');
                    } else {
                        alert('Đã cập nhật trạng thái đơn hàng thành công!');
                    }
                    window.closeOrderDetailModal();
                    window.renderOrdersTable();
                } else {
                    if (typeof showToast === 'function') showToast('Không tìm thấy đơn hàng để cập nhật!', 'error');
                }
            } catch (err) {
                console.error("Error saving status updates:", err);
                if (typeof showToast === 'function') {
                    showToast('❌ Lỗi cập nhật trạng thái: ' + err.message, 'error');
                } else {
                    alert('Lỗi cập nhật trạng thái: ' + err.message);
                }
            }
        };

        // Window click close behavior
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('orderDetailModal');
            if (event.target === modal) {
                window.closeOrderDetailModal();
            }
        });

        // Bulk Actions Handlers
        const getSelectedOrderIds = () => {
            return Array.from(document.querySelectorAll('.order-select-cb:checked')).map(cb => cb.value);
        };

        const bulkDeleteBtn = document.getElementById('bulk-delete-orders-btn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => {
                const ids = getSelectedOrderIds();
                if (ids.length === 0) return;
                if (confirm(`Bạn có chắc chắn muốn xóa ${ids.length} đơn hàng đã chọn không?`)) {
                    let data = window.GradieStore.getData();
                    data.orders = data.orders.filter(o => !ids.includes(o.orderNumber));
                    window.GradieStore.saveData(data);
                    
                    window.GradieStore.addActivityLog('Xóa hàng loạt đơn hàng', `Đã xóa ${ids.length} đơn hàng khỏi hệ thống.`);
                    
                    window.renderOrdersTable();
                    document.getElementById('bulk-actions-container-orders').style.display = 'none';
                    if(document.getElementById('select-all-orders')) document.getElementById('select-all-orders').checked = false;
                }
            });
        }

        const bulkStatusSelect = document.getElementById('bulk-status-select');
        if (bulkStatusSelect) {
            bulkStatusSelect.addEventListener('change', async (e) => {
                const newStatus = e.target.value;
                if (!newStatus) return; // User selected the default prompt option
                
                const ids = getSelectedOrderIds();
                if (ids.length === 0) {
                    e.target.value = "";
                    return;
                }
                
                const confirmed = await window.showStatusConfirmModal(`Bạn có chắc muốn đổi trạng thái ${ids.length} đơn hàng thành "${newStatus}"?`);
                if (confirmed) {
                    ids.forEach(id => {
                        window.GradieStore.updateOrder(id, { status: newStatus });
                    });
                    
                    window.GradieStore.addActivityLog('Cập nhật trạng thái hàng loạt', `Đã đổi ${ids.length} đơn hàng sang trạng thái ${newStatus}.`);
                    
                    window.renderOrdersTable();
                    document.getElementById('bulk-actions-container-orders').style.display = 'none';
                    if(document.getElementById('select-all-orders')) document.getElementById('select-all-orders').checked = false;
                }
                
                // Reset select back to default
                e.target.value = "";
            });
        }

        if (document.getElementById('admin-orders-list')) {
            renderOrdersTable();
        }
    } // end setupOrdersUI

    initAdminOrders();
});
