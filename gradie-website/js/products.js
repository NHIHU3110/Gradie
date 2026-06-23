// js/products.js

function getAllProducts() {
  if (window.GradieStore && typeof window.GradieStore.getProducts === "function") {
    return window.GradieStore.getProducts();
  }
  return window.GRADIE_DATA?.products || [];
}

document.addEventListener('DOMContentLoaded', () => {
  let products = getAllProducts();
  
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
      container.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Không tìm thấy sản phẩm nào phù hợp.</p>';
      return;
    }
    
    container.innerHTML = items.map(p => {
        let oldPriceHtml = p.oldPrice ? `<span class="old-price">${p.oldPrice.toLocaleString('vi-VN')} ₫</span>` : '';
        return `
            <div class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'">
              <div class="product-image-wrapper">
                ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
                <img src="${p.image || p.gallery[0]}" alt="${p.name}" class="p-img">
              </div>
              <div class="product-info">
                <h3 class="product-title">${p.name}</h3>
                <div class="product-price">${p.price.toLocaleString('vi-VN')} ₫ ${oldPriceHtml}</div>
                <div class="product-actions">
                  <button type="button" class="btn-favorite" onclick="event.stopPropagation(); event.preventDefault(); toggleFavorite('${p.id}', this)"><svg width="18" height="18" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
                  <button type="button" class="btn-add-cart" onclick="event.stopPropagation(); event.preventDefault(); addToCart('${p.id}')">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    Thêm vào giỏ
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
          filtered = filtered.filter(p => (p.category || '').toLowerCase() === currentCategory.toLowerCase());
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

  // Dynamic Category Filters rendering
  function renderCategoryFilters() {
      const filtersContainer = document.querySelector('.filters');
      if (!filtersContainer) return;

      const categories = (window.GradieStore && typeof window.GradieStore.getCategories === 'function')
          ? window.GradieStore.getCategories()
          : ["Gấu Bông", "Hoa mừng", "Kẹo", "Khung ảnh", "Sổ", "Bình Nước", "Túi", "Balo", "Huy Chương", "Đèn Ngủ", "Đồ tốt nghiệp", "Chậu Cây", "Ví", "Nến Thơm", "Túi Đựng Laptop"];

      const uniqueCategories = [...new Set(categories.map(c => typeof c === 'string' ? c.trim() : ''))].filter(Boolean);

      const currentPath = window.location.pathname.split('/').pop();
      const btnClass = (currentPath === 'products.html' || currentPath === '') ? 'category-filter' : 'outline-button category-filter';

      const allActive = currentCategory === 'all' ? 'active' : '';
      let html = `<button class="${btnClass} ${allActive}" data-category="all">Tất Cả</button>`;

      uniqueCategories.forEach(cat => {
          const isActive = currentCategory.toLowerCase() === cat.toLowerCase() ? 'active' : '';
          html += `<button class="${btnClass} ${isActive}" data-category="${cat}">${cat}</button>`;
      });

      filtersContainer.innerHTML = html;

      // Attach Event Listeners for Dynamic Filters
      const filterBtns = filtersContainer.querySelectorAll('.category-filter');
      filterBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
              filterBtns.forEach(b => b.classList.remove('active'));
              e.currentTarget.classList.add('active');
              currentCategory = e.currentTarget.getAttribute('data-category');
              updateMainGrid();
          });
      });
  }

  renderCategoryFilters();

  const searchInput = document.getElementById('product-search');
  if (searchInput) {
      searchInput.addEventListener('input', updateMainGrid);
  }
  
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
      sortSelect.addEventListener('change', updateMainGrid);
  }
  
  // Home Page Specific Grids
  function updateHomeGrids() {
      if (trendingGrid) {
          renderGrid(trendingGrid, products.filter(p => p.isTrending || p.rating >= 4.8).slice(0, 4));
      }
      if (featuredGrid) {
          renderGrid(featuredGrid, products.filter(p => p.isFeatured || p.price >= 500000).slice(0, 4));
      }
  }
  updateHomeGrids();

  // Listen to Database sync events to update categories & products dynamically
  window.addEventListener('gradie_data_synced', () => {
      products = getAllProducts();
      renderCategoryFilters();
      updateMainGrid();
      updateHomeGrids();
  });
  
  // Product Detail Page Logic
  const detailContainer = document.getElementById('product-detail-container');
  if (detailContainer) {
      const urlParams = new URLSearchParams(window.location.search);
      let pId = urlParams.get('id');
      let p = products.find(x => x.id === pId) || products[0];
      
      if(p) {
          let vHtml = '';
          if (p.variants && p.variants.length > 0) {
              vHtml = '<p class="detail-options-title"><strong>Chọn phiên bản:</strong></p><div id="variant-options" class="detail-options-grid">';
              vHtml += p.variants.map((v, index) => {
                  let label = "Mặc định";
                  if (v.options && v.options.length) {
                      label = v.options.map((val, idx) => {
                          if (val) {
                              const optName = (p.options && p.options[idx] && p.options[idx].name) ? p.options[idx].name : "";
                              return optName ? `${optName}: ${val}` : val;
                          }
                          return null;
                      }).filter(Boolean).join(' | ');
                  } else {
                      label = v.name || v.color || v.title || v.sku || "Mặc định";
                  }
                  const price = v.price || p.price;
                  return `<button class="variant-btn ${index === 0 ? 'active' : ''}" data-variant="${label}" data-price="${price}" data-image="${v.image || ''}" onclick="selectVariant(this)"><span style="font-weight:600;">${label}</span><br><small style="color:var(--taupe); font-weight:600; font-size:0.88rem; margin-top:4px; display:inline-block;">${price.toLocaleString('vi-VN')} ₫</small></button>`;
              }).join('');
              vHtml += '</div>';
          }
          
          window.selectVariant = function(btn) {
              document.querySelectorAll('.variant-btn').forEach(b => {
                  b.classList.remove('active');
              });
              btn.classList.add('active');
              
              document.getElementById('detail-price').textContent = Number(btn.getAttribute('data-price')).toLocaleString('vi-VN') + ' ₫';
              const varInput = document.getElementById('selected-variant');
              if (varInput) varInput.value = btn.getAttribute('data-variant');
              
              const vImg = btn.getAttribute('data-image');
              if (vImg) {
                  const mainImg = document.getElementById('main-detail-image');
                  if (mainImg) mainImg.src = vImg;
              }
          };
          
          let thumbsHtml = '';
          if (p.gallery && p.gallery.length > 1) {
              thumbsHtml = p.gallery.map((img, idx) => `
                <img src="${img}" class="detail-thumb-img ${idx === 0 ? 'active' : ''}" 
                     onclick="document.getElementById('main-detail-image').src = this.src; document.querySelectorAll('.detail-thumb-img').forEach(el => el.classList.remove('active')); this.classList.add('active');">
              `).join('');
          }
          const cat = (p.category || "").toLowerCase();
          const pName = (p.name || "").toLowerCase();
          const isFabric = cat.includes('gấu') || cat.includes('tốt nghiệp') || cat.includes('túi') || cat.includes('balo') || cat.includes('ví');
          const isMetal = (cat.includes('bình') && pName.includes('giữ nhiệt')) || cat.includes('huy chương');

          let customHtml = '<div id="customization-panel" style="margin-bottom:30px;">';
          
          if (isFabric) {
              customHtml += `
                      <div class="custom-option-card">
                        <button type="button" id="toggle-emb" onclick="(function(){ var s=document.getElementById('emb-section'); var a=document.getElementById('emb-arrow'); if(s.style.display==='none'){s.style.display='block';a.style.transform='rotate(180deg)';}else{s.style.display='none';a.style.transform='rotate(0deg)';} })()" class="custom-option-header">
                          <span style="display:flex; align-items:center; gap:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--champagne)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.6 7.6 2.4-7.6 2.4-2.4 7.6-2.4-7.6-7.6-2.4 7.6-2.4z"/></svg>
                            Thêu Tên (+50.000 ₫)
                          </span>
                          <svg id="emb-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--champagne)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div id="emb-section" class="custom-option-body" style="display:none;">
                          <label for="custom-emb-text" class="custom-option-label">Nội dung thêu</label>
                          <input type="text" id="custom-emb-text" maxlength="25" placeholder="Ví dụ: Gradie 2026" class="input">
                          <div style="text-align:right; font-size:0.75rem; color:var(--taupe); margin-top:4px;"><span id="emb-char-count">0</span>/25 ký tự</div>

                          <label class="custom-option-label" style="margin:16px 0 8px;">Màu Chỉ</label>
                          <input type="hidden" id="custom-thread-color" value="Champagne Gold">
                          <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <button type="button" class="thread-swatch" data-color="Champagne Gold" onclick="window._pickSwatch(this,'custom-thread-color','thread-swatch')" style="width:36px;height:36px;border-radius:50%;border:3px solid var(--champagne);background:#D8A94F;cursor:pointer;box-shadow:0 0 0 2px rgba(216,169,79,.4);transition:all .2s;" title="Champagne Gold"></button>
                            <button type="button" class="thread-swatch" data-color="Classic Silver" onclick="window._pickSwatch(this,'custom-thread-color','thread-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#C0C0C0;cursor:pointer;transition:all .2s;" title="Classic Silver"></button>
                            <button type="button" class="thread-swatch" data-color="Crisp White" onclick="window._pickSwatch(this,'custom-thread-color','thread-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#FFFFFF;cursor:pointer;transition:all .2s;" title="Crisp White"></button>
                            <button type="button" class="thread-swatch" data-color="Midnight Black" onclick="window._pickSwatch(this,'custom-thread-color','thread-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#17181D;cursor:pointer;transition:all .2s;" title="Midnight Black"></button>
                          </div>
                        </div>
                      </div>
              `;
          }

          if (isMetal) {
              customHtml += `
                      <div class="custom-option-card">
                        <button type="button" id="toggle-engrave" onclick="(function(){ var s=document.getElementById('engrave-section'); var a=document.getElementById('engrave-arrow'); if(s.style.display==='none'){s.style.display='block';a.style.transform='rotate(180deg)';}else{s.style.display='none';a.style.transform='rotate(0deg)';} })()" class="custom-option-header">
                          <span style="display:flex; align-items:center; gap:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--champagne)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line></svg>
                            Khắc Tên (+50.000 ₫)
                          </span>
                          <svg id="engrave-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--champagne)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div id="engrave-section" class="custom-option-body" style="display:none;">
                          <label for="custom-engrave-text" class="custom-option-label">Nội dung khắc</label>
                          <input type="text" id="custom-engrave-text" maxlength="15" placeholder="Ví dụ: Gradie 2026" class="input">
                          <div style="text-align:right; font-size:0.75rem; color:var(--taupe); margin-top:4px;"><span id="engrave-char-count">0</span>/15 ký tự</div>

                          <label for="custom-engrave-font" class="custom-option-label" style="margin:16px 0 8px;">Font chữ</label>
                          <select id="custom-engrave-font" class="select">
                            <option value="Classic Serif" style="font-family:'Playfair Display', serif;">Classic Serif (Cổ điển)</option>
                            <option value="Modern Sans" style="font-family:'Montserrat', sans-serif;">Modern Sans (Hiện đại)</option>
                            <option value="Elegant Script" style="font-family:'Great Vibes', cursive;">Elegant Script (Nghệ thuật)</option>
                          </select>
                        </div>
                      </div>
              `;
          }

          customHtml += `
                      <div class="custom-option-card">
                        <button type="button" id="toggle-gift" onclick="(function(){ var s=document.getElementById('gift-section'); var a=document.getElementById('gift-arrow'); if(s.style.display==='none'){s.style.display='block';a.style.transform='rotate(180deg)';}else{s.style.display='none';a.style.transform='rotate(0deg)';} })()" class="custom-option-header">
                          <span style="display:flex; align-items:center; gap:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--champagne)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                            Gói Quà (+30.000 ₫)
                          </span>
                          <svg id="gift-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--champagne)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div id="gift-section" class="custom-option-body" style="display:none;">
                          <label class="custom-option-label">Màu Hộp</label>
                          <input type="hidden" id="custom-box-color" value="">
                          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;">
                            <button type="button" class="box-swatch" data-color="Signature Cream" onclick="window._pickSwatch(this,'custom-box-color','box-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#F4E8D1;cursor:pointer;transition:all .2s;" title="Signature Cream"></button>
                            <button type="button" class="box-swatch" data-color="Midnight Black" onclick="window._pickSwatch(this,'custom-box-color','box-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#17181D;cursor:pointer;transition:all .2s;" title="Midnight Black"></button>
                            <button type="button" class="box-swatch" data-color="Royal Navy" onclick="window._pickSwatch(this,'custom-box-color','box-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#002040;cursor:pointer;transition:all .2s;" title="Royal Navy"></button>
                          </div>

                          <label class="custom-option-label">Màu Ruy Băng</label>
                          <input type="hidden" id="custom-ribbon-color" value="">
                          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;">
                            <button type="button" class="ribbon-swatch" data-color="Champagne Gold" onclick="window._pickSwatch(this,'custom-ribbon-color','ribbon-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#D8A94F;cursor:pointer;transition:all .2s;" title="Champagne Gold"></button>
                            <button type="button" class="ribbon-swatch" data-color="Scarlet Red" onclick="window._pickSwatch(this,'custom-ribbon-color','ribbon-swatch')" style="width:36px;height:36px;border-radius:50%;border:2px solid #ddd;background:#990000;cursor:pointer;transition:all .2s;" title="Scarlet Red"></button>
                          </div>

                          <label for="custom-wax-seal" class="custom-option-label">Dấu Sáp</label>
                          <select id="custom-wax-seal" class="select">
                            <option value="">— Không Dấu Sáp —</option>
                            <option value="Graduation Cap">Mũ Tốt Nghiệp</option>
                            <option value="Heart">Trái Tim</option>
                          </select>
                        </div>
                      </div>
          </div>
          `;
      
          detailContainer.innerHTML = `
            <div class="detail-grid">
                <!-- Left: Gallery -->
                <div class="detail-gallery-column">
                    <div class="detail-main-img-box" style="position: relative; overflow: hidden; border-radius: 16px; border: 1px solid var(--border-gold);">
                        <img id="main-detail-image" class="detail-main-img" src="${p.image || (p.gallery && p.gallery.length ? p.gallery[0] : '')}" style="display: block; width: 100%;">
                        <div id="personalization-preview-overlay" style="position: absolute; pointer-events: none; text-align: center; width: 100%; top: 65%; left: 50%; transform: translate(-50%, -50%); font-family: 'Great Vibes', cursive; font-size: 1.8rem; color: #D8A94F; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); opacity: 0; transition: all 0.3s ease; z-index: 2;"></div>
                    </div>
                    <div class="detail-thumbnails-row">
                        ${thumbsHtml}
                    </div>
                </div>
                
                <!-- Right: Info -->
                <div class="detail-info-column">
                    <span class="detail-category">${p.category || 'Gradie'}</span>
                    <h1 id="detail-title" class="detail-title">${p.name}</h1>
                    <h2 id="detail-price" class="detail-price">${p.price.toLocaleString('vi-VN')} ₫</h2>
                    
                    <p class="detail-desc">
                        ${p.description || p.shortDescription || 'Món quà ý nghĩa cho ngày tốt nghiệp đến từ Gradie.'}
                    </p>
                    
                    ${vHtml}
                    <input type="hidden" id="selected-variant" value="${p.variants && p.variants.length > 0 ? (p.variants[0].name || p.variants[0].color || p.variants[0].title || "Mặc định") : ""}">

                    ${customHtml}
                    
                    <button type="button" class="peach-button detail-btn-add-cart" onclick="event.preventDefault(); addToCart('${p.id}', true)">
                      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                      Thêm vào giỏ
                    </button>
                    
                    <div class="detail-spec-box">
                        <h3 class="detail-spec-title">Chi Tiết Sản Phẩm</h3>
                        <ul class="detail-spec-list">
                            <li>Chế tác thủ công từ chất liệu cao cấp</li>
                            <li>Hỗ trợ cá nhân hóa theo yêu cầu</li>
                            <li>Giao hàng nhanh từ 3-5 ngày làm việc</li>
                            <li>Trạng thái: ${p.stock > 0 ? 'Còn hàng (' + p.stock + ')' : 'Hết hàng'}</li>
                        </ul>
                    </div>
                </div>
            </div>
          `;
          
          // Wire up initial variant select value if available
          if (p.variants && p.variants.length > 0) {
              const firstBtn = document.querySelector('.variant-btn');
              if (firstBtn) {
                  const varInput = document.getElementById('selected-variant');
                  if (varInput) varInput.value = firstBtn.getAttribute('data-variant');
              }
          }
 
          // Wire up character counter for embroidery text
          var embInput = document.getElementById('custom-emb-text');
          if (embInput) {
            embInput.addEventListener('input', function() {
              var counter = document.getElementById('emb-char-count');
              if (counter) counter.textContent = embInput.value.length;
              if (typeof window.updateLivePreview === 'function') window.updateLivePreview();
            });
          }
          
          // Character counter for engrave text
          var engInput = document.getElementById('custom-engrave-text');
          if (engInput) {
            engInput.addEventListener('input', function() {
              var counter = document.getElementById('engrave-char-count');
              if (counter) counter.textContent = engInput.value.length;
              if (typeof window.updateLivePreview === 'function') window.updateLivePreview();
            });
          }

          var engFontSelect = document.getElementById('custom-engrave-font');
          if (engFontSelect) {
            engFontSelect.addEventListener('change', function() {
              if (typeof window.updateLivePreview === 'function') window.updateLivePreview();
            });
          }

          // Initial render of reviews section
          if (document.getElementById('product-reviews-section')) {
            window.renderReviewsSection(p.id);
          }
 
          // Show redirected options selection prompt toast
          if (urlParams.get('msg') === 'select-options') {
            setTimeout(() => {
              if (typeof showToast === 'function') {
                showToast('Sản phẩm này có nhiều lựa chọn, vui lòng chọn phiên bản trước khi thêm vào giỏ! ✨', 'info');
              }
            }, 400);
          }
      } else {
          detailContainer.innerHTML = '<p style="text-align:center; padding:100px;">Không tìm thấy sản phẩm.</p>';
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
    // Debounce: prevent multiple rapid clicks
    if (window._addToCartLock) return;
    window._addToCartLock = true;
    setTimeout(() => { window._addToCartLock = false; }, 1500);

    const products = window.GradieStore ? window.GradieStore.getProducts() : (window.GRADIE_DATA?.products || []);
    const p = products.find(x => x.id === id);
    if (!p) { window._addToCartLock = false; return; }
    
    let selectedVariant = null;
    let price = Number(p.price) || 0;

    if (p.variants && p.variants.length > 0) {
        if (isDetailView) {
            const variantInput = document.getElementById('selected-variant');
            if (!variantInput || !variantInput.value) {
                showToast('Vui lòng chọn tùy chọn sản phẩm trước khi thêm vào giỏ!', 'warning');
                window._addToCartLock = false;
                return;
            }
            selectedVariant = variantInput.value;
            const vObj = p.variants.find(v => {
                let label = "Mặc định";
                if (v.options && v.options.length) {
                    label = v.options.map((val, idx) => {
                        if (val) {
                            const optName = (p.options && p.options[idx] && p.options[idx].name) ? p.options[idx].name : "";
                            return optName ? `${optName}: ${val}` : val;
                        }
                        return null;
                    }).filter(Boolean).join(' | ');
                } else {
                    label = v.name || v.color || v.title || v.sku || "Mặc định";
                }
                return label === selectedVariant;
            });
            if (vObj && vObj.price) price = Number(vObj.price) || price;
        } else {
            // Added from grid, force redirect to detail page
            window.location.href = `product-detail.html?id=${p.id}&msg=select-options`;
            return;
        }
    }

    // Collect customization data (only on detail page)
    let customization = null;
    if (isDetailView) {
        const embText = document.getElementById('custom-emb-text');
        const threadColor = document.getElementById('custom-thread-color');
        const engraveText = document.getElementById('custom-engrave-text');
        const boxColor = document.getElementById('custom-box-color');
        const ribbonColor = document.getElementById('custom-ribbon-color');
        const waxSeal = document.getElementById('custom-wax-seal');

        if (embText && embText.value.trim()) {
            customization = customization || {};
            customization.embroideryText = embText.value.trim();
            customization.threadColor = threadColor ? threadColor.value : 'Champagne Gold';
            price += 50000;
        }
        if (engraveText && engraveText.value.trim()) {
            customization = customization || {};
            customization.engraveText = engraveText.value.trim();
            const engraveFont = document.getElementById('custom-engrave-font');
            customization.engraveFont = engraveFont ? engraveFont.value : 'Classic Serif';
            price += 50000;
        }
        if (boxColor && boxColor.value) {
            customization = customization || {};
            customization.boxColor = boxColor.value;
            customization.ribbonColor = ribbonColor ? ribbonColor.value : 'Champagne Gold';
            customization.waxSeal = waxSeal ? waxSeal.value : '';
            price += 30000;
        }
    }
    
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('GRADIE_CART')) || JSON.parse(localStorage.getItem('gradie_cart')) || [];
    } catch(e) { cart = []; }

    // Check if same product, variant, AND customization exists
    let exists = cart.find(function(x) {
        if (x.id !== id || x.variant !== selectedVariant) return false;
        return JSON.stringify(x.customization || null) === JSON.stringify(customization);
    });
    
    if (exists) {
        exists.qty = (exists.qty || exists.quantity || 0) + 1;
        exists.quantity = exists.qty;
    } else {
        cart.push({ 
            id: p.id, 
            name: p.name, 
            price: price, 
            image: p.image || (p.gallery ? p.gallery[0] : ''), 
            qty: 1,
            quantity: 1,
            variant: selectedVariant,
            customization: customization
        });
    }
    
    localStorage.setItem('GRADIE_CART', JSON.stringify(cart));
    localStorage.setItem('gradie_cart', JSON.stringify(cart));
    if(window.updateCartCount) window.updateCartCount();
    
    // Visual feedback on badge
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.style.transform = 'scale(1.5)';
        setTimeout(() => { badge.style.transform = 'scale(1)'; }, 300);
    }

    // Show success toast (only once)
    if (typeof showToast === 'function') {
      showToast('Đã thêm sản phẩm vào giỏ hàng thành công! 🛒', 'success');
    }
}

// =========================================================================
// CUSTOMIZATION & VERIFIED REVIEWS HELPERS
// =========================================================================

// Live preview updates
window.updateLivePreview = function() {
  const overlay = document.getElementById('personalization-preview-overlay');
  if (!overlay) return;

  const embTextEl = document.getElementById('custom-emb-text');
  const threadColorEl = document.getElementById('custom-thread-color');
  
  const engraveTextEl = document.getElementById('custom-engrave-text');
  const engraveFontEl = document.getElementById('custom-engrave-font');

  let text = '';
  let color = '#D8A94F';
  let fontFamily = "'Great Vibes', cursive";
  let textShadow = '1px 1px 1px rgba(0,0,0,0.5)';
  let topPosition = '65%';
  let rotateAngle = '-8deg';

  if (embTextEl && embTextEl.value.trim()) {
    text = embTextEl.value.trim();
    const threadColor = threadColorEl ? threadColorEl.value : 'Champagne Gold';
    const colorMap = {
      'Champagne Gold': '#D8A94F',
      'Classic Silver': '#E5E7EB',
      'Crisp White': '#FFFFFF',
      'Midnight Black': '#17181D'
    };
    color = colorMap[threadColor] || '#D8A94F';
    fontFamily = "'Great Vibes', cursive";
    rotateAngle = '-8deg';
    topPosition = '60%';
    textShadow = color === '#17181D' 
      ? '0.5px 0.5px 0px rgba(255,255,255,0.3), -0.5px -0.5px 0px rgba(0,0,0,0.5)' 
      : '0.5px 0.5px 0px rgba(0,0,0,0.3), -0.5px -0.5px 0px rgba(255,255,255,0.2)';
  } else if (engraveTextEl && engraveTextEl.value.trim()) {
    text = engraveTextEl.value.trim();
    const fontVal = engraveFontEl ? engraveFontEl.value : 'Classic Serif';
    const fontMap = {
      'Classic Serif': "'Playfair Display', serif",
      'Modern Sans': "'Montserrat', sans-serif",
      'Elegant Script': "'Great Vibes', cursive"
    };
    fontFamily = fontMap[fontVal] || "'Playfair Display', serif";
    color = '#4a3b2c'; 
    rotateAngle = '0deg';
    topPosition = '55%';
    textShadow = '0.5px 0.5px 0.5px rgba(255,255,255,0.2)';
  }

  if (text) {
    overlay.innerText = text;
    overlay.style.color = color;
    overlay.style.fontFamily = fontFamily;
    overlay.style.textShadow = textShadow;
    overlay.style.top = topPosition;
    overlay.style.transform = `translate(-50%, -50%) rotate(${rotateAngle})`;
    overlay.style.left = '50%';
    overlay.style.position = 'absolute';
    overlay.style.opacity = '1';
  } else {
    overlay.style.opacity = '0';
  }
};

// Update _pickSwatch helper to run live preview as well
const originalPickSwatch = window._pickSwatch;
window._pickSwatch = function(btn, hiddenId, swatchClass) {
  if (typeof originalPickSwatch === 'function') {
    originalPickSwatch(btn, hiddenId, swatchClass);
  } else {
    document.querySelectorAll('.' + swatchClass).forEach(function(b) {
      b.style.border = '2px solid #ddd';
      b.style.boxShadow = 'none';
    });
    btn.style.border = '3px solid var(--champagne)';
    btn.style.boxShadow = '0 0 0 2px rgba(216,169,79,.4)';
    document.getElementById(hiddenId).value = btn.getAttribute('data-color');
  }
  if (typeof window.updateLivePreview === 'function') {
    window.updateLivePreview();
  }
};

// Render reviews section dynamically
window.renderReviewsSection = function(productId) {
  const container = document.getElementById('product-reviews-section');
  if (!container) return;

  const user = window.GradieStore ? window.GradieStore.getCurrentUser() : null;
  const reviews = window.GradieStore ? window.GradieStore.getReviews() : [];
  const productReviews = reviews.filter(r => r.productId === productId);

  const totalReviews = productReviews.length;
  const avgRating = totalReviews > 0
    ? parseFloat((productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 5.0;

  // Check if current user is verified buyer
  let isVerified = false;
  if (user) {
    const orders = window.GradieStore.getOrders();
    const userOrders = orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase());
    const completedOrders = userOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered');
    isVerified = completedOrders.some(o => o.items && o.items.some(item => item.id === productId));
  }

  function getStarsHtml(rating) {
    let stars = '';
    const rounded = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars += i <= rounded ? '<span style="color:#d8a94f; font-size:1.1rem; margin-right:2px;">★</span>' : '<span style="color:#e2e8f0; font-size:1.1rem; margin-right:2px;">★</span>';
    }
    return stars;
  }

  let reviewsListHtml = '';
  if (productReviews.length > 0) {
    reviewsListHtml = productReviews.map(r => {
      const verifiedBadge = r.isVerified ? `
        <span class="review-item-badge-verified">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Người mua đã xác thực
        </span>
      ` : '';
      
      const reviewImageHtml = r.image ? `
        <div>
          <img src="${r.image}" class="review-item-image" onclick="window.openImageModal('${r.image}')" alt="Feedback Photo">
        </div>
      ` : '';

      return `
        <div class="review-item-card">
          <div class="review-item-header">
            <div class="review-item-author-info">
              <span class="review-item-author">${r.userName}</span>
              ${verifiedBadge}
            </div>
            <div style="text-align: right;">
              <div style="margin-bottom: 4px;">${getStarsHtml(r.rating)}</div>
              <span class="review-item-date">${r.date || ''}</span>
            </div>
          </div>
          <p class="review-item-comment" style="margin-top:8px; margin-bottom:0; color:#374151;">${r.comment}</p>
          ${reviewImageHtml}
        </div>
      `;
    }).join('');
  } else {
    reviewsListHtml = `
      <div style="text-align:center; padding:40px; border:1px dashed #f0eeeb; border-radius:16px; background:#faf8f5;">
        <span style="font-size:2rem; margin-bottom:10px; display:block;">✍️</span>
        <p style="color:var(--taupe); font-style:italic;">Chưa có đánh giá nào cho sản phẩm này. Hãy chia sẻ trải nghiệm đầu tiên!</p>
      </div>
    `;
  }

  let formHtml = '';
  if (!user) {
    formHtml = `
      <div class="reviews-verified-info" style="text-align: center; padding: 20px;">
        <p style="font-weight: 600; color: var(--ink); margin-bottom: 10px;">Bạn muốn viết đánh giá?</p>
        <p style="font-size:0.85rem; margin-bottom:15px; color:var(--taupe); line-height:1.4;">Vui lòng đăng nhập tài khoản đã mua sản phẩm để chia sẻ cảm nhận.</p>
        <a href="login.html?redirect=product-detail.html?id=${productId}" class="outline-button" style="display:inline-block; padding: 8px 20px; text-decoration:none; font-size:0.85rem; border-radius:8px; border:1.5px solid var(--border-gold); font-weight:600; color:var(--ink); background:#fff; cursor:pointer;">Đăng Nhập Ngay</a>
      </div>
    `;
  } else if (!isVerified) {
    formHtml = `
      <div class="reviews-verified-info">
        <strong style="color:var(--ink); display:block; margin-bottom:6px; font-size:0.85rem;">🔒 Đánh giá đã xác thực</strong>
        <p style="font-size:0.8rem; margin:0; line-height:1.4;">Hệ thống chỉ cho phép những khách hàng **đã mua sản phẩm này** viết đánh giá để đảm bảo phản hồi trung thực và chính xác nhất cho cộng đồng Gradie. Cảm ơn bạn!</p>
      </div>
    `;
  } else {
    formHtml = `
      <div class="review-form-box">
        <h4 class="review-form-title">Đánh Giá Sản Phẩm Của Bạn</h4>
        <form id="product-review-form" onsubmit="window.submitReview(event);">
          <div style="margin-bottom: 18px;">
            <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:8px; color:var(--ink);">Đánh giá của bạn *</label>
            <div class="star-rating-selector" style="display:flex; gap:8px; margin-bottom:15px; cursor:pointer;">
              <span class="star-select-item" data-val="1" style="font-size:1.8rem; color:#e2e8f0; transition:color 0.2s;">★</span>
              <span class="star-select-item" data-val="2" style="font-size:1.8rem; color:#e2e8f0; transition:color 0.2s;">★</span>
              <span class="star-select-item" data-val="3" style="font-size:1.8rem; color:#e2e8f0; transition:color 0.2s;">★</span>
              <span class="star-select-item" data-val="4" style="font-size:1.8rem; color:#e2e8f0; transition:color 0.2s;">★</span>
              <span class="star-select-item" data-val="5" style="font-size:1.8rem; color:#e2e8f0; transition:color 0.2s;">★</span>
            </div>
            <input type="hidden" id="review-rating-value" value="5">
          </div>
          
          <div style="margin-bottom: 18px;">
            <label for="review-comment" style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:8px; color:var(--ink);">Nhận xét chi tiết *</label>
            <textarea id="review-comment" required placeholder="Chia sẻ trải nghiệm của bạn về chất lượng sản phẩm, dịch vụ gói quà, thêu khắc tên..." class="review-form-textarea"></textarea>
          </div>

          <div style="margin-bottom: 24px;">
            <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:8px; color:var(--ink);">Hình ảnh thực tế (Tùy chọn, tối đa 2MB)</label>
            <div style="display:flex; align-items:center; gap:15px;">
              <input type="file" id="review-image-input" accept="image/*" style="display:none;">
              <button type="button" class="outline-button" onclick="document.getElementById('review-image-input').click()" style="padding:8px 14px; font-size:0.82rem; border-radius:8px; border:1.5px solid var(--border-gold); background:#fff; cursor:pointer; font-weight:600; font-family:inherit;">
                Chọn Ảnh
              </button>
              <div id="review-image-preview-container" style="display:none; position:relative; width:64px; height:64px; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0;">
                <img id="review-image-preview" style="width:100%; height:100%; object-fit:cover;">
                <button type="button" onclick="window._clearReviewImage()" style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.6); color:#fff; border:none; width:16px; height:16px; border-radius:50%; font-size:10px; cursor:pointer; line-height:16px; text-align:center;">✕</button>
              </div>
            </div>
            <input type="hidden" id="review-image-base64" value="">
          </div>

          <button type="submit" class="btn-primary" style="width:100%; padding:14px; border-radius:10px; font-weight:600; text-transform:uppercase; font-size:0.88rem; letter-spacing:0.5px; border:none; cursor:pointer; background:var(--champagne); color:#fff;">Đăng Đánh Giá</button>
        </form>
      </div>
    `;
  }

  container.innerHTML = `
    <h3 style="font-family:'Playfair Display', serif; font-size:1.8rem; margin:0 0 10px; color:var(--ink);">Đánh giá từ khách hàng</h3>
    <p style="color:var(--taupe); margin-bottom:30px; font-size:0.95rem;">Gradie cam kết 100% đánh giá là thật từ những khách hàng đã mua sản phẩm.</p>
    
    <div class="reviews-container">
      <!-- Left Column: Summary Card and form -->
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div class="reviews-summary-card">
          <div class="reviews-summary-score">${avgRating}</div>
          <div class="reviews-summary-stars">${getStarsHtml(avgRating)}</div>
          <div class="reviews-summary-count">Dựa trên ${totalReviews} đánh giá</div>
          
          <div style="display:flex; flex-direction:column; gap:8px; border-top:1px solid #f0eeeb; padding-top:20px; font-size:0.85rem; text-align:left;">
            ${[5, 4, 3, 2, 1].map(starsCount => {
              const count = productReviews.filter(r => r.rating === starsCount).length;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return `
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="width:12px; font-weight:600;">${starsCount}</span>
                  <span style="color:#d8a94f;">★</span>
                  <div style="flex:1; height:8px; background:#f0eeeb; border-radius:4px; overflow:hidden;">
                    <div style="width:${percent}%; height:100%; background:#d8a94f;"></div>
                  </div>
                  <span style="width:24px; text-align:right; color:var(--taupe);">${count}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        ${formHtml}
      </div>

      <!-- Right Column: Reviews List -->
      <div class="reviews-list-column">
        ${reviewsListHtml}
      </div>
    </div>
  `;

  // Attach Star Rating events if Form is present
  if (user && isVerified) {
    let selectedRating = 5;
    const starsEl = container.querySelectorAll('.star-select-item');
    const ratingInput = document.getElementById('review-rating-value');

    const updateStarsDisplay = (rating) => {
      starsEl.forEach(s => {
        const val = parseInt(s.getAttribute('data-val'));
        s.style.color = val <= rating ? '#d8a94f' : '#e2e8f0';
      });
    };

    // Trigger initial color render
    updateStarsDisplay(selectedRating);

    starsEl.forEach(star => {
      star.addEventListener('mouseenter', function() {
        const val = parseInt(this.getAttribute('data-val'));
        updateStarsDisplay(val);
      });
      star.addEventListener('mouseleave', function() {
        updateStarsDisplay(selectedRating);
      });
      star.addEventListener('click', function() {
        selectedRating = parseInt(this.getAttribute('data-val'));
        if (ratingInput) ratingInput.value = selectedRating;
        updateStarsDisplay(selectedRating);
      });
    });

    // File Upload listeners
    const fileInput = document.getElementById('review-image-input');
    if (fileInput) {
      fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) {
            alert('Dung lượng ảnh tối đa là 2MB.');
            this.value = '';
            return;
          }
          const reader = new FileReader();
          reader.onload = function(evt) {
            document.getElementById('review-image-base64').value = evt.target.result;
            document.getElementById('review-image-preview').src = evt.target.result;
            document.getElementById('review-image-preview-container').style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }
};

// Zoom image modal for review photos
window.openImageModal = function(imageSrc) {
  let modal = document.getElementById('review-zoom-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'review-zoom-modal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:none; align-items:center; justify-content:center; cursor:zoom-out;';
    modal.onclick = function() { modal.style.display = 'none'; };
    
    const img = document.createElement('img');
    img.id = 'review-zoom-modal-img';
    img.style.cssText = 'max-width:90%; max-height:90%; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.5); object-fit:contain;';
    modal.appendChild(img);
    document.body.appendChild(modal);
  }
  
  document.getElementById('review-zoom-modal-img').src = imageSrc;
  modal.style.display = 'flex';
};

// Clear review photo helper
window._clearReviewImage = function() {
  const fileInput = document.getElementById('review-image-input');
  if (fileInput) fileInput.value = '';
  const base64Input = document.getElementById('review-image-base64');
  if (base64Input) base64Input.value = '';
  const previewContainer = document.getElementById('review-image-preview-container');
  if (previewContainer) previewContainer.style.display = 'none';
};

// Submit review action
window.submitReview = function(event) {
  event.preventDefault();
  const user = window.GradieStore ? window.GradieStore.getCurrentUser() : null;
  if (!user) {
    alert('Vui lòng đăng nhập để gửi đánh giá.');
    return;
  }

  const rating = parseInt(document.getElementById('review-rating-value')?.value || '5');
  const comment = document.getElementById('review-comment')?.value.trim();
  const image = document.getElementById('review-image-base64')?.value || null;

  if (!comment) {
    alert('Vui lòng nhận xét về sản phẩm.');
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const newReview = {
    id: 'rev-' + Date.now(),
    productId: productId,
    userName: user.username || 'Khách hàng',
    userEmail: user.email,
    rating: rating,
    comment: comment,
    image: image,
    date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
    isVerified: true
  };

  if (window.GradieStore && typeof window.GradieStore.addReview === 'function') {
    window.GradieStore.addReview(newReview);
    if (typeof showToast === 'function') {
      showToast('Đăng đánh giá thành công! Cảm ơn phản hồi của bạn. ✨', 'success');
    } else {
      alert('Đăng đánh giá thành công!');
    }
    
    // Clear review inputs
    const commentEl = document.getElementById('review-comment');
    if (commentEl) commentEl.value = '';
    window._clearReviewImage();
    
    // Re-render reviews
    window.renderReviewsSection(productId);
  }
};

