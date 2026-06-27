// js/admin-settings.js
document.addEventListener('DOMContentLoaded', () => {
    if(!window.GradieStore) return;
    const settingsForm = document.getElementById('admin-settings-form');
    if (settingsForm) {
        const s = window.GradieStore.getSettings();
        document.getElementById('set-brand').value = s.brandName || '';
        document.getElementById('set-tagline').value = s.tagline || '';
        document.getElementById('set-ann').value = s.announcement || '';
        document.getElementById('set-ship').value = s.shippingFee || 30000;
        document.getElementById('set-tiki-key').value = s.tikiAppKey || '';
        document.getElementById('set-tiki-secret').value = s.tikiAppSecret || '';
        document.getElementById('set-tiki-token').value = s.tikiAccessToken || '';
        document.getElementById('set-tiki-shop-cipher').value = s.tikiShopCipher || '';
        document.getElementById('set-lazada-key').value = s.lazadaAppKey || '';
        document.getElementById('set-lazada-secret').value = s.lazadaAppSecret || '';
        document.getElementById('set-lazada-token').value = s.lazadaAccessToken || '';
        document.getElementById('set-lazada-base-url').value = s.lazadaApiBaseUrl || 'https://api.lazada.vn/rest';
        
        
        // Update connection status and sync counts
        const updateMarketplaceStatus = () => {
            const currentSettings = window.GradieStore.getSettings();
            const tikiConnected = currentSettings.tikiAppKey && currentSettings.tikiAppSecret;
            const lazadaConnected = currentSettings.lazadaAppKey && currentSettings.lazadaAppSecret;

            const tikiStatusEl = document.getElementById('tiki-conn-status');
            if (tikiStatusEl) {
                if (tikiConnected) {
                    tikiStatusEl.textContent = '● Connected';
                    tikiStatusEl.style.color = '#10b981';
                } else {
                    tikiStatusEl.textContent = '○ Disconnected';
                    tikiStatusEl.style.color = '#ef4444';
                }
            }

            const lazadaStatusEl = document.getElementById('lazada-conn-status');
            if (lazadaStatusEl) {
                if (lazadaConnected) {
                    lazadaStatusEl.textContent = '● Connected';
                    lazadaStatusEl.style.color = '#10b981';
                } else {
                    lazadaStatusEl.textContent = '○ Disconnected';
                    lazadaStatusEl.style.color = '#ef4444';
                }
            }

            const allProducts = window.GradieStore.getProducts();
            const allOrders = window.GradieStore.getOrders();

            const productsEl = document.getElementById('tiki-synced-products');
            const ordersEl = document.getElementById('tiki-synced-orders');
            if (productsEl) productsEl.textContent = allProducts.filter(p => p.tikiStock !== undefined).length || allProducts.length;
            if (ordersEl) ordersEl.textContent = allOrders.filter(o => o.source === 'Tiki').length;

            const lazadaProductsEl = document.getElementById('lazada-synced-products');
            const lazadaOrdersEl = document.getElementById('lazada-synced-orders');
            if (lazadaProductsEl) lazadaProductsEl.textContent = allProducts.filter(p => p.lazadaStock !== undefined).length || allProducts.length;
            if (lazadaOrdersEl) lazadaOrdersEl.textContent = allOrders.filter(o => o.source === 'Lazada').length;
        };
        
        updateMarketplaceStatus();
        
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.GradieStore.saveSettings({
                brandName: document.getElementById('set-brand').value,
                tagline: document.getElementById('set-tagline').value,
                announcement: document.getElementById('set-ann').value,
                shippingFee: Number(document.getElementById('set-ship').value),
                tikiAppKey: document.getElementById('set-tiki-key').value,
                tikiAppSecret: document.getElementById('set-tiki-secret').value,
                tikiAccessToken: document.getElementById('set-tiki-token').value,
                tikiShopCipher: document.getElementById('set-tiki-shop-cipher').value,
                lazadaAppKey: document.getElementById('set-lazada-key').value,
                lazadaAppSecret: document.getElementById('set-lazada-secret').value,
                lazadaAccessToken: document.getElementById('set-lazada-token').value,
                lazadaApiBaseUrl: document.getElementById('set-lazada-base-url').value
            });
            updateMarketplaceStatus();
            showToast('Đã lưu cài đặt! Thay đổi sẽ được áp dụng ngay lập tức.', 'success');
        });
        
        // Sync Products Button
        const syncProductsBtn = document.getElementById('btn-sync-tiki-products');
        if (syncProductsBtn) {
            syncProductsBtn.addEventListener('click', async () => {
                const origText = syncProductsBtn.innerHTML;
                syncProductsBtn.disabled = true;
                syncProductsBtn.innerHTML = '<span>⏳</span> Synchronizing...';
                
                try {
                    const res = await window.GradieStore.syncTikiProducts();
                    if (res && res.success) {
                        showToast(`Đã đồng bộ thành công ${res.syncedCount || 0} sản phẩm với Tiki!`, 'success');
                        updateMarketplaceStatus();
                    } else {
                        showToast(`Lỗi đồng bộ: ${res?.message || 'Không rõ nguyên nhân'}`, 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Lỗi mạng khi đồng bộ sản phẩm.', 'error');
                } finally {
                    syncProductsBtn.disabled = false;
                    syncProductsBtn.innerHTML = origText;
                }
            });
        }

        const syncLazadaProductsBtn = document.getElementById('btn-sync-lazada-products');
        if (syncLazadaProductsBtn) {
            syncLazadaProductsBtn.addEventListener('click', async () => {
                const origText = syncLazadaProductsBtn.innerHTML;
                syncLazadaProductsBtn.disabled = true;
                syncLazadaProductsBtn.innerHTML = '<span>⏳</span> Synchronizing...';
                
                try {
                    const result = await window.GradieStore.syncLazadaProducts();
                    if (result.success) {
                        showToast(`Đã đồng bộ thành công ${result.syncedCount} sản phẩm với Lazada!`, 'success');
                        updateMarketplaceStatus();
                    } else {
                        showToast(`Lỗi đồng bộ Lazada: ${result.message || 'Không rõ nguyên nhân'}`, 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Lỗi mạng khi đồng bộ sản phẩm Lazada.', 'error');
                } finally {
                    syncLazadaProductsBtn.disabled = false;
                    syncLazadaProductsBtn.innerHTML = origText;
                }
            });
        }
        
        // Sync Orders Button
        const syncOrdersBtn = document.getElementById('btn-sync-tiki-orders');
        if (syncOrdersBtn) {
            syncOrdersBtn.addEventListener('click', async () => {
                const origText = syncOrdersBtn.innerHTML;
                syncOrdersBtn.disabled = true;
                syncOrdersBtn.innerHTML = '<span>⏳</span> Importing...';
                
                await window.GradieStore.syncTikiOrders(
                    (res) => {
                        showToast(`Đã đồng bộ thành công! Thêm ${res.addedCount} đơn mới, cập nhật ${res.updatedCount} đơn hàng từ Tiki!`, 'success');
                        updateMarketplaceStatus();
                    },
                    (err) => {
                        showToast(`Lỗi nhập đơn hàng: ${err}`, 'error');
                    },
                    (loading) => {
                        if (!loading) {
                            syncOrdersBtn.disabled = false;
                            syncOrdersBtn.innerHTML = origText;
                        }
                    }
                );
            });
        }

        const syncLazadaOrdersBtn = document.getElementById('btn-sync-lazada-orders');
        if (syncLazadaOrdersBtn) {
            syncLazadaOrdersBtn.addEventListener('click', async () => {
                const origText = syncLazadaOrdersBtn.innerHTML;
                syncLazadaOrdersBtn.disabled = true;
                syncLazadaOrdersBtn.innerHTML = '<span>⏳</span> Importing...';

                await window.GradieStore.syncLazadaOrders(
                    (res) => {
                        showToast(`Đã đồng bộ thành công! Thêm ${res.addedCount} đơn mới, cập nhật ${res.updatedCount} đơn hàng từ Lazada!`, 'success');
                        updateMarketplaceStatus();
                    },
                    (err) => {
                        showToast(`Lỗi nhập đơn Lazada: ${err}`, 'error');
                    },
                    (loading) => {
                        if (!loading) {
                            syncLazadaOrdersBtn.disabled = false;
                            syncLazadaOrdersBtn.innerHTML = origText;
                        }
                    }
                );
            });
        }
        
        window.resetDatabase = function() {
            if(confirm("DANGER! This will wipe all current orders, custom products, and content. Restore original CSV products and defaults?")) {
                window.GradieStore.resetData(true);
                showToast('Đã reset database thành công!', 'info');
                window.location.reload();
            }
        };

        window.exportProductsJson = function() {
            const data = window.GradieStore.getData();
            const products = data.products || [];
            const jsonStr = JSON.stringify(products, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "products.json";
            a.click();
            URL.revokeObjectURL(url);
            showToast("Đã tải xuống products.json. Hãy copy đè vào file data/products.json!", "success");
        };

        window.exportGlobalDataJs = function() {
            const data = window.GradieStore.getData();
            const jsStr = "window.GRADIE_DATA = " + JSON.stringify(data, null, 2) + ";";
            const blob = new Blob([jsStr], { type: "application/javascript" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "global-data.js";
            a.click();
            URL.revokeObjectURL(url);
            showToast("Đã tải xuống global-data.js. Hãy copy đè vào file js/global-data.js!", "success");
        };

        // Tab Switching Logic
        const tabs = document.querySelectorAll('.settings-tabs li');
        const panes = document.querySelectorAll('.settings-pane');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');
                
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(target).classList.add('active');
            });
        });
    }
});
