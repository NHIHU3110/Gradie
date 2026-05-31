// js/admin-users.js
document.addEventListener('DOMContentLoaded', () => {
    if (!window.GradieStore) return;
    const usersBody = document.getElementById('admin-users-list');

    if (usersBody) {
        window.renderUsersTable = function() {
            try {
                const users = window.GradieStore.getUsers();
                const orders = window.GradieStore.getOrders();

                if (!users || users.length === 0) {
                    usersBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 30px; color: #64748b;">No registered users yet.</td></tr>';
                } else {
                    usersBody.innerHTML = users.map(u => {
                        const userOrders = orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase());
                        const orderCount = userOrders.length;
                        
                        return `
                        <tr>
                            <td class="clickable-user" onclick="openUserDetailModal('${u.id}')" style="font-weight:600;">
                                ${u.username || 'N/A'}
                            </td>
                            <td>${u.email}</td>
                            <td>${u.phone || 'N/A'}</td>
                            <td>${u.address || 'N/A'}</td>
                            <td style="font-weight:600; text-align:center;">${orderCount}</td>
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
                    }).join('');
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
                    alert("User successfully deleted.");
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
