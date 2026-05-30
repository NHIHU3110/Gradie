// js/admin-auth.js

document.addEventListener('DOMContentLoaded', () => {
    const isAuth = localStorage.getItem('GRADIE_ADMIN_AUTH') === 'true';
    const currentPath = window.location.pathname.split('/').pop();
    
    // We treat login.html as the universal login page now.
    // If they try to access an admin-*.html page (which isn't login.html) without auth
    if (!isAuth && currentPath !== 'login.html') {
        window.location.href = 'login.html';
        return; 
    }
    
    // Note: We don't force redirect away from login.html if they are an admin
    // because they might want to login as a user or logout. The redirect logic 
    // for admin login is handled inside account.js upon successful form submission.
});
