// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // 0. Lazy Image Loading Observer
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('loaded');
          imgObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px' });
    document.querySelectorAll('img[loading="lazy"]').forEach(img => imgObserver.observe(img));
  }

  // 1. Sync Settings
  if (window.GradieStore) {
    const settings = window.GradieStore.getSettings();
    
    // Announcement bar
    const annBar = document.querySelector('.announcement-bar');
    if (annBar && settings.announcement) {
      annBar.textContent = settings.announcement;
    }
  }

  // 2. Hamburger menu
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
    // Đóng menu khi bấm vào link trên mobile
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });
  }


  // 3. Dynamic Global Live Search Hijack
  const headerIcons = document.querySelector('.header-icons');
  if (headerIcons) {
    // Find if there is an alert-based search button
    const searchBtn = Array.from(headerIcons.querySelectorAll('button')).find(btn => 
      btn.getAttribute('onclick') && btn.getAttribute('onclick').includes('Search functionality coming soon!')
    );
    
    if (searchBtn) {
      searchBtn.removeAttribute('onclick');
      searchBtn.id = 'search-trigger-btn';
      
      // Create wrapper
      const searchWrapper = document.createElement('div');
      searchWrapper.id = 'search-wrapper';
      searchWrapper.style.position = 'relative';
      searchWrapper.style.display = 'inline-block';
      
      searchBtn.parentNode.insertBefore(searchWrapper, searchBtn);
      searchWrapper.appendChild(searchBtn);
      
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.id = 'header-search';
      searchInput.placeholder = 'Search Gradie...';
      searchInput.style.display = 'none';
      searchInput.style.padding = '6px 12px';
      searchInput.style.border = '1px solid #d8a94f';
      searchInput.style.borderRadius = '20px';
      searchInput.style.fontSize = '0.85rem';
      searchInput.style.width = '180px';
      searchInput.style.outline = 'none';
      searchInput.style.transition = 'all 0.3s';
      searchInput.style.marginRight = '8px';
      
      searchWrapper.insertBefore(searchInput, searchBtn);
      
      const searchDropdown = document.createElement('div');
      searchDropdown.id = 'live-search-dropdown';
      searchDropdown.style.display = 'none';
      searchDropdown.style.position = 'absolute';
      searchDropdown.style.top = '40px';
      searchDropdown.style.right = '0';
      searchDropdown.style.width = '350px';
      searchDropdown.style.background = 'rgba(255,255,255,0.98)';
      searchDropdown.style.backdropFilter = 'blur(8px)';
      searchDropdown.style.border = '1px solid #d8a94f';
      searchDropdown.style.borderRadius = '12px';
      searchDropdown.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
      searchDropdown.style.zIndex = '1000';
      searchDropdown.style.maxHeight = '400px';
      searchDropdown.style.overflowY = 'auto';
      searchDropdown.style.padding = '15px';
      
      searchWrapper.appendChild(searchDropdown);
    }
  }

  // 4. Live Search Interactions
  const triggerBtn = document.getElementById('search-trigger-btn');
  const searchInput = document.getElementById('header-search');
  const searchDropdown = document.getElementById('live-search-dropdown');

  if (triggerBtn && searchInput && searchDropdown) {
    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (searchInput.style.display === 'none') {
        searchInput.style.display = 'inline-block';
        searchInput.focus();
      } else {
        searchInput.style.display = 'none';
        searchDropdown.style.display = 'none';
        searchInput.value = '';
      }
    });

    searchInput.addEventListener('click', (e) => e.stopPropagation());
    searchDropdown.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', () => {
      searchInput.style.display = 'none';
      searchDropdown.style.display = 'none';
      searchInput.value = '';
    });

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        searchDropdown.style.display = 'none';
        return;
      }

      const products = window.GradieStore.getProducts().filter(p => {
        if (p.isSyncOnly) return false;
        if (!isNaN(p.id) && String(p.id).length >= 10) return false;
        if (p.name && (p.name.includes('Sản phẩm mới từ') || p.name.includes('Untitled Product'))) return false;
        return true;
      });
      const matches = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
      );

      if (matches.length === 0) {
        searchDropdown.innerHTML = '<p style="color:#888; font-style:italic; text-align:center; font-size:0.9rem; margin:10px 0;">No products found.</p>';
      } else {
        searchDropdown.innerHTML = matches.map(p => `
          <a href="product-detail.html?id=${p.id}" style="display:flex; gap:12px; align-items:center; text-decoration:none; margin-bottom:12px; border-bottom:1px solid #f2effa; padding-bottom:8px;">
            <img src="${p.image}" style="width:50px; height:50px; object-fit:cover; border-radius:6px; border:1px solid #eee;">
            <div style="flex:1;">
              <div style="font-weight:600; font-size:0.9rem; color:#1a1a1a;">${p.name}</div>
              <div style="font-size:0.75rem; color:#888;">${p.category}</div>
            </div>
            <div style="font-weight:600; font-size:0.9rem; color:#d8a94f;">${p.price.toLocaleString('vi-VN')}đ</div>
          </a>
        `).join('');
      }
      searchDropdown.style.display = 'block';
    });
  }

  // 5. Cart Count Initial Sync
  if (window.updateCartCount) {
    window.updateCartCount();
  }
});

