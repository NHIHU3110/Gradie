// js/admin-users.js
document.addEventListener('DOMContentLoaded', () => {
    if (!window.GradieStore) return;
    const usersBody = document.getElementById('admin-users-list');

    if (usersBody) {
        window.renderUsersTable = function() {
            try {
                const users = window.GradieStore.getUsers();
                const orders = window.GradieStore.getOrders();
                const usersBody = document.getElementById('admin-users-list');

                // Variables for Top 3 customers
                const now = new Date();
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                let userSpending = [];

                if (!users || users.length === 0) {
                    if(usersBody) usersBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 30px; color: #64748b;">No registered users yet.</td></tr>';
                } else {
                    const htmlRows = users.map(u => {
                        const userOrders = orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase());
                        const orderCount = userOrders.length;
                        
                        // Calculate total spent
                        const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
                        
                        // VIP Threshold: 2,000,000 VND
                        const isVIP = totalSpent >= 2000000;
                        const tierBadge = isVIP ? `<span style="background:#fef08a; color:#854d0e; padding:3px 8px; border-radius:12px; font-weight:600; font-size:0.75rem;">VIP</span>` : `<span style="background:#e2e8f0; color:#475569; padding:3px 8px; border-radius:12px; font-weight:600; font-size:0.75rem;">Thường</span>`;

                        // Calculate weekly spending
                        const weeklyOrders = userOrders.filter(o => {
                            const oDate = new Date(o.createdAt || o.date || Date.now());
                            return oDate >= oneWeekAgo && oDate <= now;
                        });
                        const weeklySpent = weeklyOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
                        
                        userSpending.push({ user: u, weeklySpent: weeklySpent, totalSpent: totalSpent });

                        return `
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
                        `;
                    });

                    if(usersBody) usersBody.innerHTML = htmlRows.join('');
                    
                    // Render Top 3 customers
                    const topCustomersContainer = document.getElementById('top-customers-container');
                    if (topCustomersContainer) {
                        const top3 = userSpending.filter(item => item.weeklySpent > 0).sort((a, b) => b.weeklySpent - a.weeklySpent).slice(0, 3);
                        
                        if (top3.length === 0) {
                            topCustomersContainer.innerHTML = '<div style="color:#64748b; font-style:italic; padding:15px;">Chưa có khách hàng nào phát sinh đơn hàng trong 7 ngày qua.</div>';
                        } else {
                            const medals = ['🥇', '🥈', '🥉'];
                            topCustomersContainer.innerHTML = top3.map((item, index) => `
                                <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; overflow: hidden;">
                                    <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#b45309'};"></div>
                                    <div style="font-size: 2.5rem; position: absolute; top: 10px; right: 15px; opacity: 0.2;">${medals[index]}</div>
                                    <h4 style="margin: 0 0 10px 0; font-family: 'Playfair Display', serif; color: #1e293b; font-size: 1.2rem;">${item.user.username || 'N/A'}</h4>
                                    <div style="font-size: 0.9rem; color: #475569; margin-bottom: 5px;"><strong>Email:</strong> ${item.user.email}</div>
                                    <div style="font-size: 0.9rem; color: #475569; margin-bottom: 5px;"><strong>Tổng mua (từ trước):</strong> ${item.totalSpent.toLocaleString('vi-VN')}đ</div>
                                    <div style="font-size: 1.15rem; color: #d8a94f; font-weight: 700; margin-top: 10px;">Chi tiêu tuần này: ${item.weeklySpent.toLocaleString('vi-VN')}đ</div>
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
