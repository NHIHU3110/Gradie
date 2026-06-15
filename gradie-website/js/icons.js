/**
 * js/icons.js — Gradie Unified Icon System
 * Bộ icon SVG hiện đại, mảnh, đồng bộ toàn website.
 * Tự động chạy khi DOM sẵn sàng, không cần sửa từng trang HTML.
 *
 * Style: stroke-based, stroke-width=1.5, rounded linecap/linejoin (Lucide-style)
 * Kích thước chuẩn: 20×20 cho header, 16×16 cho inline nhỏ
 */

// ─────────────────────────────────────────────
// 1. ICON LIBRARY
// ─────────────────────────────────────────────
window.GradieIcons = {

  /** Người dùng / tài khoản — đường viền tinh tế hơn */
  user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>`,

  /** Tìm kiếm — kính lúp góc nghiêng tinh tế */
  search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.5"/>
    <path d="M15.5 15.5 21 21"/>
  </svg>`,

  /** Giỏ hàng — túi mua sắm sạch, hiện đại */
  bag: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>`,

  /** Ổ khóa — khoá đóng dùng trong secure badge, bảo mật */
  lock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.6"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>`,

  /** Ổ khóa nhỏ — dùng trong form title checkout */
  lockMd: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.6"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>`,

  /** Mắt mở — hiện mật khẩu */
  eyeOpen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`,

  /** Mắt đóng — ẩn mật khẩu */
  eyeClosed: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
    <path d="m2 2 20 20"/>
  </svg>`,

  /** Trái tim / Yêu thích — outline */
  heartOutline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>`,

  /** Trái tim / Yêu thích — filled */
  heartFilled: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
      stroke="none" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>`,

  /** Thùng rác / Xoá — thanh mảnh */
  trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 6h18"/>
    <path d="M8 6V4h8v2"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>`,

  /** Check / Thành công */
  check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5"/>
  </svg>`,

  /** Vòng tròn check — dùng success state */
  checkCircle: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>`,

  /** Địa chỉ / Vị trí — map pin */
  mapPin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>`,

  /** Giao hàng / xe tải */
  truck: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
    <rect width="9" height="11" x="12" y="11" rx="1"/>
    <circle cx="7" cy="17" r="2"/>
    <circle cx="17" cy="17" r="2"/>
  </svg>`,

  /** Phiếu giảm giá / mã giảm giá */
  tag: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>
    <circle cx="7.5" cy="7.5" r="1.5"/>
  </svg>`,

  /** QR Code */
  qrCode: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect width="5" height="5" x="3" y="3" rx="1"/>
    <rect width="5" height="5" x="16" y="3" rx="1"/>
    <rect width="5" height="5" x="3" y="16" rx="1"/>
    <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
    <path d="M21 21v.01"/>
    <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
    <path d="M3 12h.01"/>
    <path d="M12 3h.01"/>
    <path d="M12 16v.01"/>
    <path d="M16 12h1"/>
    <path d="M21 12v.01"/>
    <path d="M12 21v-1"/>
  </svg>`,

  /** Điện thoại / COD */
  phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 9.52 19.79 19.79 0 0 1 1 5 2 2 0 0 1 3 2.82h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 10a16 16 0 0 0 6.29 6.29l1.37-1.37a2 2 0 0 1 2.11-.44 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92"/>
  </svg>`,

  /** Thông tin / Info */
  info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>`,

  /** Package / Hộp quà */
  package: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
    <path d="M12 22V12"/>
    <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/>
    <path d="m7.5 4.27 9 5.15"/>
  </svg>`,

  /** Ngôi sao — rating */
  star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
      stroke="none" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>`,

  /** Mũi tên phải — next/detail */
  arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>`,

  /** X / Đóng */
  x: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>`,

  /** Chỉnh sửa / Edit */
  edit: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 20h9"/>
    <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 19.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>
  </svg>`,

  /** Đăng xuất */
  logout: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>`,

  /** Plus / Thêm */
  plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
  </svg>`,

  /** Minus / Bớt */
  minus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12h14"/>
  </svg>`,

  /** Bộ lọc */
  filter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>`,

  /** Đặt hàng / clipboard */
  clipboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4"/>
    <path d="M12 16h4"/>
    <path d="M8 11h.01"/>
    <path d="M8 16h.01"/>
  </svg>`,

  /** Google logo — social login */
  google: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>`,

  /** Facebook logo — social login */
  facebook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"
      stroke="none" aria-hidden="true">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
  </svg>`,
};


// ─────────────────────────────────────────────
// 2. AUTO-INJECT: Header icons (user, search, bag)
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const I = window.GradieIcons;

  // ── 2a. Header icon-btn: replace SVG contents ──
  const headerIcons = document.querySelector('.header-icons');
  if (headerIcons) {
    // User icon (link to account.html)
    const userBtn = headerIcons.querySelector('a[href*="account"]');
    if (userBtn) {
      const existing = userBtn.querySelector('svg');
      if (existing) existing.outerHTML = I.user;
      else userBtn.insertAdjacentHTML('afterbegin', I.user);
    }

    // Cart icon (link to cart.html) — keep badge intact
    const cartBtn = headerIcons.querySelector('a[href*="cart"]');
    if (cartBtn) {
      const oldSvg = cartBtn.querySelector('svg');
      if (oldSvg) oldSvg.outerHTML = I.bag;
      else cartBtn.insertAdjacentHTML('afterbegin', I.bag);
    }

    // Search button — replace SVG only
    const searchBtns = headerIcons.querySelectorAll('button');
    searchBtns.forEach(btn => {
      if (btn.id !== 'search-trigger-btn') return; // already upgraded by main.js
      const oldSvg = btn.querySelector('svg');
      if (oldSvg) oldSvg.outerHTML = I.search;
    });
    // Also handle search button before main.js hijacks it
    const rawSearchBtn = Array.from(headerIcons.querySelectorAll('button')).find(
      b => b.querySelector('circle[cx="11"]') || (b.getAttribute('onclick') || '').includes('ìm kiếm')
    );
    if (rawSearchBtn) {
      const oldSvg = rawSearchBtn.querySelector('svg');
      if (oldSvg) oldSvg.outerHTML = I.search;
    }
  }

  // ── 2b. Secure badge lock icon in checkout ──
  const secureBadge = document.querySelector('.secure-badge');
  if (secureBadge) {
    // Replace the text lock emoji / old svg with proper icon
    const lockEmojiText = secureBadge.innerHTML;
    if (lockEmojiText.includes('🔒') || lockEmojiText.includes('secure') || lockEmojiText.includes('ảo mật')) {
      // Prepend the lock icon
      secureBadge.innerHTML = I.lock + secureBadge.innerHTML.replace(/🔒/g, '');
    } else if (!secureBadge.querySelector('svg')) {
      secureBadge.insertAdjacentHTML('afterbegin', I.lock + ' ');
    } else {
      // Replace existing svg
      const oldSvg = secureBadge.querySelector('svg');
      if (oldSvg) oldSvg.outerHTML = I.lock;
    }
  }

  // ── 2c. Password toggle buttons — upgrade eye icons ──
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    const openIcon = btn.querySelector('.eye-open, svg:first-child');
    const closedIcon = btn.querySelector('.eye-closed, svg:last-child');

    // Clear and rebuild with new icons
    btn.innerHTML = `
      <span class="eye-open">${I.eyeOpen}</span>
      <span class="eye-closed" style="display:none">${I.eyeClosed}</span>
    `;
  });

  // ── 2d. Patch togglePasswordVisibility to work with new markup ──
  window.togglePasswordVisibility = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const openSpan  = btn.querySelector('.eye-open');
    const closeSpan = btn.querySelector('.eye-closed');
    if (input.type === 'password') {
      input.type = 'text';
      if (openSpan)  openSpan.style.display  = 'none';
      if (closeSpan) closeSpan.style.display = 'inline-flex';
    } else {
      input.type = 'password';
      if (openSpan)  openSpan.style.display  = 'inline-flex';
      if (closeSpan) closeSpan.style.display = 'none';
    }
  };

  // ── 2e. Favorites heart icons — sync styles ──
  window.GradieIcons._heartOutline = I.heartOutline;
  window.GradieIcons._heartFilled  = I.heartFilled;

  // Override toggleFavorite to use new icons
  const _origToggle = window.toggleFavorite;
  window.toggleFavorite = function (productId, btn) {
    let favs = JSON.parse(localStorage.getItem('gradie_favs')) || [];
    if (favs.includes(productId)) {
      favs = favs.filter(id => id !== productId);
      if (btn) {
        btn.innerHTML = I.heartOutline;
        btn.style.borderColor = 'var(--border-gold)';
        btn.style.color = 'var(--taupe)';
      }
    } else {
      favs.push(productId);
      if (btn) {
        btn.innerHTML = I.heartFilled;
        btn.style.borderColor = 'var(--dusty-rose)';
        btn.style.color = 'var(--dusty-rose)';
      }
    }
    localStorage.setItem('gradie_favs', JSON.stringify(favs));
  };

  // Sync favorite icons on load with new style
  setTimeout(() => {
    const favs = JSON.parse(localStorage.getItem('gradie_favs')) || [];
    document.querySelectorAll('.btn-favorite').forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick') || '';
      const match = onclickAttr.match(/toggleFavorite\('([^']+)'/);
      if (match && match[1]) {
        if (favs.includes(match[1])) {
          btn.innerHTML = I.heartFilled;
          btn.style.borderColor = 'var(--dusty-rose)';
          btn.style.color = 'var(--dusty-rose)';
        } else {
          btn.innerHTML = I.heartOutline;
        }
      }
    });
  }, 300);

  // ── 2f. Social login buttons — upgrade icons ──
  const googleBtn = document.querySelector('.google-btn');
  if (googleBtn) {
    const oldSvg = googleBtn.querySelector('svg');
    if (oldSvg) oldSvg.outerHTML = I.google;
  }
  const fbBtn = document.querySelector('.facebook-btn');
  if (fbBtn) {
    const oldSvg = fbBtn.querySelector('svg');
    if (oldSvg) oldSvg.outerHTML = I.facebook;
  }

  // ── 2g. Form title icons in checkout (emoji → SVG) ──
  document.querySelectorAll('.form-title-icon').forEach(el => {
    const text = el.textContent || el.innerHTML;
    if (text.includes('📍') || text.includes('🏠') || el.dataset.icon === 'map') {
      el.innerHTML = I.mapPin;
    } else if (text.includes('💳') || text.includes('💰') || el.dataset.icon === 'pay') {
      el.innerHTML = I.lock;
    } else if (text.includes('📋') || el.dataset.icon === 'order') {
      el.innerHTML = I.clipboard;
    }
  });

  // ── 2h. Apply consistent icon sizes via CSS class ──
  document.querySelectorAll('.header-icons svg').forEach(svg => {
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.style.display = 'block';
    svg.style.flexShrink = '0';
  });
});


// ─────────────────────────────────────────────
// 3. HELPER: get icon HTML string
// ─────────────────────────────────────────────
window.getIcon = function(name, opts = {}) {
  const icon = window.GradieIcons[name];
  if (!icon) return '';
  if (opts.size) {
    return icon.replace(/width="\d+"/, `width="${opts.size}"`).replace(/height="\d+"/, `height="${opts.size}"`);
  }
  return icon;
};
