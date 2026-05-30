/* ===== APP.JS – Gradie Shop ===== */

// ---- State ----
let cart = JSON.parse(localStorage.getItem('gradie_cart') || '[]');
let currentFilter = 'all';
let currentSort = 'default';
let searchQuery = '';
let selectedVariants = {};   // productId -> variantIndex
let quantities = {};          // productId -> qty

// ---- Helpers ----
const fmt = n => n.toLocaleString('vi-VN') + ' ₫';
const disc = (p, c) => Math.round((1 - p / c) * 100);
const $ = id => document.getElementById(id);
const categories = [...new Set(PRODUCTS.map(p => p.category))];

const BADGE_MAP = {
  'hot-products': { label: 'Nổi bật', cls: 'badge-hot' },
  'onsale':       { label: 'Giảm giá', cls: 'badge-sale' },
  'frontpage':    { label: 'Mới', cls: 'badge-new' }
};
const CAT_ICONS = {
  'Gấu Bông': '🐻', 'Hoa mừng': '🌸', 'Kẹo': '🍬',
  'Khung ảnh': '🖼️', 'Huy Chương': '🏅', 'Đèn Ngủ': '💡',
  'Đồ tốt nghiệp': '🎓', 'Scrapbook': '📒', 'Sổ kế hoạch': '📔'
};

// ---- Render Categories ----
function renderCategories() {
  const grid = $('categories-grid');
  const tabs = $('filter-tabs');

  const catCounts = {};
  categories.forEach(c => { catCounts[c] = PRODUCTS.filter(p => p.category === c).length; });

  grid.innerHTML = categories.map(c => `
    <div class="cat-card ${currentFilter === c ? 'active' : ''}"
         onclick="filterCategory('${c}')" id="cat-${c.replace(/\s/g,'_')}">
      <span class="cat-icon">${CAT_ICONS[c] || '📦'}</span>
      <div class="cat-name">${c}</div>
      <div class="cat-count">${catCounts[c]} sản phẩm</div>
    </div>`).join('');

  // Filter tabs
  const existing = tabs.querySelectorAll('.filter-tab:not(#filter-all)');
  existing.forEach(e => e.remove());
  categories.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'filter-tab' + (currentFilter === c ? ' active' : '');
    btn.dataset.filter = c;
    btn.textContent = c;
    btn.onclick = () => filterCategory(c);
    tabs.appendChild(btn);
  });
}

// ---- Filter ----
function filterCategory(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.toggle('active', b.dataset.filter === cat));
  document.querySelectorAll('.cat-card').forEach(c => {
    const match = c.id === 'cat-' + cat.replace(/\s/g, '_');
    c.classList.toggle('active', match);
  });
  renderProducts();
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// ---- Get min price of product ----
function minPrice(p) { return Math.min(...p.variants.map(v => v.price)); }
function minCompare(p) { return Math.min(...p.variants.map(v => v.compare)); }

