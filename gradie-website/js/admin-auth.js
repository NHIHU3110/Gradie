// js/admin-auth.js

document.addEventListener('DOMContentLoaded', () => {
    let isAuth = sessionStorage.getItem('GRADIE_ADMIN_AUTH') === 'true';
    if (!isAuth && localStorage.getItem('GRADIE_ADMIN_AUTH') === 'true') {
        sessionStorage.setItem('GRADIE_ADMIN_AUTH', 'true');
        sessionStorage.setItem('GRADIE_ACTIVE_ROLE', localStorage.getItem('GRADIE_ACTIVE_ROLE'));
        sessionStorage.setItem('GRADIE_ACTIVE_USER', localStorage.getItem('GRADIE_ACTIVE_USER'));
        isAuth = true;
    }
    const currentPath = window.location.pathname.split('/').pop();
    
    if (!isAuth && currentPath !== 'login.html') {
        window.location.href = 'login.html';
        return; 
    }
    
    // Role-based Access Control (RBAC) Logic
    const activeRole = sessionStorage.getItem('GRADIE_ACTIVE_ROLE') || 'Admin';
    
    // Define which pages each role is NOT allowed to access
    const roleRestrictions = {
        'Admin': [], // Admin can access everything
        'Manager': [], // Manager can access everything
        'Sales': ['admin-analytics.html', 'admin-staff.html', 'admin-settings.html', 'admin-customize.html', 'admin-policies.html'],
        'Warehouse': ['admin-dashboard.html', 'admin-analytics.html', 'admin-users.html', 'admin-blog.html', 'admin-staff.html', 'admin-settings.html', 'admin-customize.html', 'admin-policies.html'],
        'Accountant': ['admin-products.html', 'admin-categories.html', 'admin-users.html', 'admin-blog.html', 'admin-gallery.html', 'admin-staff.html', 'admin-settings.html', 'admin-customize.html', 'admin-policies.html']
    };

    const restrictedPages = roleRestrictions[activeRole] || [];
    
    if (restrictedPages.includes(currentPath)) {
        // Redirect to a safe page if accessing a restricted page
        alert(`Quyền truy cập bị từ chối! Vai trò [${activeRole}] không được phép xem trang này.`);
        if (activeRole === 'Warehouse') {
            window.location.href = 'admin-orders.html';
        } else if (activeRole === 'Accountant') {
            window.location.href = 'admin-analytics.html'; // Let's allow accountant to see analytics
        } else {
            window.location.href = 'admin-dashboard.html';
        }
        return;
    }
});
