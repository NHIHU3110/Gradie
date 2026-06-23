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
        document.getElementById('set-tiktok-key').value = s.tiktokAppKey || '';
        document.getElementById('set-tiktok-secret').value = s.tiktokAppSecret || '';
        document.getElementById('set-tiktok-token').value = s.tiktokAccessToken || '';
        document.getElementById('set-tiktok-shop-cipher').value = s.tiktokShopCipher || '';
        document.getElementById('set-lazada-key').value = s.lazadaAppKey || '';
        document.getElementById('set-lazada-secret').value = s.lazadaAppSecret || '';
        document.getElementById('set-lazada-base-url').value = s.lazadaApiBaseUrl || 'https://api.lazada.vn/rest';
        
        // Update connection status and sync counts
        const updateMarketplaceStatus = () => {
            const currentSettings = window.GradieStore.getSettings();
            const tiktokConnected = currentSettings.tiktokAppKey && currentSettings.tiktokAppSecret;
            const lazadaConnected = currentSettings.lazadaAppKey && currentSettings.lazadaAppSecret;

            const tiktokStatusEl = document.getElementById('tiktok-conn-status');
            if (tiktokStatusEl) {
                if (tiktokConnected) {
                    tiktokStatusEl.textContent = '● Connected';
                    tiktokStatusEl.style.color = '#10b981';
                } else {
                    tiktokStatusEl.textContent = '○ Disconnected';
                    tiktokStatusEl.style.color = '#ef4444';
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

            const productsEl = document.getElementById('tiktok-synced-products');
            const ordersEl = document.getElementById('tiktok-synced-orders');
            if (productsEl) productsEl.textContent = window.GradieStore.getProducts().length;
            if (ordersEl) ordersEl.textContent = window.GradieStore.getOrders().length;

            const lazadaProductsEl = document.getElementById('lazada-synced-products');
            const lazadaOrdersEl = document.getElementById('lazada-synced-orders');
            if (lazadaProductsEl) lazadaProductsEl.textContent = window.GradieStore.getProducts().length;
            if (lazadaOrdersEl) lazadaOrdersEl.textContent = window.GradieStore.getOrders().length;
        };
        
        updateMarketplaceStatus();
        
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.GradieStore.saveSettings({
                brandName: document.getElementById('set-brand').value,
                tagline: document.getElementById('set-tagline').value,
                announcement: document.getElementById('set-ann').value,
                shippingFee: Number(document.getElementById('set-ship').value),
                tiktokAppKey: document.getElementById('set-tiktok-key').value,
                tiktokAppSecret: document.getElementById('set-tiktok-secret').value,
                tiktokAccessToken: document.getElementById('set-tiktok-token').value,
                tiktokShopCipher: document.getElementById('set-tiktok-shop-cipher').value,
                lazadaAppKey: document.getElementById('set-lazada-key').value,
                lazadaAppSecret: document.getElementById('set-lazada-secret').value,
                lazadaApiBaseUrl: document.getElementById('set-lazada-base-url').value
            });
            updateMarketplaceStatus();
            showToast('Đã lưu cài đặt! Thay đổi sẽ được áp dụng ngay lập tức.', 'success');
        });
        
        // Sync Products Button
        const syncProductsBtn = document.getElementById('btn-sync-tiktok-products');
        if (syncProductsBtn) {
            syncProductsBtn.addEventListener('click', async () => {
                const origText = syncProductsBtn.innerHTML;
                syncProductsBtn.disabled = true;
                syncProductsBtn.innerHTML = '<span>⏳</span> Synchronizing...';
                
                try {
                    const settings = window.GradieStore.getSettings();
                    const res = await fetch('/api/tiktok', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'sync_products',
                            appKey: settings.tiktokAppKey,
                            appSecret: settings.tiktokAppSecret
                        })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        showToast(`Đã đồng bộ thành công ${data.syncedCount} sản phẩm với TikTok Shop!`, 'success');
                        window.GradieStore.addActivityLog('TikTok Sync', `Đồng bộ thành công ${data.syncedCount} sản phẩm.`);
                        updateMarketplaceStatus();
                    } else {
                        showToast(`Lỗi đồng bộ: ${data.message || 'Không rõ nguyên nhân'}`, 'error');
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
        const syncOrdersBtn = document.getElementById('btn-sync-tiktok-orders');
        if (syncOrdersBtn) {
            syncOrdersBtn.addEventListener('click', async () => {
                const origText = syncOrdersBtn.innerHTML;
                syncOrdersBtn.disabled = true;
                syncOrdersBtn.innerHTML = '<span>⏳</span> Importing...';
                
                await window.GradieStore.syncTikTokOrders(
                    (res) => {
                        showToast(`Đã đồng bộ thành công! Thêm ${res.addedCount} đơn mới, cập nhật ${res.updatedCount} đơn hàng từ TikTok Shop!`, 'success');
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
    }
});