// ---- Render Products ----
function renderProducts() {
  let list = [...PRODUCTS];

  if (currentFilter !== 'all') list = list.filter(p => p.category === currentFilter);
  if (searchQuery) list = list.filter(p =>
    p.name.toLowerCase().includes(searchQuery) ||
    p.category.toLowerCase().includes(searchQuery) ||
    p.desc.toLowerCase().includes(searchQuery)
  );
  if (currentSort === 'price-asc') list.sort((a, b) => minPrice(a) - minPrice(b));
  else if (currentSort === 'price-desc') list.sort((a, b) => minPrice(b) - minPrice(a));
  else if (currentSort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const grid = $('products-grid');
  const noRes = $('no-results');

  if (!list.length) { grid.innerHTML = ''; noRes.classList.remove('hidden'); return; }
  noRes.classList.add('hidden');

  grid.innerHTML = list.map(p => {
    const vIdx = selectedVariants[p.id] ?? 0;
    const v = p.variants[vIdx];
    const badge = BADGE_MAP[p.tag];
    const d = disc(v.price, v.compare);
    return `
    <div class="product-card" onclick="openModal('${p.id}')" id="pcard-${p.id}">
      <div class="product-img-wrap">
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/400x400/fce7f3/a855f7?text=Gradie'" />
        ${badge ? `<span class="product-badge ${badge.cls}">${badge.label}</span>` : ''}
        <div class="product-actions-overlay">
          <button class="btn-add-overlay" onclick="event.stopPropagation();addToCart('${p.id}')">🛒 Thêm vào giỏ</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price-row">
          <span class="product-price">${fmt(v.price)}</span>
          <span class="product-price-compare">${fmt(v.compare)}</span>
          <span class="product-discount">-${d}%</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ---- Modal ----
function openModal(pid) {
  const p = PRODUCTS.find(x => x.id === pid);
  if (!p) return;
  const vIdx = selectedVariants[pid] ?? 0;
  const v = p.variants[vIdx];
  const qty = quantities[pid] ?? 1;

  // Group attrs
  const attr1s = [...new Set(p.variants.map(v => v.attr1))];
  const attr2s = [...new Set(p.variants.map(v => v.attr2))];

  $('modal-body').innerHTML = `
    <div class="modal-gallery">
      <img src="${p.images[vIdx] || p.images[0]}" alt="${p.name}"
           onerror="this.src='https://via.placeholder.com/500x500/fce7f3/a855f7?text=Gradie'" />
    </div>
    <div class="modal-info">
      <div class="modal-category">${p.category}</div>
      <h2 class="modal-title">${p.name}</h2>
      <div class="modal-price-row">
        <span class="modal-price" id="m-price">${fmt(v.price)}</span>
        <span class="modal-price-compare" id="m-cmp">${fmt(v.compare)}</span>
        <span class="product-discount">-${disc(v.price, v.compare)}%</span>
      </div>
      <p class="modal-desc">${p.desc}</p>
      <div class="modal-variants">
        ${attr1s.length > 1 ? `<label>Hình dáng / Màu sắc</label>
        <div class="variants-list">${attr1s.map((a, i) => `
          <button class="variant-btn ${p.variants.findIndex(vv=>vv.attr1===a) === vIdx ? 'selected' : ''}"
            onclick="selectVariantByAttr('${pid}','attr1','${a}')">${a}</button>`).join('')}</div>` : ''}
        ${attr2s.length > 1 ? `<label>Kích thước</label>
        <div class="variants-list">${attr2s.map((a) => `
          <button class="variant-btn ${v.attr2 === a ? 'selected' : ''}"
            onclick="selectVariantByAttr('${pid}','attr2','${a}')">${a}</button>`).join('')}</div>` : ''}
      </div>
      <div class="modal-qty">
        <label>Số lượng</label>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty('${pid}',-1)">−</button>
          <span class="qty-num" id="qty-num-${pid}">${qty}</span>
          <button class="qty-btn" onclick="changeQty('${pid}',1)">+</button>
        </div>
      </div>
      <button class="btn btn-primary modal-add-btn" onclick="addToCart('${pid}');closeModal()">
        🛒 Thêm vào giỏ hàng
      </button>
    </div>`;

  $('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

function selectVariantByAttr(pid, attr, val) {
  const p = PRODUCTS.find(x => x.id === pid);
  const cur = selectedVariants[pid] ?? 0;
  const cv = p.variants[cur];
  let newIdx;
  if (attr === 'attr1') newIdx = p.variants.findIndex(v => v.attr1 === val && v.attr2 === cv.attr2);
  else newIdx = p.variants.findIndex(v => v.attr2 === val && v.attr1 === cv.attr1);
  if (newIdx < 0) newIdx = p.variants.findIndex(v => v[attr] === val);
  if (newIdx >= 0) selectedVariants[pid] = newIdx;
  openModal(pid);
}

function changeQty(pid, delta) {
  quantities[pid] = Math.max(1, (quantities[pid] ?? 1) + delta);
  const el = $('qty-num-' + pid);
  if (el) el.textContent = quantities[pid];
}

// ---- Cart ----
function addToCart(pid) {
  const p = PRODUCTS.find(x => x.id === pid);
  const vIdx = selectedVariants[pid] ?? 0;
  const v = p.variants[vIdx];
  const qty = quantities[pid] ?? 1;
  const key = pid + '_' + v.sku;
  const existing = cart.find(i => i.key === key);
  if (existing) existing.qty += qty;
  else cart.push({ key, pid, name: p.name, img: p.images[0] || '', variant: v.attr1 + (v.attr2 ? ' / ' + v.attr2 : ''), price: v.price, qty });
  saveCart();
  showToast('Đã thêm vào giỏ hàng! 🎉');
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem('gradie_cart', JSON.stringify(cart));
  updateBadge();
  renderCart();
}

function updateBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  $('cart-badge').textContent = total;
}

function renderCart() {
  const el = $('cart-items');
  if (!cart.length) {
    el.innerHTML = '<div class="cart-empty">🛒<br/>Giỏ hàng trống<br/><small>Hãy thêm sản phẩm bạn yêu thích!</small></div>';
    $('cart-total-price').textContent = '0 ₫';
    return;
  }
  el.innerHTML = cart.map(i => `
    <div class="cart-item">
      <img class="cart-item-img" src="${i.img}" alt="${i.name}"
           onerror="this.src='https://via.placeholder.com/80x80/fce7f3/a855f7?text=G'" />
      <div class="cart-item-detail">
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-variant">${i.variant} · SL: ${i.qty}</div>
        <div class="cart-item-bottom">
          <span class="cart-item-price">${fmt(i.price * i.qty)}</span>
          <button class="cart-item-remove" onclick="removeFromCart('${i.key}')">Xoá</button>
        </div>
      </div>
    </div>`).join('');
  $('cart-total-price').textContent = fmt(cart.reduce((s, i) => s + i.price * i.qty, 0));
}

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.add('hidden'), 2800);
}

// ---- Event Listeners ----
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts();
  updateBadge();
  renderCart();

  // Header scroll
  window.addEventListener('scroll', () => {
    $('header').classList.toggle('scrolled', window.scrollY > 10);
  });

  // Search
  $('search-toggle').onclick = () => {
    $('search-bar').classList.toggle('open');
    if ($('search-bar').classList.contains('open')) $('search-input').focus();
  };
  $('search-close').onclick = () => {
    $('search-bar').classList.remove('open');
    $('search-input').value = '';
    searchQuery = '';
    renderProducts();
  };
  $('search-input').addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderProducts();
    if (searchQuery) document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  });

  // Hamburger
  $('hamburger').onclick = () => $('main-nav').classList.toggle('open');

  // Filter all
  $('filter-all').onclick = () => {
    currentFilter = 'all';
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
    document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
    renderProducts();
  };

  // Sort
  $('sort-select').onchange = e => { currentSort = e.target.value; renderProducts(); };

  // Cart
  $('cart-btn').onclick = () => {
    $('cart-drawer').classList.remove('hidden');
    $('drawer-overlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };
  const closeCart = () => {
    $('cart-drawer').classList.add('hidden');
    $('drawer-overlay').classList.add('hidden');
    document.body.style.overflow = '';
  };
  $('cart-close').onclick = closeCart;
  $('drawer-overlay').onclick = closeCart;

  // Modal close
  $('modal-close').onclick = closeModal;
  $('modal-overlay').onclick = e => { if (e.target === $('modal-overlay')) closeModal(); };

  // Checkout
  $('checkout-btn').onclick = () => {
    if (!cart.length) { showToast('Giỏ hàng đang trống!'); return; }
    showToast('Cảm ơn bạn đã đặt hàng! 💝 Gradie sẽ liên hệ sớm.');
    cart = [];
    saveCart();
    closeCart();
  };

  // Logo
  $('logo-home').onclick = e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
});

// Expose globally
window.filterCategory = filterCategory;
window.openModal = openModal;
window.closeModal = closeModal;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.selectVariantByAttr = selectVariantByAttr;
window.changeQty = changeQty;
