// js/admin.js

const ADMIN_ROUTES = [
  { label: "Dashboard", href: "admin-dashboard.html", icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-right: 8px;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 17v-4"/><path d="M12 17V9"/><path d="M17 17v-6"/></svg>` },
  { label: "Products", href: "admin-products.html", icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-right: 8px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>` },
  { label: "Categories", href: "admin-categories.html", icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-right: 8px;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>` },
  { label: "Orders", href: "admin-orders.html", icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="vertical-align: text-bottom;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>` },
  { label: "Blog", href: "admin-blog.html", icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-right: 8px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>` },
  { label: "Gallery", href: "admin-gallery.html", icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-right: 8px;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>` },
  { label: "Policies", href: "admin-policies.html", icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-right: 8px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
  { label: "Customization", href: "admin-customize.html", icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-right: 8px;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>` },
  { label: "Settings", href: "admin-settings.html", icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-right: 8px;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>` }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Render standard Sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const currentPath = window.location.pathname.split('/').pop();
        
        let navHtml = `<div class="sidebar-header">Gradie Admin</div><nav class="sidebar-nav">`;
        
        ADMIN_ROUTES.forEach(route => {
            const isActive = currentPath === route.href || (currentPath === 'admin-product-form.html' && route.href === 'admin-products.html') ? 'active' : '';
            navHtml += `<a href="${route.href}" class="${isActive}">${route.icon} ${route.label}</a>`;
        });
        
        navHtml += `</nav>`;
        sidebar.innerHTML = navHtml;
    }
    
    // 2. Render standard Topbar
    const topbar = document.querySelector('.topbar');
    if (topbar) {
        // Only keep back link if it's explicitly set in the HTML (like Back to Products)
        const existingLinks = topbar.innerHTML;
        if (!existingLinks.includes('admin-logout-btn')) {
             topbar.innerHTML += `
                <div style="margin-left:auto; display:flex; gap:15px; align-items:center;">
                    <a href="index.html" target="_blank" style="color:var(--admin-primary); font-weight:600; text-decoration:none;">View Website ↗</a>
                    <button id="admin-logout-btn" class="btn-primary" style="padding: 6px 15px; width:auto;">Logout</button>
                </div>
             `;
        }
    }
    
    // 3. Attach Global Logout Event
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'admin-logout-btn') {
            localStorage.removeItem('GRADIE_ADMIN_AUTH');
            window.location.href = 'login.html';
        }
    });
});