// Standarized Cart Count
window.updateCartCount = function() {
  const cart = JSON.parse(localStorage.getItem('GRADIE_CART')) || JSON.parse(localStorage.getItem('gradie_cart')) || [];
  let count = 0;
  cart.forEach(item => count += (item.quantity || item.qty || 1));
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
};

// Note: window.addToCart is defined in products.js with full variant + customization support.
// Do NOT redefine addToCart here.


// Favorites persistence
window.toggleFavorite = function(productId, btn) {
  let favs = JSON.parse(localStorage.getItem('gradie_favs')) || [];
  if (favs.includes(productId)) {
    favs = favs.filter(id => id !== productId);
    if (btn) { 
      btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`; 
      btn.style.borderColor = 'var(--border-gold)'; 
    }
  } else {
    favs.push(productId);
    if (btn) { 
      btn.innerHTML = `<svg width="18" height="18" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`; 
      btn.style.borderColor = 'red'; 
    }
  }
  localStorage.setItem('gradie_favs', JSON.stringify(favs));
};

// Auto-style favorites on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    let favs = JSON.parse(localStorage.getItem('gradie_favs')) || [];
    document.querySelectorAll('.btn-favorite').forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick');
      if (onclickAttr) {
        const match = onclickAttr.match(/toggleFavorite\('([^']+)'/);
        if (match && match[1] && favs.includes(match[1])) {
          btn.innerHTML = `<svg width="18" height="18" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`; 
          btn.style.borderColor = 'red';
        }
      }
    });
  }, 500);
});

// Toggle password visibility helper
window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const openIcon = btn.querySelector('.eye-open');
  const closedIcon = btn.querySelector('.eye-closed');
  
  if (input.type === 'password') {
    input.type = 'text';
    if (openIcon) openIcon.style.display = 'none';
    if (closedIcon) closedIcon.style.display = 'block';
  } else {
    input.type = 'password';
    if (openIcon) openIcon.style.display = 'block';
    if (closedIcon) closedIcon.style.display = 'none';
  }
};

// Tawk.to Chatbot Integration — luôn hiển thị cố định ở góc phải dưới
var Tawk_API = Tawk_API || {};
Tawk_API.customStyle = {
  zIndex: 999999,
  visibility: {
    desktop: {
      position: 'br', // bottom right
      xOffset: 20,
      yOffset: 20
    },
    mobile: {
      position: 'br',
      xOffset: 15,
      yOffset: 15
    }
  }
};
var Tawk_LoadStart = new Date();

// Khi Tawk.to load xong: hiện widget, không cho ẩn
Tawk_API.onLoad = function() {
  // Hiện widget ngay khi load
  Tawk_API.showWidget();

  // Nếu người dùng thu nhỏ chat, tự động mở lại sau 1s
  Tawk_API.onChatMinimized = function() {
    setTimeout(function() {
      Tawk_API.showWidget();
    }, 800);
  };
};

(function(){
  var s1 = document.createElement("script");
  var s0 = document.getElementsByTagName("script")[0];
  if (!s0) { s0 = document.createElement("script"); document.head.appendChild(s0); }
  s1.async = true;
  s1.src = 'https://embed.tawk.to/6a2666706766561c2e4b4aeb/1jqj00aa1';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  s0.parentNode.insertBefore(s1, s0);
})();
