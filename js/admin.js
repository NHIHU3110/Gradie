// js/admin.js — Gradie Admin Shell
// Renders sidebar, topbar, and global admin UX enhancements

const ADMIN_ROUTES = [
  {
    section: 'Tổng Quan',
    items: [
      {
        label: 'Dashboard', href: 'admin-dashboard.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`
      },
      {
        label: 'Phân Tích', href: 'admin-analytics.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`
      },
    ]
  },
  {
    section: 'Nội Dung',
    items: [
      {
        label: 'Sản Phẩm', href: 'admin-products.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/></svg>`
      },
      {
        label: 'Danh Mục', href: 'admin-categories.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`
      },
      {
        label: 'Bài Viết', href: 'admin-blog.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`
      },
      {
        label: 'Bộ Sưu Tập', href: 'admin-gallery.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`
      },
    ]
  },
  {
    section: 'Vận Hành',
    items: [
      {
        label: 'Đơn Hàng', href: 'admin-orders.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
      },
      {
        label: 'Người Dùng', href: 'admin-users.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`
      },
      {
        label: 'Cá Nhân Hóa', href: 'admin-customize.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`
      },
    ]
  },
  {
    section: 'Cấu Hình',
    items: [
      {
        label: 'Nhân Sự', href: 'admin-staff.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
      },
      {
        label: 'Chính Sách', href: 'admin-policies.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
      },
      {
        label: 'Cài Đặt', href: 'admin-settings.html',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
      },
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('gradie_data_synced', () => {
        if (typeof renderDashboardStats === 'function') renderDashboardStats();
        if (typeof renderRecentOrders === 'function') renderRecentOrders();
        if (typeof renderRecentUsers === 'function') renderRecentUsers();
    });

  const activeRole = sessionStorage.getItem('GRADIE_ACTIVE_ROLE') || 'Admin';

  // ── 1. Build Sidebar ──
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    const currentPage = window.location.pathname.split('/').pop() || 'admin-dashboard.html';
    
    const roleRestrictions = {
        'Admin': [],
        'Manager': [],
        'Sales': ['admin-analytics.html', 'admin-staff.html', 'admin-settings.html', 'admin-customize.html', 'admin-policies.html'],
        'Warehouse': ['admin-dashboard.html', 'admin-analytics.html', 'admin-users.html', 'admin-blog.html', 'admin-staff.html', 'admin-settings.html', 'admin-customize.html', 'admin-policies.html'],
        'Accountant': ['admin-products.html', 'admin-categories.html', 'admin-users.html', 'admin-blog.html', 'admin-gallery.html', 'admin-staff.html', 'admin-settings.html', 'admin-customize.html', 'admin-policies.html']
    };
    const restrictedPages = roleRestrictions[activeRole] || [];

    let html = `
      <div class="sidebar-header">
        <div class="sidebar-logo-ring">
          <img src="images/Gradie_logo.jpeg" alt="Gradie" onerror="this.style.display='none'">
        </div>
        <div class="sidebar-brand">
          <span class="sidebar-brand-name">Gradie</span>
          <span class="sidebar-brand-sub">Admin CMS</span>
        </div>
      </div>
    `;

    ADMIN_ROUTES.forEach(group => {
      let groupHtml = `<div class="sidebar-section-label">${group.section}</div><nav class="sidebar-nav" style="padding:0 0 4px;">`;
      let hasVisibleItems = false;
      
      group.items.forEach(route => {
        if (!restrictedPages.includes(route.href)) {
            hasVisibleItems = true;
            const isActive = (currentPage === route.href ||
              (currentPage === 'admin-product-form.html' && route.href === 'admin-products.html'))
              ? 'active' : '';
            groupHtml += `<a href="${route.href}" class="${isActive}">${route.icon}<span>${route.label}</span></a>`;
        }
      });
      groupHtml += `</nav>`;
      if (hasVisibleItems) {
          html += groupHtml;
      }
    });

    // Footer
    html += `<div class="sidebar-footer">Gradie CMS © 2026</div>`;
    sidebar.innerHTML = html;
  }

  // ── 2. Build Topbar ──
  const topbar = document.querySelector('.topbar');
  if (topbar && !topbar.querySelector('#admin-logout-btn')) {
    // Get page title
    const currentPage = window.location.pathname.split('/').pop();
    let pageTitle = 'Bảng Điều Khiển';
    ADMIN_ROUTES.forEach(g => g.items.forEach(r => {
      if (r.href === currentPage) pageTitle = r.label;
    }));

    topbar.innerHTML = `
      <button id="sidebar-toggle" style="background:transparent; border:none; color:var(--adm-text); cursor:pointer; margin-right:16px; display:flex; align-items:center; padding:8px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
      <span class="topbar-title">${pageTitle}</span>
      <div class="topbar-spacer"></div>
      
      <div class="topbar-actions">
          <span style="font-size: 0.85rem; color: #64748b; font-weight: 500; margin-right: 15px;">
            Xin chào, <strong style="color: #0f172a;" id="topbar-username">Quản trị viên</strong> 
            (<span id="topbar-role-name" style="color: var(--champagne);">Admin</span>)
          </span>
          <button id="admin-logout-btn" style="background:transparent; border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; color:#ef4444; font-size:0.85rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Đăng Xuất
          </button>
      </div>
    `;

    // Populate topbar user info
    const activeUser = sessionStorage.getItem('GRADIE_ACTIVE_USER') || 'Admin';
    document.getElementById('topbar-username').textContent = activeUser;
    document.getElementById('topbar-role-name').textContent = activeRole;

    // Handle logout
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (confirm('Bạn có chắc muốn đăng xuất?')) {
            sessionStorage.removeItem('GRADIE_ADMIN_AUTH');
            sessionStorage.removeItem('GRADIE_ACTIVE_ROLE');
            sessionStorage.removeItem('GRADIE_ACTIVE_USER');
            window.location.href = 'login.html';
          }
        });
    }

    // Toggle sidebar
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
        document.querySelector('.admin-layout').classList.toggle('sidebar-open');
      });
      
      // Click outside to close
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
          sidebar.classList.remove('open');
          document.querySelector('.admin-layout').classList.remove('sidebar-open');
        }
      });
    }
  }

  // ── 3. Logout handler ──
  document.body.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'admin-logout-btn' || e.target.closest('#admin-logout-btn'))) {
      sessionStorage.removeItem('GRADIE_ADMIN_AUTH');
      sessionStorage.removeItem('GRADIE_ACTIVE_ROLE');
      sessionStorage.removeItem('GRADIE_ACTIVE_USER');
      window.location.href = 'login.html';
    }
  });

  // ── 4. Style select elements with status colors ──
  document.querySelectorAll('select[id*="status"], select[name*="status"]').forEach(sel => {
    const updateColor = () => {
      const v = sel.value.toLowerCase();
      sel.style.color = v.includes('pending') ? '#8C6420'
        : v.includes('processing') ? '#4A5A8C'
        : v.includes('shipped') || v.includes('completed') ? '#5A7A4A'
        : v.includes('cancel') ? '#8B4545'
        : 'inherit';
    };
    updateColor();
    sel.addEventListener('change', updateColor);
  });
});

// Listen for cross-tab changes (e.g. new orders from checkout)
window.addEventListener('storage', (e) => {
  if (e.key === 'GRADIE_CMS_DATA') {
    try {
      const oldData = JSON.parse(e.oldValue || '{}');
      const newData = JSON.parse(e.newValue || '{}');
      const oldOrders = oldData.orders || [];
      const newOrders = newData.orders || [];
      if (newOrders.length > oldOrders.length) {
        if (typeof showToast === 'function') {
          showToast('🎉 Có đơn hàng mới vừa được đặt!', 'success');
        }
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(err => console.log('Audio error:', err));
        // Trigger re-render if on orders page
        window.dispatchEvent(new Event('gradie_data_synced'));
      }
    } catch (err) {}
  }
});

