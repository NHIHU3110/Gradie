// js/products.js

function getAllProducts() {
  if (window.GradieStore && typeof window.GradieStore.getProducts === "function") {
    return window.GradieStore.getProducts();
  }
  return window.GRADIE_DATA?.products || [];
}

document.addEventListener('DOMContentLoaded', () => {
  const products = getAllProducts();
  
  const productGrid = document.getElementById('main-product-grid') 
                   || document.getElementById('products-grid') 
                   || document.getElementById('product-grid')
                   || document.getElementById('category-products');
                   
  const trendingGrid = document.getElementById('trending-grid');
  const featuredGrid = document.getElementById('featured-grid');

  let currentCategory = 'all';
  const categoryMap = {
    'graduation-sashes.html': 'Đồ tốt nghiệp', 
    'personalized-plushies.html': 'Gấu Bông',
    'unique-gifts.html': 'Khung ảnh', 
    'gift-combos-flowers.html': 'Hoa mừng',
    'accessories-jewelry.html': 'Huy Chương'
  };
  
  const currentPath = window.location.pathname.split('/').pop();
  if (categoryMap[currentPath]) currentCategory = categoryMap[currentPath];

  function renderGrid(container, items) {
    if (!container) return;
    if (items.length === 0) {
      container.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No products found matching your criteria.</p>';
      return;
    }
    
    container.innerHTML = items.map(p => {
        let oldPriceHtml = p.oldPrice ? `<span class="old-price">${p.oldPrice.toLocaleString('vi-VN')} ₫</span>` : '';
        return `
            <div class="product-card" style="position:relative; cursor:pointer;" onclick="window.location.href='product-detail.html?id=${p.id}'">
              <div class="product-image-wrapper">
                ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
                <img src="${p.image || p.gallery[0]}" alt="${p.name}" class="p-img">
              </div>
              <div class="product-info">
                <h3 class="product-title">${p.name}</h3>
                <div class="product-price">${p.price.toLocaleString('vi-VN')} ₫ ${oldPriceHtml}</div>
                <div class="product-actions">
                  <button class="btn-favorite outline-button" onclick="event.stopPropagation(); toggleFavorite('${p.id}', this)" style="padding: 8px; border: 1px solid var(--border-gold); background: white; cursor:pointer;"><svg width="18" height="18" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
                  <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${p.id}')" style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
        `;
    }).join('');
  }

  // Generic Grid Rendering & Filtering
  function updateMainGrid() {
      if (!productGrid) return;
      
      let filtered = products;
      
      // 1. Filter by category
      if (currentCategory !== 'all') {
          filtered = filtered.filter(p => p.category === currentCategory);
      }
      
      // 2. Filter by search
      const searchInput = document.getElementById('product-search');
      if (searchInput && searchInput.value) {
          const query = searchInput.value.toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
      }
      
      // 3. Sort
      const sortSelect = document.getElementById('sort-select');
      if (sortSelect) {
          const sortVal = sortSelect.value;
          if (sortVal === 'price-low') {
              filtered.sort((a, b) => a.price - b.price);
          } else if (sortVal === 'price-high') {
              filtered.sort((a, b) => b.price - a.price);
          } else if (sortVal === 'rating') {
              filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          } else {
              // newest/default - fallback to natural array order (or parse ID date if we want)
              filtered.reverse(); // simple mock for newest
          }
      }
      
      renderGrid(productGrid, filtered);
  }

  updateMainGrid();

  // Attach Event Listeners for Filters/Search
  const filterBtns = document.querySelectorAll('.category-filter');
  filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
          filterBtns.forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          currentCategory = e.target.getAttribute('data-category');
          updateMainGrid();
      });
  });
  
  const searchInput = document.getElementById('product-search');
  if (searchInput) {
      searchInput.addEventListener('input', updateMainGrid);
  }
  
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
      sortSelect.addEventListener('change', updateMainGrid);
  }
  
  // Home Page Specific Grids
  if (trendingGrid) {
      renderGrid(trendingGrid, products.filter(p => p.isTrending || p.rating >= 4.8).slice(0, 4));
  }
  if (featuredGrid) {
      renderGrid(featuredGrid, products.filter(p => p.isFeatured || p.price >= 500000).slice(0, 4));
  }
  
  // Product Detail Page Logic
  const detailContainer = document.getElementById('product-detail-container');
  if (detailContainer) {
      const urlParams = new URLSearchParams(window.location.search);
      let pId = urlParams.get('id');
      let p = products.find(x => x.id === pId) || products[0];
      
      if(p) {
          let vHtml = '';
          if (p.variants && p.variants.length > 0) {
              vHtml = '<p style="margin-bottom:10px; font-weight:600; color: var(--ink);"><strong>Chọn phiên bản:</strong></p><div id="variant-options" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:30px;">';
              vHtml += p.variants.map(v => {
                  const label = (v.options && v.options.length) ? v.options.filter(Boolean).join(' / ') : (v.name || v.color || v.title || v.sku || "Mặc định");
                  const price = v.price || p.price;
                  return `<button class="variant-btn" data-variant="${label}" data-price="${price}" style="padding:10px 18px; border:1px solid var(--border-gold); background:var(--white); cursor:pointer; border-radius:6px; font-size:0.95rem; transition: all 0.2s;" onclick="selectVariant(this)">${label}<br><small style="color:var(--taupe);">${price.toLocaleString('vi-VN')} ₫</small></button>`;
              }).join('');
              vHtml += '</div>';
          }
          
          window.selectVariant = function(btn) {
              document.querySelectorAll('.variant-btn').forEach(b => {
                  b.style.background = 'var(--white)';
                  b.style.border = '1px solid var(--border-gold)';
                  b.style.boxShadow = 'none';
              });
              btn.style.background = 'var(--champagne-light)';
              btn.style.border = '2px solid var(--champagne)';
              btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              
              document.getElementById('detail-price').textContent = Number(btn.getAttribute('data-price')).toLocaleString('vi-VN') + ' ₫';
              document.getElementById('selected-variant').value = btn.getAttribute('data-variant');
          };
          
          let thumbsHtml = '';
          if (p.gallery) {
              thumbsHtml = p.gallery.map(img => `
                <img src="${img}" style="width:80px; height:80px; object-fit:cover; cursor:pointer; border:1px solid var(--border-gold); border-radius:8px;" 
                     onclick="document.getElementById('main-detail-image').src = this.src;">
              `).join('');
          }
      
          detailContainer.innerHTML = `
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
                <!-- Left: Gallery -->
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div style="width:100%; padding-top:100%; position:relative; border-radius:12px; overflow:hidden; border:1px solid var(--border-gold);">
                        <img id="main-detail-image" src="${p.image || p.gallery[0]}" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div style="display:flex; gap:15px; overflow-x:auto;">
                        ${thumbsHtml}
                    </div>
                </div>
                
                <!-- Right: Info -->
                <div style="display:flex; flex-direction:column;">
                    <span style="color:var(--champagne); font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">${p.category || 'Gradie'}</span>
                    <h1 id="detail-title" style="font-family:'Playfair Display', serif; font-size:2.5rem; color:var(--ink); margin-bottom:15px;">${p.name}</h1>
                    <h2 id="detail-price" style="color:var(--peach); font-size:2rem; font-weight:500; margin-bottom:30px;">${p.price.toLocaleString('vi-VN')} ₫</h2>
                    
                    <p style="font-size:1.1rem; line-height:1.8; color:var(--soft-black); margin-bottom:30px;">
                        ${p.description || p.shortDescription || 'A beautiful personalized graduation gift from Gradie.'}
                    </p>
                    
                    ${vHtml}
                    <input type="hidden" id="selected-variant" value="">

                    <!-- Customization Panel -->
                    <div id="customization-panel" style="margin-bottom:30px;">

                      <!-- Embroidery Toggle -->
                      <div style="border:1px solid var(--border-gold); border-radius:10px; overflow:hidden; margin-bottom:14px;">
                        <button type="button" id="toggle-emb" onclick="(function(){ var s=document.getElementById('emb-section'); var a=document.getElementById('emb-arrow'); if(s.style.display==='none'){s.style.display='block';a.style.transform='rotate(180deg)';}else{s.style.display='none';a.style.transform='rotate(0deg)';} })()" style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:14px 18px; background:var(--warm-cream); border:none; cursor:pointer; font-family:'Montserrat',sans-serif; font-size:0.95rem; font-weight:600; color:var(--ink);">
                          <span>✨ Embroidery Personalization</span>
                          <svg id="emb-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--champagne)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div id="emb-section" style="display:none; padding:18px; background:var(--white);">
                          <label for="custom-emb-text" style="display:block; margin-bottom:8px; font-size:0.85rem; font-weight:600; color:var(--taupe); text-transform:uppercase; letter-spacing:.5px;">Embroidery Text</label>
                          <input type="text" id="custom-emb-text" maxlength="25" placeholder="e.g. Congratulations, Sarah!" style="width:100%; padding:12px 14px; border:1px solid var(--border-gold); border-radius:8px; font-family:'Montserrat',sans-serif; font-size:0.95rem; color:var(--ink); background:var(--warm-cream); outline:none; box-sizing:border-box; transition:border .2s;" onfocus="this.style.borderColor='var(--champagne)'" onblur="this.style.borderColor='var(--border-gold)'">
                          <div style="text-align:right; font-size:0.75rem; color:var(--taupe); margin-top:4px;"><span id="emb-char-count">0</span>/25 characters</div>

                          <label style="display:block; margin:16px 0 8px; font-size:0.85rem; font-weight:600; color:var(--taupe); text-transform:uppercase; letter-spacing:.5px;">Thread Color</label>
                          <input type="hidden" id="custom-thread-color" value="Champagne Gold">
                          <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <button type="button" class="thread-swatch" data-color="Champagne Gold" onclick="window._pickSwatch(this,'custom-thread-color','thread-swatch')" style="width:36px;height:36px;border-radius:50%;border:3px solid var(--champagne);background:#D8A94F;cursor:pointer;box-shadow:0 0 0 2px rgba(216,169,79,.4);transition:all .2s;" title="Champagne Gold"></button>
                            <button type="button" class="thread-swatch" data-color="Classic Silver" onclick="window._pickSwatch(this,'custom-thread-color','thread-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#C0C0C0;cursor:pointer;transition:all .2s;" title="Classic Silver"></button>
                            <button type="button" class="thread-swatch" data-color="Peach Gold" onclick="window._pickSwatch(this,'custom-thread-color','thread-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#E9A08D;cursor:pointer;transition:all .2s;" title="Peach Gold"></button>
                            <button type="button" class="thread-swatch" data-color="Crisp White" onclick="window._pickSwatch(this,'custom-thread-color','thread-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#FFFFFF;cursor:pointer;transition:all .2s;" title="Crisp White"></button>
                            <button type="button" class="thread-swatch" data-color="Midnight Black" onclick="window._pickSwatch(this,'custom-thread-color','thread-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#17181D;cursor:pointer;transition:all .2s;" title="Midnight Black"></button>
                          </div>
                        </div>
                      </div>

                      <!-- Gift Wrapping Toggle -->
                      <div style="border:1px solid var(--border-gold); border-radius:10px; overflow:hidden;">
                        <button type="button" id="toggle-gift" onclick="(function(){ var s=document.getElementById('gift-section'); var a=document.getElementById('gift-arrow'); if(s.style.display==='none'){s.style.display='block';a.style.transform='rotate(180deg)';}else{s.style.display='none';a.style.transform='rotate(0deg)';} })()" style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:14px 18px; background:var(--warm-cream); border:none; cursor:pointer; font-family:'Montserrat',sans-serif; font-size:0.95rem; font-weight:600; color:var(--ink);">
                          <span>🎁 Gift Wrapping</span>
                          <svg id="gift-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--champagne)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div id="gift-section" style="display:none; padding:18px; background:var(--white);">

                          <label style="display:block; margin-bottom:8px; font-size:0.85rem; font-weight:600; color:var(--taupe); text-transform:uppercase; letter-spacing:.5px;">Box Color</label>
                          <input type="hidden" id="custom-box-color" value="">
                          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;">
                            <button type="button" class="box-swatch" data-color="Signature Cream" onclick="window._pickSwatch(this,'custom-box-color','box-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#F4E8D1;cursor:pointer;transition:all .2s;" title="Signature Cream"></button>
                            <button type="button" class="box-swatch" data-color="Pastel Peach" onclick="window._pickSwatch(this,'custom-box-color','box-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#E9A08D;cursor:pointer;transition:all .2s;" title="Pastel Peach"></button>
                            <button type="button" class="box-swatch" data-color="Midnight Black" onclick="window._pickSwatch(this,'custom-box-color','box-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#17181D;cursor:pointer;transition:all .2s;" title="Midnight Black"></button>
                            <button type="button" class="box-swatch" data-color="Royal Navy" onclick="window._pickSwatch(this,'custom-box-color','box-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#002040;cursor:pointer;transition:all .2s;" title="Royal Navy"></button>
                          </div>

                          <label style="display:block; margin-bottom:8px; font-size:0.85rem; font-weight:600; color:var(--taupe); text-transform:uppercase; letter-spacing:.5px;">Ribbon Color</label>
                          <input type="hidden" id="custom-ribbon-color" value="">
                          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;">
                            <button type="button" class="ribbon-swatch" data-color="Champagne Gold" onclick="window._pickSwatch(this,'custom-ribbon-color','ribbon-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#D8A94F;cursor:pointer;transition:all .2s;" title="Champagne Gold"></button>
                            <button type="button" class="ribbon-swatch" data-color="Scarlet Red" onclick="window._pickSwatch(this,'custom-ribbon-color','ribbon-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#990000;cursor:pointer;transition:all .2s;" title="Scarlet Red"></button>
                            <button type="button" class="ribbon-swatch" data-color="Emerald Green" onclick="window._pickSwatch(this,'custom-ribbon-color','ribbon-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#2E7D32;cursor:pointer;transition:all .2s;" title="Emerald Green"></button>
                          </div>

                          <label for="custom-wax-seal" style="display:block; margin-bottom:8px; font-size:0.85rem; font-weight:600; color:var(--taupe); text-transform:uppercase; letter-spacing:.5px;">Wax Seal</label>
                          <select id="custom-wax-seal" style="width:100%; padding:12px 14px; border:1px solid var(--border-gold); border-radius:8px; font-family:'Montserrat',sans-serif; font-size:0.95rem; color:var(--ink); background:var(--warm-cream); outline:none; box-sizing:border-box; cursor:pointer; appearance:auto;">
                            <option value="">— No Seal —</option>
                            <option value="Graduation Cap">🎓 Graduation Cap</option>
                            <option value="Heart">❤️ Heart</option>
                            <option value="Rose">🌹 Rose</option>
                            <option value="Star">⭐ Star</option>
                          </select>
                        </div>
                      </div>

                    </div>
                    <!-- End Customization Panel -->

                    <button class="peach-button" style="width:100%; padding:15px; font-size:1.1rem; display:flex; align-items:center; justify-content:center; gap:10px; border-radius:12px; font-weight:600; text-transform:uppercase; letter-spacing:1px; cursor:pointer;" onclick="addToCart('${p.id}', true)">
                      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="margin-right:2px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                      Add to Cart
                    </button>
                    
                    <div style="margin-top:40px; border-top:1px solid var(--border-gold); padding-top:30px;">
                        <h3 style="margin-bottom:15px;">Product Details</h3>
                        <ul style="color:var(--soft-black); line-height:1.8; padding-left:20px;">
                            <li>Hand-crafted with premium materials</li>
                            <li>Personalization available at checkout</li>
                            <li>Ships within 3-5 business days</li>
                            <li>Stock status: ${p.stock > 0 ? 'In Stock (' + p.stock + ')' : 'Out of Stock'}</li>
                        </ul>
                    </div>
                </div>
            </div>
          `;

          // Wire up character counter for embroidery text
          var embInput = document.getElementById('custom-emb-text');
          if (embInput) {
            embInput.addEventListener('input', function() {
              var counter = document.getElementById('emb-char-count');
              if (counter) counter.textContent = embInput.value.length;
            });
          }
      } else {
          detailContainer.innerHTML = '<p style="text-align:center; padding:100px;">Product not found.</p>';
      }
  }
});

