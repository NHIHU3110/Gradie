// js/main.js
document.addEventListener('DOMContentLoaded', () => {
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

      const products = window.GradieStore.getProducts();
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

// Add to Cart helper supporting both storage keys
window.addToCart = function(productId, qty = 1, variant = '') {
  if (!window.GradieStore) return;
  const product = window.GradieStore.getProductById(productId);
  if (!product) return;
  
  let cart = JSON.parse(localStorage.getItem('GRADIE_CART')) || JSON.parse(localStorage.getItem('gradie_cart')) || [];
  let actualPrice = product.price;
  if (variant && product.variants) {
    let v = product.variants.find(x => x.name === variant);
    if (v && v.price) actualPrice = v.price;
  }
  
  let cartItemId = product.id + (variant ? '-' + variant : '');
  let existingItem = cart.find(i => i.cartItemId === cartItemId);
  
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || existingItem.qty || 0) + parseInt(qty);
  } else {
    cart.push({
      cartItemId: cartItemId,
      id: product.id,
      name: product.name + (variant ? ` (${variant})` : ''),
      price: actualPrice,
      image: product.image || (product.gallery && product.gallery[0]) || '',
      quantity: parseInt(qty)
    });
  }
  
  localStorage.setItem('GRADIE_CART', JSON.stringify(cart));
  localStorage.setItem('gradie_cart', JSON.stringify(cart));
  window.updateCartCount();
  
  // Visual Feedback
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.style.transform = 'scale(1.5)';
    badge.style.backgroundColor = 'var(--champagne)';
    setTimeout(() => {
      badge.style.transform = 'scale(1)';
      badge.style.backgroundColor = 'var(--text-color)';
    }, 300);
  }
  alert(product.name + " added to cart!");
};

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
