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
        
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.GradieStore.saveSettings({
                brandName: document.getElementById('set-brand').value,
                tagline: document.getElementById('set-tagline').value,
                announcement: document.getElementById('set-ann').value,
                shippingFee: Number(document.getElementById('set-ship').value)
            });
            showToast('Đã lưu cài đặt! Thay đổi sẽ được áp dụng ngay lập tức.', 'success');
        });
        
        window.resetDatabase = function() {
            if(confirm("DANGER! This will wipe all current orders, custom products, and content. Restore original CSV products and defaults?")) {
                window.GradieStore.resetData(true);
                showToast('Đã reset database thành công!', 'info');
                window.location.reload();
            }
        }
    }
});
