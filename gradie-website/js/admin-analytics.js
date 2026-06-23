// js/admin-analytics.js

document.addEventListener('DOMContentLoaded', () => {
    let categoryChartInstance = null;
    let revenueChartInstance = null;
    let currentRevenueTimeframe = 'all';

    // Helper to format currency
    const formatMoney = (amount) => Number(amount).toLocaleString('vi-VN') + 'đ';

    function renderAnalytics(animate = true) {
        const orders = window.GradieStore.getOrders() || [];
        const products = window.GradieStore.getProducts() || [];
        const users = window.GradieStore.getUsers() || [];

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
        let categoryProductCounts = {};

        products.forEach(p => {
            productSales[p.id] = { 
                name: p.name, 
                image: p.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100',
                category: p.category || 'Uncategorized',
                sold: 0, 
                revenue: 0, 
                stock: p.stock || 0 
            };
            
            const cat = p.category || 'Uncategorized';
            categoryProductCounts[cat] = (categoryProductCounts[cat] || 0) + 1;

            if (!categorySales[cat]) {
                categorySales[cat] = 0;
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
            const catLabels = Object.keys(categoryProductCounts).filter(k => categoryProductCounts[k] > 0);
            const catData = catLabels.map(k => categoryProductCounts[k]);
            
            if (categoryChartInstance) {
                categoryChartInstance.destroy();
            }

            categoryChartInstance = new Chart(catCtx, {
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

        // 4. Revenue Trend Chart
        const revCtx = document.getElementById('revenueChart');
        if (revCtx) {
            renderRevenueChart(currentRevenueTimeframe);
        }

        // 5. Commission Report
        renderCommissionReport();
    }

    function renderRevenueChart(timeframe) {
        const revCtx = document.getElementById('revenueChart');
        if (!revCtx) return;

        const orders = window.GradieStore.getOrders() || [];
        const validStatuses = ['completed'];

        let dailyRevenue = {};
        
        orders.forEach(o => {
            const status = (o.status || '').toLowerCase();
            if (validStatuses.includes(status)) {
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

        let revenueArray = Object.keys(dailyRevenue).map(date => ({
            date: date.substring(0, 5),
            timestamp: dailyRevenue[date].timestamp,
            revenue: dailyRevenue[date].revenue
        })).sort((a, b) => a.timestamp - b.timestamp);

        if (revenueArray.length === 0) {
            const today = new Date();
            revenueArray = [{ date: `${today.getDate()}/${today.getMonth()+1}`, revenue: 0 }];
        }

        if (timeframe === 'recent') {
            revenueArray = revenueArray.slice(-7);
        }

        const labels = revenueArray.map(item => item.date);
        const data = revenueArray.map(item => item.revenue);

        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }

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
                interaction: { mode: 'index', intersect: false },
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
                    x: { grid: { display: false, drawBorder: false } },
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

    async function renderCommissionReport() {
        try {
            const orders = window.GradieStore.getOrders() || [];
            const validStatuses = ['completed'];
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
    }

    renderAnalytics(true);

    const tfSelect = document.getElementById('revenue-timeframe');
    if (tfSelect) {
        tfSelect.addEventListener('change', (e) => {
            currentRevenueTimeframe = e.target.value;
            renderRevenueChart(currentRevenueTimeframe);
        });
    }

    window.addEventListener('gradie_data_synced', () => {
        renderAnalytics(false);
    });

    // ── AI Insights Modal Functions ──────────────────────────────────────────────────
    window.openAiAnalysis = function() {
        const modal = document.getElementById('aiModal');
        const loading = document.getElementById('ai-loading');
        const content = document.getElementById('ai-content');
        
        if (modal) {
            modal.style.display = 'block';
        }
        if (loading) loading.style.display = 'block';
        if (content) content.style.display = 'none';
        
        setTimeout(async () => {
            try {
                await generateAiReport();
                if (loading) loading.style.display = 'none';
                if (content) content.style.display = 'block';
            } catch (e) {
                console.error('Error generating AI report:', e);
                if (loading) loading.style.display = 'none';
                if (content) {
                    content.innerHTML = `<div style="padding: 20px; color: #ef4444; text-align: center; font-weight: 600;">Đã xảy ra lỗi khi phân tích dữ liệu: ${e.message}</div>`;
                    content.style.display = 'block';
                }
            }
        }, 1500);
    };

    window.closeAiModal = function() {
        const modal = document.getElementById('aiModal');
        if (modal) modal.style.display = 'none';
    };

    window.exportAiReport = function() {
        document.body.classList.add('printing-ai');
        if (typeof showToast === 'function') {
            showToast('🖨️ Đang chuẩn bị báo cáo AI...', 'info');
        }
        
        const cleanUp = () => {
            document.body.classList.remove('printing-ai');
            window.removeEventListener('afterprint', cleanUp);
        };
        
        window.addEventListener('afterprint', cleanUp, { once: true });
        
        setTimeout(() => {
            window.print();
            // Fallback for browsers that don't support or delay afterprint
            setTimeout(cleanUp, 1000);
        }, 300);
    };

    async function generateAiReport() {
        const orders = window.GradieStore.getOrders() || [];
        const products = window.GradieStore.getProducts() || [];
        
        // Determine Timeframe & filter orders
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const isCurrentMonth = (o) => {
            let dateStr = o.date || o.createdAt || '';
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
            return (!isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear);
        };
        
        const validStatuses = ['completed'];
        let monthOrders = orders.filter(o => validStatuses.includes((o.status || '').toLowerCase()) && isCurrentMonth(o));
        let isHistoricalFallback = false;
        
        if (monthOrders.length === 0) {
            monthOrders = orders.filter(o => validStatuses.includes((o.status || '').toLowerCase()));
            isHistoricalFallback = true;
        }
        
        // Calculate KPIs
        let totalRevenue = 0;
        monthOrders.forEach(o => {
            totalRevenue += (Number(o.total) || 0);
        });
        const ordersCount = monthOrders.length;
        const aov = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;
        
        // Product & Category performance
        let productSales = {};
        let categorySales = {};
        
        products.forEach(p => {
            productSales[p.id] = {
                name: p.name,
                category: p.category || 'Chưa phân loại',
                sold: 0,
                revenue: 0,
                stock: Number(p.stock) || 0
            };
        });
        
        monthOrders.forEach(o => {
            if (o.items && Array.isArray(o.items)) {
                o.items.forEach(item => {
                    const qty = Number(item.quantity) || 1;
                    const price = Number(item.price) || 0;
                    const rev = price * qty;
                    
                    if (productSales[item.id]) {
                        productSales[item.id].sold += qty;
                        productSales[item.id].revenue += rev;
                        
                        const cat = productSales[item.id].category;
                        categorySales[cat] = (categorySales[cat] || 0) + rev;
                    } else {
                        const cat = item.category || 'Khác';
                        categorySales[cat] = (categorySales[cat] || 0) + rev;
                    }
                });
            }
        });
        
        // Best selling product
        let bestSeller = null;
        Object.keys(productSales).forEach(id => {
            const p = productSales[id];
            if (p.sold > 0) {
                if (!bestSeller || p.sold > bestSeller.sold) {
                    bestSeller = p;
                }
            }
        });
        
        // Best selling category
        let topCategory = null;
        Object.keys(categorySales).forEach(cat => {
            const rev = categorySales[cat];
            if (!topCategory || rev > topCategory.revenue) {
                topCategory = { name: cat, revenue: rev };
            }
        });
        
        // Dead stock
        const deadStock = Object.values(productSales)
            .filter(p => p.sold === 0 && p.stock > 0)
            .sort((a, b) => b.stock - a.stock)
            .slice(0, 3);
            
        // Staff KPIs
        let staffList = [];
        try {
            const res = await fetch('/api/staff');
            if (res.ok) {
                staffList = await res.json();
            } else {
                throw new Error('API failed');
            }
        } catch (e) {
            if (window.GradieStore) staffList = window.GradieStore.getStaff() || [];
        }
        
        const salesReps = staffList.filter(s => s.role === 'Sales');
        const salesPerformance = [];
        let topRep = null;
        
        salesReps.forEach(rep => {
            const repOrders = monthOrders.filter(o => o.salesperson_id === rep.id);
            const totalSales = repOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
            const kpi = Number(rep.kpi) || 0;
            const progress = kpi > 0 ? Math.min(100, Math.round((totalSales / kpi) * 100)) : 100;
            
            const perf = {
                name: rep.name,
                totalSales: totalSales,
                kpi: kpi,
                progress: progress
            };
            salesPerformance.push(perf);
            
            if (!topRep || progress > topRep.progress) {
                topRep = perf;
            }
        });
        
        // Strategic recommendations
        const recommendations = [];
        
        // Recommendation 1: AOV
        if (aov < 350000) {
            recommendations.push({
                type: 'warning',
                title: 'Tối ưu hóa giá trị trung bình đơn hàng (AOV)',
                content: `AOV hiện tại là <strong>${formatMoney(aov)}</strong>, tương đối thấp. Đề xuất áp dụng chính sách Freeship cho đơn hàng từ 350.000đ hoặc tạo các combo sản phẩm bán kèm (cross-sell) để khuyến khích khách hàng mua thêm sản phẩm.`
            });
        } else {
            recommendations.push({
                type: 'success',
                title: 'Duy trì sức mua tốt (AOV cao)',
                content: `AOV đang ở mức tốt <strong>${formatMoney(aov)}</strong>. Hãy tiếp tục duy trì các ưu đãi quà tặng kèm để giữ chân khách hàng giá trị cao.`
            });
        }
        
        // Recommendation 2: Dead Stock
        if (deadStock.length > 0) {
            const itemsList = deadStock.map(p => `<strong>${p.name}</strong> (Tồn kho: ${p.stock})`).join(', ');
            recommendations.push({
                type: 'danger',
                title: 'Giải phóng hàng tồn đọng (Dead Stock)',
                content: `Phát hiện các mặt hàng có tồn kho nhưng chưa phát sinh doanh số trong kỳ: ${itemsList}. Đề xuất tổ chức chương trình flash sale giảm giá 15-20% hoặc làm quà tặng đính kèm khi mua sản phẩm bán chạy.`
            });
        } else {
            recommendations.push({
                type: 'success',
                title: 'Quản lý vòng quay kho tối ưu',
                content: 'Không phát hiện sản phẩm tồn kho bị đóng băng lâu ngày. Hiệu quả luân chuyển hàng hóa đạt mức xuất sắc.'
            });
        }
        
        // Recommendation 3: Sales Reps KPI
        if (salesPerformance.length > 0) {
            const lowPerformers = salesPerformance.filter(rep => rep.progress < 50);
            if (lowPerformers.length > 0) {
                const names = lowPerformers.map(rep => `<strong>${rep.name}</strong> (${rep.progress}% KPI)`).join(', ');
                recommendations.push({
                    type: 'info',
                    title: 'Thúc đẩy hiệu suất đội ngũ Sales',
                    content: `Một số nhân sự đang có tiến độ hoàn thành KPI dưới 50%: ${names}. Đề xuất xem xét phân bổ lại khu vực khách hàng hoặc áp dụng chương trình thưởng nóng ngắn hạn.`
                });
            } else {
                recommendations.push({
                    type: 'success',
                    title: 'Hiệu suất đội ngũ kinh doanh xuất sắc',
                    content: 'Tất cả nhân viên kinh doanh đều đạt trên 50% tiến độ KPI trong kỳ. Tiếp tục duy trì động lực tốt này.'
                });
            }
        }
        
        // Recommendation 4: Best Seller Stock Alert
        if (bestSeller) {
            const catalogItem = products.find(p => p.id === bestSeller.id);
            const currentStock = catalogItem ? Number(catalogItem.stock) || 0 : 0;
            if (currentStock < 10) {
                recommendations.push({
                    type: 'danger',
                    title: 'Cảnh báo hết hàng dòng sản phẩm Hot',
                    content: `Sản phẩm bán chạy nhất <strong>${bestSeller.name}</strong> hiện chỉ còn <strong>${currentStock}</strong> sản phẩm trong kho. Cần liên hệ nhà cung cấp để bổ sung gấp tránh đứt gãy doanh số.`
                });
            } else {
                recommendations.push({
                    type: 'success',
                    title: 'Tối ưu nguồn hàng bán chạy',
                    content: `Sản phẩm <strong>${bestSeller.name}</strong> là dòng bán chạy nhất với <strong>${bestSeller.sold}</strong> sản phẩm bán ra. Lượng tồn kho hiện tại (${currentStock}) đủ đáp ứng nhu cầu kỳ tới.`
                });
            }
        }
        
        const reportHtml = `
            <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; background: #e0e7ff; color: #4f46e5; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.05em;">
                    ${isHistoricalFallback ? 'Phân tích dữ liệu tích lũy' : `Phân tích dữ liệu tháng ${currentMonth + 1}/${currentYear}`}
                </span>
                <span style="font-size: 0.85rem; color: #64748b;">Mã báo cáo: #AI-${Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            
            <!-- Grid: Key metrics -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                    <div style="font-size: 0.85rem; color: #64748b; font-weight: 600;">Doanh Số Trong Kỳ</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 5px;">${formatMoney(totalRevenue)}</div>
                </div>
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                    <div style="font-size: 0.85rem; color: #64748b; font-weight: 600;">Số Đơn Hoàn Tất</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-top: 5px;">${ordersCount} đơn hàng</div>
                </div>
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                    <div style="font-size: 0.85rem; color: #64748b; font-weight: 600;">Giá Trị Đơn Trung Bình (AOV)</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: #7c3aed; margin-top: 5px;">${formatMoney(aov)}</div>
                </div>
            </div>
    
            <!-- Section: Key Highlights -->
            <div style="margin-bottom: 30px;">
                <h4 style="margin: 0 0 15px 0; font-size: 1.1rem; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d8a94f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                    Điểm Sáng Kinh Doanh & Tồn Kho
                </h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; flex-wrap: wrap;">
                    <div>
                        <div style="font-weight: 600; color: #475569; font-size: 0.9rem; margin-bottom: 8px;">Sản phẩm bán chạy nhất:</div>
                        ${bestSeller ? `
                            <div style="display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
                                <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem;">${bestSeller.name}</div>
                                <div style="font-size: 0.85rem; background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 20px; font-weight: 600; margin-left: auto;">Bán: ${bestSeller.sold}</div>
                            </div>
                        ` : '<div style="color: #94a3b8; font-style: italic;">Chưa ghi nhận sản phẩm bán chạy</div>'}
                        
                        <div style="font-weight: 600; color: #475569; font-size: 0.9rem; margin-top: 15px; margin-bottom: 8px;">Danh mục đóng góp doanh số tốt nhất:</div>
                        ${topCategory ? `
                            <div style="display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                                <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem;">${topCategory.name}</div>
                                <div style="font-size: 0.85rem; color: #64748b; margin-left: auto;">Doanh số: <strong>${formatMoney(topCategory.revenue)}</strong></div>
                            </div>
                        ` : '<div style="color: #94a3b8; font-style: italic;">Chưa ghi nhận danh mục nổi bật</div>'}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #475569; font-size: 0.9rem; margin-bottom: 8px;">Mặt hàng tồn đọng cần lưu ý (Dead Stock):</div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${deadStock.length > 0 ? deadStock.map(p => `
                                <div style="display: flex; align-items: center; justify-content: space-between; background: #fff1f2; padding: 8px 12px; border-radius: 8px; border: 1px solid #fee2e2;">
                                    <span style="font-size: 0.9rem; font-weight: 600; color: #991b1b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${p.name}</span>
                                    <span style="font-size: 0.8rem; background: #fecaca; color: #991b1b; padding: 2px 8px; border-radius: 20px; font-weight: 700;">Tồn: ${p.stock}</span>
                                </div>
                            `).join('') : `
                                <div style="color: #10b981; font-weight: 600; font-size: 0.9rem; padding: 12px; background: #ecfdf5; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                                    Tuyệt vời! Không có hàng tồn đọng.
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
    
            <!-- Section: Staff Performance -->
            ${salesPerformance.length > 0 ? `
            <div style="margin-bottom: 30px;">
                <h4 style="margin: 0 0 15px 0; font-size: 1.1rem; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d8a94f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Hiệu Suất Đội Ngũ Kinh Doanh
                </h4>
                <div style="background: #f8fafc; border-radius: 12px; padding: 15px; border: 1px solid #e2e8f0;">
                    <div style="margin-bottom: 12px; font-size: 0.9rem; color: #475569;">
                        Nhân viên dẫn đầu KPI: <strong>${topRep ? `${topRep.name} (${topRep.progress}% KPI)` : 'N/A'}</strong>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${salesPerformance.map(rep => `
                            <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                                    <span style="font-weight: 600; color: #334155;">${rep.name}</span>
                                    <span style="font-weight: 700; color: #64748b;">${formatMoney(rep.totalSales)} / ${formatMoney(rep.kpi)} (${rep.progress}%)</span>
                                </div>
                                <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                                    <div style="width: ${rep.progress}%; height: 100%; background: ${rep.progress >= 100 ? '#10b981' : '#3b82f6'};"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            ` : ''}
    
            <!-- Section: Strategic Recommendations -->
            <div>
                <h4 style="margin: 0 0 15px 0; font-size: 1.1rem; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d8a94f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.5 1 3.5l1.5 2.5"></path>
                        <path d="M9 18h6"></path>
                        <path d="M10 22h4"></path>
                    </svg>
                    Đề Xuất Chiến Lược Từ AI
                </h4>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${recommendations.map(rec => {
                        let bgColor = '#f8fafc';
                        let borderColor = '#cbd5e1';
                        let titleColor = '#334155';
                        let iconSvg = '';
                        if (rec.type === 'warning') {
                            bgColor = '#fffbeb'; borderColor = '#fcd34d'; titleColor = '#b45309';
                            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
                        } else if (rec.type === 'success') {
                            bgColor = '#f0fdf4'; borderColor = '#86efac'; titleColor = '#15803d';
                            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
                        } else if (rec.type === 'danger') {
                            bgColor = '#fdf2f8'; borderColor = '#fbcfe8'; titleColor = '#be185d';
                            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#be185d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
                        } else if (rec.type === 'info') {
                            bgColor = '#eff6ff'; borderColor = '#93c5fd'; titleColor = '#1d4ed8';
                            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
                        }
                        return `
                            <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-left: 5px solid ${borderColor}; border-radius: 8px; padding: 15px;">
                                <h5 style="margin: 0 0 8px 0; font-size: 0.95rem; font-weight: 700; color: ${titleColor}; display: flex; align-items: center; gap: 8px;">
                                    ${iconSvg}
                                    ${rec.title}
                                </h5>
                                <p style="margin: 0 0 0 26px; font-size: 0.88rem; color: #475569; line-height: 1.6;">${rec.content}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        const container = document.getElementById('ai-content');
        if (container) container.innerHTML = reportHtml;
    }
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

