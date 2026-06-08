// js/admin-analytics.js

document.addEventListener('DOMContentLoaded', () => {
    const orders = window.GradieStore.getOrders() || [];
    const products = window.GradieStore.getProducts() || [];
    const users = window.GradieStore.getUsers() || [];

    // 1. Calculate Cash Flow
    let cashFlow = 0;
    let pendingCod = 0;
    
    orders.forEach(o => {
        const status = (o.status || '').toLowerCase();
        const total = Number(o.total) || 0;
        
        if (status === 'delivered' || status === 'completed') {
            cashFlow += total;
        } else if (status === 'shipped' || status === 'processing' || status === 'pending') {
            if ((o.paymentMethod || '').toLowerCase() === 'cod') {
                pendingCod += total;
            }
        }
    });

    document.getElementById('total-cashflow').innerText = cashFlow.toLocaleString('vi-VN') + 'đ';
    document.getElementById('pending-cod').innerText = pendingCod.toLocaleString('vi-VN') + 'đ';

    // 2. Customers
    let vipCount = 0;
    users.forEach(u => {
        const userOrders = orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase());
        const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        if (totalSpent >= 3000000) vipCount++;
    });
    
    document.getElementById('total-customers').innerText = users.length;
    document.getElementById('vip-count').innerText = `${vipCount} khách VIP`;

    // 3. Product Performance (Best Sellers & Dead Stock)
    let productSales = {};
    products.forEach(p => {
        productSales[p.id] = { name: p.name, sold: 0, revenue: 0, stock: p.stock || 0 };
    });

    orders.forEach(o => {
        const status = (o.status || '').toLowerCase();
        if (status === 'cancelled') return;

        if (o.items && Array.isArray(o.items)) {
            o.items.forEach(item => {
                if (productSales[item.id]) {
                    productSales[item.id].sold += (item.quantity || 1);
                    productSales[item.id].revenue += (item.price * (item.quantity || 1));
                }
            });
        }
    });

    const salesArray = Object.values(productSales);
    
    // Best Sellers (Top 5)
    const bestSellers = [...salesArray].sort((a, b) => b.sold - a.sold).slice(0, 5);
    const bestSellersHtml = bestSellers.map(p => `
        <tr>
            <td style="font-weight: 500;">${p.name}</td>
            <td style="text-align:center; font-weight: 600; color:#15803d;">${p.sold}</td>
            <td style="text-align:right;">${p.revenue.toLocaleString('vi-VN')}đ</td>
        </tr>
    `).join('');
    document.getElementById('best-sellers-list').innerHTML = bestSellersHtml || '<tr><td colspan="3" style="text-align:center; color:#64748b;">Chưa có dữ liệu</td></tr>';

    // Dead Stock (0 sold but has stock > 0)
    const deadStock = salesArray.filter(p => p.sold === 0 && p.stock > 0).sort((a, b) => b.stock - a.stock);
    const deadStockHtml = deadStock.map(p => `
        <tr>
            <td style="font-weight: 500;">${p.name}</td>
            <td style="text-align:center; font-weight: 600; color:#dc2626;">${p.stock}</td>
            <td style="text-align:center;">
                <span style="background:#fee2e2; color:#b91c1c; padding:3px 8px; border-radius:12px; font-size:0.75rem; font-weight:600;">Chưa bán được</span>
            </td>
        </tr>
    `).join('');
    document.getElementById('dead-stock-list').innerHTML = deadStockHtml || '<tr><td colspan="3" style="text-align:center; color:#64748b;">Tuyệt vời! Không có sản phẩm tồn đọng.</td></tr>';

    // 4. Revenue Chart (Last 7 Days)
    const ctx = document.getElementById('revenueChart');
    if (ctx) {
        const last7Days = [];
        const revenueData = [];
        const now = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = `${d.getDate()}/${d.getMonth()+1}`;
            last7Days.push(dateStr);
            
            // Calculate revenue for this day
            let dayRev = 0;
            orders.forEach(o => {
                const status = (o.status || '').toLowerCase();
                if (status !== 'cancelled') {
                    const oDate = new Date(o.createdAt || o.date || Date.now());
                    if (oDate.getDate() === d.getDate() && oDate.getMonth() === d.getMonth() && oDate.getFullYear() === d.getFullYear()) {
                        dayRev += (Number(o.total) || 0);
                    }
                }
            });
            revenueData.push(dayRev);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Doanh thu',
                    data: revenueData,
                    borderColor: '#d8a94f',
                    backgroundColor: 'rgba(216, 169, 79, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#d8a94f',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4 // Smooth curve
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleFont: { size: 13, family: "'Inter', sans-serif" },
                        bodyFont: { size: 14, weight: 'bold', family: "'Inter', sans-serif" },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y.toLocaleString('vi-VN') + ' VNĐ';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f5f9',
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: 6,
                            callback: function(value) {
                                if(value >= 1000000) return (value / 1000000) + 'M';
                                if(value >= 1000) return (value / 1000) + 'k';
                                return value;
                            }
                        }
                    }
                }
            }
        });
    }
});
