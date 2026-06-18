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
        
        // Update connection status and sync counts
        const updateTiktokStatus = () => {
            const currentSettings = window.GradieStore.getSettings();
            const hasCredentials = currentSettings.tiktokAppKey && currentSettings.tiktokAppSecret;
            const statusEl = document.getElementById('tiktok-conn-status');
            if (statusEl) {
                if (hasCredentials) {
                    statusEl.textContent = '● Connected';
                    statusEl.style.color = '#10b981';
                } else {
                    statusEl.textContent = '○ Disconnected';
                    statusEl.style.color = '#ef4444';
                }
            }
            
            const productsEl = document.getElementById('tiktok-synced-products');
            const ordersEl = document.getElementById('tiktok-synced-orders');
            if (productsEl) productsEl.textContent = window.GradieStore.getProducts().length;
            if (ordersEl) ordersEl.textContent = window.GradieStore.getOrders().length;
        };
        
        updateTiktokStatus();
        
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.GradieStore.saveSettings({
                brandName: document.getElementById('set-brand').value,
                tagline: document.getElementById('set-tagline').value,
                announcement: document.getElementById('set-ann').value,
                shippingFee: Number(document.getElementById('set-ship').value),
                tiktokAppKey: document.getElementById('set-tiktok-key').value,
                tiktokAppSecret: document.getElementById('set-tiktok-secret').value
            });
            updateTiktokStatus();
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
                        updateTiktokStatus();
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
                        updateTiktokStatus();
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
        
        window.resetDatabase = function() {
            if(confirm("DANGER! This will wipe all current orders, custom products, and content. Restore original CSV products and defaults?")) {
                window.GradieStore.resetData(true);
                showToast('Đã reset database thành công!', 'info');
                window.location.reload();
            }
        };
    }
});
