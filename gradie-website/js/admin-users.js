// js/admin-users.js
document.addEventListener('DOMContentLoaded', () => {
    if (!window.GradieStore) return;
    const usersBody = document.getElementById('admin-users-list');

    if (usersBody) {
        let currentSegmentFilter = 'all';

        // Add Event Listener for Filter
        const filterEl = document.getElementById('user-segment-filter');
        if(filterEl) {
            filterEl.addEventListener('change', (e) => {
                currentSegmentFilter = e.target.value;
                window.renderUsersTable();
            });
        }

        window.renderUsersTable = function() {
            try {
                const users = window.GradieStore.getUsers();
                const orders = window.GradieStore.getOrders();
                const usersBody = document.getElementById('admin-users-list');

                // Variables for Top 3 customers
                const now = new Date();
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                let userSpending = [];

                if (!users || users.length === 0) {
                    if(usersBody) usersBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 30px; color: #64748b;">No registered users yet.</td></tr>';
                } else {
                    let htmlRows = [];
                    
                    users.forEach(u => {
                        const userOrders = orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase());
                        const orderCount = userOrders.length;
                        
                        // Calculate total spent (Only Completed)
                        const validUserOrders = userOrders.filter(o => {
                            const status = (o.status || '').toLowerCase();
                            return status === 'completed';
                        });
                        const totalSpent = validUserOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
                        
                        // Tier Logic
                        let tierBadge = `<span style="background:#e2e8f0; color:#475569; padding:3px 8px; border-radius:12px; font-weight:600; font-size:0.75rem;">Đồng</span>`;
                        if(totalSpent >= 3000000) {
                            tierBadge = `<span style="background:#fef08a; color:#854d0e; padding:3px 8px; border-radius:12px; font-weight:600; font-size:0.75rem;">💎 VIP</span>`;
                        } else if(totalSpent >= 1500000) {
                            tierBadge = `<span style="background:#fde68a; color:#b45309; padding:3px 8px; border-radius:12px; font-weight:600; font-size:0.75rem;">Vàng</span>`;
                        } else if(totalSpent >= 500000) {
                            tierBadge = `<span style="background:#e2e8f0; color:#334155; padding:3px 8px; border-radius:12px; font-weight:600; font-size:0.75rem; border:1px solid #cbd5e1;">Bạc</span>`;
                        }

                        // Last purchase date
                        let lastPurchaseDate = 0;
                        let boughtTeddy = false;
                        
                        userOrders.forEach(o => {
                            const oDate = new Date(o.createdAt || o.date || Date.now()).getTime();
                            if(oDate > lastPurchaseDate) lastPurchaseDate = oDate;
                            if(o.items && o.items.some(i => i.name.toLowerCase().includes('gấu bông') || i.id.toLowerCase().includes('teddy'))) {
                                boughtTeddy = true;
                            }
                        });

                        // Calculate weekly spending
                        const weeklyOrders = userOrders.filter(o => {
                            const oDate = new Date(o.createdAt || o.date || Date.now());
                            return oDate >= oneWeekAgo && oDate <= now;
                        });
                        const weeklySpent = weeklyOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
                        
                        userSpending.push({ user: u, weeklySpent: weeklySpent, totalSpent: totalSpent });

                        // Filtering logic (Segmentation)
                        let isMatch = true;
                        if(currentSegmentFilter === 'vip_only' && totalSpent < 3000000) isMatch = false;
                        if(currentSegmentFilter === 'sleeping' && (lastPurchaseDate >= threeMonthsAgo.getTime() || orderCount === 0)) isMatch = false;
                        if(currentSegmentFilter === 'teddy_lovers' && !boughtTeddy) isMatch = false;

                        if (isMatch) {
                            htmlRows.push(`
                            <tr>
                                <td class="clickable-user" onclick="openUserDetailModal('${u.id}')" style="font-weight:600;">
                                    ${u.username || 'N/A'}
                                </td>
                                <td>${u.email}</td>
                                <td>${u.phone || 'N/A'}</td>
                                <td>${u.address || 'N/A'}</td>
                                <td style="font-weight:600; text-align:center;">${orderCount}</td>
                                <td style="font-weight:600; color:#15803d;">${totalSpent.toLocaleString('vi-VN')}đ</td>
                                <td>${tierBadge}</td>
                                <td>
                                    <div style="display:flex; gap:10px;">
                                        <button class="outline-button" onclick="openUserDetailModal('${u.id}')" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 4px; border: 1px solid #d8a94f; color: #d8a94f; background: transparent; cursor: pointer; font-weight: 500;">
                                            History
                                        </button>
                                        <button class="outline-button" onclick="deleteUser('${u.id}')" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 4px; border: 1px solid #dc2626; color: #dc2626; background: transparent; cursor: pointer; font-weight: 500;">
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            `);
                        }
                    });

                    if(usersBody) {
                        usersBody.innerHTML = htmlRows.length > 0 ? htmlRows.join('') : '<tr><td colspan="8" style="text-align:center; padding: 30px; color: #64748b;">Không có khách hàng nào khớp với bộ lọc.</td></tr>';
                    }
                    
                    // Render Top 3 customers All-Time (ignores segmentation filter)
                    const topCustomersContainer = document.getElementById('top-customers-container');
                    if (topCustomersContainer) {
                        const top3 = userSpending.filter(item => item.totalSpent > 0).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3);
                        
                        if (top3.length === 0) {
                            topCustomersContainer.innerHTML = '<div style="color:#64748b; font-style:italic; padding:15px;">Chưa có dữ liệu khách hàng.</div>';
                        } else {
                            const getCrownSVG = (color) => `<svg width="42" height="42" viewBox="0 0 24 24" fill="${color}"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>`;
                            const medals = [getCrownSVG('#fbbf24'), getCrownSVG('#94a3b8'), getCrownSVG('#b45309')];
                            const labelColors = ['#fbbf24', '#94a3b8', '#b45309'];
                            
                            topCustomersContainer.innerHTML = top3.map((item, index) => `
                                <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
                                    <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${labelColors[index]};"></div>
                                    <div style="position: absolute; top: 15px; right: 15px; opacity: 0.15; transform: rotate(15deg);">${medals[index]}</div>
                                    
                                    <div>
                                        <div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: ${labelColors[index]}; letter-spacing: 1px; margin-bottom: 8px;">Top ${index + 1} Khách Hàng</div>
                                        <h4 style="margin: 0 0 10px 0; font-family: 'Playfair Display', serif; color: #1e293b; font-size: 1.3rem;">${item.user.username || 'N/A'}</h4>
                                        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">${item.user.email}</div>
                                    </div>
                                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e2e8f0;">
                                        <div style="font-size: 0.8rem; color: #64748b;">Tổng chi tiêu mọi thời đại:</div>
                                        <div style="font-size: 1.4rem; color: #1e293b; font-weight: 700;">${item.totalSpent.toLocaleString('vi-VN')}đ</div>
                                    </div>
                                </div>
                            `).join('');
                        }
                    }
                }
            } catch (err) {
                console.error("Error rendering users:", err);
            }
        };

        window.openUserDetailModal = function(userId) {
            try {
                const users = window.GradieStore.getUsers();
                const u = users.find(user => user.id === userId);
                if (!u) return;

                document.getElementById('detail-user-id').innerText = u.id;
                document.getElementById('detail-user-name').innerText = u.username || 'N/A';
                document.getElementById('detail-user-email').innerText = u.email;
                document.getElementById('detail-user-phone').innerText = u.phone || 'N/A';
                document.getElementById('detail-user-address').innerText = u.address || 'N/A';

                const orders = window.GradieStore.getOrders();
                const userOrders = orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase());

                const ordersList = document.getElementById('user-orders-list');
                if (ordersList) {
                    if (userOrders.length === 0) {
                        ordersList.innerHTML = '<div style="color:#64748b; font-style:italic; padding:15px; text-align:center;">This user hasn\'t placed any orders yet.</div>';
                    } else {
                        ordersList.innerHTML = userOrders.map(o => {
                            const total = Number(o.total) || 0;
                            const oDate = o.date || new Date(o.createdAt || Date.now()).toLocaleDateString('vi-VN');
                            const status = o.status || 'Pending';

                            let badgeStyle = 'background: #fef3c7; color: #d97706;';
                            if (status === 'Shipped' || status === 'Dispatched') {
                                badgeStyle = 'background: #dbeafe; color: #2563eb;';
                            } else if (status === 'Delivered') {
                                badgeStyle = 'background: #dcfce7; color: #15803d;';
                            } else if (status === 'Cancelled') {
                                badgeStyle = 'background: #fee2e2; color: #dc2626;';
                            }

                            return `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #f1f5f9; background:#fafbfd; margin-bottom:8px; border-radius:6px;">
                                <div>
                                    <div style="font-weight:600; color:#1e293b; font-size:0.95rem;">${o.orderNumber}</div>
                                    <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">Date: ${oDate} | Items: ${o.items ? o.items.length : 0}</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-weight:600; color:#1e293b; font-size:0.95rem;">${total.toLocaleString('vi-VN')}đ</div>
                                    <span style="${badgeStyle} padding:3px 8px; border-radius:12px; font-weight:600; font-size:0.75rem; display:inline-block; margin-top:4px;">
                                        ${status}
                                    </span>
                                </div>
                            </div>
                            `;
                        }).join('');
                    }
                }

                const modal = document.getElementById('userDetailModal');
                if (modal) modal.style.display = 'block';
            } catch (err) {
                console.error("Error opening user details modal:", err);
            }
        };

        window.closeUserDetailModal = function() {
            const modal = document.getElementById('userDetailModal');
            if (modal) modal.style.display = 'none';
        };

        window.deleteUser = function(userId) {
            try {
                if (confirm("Are you sure you want to delete this user? They will no longer be able to log in, but historical orders will be preserved.")) {
                    let data = window.GradieStore.getData();
                    data.users = (data.users || []).filter(u => u.id !== userId);
                    window.GradieStore.saveData(data);
                    showToast('Đã xóa người dùng thành công!', 'success');
                    window.renderUsersTable();
                }
            } catch (err) {
                console.error("Error deleting user:", err);
            }
        };

        // Window click close modal behavior
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('userDetailModal');
            if (event.target === modal) {
                window.closeUserDetailModal();
            }
        });

        renderUsersTable();
    }
});