// Swatch picker helper
window._pickSwatch = function(btn, hiddenId, swatchClass) {
  document.querySelectorAll('.' + swatchClass).forEach(function(b) {
    b.style.border = '2px solid #ddd';
    b.style.boxShadow = 'none';
  });
  btn.style.border = '3px solid var(--champagne)';
  btn.style.boxShadow = '0 0 0 2px rgba(216,169,79,.4)';
  document.getElementById(hiddenId).value = btn.getAttribute('data-color');
};

// Expose safe cart add
window.addToCart = function(id, isDetailView = false) {
    const products = window.GradieStore ? window.GradieStore.getProducts() : window.GRADIE_DATA.products;
    const p = products.find(x => x.id === id);
    if (!p) return;
    
    let selectedVariant = null;
    let price = p.price;

    if (p.variants && p.variants.length > 0) {
        if (isDetailView) {
            const variantInput = document.getElementById('selected-variant');
            if (!variantInput || !variantInput.value) {
                alert('Vui lòng chọn option sản phẩm trước khi thêm vào giỏ hàng!');
                return;
            }
            selectedVariant = variantInput.value;
            const vObj = p.variants.find(v => (v.name || v.color) === selectedVariant);
            if (vObj && vObj.price) price = vObj.price;
        } else {
            // Added from grid, force redirect to detail page to select options
            alert('Sản phẩm này có nhiều lựa chọn. Vui lòng xem chi tiết để chọn option phù hợp!');
            window.location.href = `product-detail.html?id=${p.id}`;
            return;
        }
    }

    // Collect customization data (only on detail page)
    let customization = null;
    if (isDetailView) {
        const embText = document.getElementById('custom-emb-text');
        const threadColor = document.getElementById('custom-thread-color');
        const boxColor = document.getElementById('custom-box-color');
        const ribbonColor = document.getElementById('custom-ribbon-color');
        const waxSeal = document.getElementById('custom-wax-seal');

        if (embText && embText.value.trim()) {
            customization = customization || {};
            customization.embroideryText = embText.value.trim();
            customization.threadColor = threadColor ? threadColor.value : 'Champagne Gold';
        }
        if (boxColor && boxColor.value) {
            customization = customization || {};
            customization.boxColor = boxColor.value;
            customization.ribbonColor = ribbonColor ? ribbonColor.value : 'Champagne Gold';
            customization.waxSeal = waxSeal ? waxSeal.value : '';
        }
    }
    
    let cart = JSON.parse(localStorage.getItem('gradie_cart') || '[]');
    // Check if same product, variant, AND customization exists
    let exists = cart.find(function(x) {
        if (x.id !== id || x.variant !== selectedVariant) return false;
        // If customization differs, treat as new entry
        return JSON.stringify(x.customization || null) === JSON.stringify(customization);
    });
    
    if (exists) {
        exists.qty += 1;
    } else {
        cart.push({ 
            id: p.id, 
            name: p.name, 
            price: price, 
            image: p.image || (p.gallery ? p.gallery[0] : ''), 
            qty: 1,
            variant: selectedVariant,
            customization: customization
        });
    }
    
    localStorage.setItem('gradie_cart', JSON.stringify(cart));
    if(window.updateCartCount) window.updateCartCount();
    
    // Quick toast
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Đã thêm vào giỏ hàng!';
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}
