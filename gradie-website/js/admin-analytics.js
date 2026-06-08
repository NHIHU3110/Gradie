// js/admin-analytics.js

document.addEventListener('DOMContentLoaded', () => {
    const orders = window.GradieStore.getOrders() || [];
    const products = window.GradieStore.getProducts() || [];
    const users = window.GradieStore.getUsers() || [];

    // Helper to format currency
    const formatMoney = (amount) => Number(amount).toLocaleString('vi-VN') + 'đ';

    // 1. Calculate KPIs
    let totalRevenue = 0;
    let validOrdersCount = 0;
    const validStatuses = ['completed'];
    
    orders.forEach(o => {
        const status = (o.status || '').toLowerCase();
        const total = Number(o.total) || 0;
        if (validStatuses.includes(status)) {
            totalRevenue += total;
            validOrdersCount++;
        }
    });

    const aov = validOrdersCount > 0 ? (totalRevenue / validOrdersCount) : 0;

    document.getElementById('total-revenue').innerText = formatMoney(totalRevenue);
    document.getElementById('total-orders').innerText = validOrdersCount;
    document.getElementById('avg-order-value').innerText = formatMoney(Math.round(aov));

    // Customers & VIPs
    let vipCount = 0;
    users.forEach(u => {
        const userOrders = orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase());
        const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        if (totalSpent >= 3000000) vipCount++;
    });
    
    document.getElementById('total-customers').innerText = users.length;
    document.getElementById('vip-count').innerText = `${vipCount} Khách VIP`;

    // 2. Product Performance (Best Sellers & Dead Stock) & Category Distribution
    let productSales = {};
    let categorySales = {};

    products.forEach(p => {
        productSales[p.id] = { 
            name: p.name, 
            image: p.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100',
            category: p.category || 'Uncategorized',
            sold: 0, 
            revenue: 0, 
            stock: p.stock || 0 
        };
        if (!categorySales[p.category || 'Uncategorized']) {
            categorySales[p.category || 'Uncategorized'] = 0;
        }
    });

    orders.forEach(o => {
        const status = (o.status || '').toLowerCase();
        if (!validStatuses.includes(status)) return;

        if (o.items && Array.isArray(o.items)) {
            o.items.forEach(item => {
                const qty = item.quantity || 1;
                const rev = item.price * qty;
                
                if (productSales[item.id]) {
                    productSales[item.id].sold += qty;
                    productSales[item.id].revenue += rev;
                    categorySales[productSales[item.id].category] += qty;
                } else {
                    // For items deleted from catalog but in orders
                    if (!categorySales['Khác']) categorySales['Khác'] = 0;
                    categorySales['Khác'] += qty;
                }
            });
        }
    });

    const salesArray = Object.values(productSales);
    
    // Best Sellers (Top 5)
    const bestSellers = [...salesArray].sort((a, b) => b.sold - a.sold).slice(0, 5);
    const bestSellersHtml = bestSellers.map(p => `
        <tr>
            <td>
                <div class="product-cell">
                    <img src="${p.image}" alt="${p.name}" class="product-img">
                    <div class="product-info">
                        <span class="product-name">${p.name}</span>
                        <span class="product-cat">${p.category}</span>
                    </div>
                </div>
            </td>
            <td style="text-align:center; font-weight: 600; color:#1e293b;">${p.sold}</td>
            <td style="text-align:right; font-weight: 600; color:#10b981;">${formatMoney(p.revenue)}</td>
        </tr>
    `).join('');
    document.getElementById('best-sellers-list').innerHTML = bestSellersHtml || '<tr><td colspan="3" style="text-align:center; color:#64748b; padding:20px;">Chưa có dữ liệu</td></tr>';

    // Dead Stock (0 sold but has stock > 0)
    const deadStock = salesArray.filter(p => p.sold === 0 && p.stock > 0).sort((a, b) => b.stock - a.stock).slice(0, 5);
    const deadStockHtml = deadStock.map(p => `
        <tr>
            <td>
                <div class="product-cell">
                    <img src="${p.image}" alt="${p.name}" class="product-img">
                    <div class="product-info">
                        <span class="product-name">${p.name}</span>
                        <span class="product-cat">${p.category}</span>
                    </div>
                </div>
            </td>
            <td style="text-align:center; font-weight: 600; color:#ef4444;">${p.stock}</td>
            <td style="text-align:center;">
                <span class="badge badge-danger">Tồn đọng</span>
            </td>
        </tr>
    `).join('');
    document.getElementById('dead-stock-list').innerHTML = deadStockHtml || '<tr><td colspan="3" style="text-align:center; color:#64748b; padding:20px;">Tuyệt vời! Không có sản phẩm tồn đọng.</td></tr>';

    // 3. Category Doughnut Chart
    const catCtx = document.getElementById('categoryChart');
    if (catCtx) {
        const catLabels = Object.keys(categorySales).filter(k => categorySales[k] > 0);
        const catData = catLabels.map(k => categorySales[k]);
        
        new Chart(catCtx, {
            type: 'doughnut',
            data: {
                labels: catLabels.length > 0 ? catLabels : ['Chưa có dữ liệu'],
                datasets: [{
                    data: catData.length > 0 ? catData : [1],
                    backgroundColor: ['#d8a94f', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: "'Inter', sans-serif", size: 12 },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { size: 13, family: "'Inter', sans-serif" },
                        bodyFont: { size: 14, weight: 'bold', family: "'Inter', sans-serif" },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                if (catData.length === 0) return ' 0';
                                return ` ${context.parsed} sản phẩm`;
                            }
                        }
                    }
                }
            }
        });
    }

    // 4. Revenue Trend Chart (Dynamic Dates)
    const revCtx = document.getElementById('revenueChart');
    let revenueChartInstance = null;

    function renderRevenueChart(timeframe) {
        // Parse all dates from orders
        let dailyRevenue = {};
        
        orders.forEach(o => {
            const status = (o.status || '').toLowerCase();
            if (validStatuses.includes(status)) {
                // Parse date: format in DB is often DD/MM/YYYY HH:mm:ss
                let dateStr = o.date || o.createdAt || new Date().toISOString();
                let d;
                if (dateStr.includes('/')) {
                    const parts = dateStr.split(' ')[0].split('/');
                    if (parts.length === 3) {
                        d = new Date(parts[2], parts[1] - 1, parts[0]);
                    } else {
                        d = new Date(dateStr);
                    }
                } else {
                    d = new Date(dateStr);
                }
                
                if (!isNaN(d.getTime())) {
                    const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`;
                    if (!dailyRevenue[formattedDate]) dailyRevenue[formattedDate] = { timestamp: d.getTime(), revenue: 0 };
                    dailyRevenue[formattedDate].revenue += (Number(o.total) || 0);
                }
            }
        });

        // Convert to array and sort chronologically
        let revenueArray = Object.keys(dailyRevenue).map(date => ({
            date: date.substring(0, 5), // Keep DD/MM
            timestamp: dailyRevenue[date].timestamp,
            revenue: dailyRevenue[date].revenue
        })).sort((a, b) => a.timestamp - b.timestamp);

        if (revenueArray.length === 0) {
            // Mock empty data if no orders
            const today = new Date();
            revenueArray = [{ date: `${today.getDate()}/${today.getMonth()+1}`, revenue: 0 }];
        }

        if (timeframe === 'recent') {
            // Take the last 7 distinct dates with sales
            revenueArray = revenueArray.slice(-7);
        }

        const labels = revenueArray.map(item => item.date);
        const data = revenueArray.map(item => item.revenue);

        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }

        // Create a gradient for the line chart
        const ctx2d = revCtx.getContext('2d');
        const gradientFill = ctx2d.createLinearGradient(0, 0, 0, 320);
        gradientFill.addColorStop(0, 'rgba(216, 169, 79, 0.4)');
        gradientFill.addColorStop(1, 'rgba(216, 169, 79, 0.0)');

        revenueChartInstance = new Chart(revCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu',
                    data: data,
                    borderColor: '#d8a94f',
                    backgroundColor: gradientFill,
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#d8a94f',
                    pointBorderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    fill: true,
                    tension: 0.45
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
                        grid: { display: false, drawBorder: false }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9', drawBorder: false },
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

    if (revCtx) {
        renderRevenueChart('all');
        const tfSelect = document.getElementById('revenue-timeframe');
        if (tfSelect) {
            tfSelect.addEventListener('change', (e) => {
                renderRevenueChart(e.target.value);
            });
        }
    }

    // 5. Commission Report
    (async function renderCommissionReport() {
        try {
            let staffList = [];
            try {
                const res = await fetch('/api/staff');
                if(!res.ok) throw new Error('API fetch failed');
                staffList = await res.json();
            } catch(e) {
                console.warn('API /api/staff failed. Using local storage fallback.');
                if (window.GradieStore) staffList = window.GradieStore.getStaff() || [];
            }
            const salesReps = staffList.filter(s => s.role === 'Sales');
            
            const tbody = document.getElementById('commission-table-body');
            if(!tbody) return;
            
            if(salesReps.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chưa có nhân viên Sales nào.</td></tr>';
                return;
            }

            let html = '';
            salesReps.forEach(rep => {
                const repOrders = orders.filter(o => o.salesperson_id === rep.id && validStatuses.includes((o.status || '').toLowerCase()));
                const totalSales = repOrders.reduce((sum, o) => sum + (Number(o.total)||0), 0);
                const kpi = Number(rep.kpi) || 0;
                const commissionRate = Number(rep.commissionRate) || 0;
                
                const commissionAmount = (totalSales * commissionRate) / 100;
                let kpiProgress = kpi > 0 ? Math.min(100, Math.round((totalSales / kpi) * 100)) : 100;

                html += `
                <tr>
                    <td>
                        <div class="product-cell">
                            <img src="${rep.avatar}" class="product-img" style="border-radius:50%;" alt="${rep.name}">
                            <div class="product-info">
                                <span class="product-name">${rep.name}</span>
                                <span class="product-cat">${rep.email}</span>
                            </div>
                        </div>
                    </td>
                    <td style="font-weight:700; color:#0f172a;">${formatMoney(totalSales)}</td>
                    <td>
                        <div style="font-size:0.8rem; color:#64748b; margin-bottom:4px;">${kpiProgress}% / ${formatMoney(kpi)}</div>
                        <div style="width:100%; height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
                            <div style="width:${kpiProgress}%; height:100%; background:${kpiProgress >= 100 ? '#10b981' : '#3b82f6'};"></div>
                        </div>
                    </td>
                    <td style="font-weight:700; color:#10b981;">
                        +${formatMoney(commissionAmount)}
                        <br><span style="font-size:0.75rem; color:#64748b; font-weight:500;">(${commissionRate}%)</span>
                    </td>
                </tr>
                `;
            });
            tbody.innerHTML = html;
        } catch(e) {
            console.error('Error rendering commission report:', e);
        }
    })();
});

// ── PDF Export Function ────────────────────────────────────────────────────────
window.exportAnalyticsPDF = function() {
    // Set the print date
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    const printDateEl = document.getElementById('pdf-print-date');
    if (printDateEl) printDateEl.textContent = 'Ngày xuất: ' + dateStr;

    // Notify user
    if (typeof showToast === 'function') {
        showToast('🖨️ Đang chuẩn bị báo cáo PDF...', 'info');
    }

    // Short delay to allow toast to show, then print
    setTimeout(() => {
        window.print();
    }, 300);
};

