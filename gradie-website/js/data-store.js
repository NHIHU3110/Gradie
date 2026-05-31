// js/data-store.js
window.GradieStore = {
  storageKey: "GRADIE_CMS_DATA",


  init: function() {
    let data = this.getData();
    let updated = false;
    
    // Check if products list contains placeholder names
    let needsCatalogUpdate = false;
    if (data && data.products && data.products.length > 0) {
      const placeholders = [
        "Sản phẩm có nhiều hình biến thể", 
        "Sản phẩm có nhiều nhóm sản phẩm", 
        "Sản phẩm có nhiều hình sản phẩm",
        "So-Tay-Bia-Cung",
        "Ao Cu Nhan"
      ];
      needsCatalogUpdate = data.products.some(p => placeholders.includes(p.name) || p.name.includes("biến thể"));
    }
    
    const correctCategories = ["Graduation Gifts", "Scrapbook", "Đồ tốt nghiệp", "Gấu Bông", "Gấu bông", "Khung ảnh", "Đèn Ngủ", "Kẹo", "Huy Chương", "Sổ kế hoạch", "Hoa mừng"];
    if (!data.categories || data.categories.includes("Hoa hồng gấu bông") || data.categories.includes("Hộp quà") || data.categories.includes("Sash") || data.categories.length !== correctCategories.length) {
      data.categories = correctCategories;
      updated = true;
    }

    const defaultCustomization = {
      sashColors: [{name: 'Classic Black', hex: '#17181d'}, {name: 'Champagne Gold', hex: '#d8a94f'}, {name: 'Peach', hex: '#e9a08d'}],
      embroideryFonts: [{name: 'Elegant Script', price: 50000}, {name: 'Modern Sans', price: 50000}],
      wrappingStyles: [{name: 'Standard Box', price: 0}, {name: 'Premium Ribbon Box', price: 100000}],
      embroideryColors: [
        { name: 'Champagne Gold', hex: '#D8A94F' },
        { name: 'Classic Silver', hex: '#C0C0C0' },
        { name: 'Peach Gold', hex: '#E9A08D' },
        { name: 'Crisp White', hex: '#FFFFFF' },
        { name: 'Midnight Black', hex: '#17181D' }
      ],
      boxColors: [
        { name: 'Signature Cream', hex: '#F4E8D1' },
        { name: 'Pastel Peach', hex: '#E9A08D' },
        { name: 'Midnight Black', hex: '#17181D' },
        { name: 'Royal Navy', hex: '#002040' }
      ],
      ribbonColors: [
        { name: 'Champagne Gold', hex: '#D8A94F' },
        { name: 'Scarlet Red', hex: '#990000' },
        { name: 'Emerald Green', hex: '#2E7D32' },
        { name: 'Golden Tangerine', hex: '#FFB74D' }
      ],
      waxSeals: [
        { name: 'Graduation Cap', emoji: '🎓' },
        { name: 'Heart of Love', emoji: '❤️' },
        { name: 'Bespoke Rose', emoji: '🌹' },
        { name: 'Star of Success', emoji: '⭐' }
      ]
    };

    if (!data.customization || !data.customization.embroideryColors) {
      data.customization = defaultCustomization;
      updated = true;
    }
    
    if (!data || !data.products || data.products.length === 0 || needsCatalogUpdate) {
      let defaults = this.getDefaultData();
      if (!data) data = defaults;
      data.products = this.normalizeProducts(window.GRADIE_DATA?.products || []);
      updated = true;
    } else {
      data.products = this.normalizeProducts(data.products);
    }
      
    // Auto-fill mock data if empty (for gallery, blog, orders, policies)
    let defaults = this.getDefaultData();
    if (!data.orders || data.orders.length === 0) { data.orders = defaults.orders; updated = true; }
    if (!data.blogPosts || data.blogPosts.length === 0) { data.blogPosts = defaults.blogPosts; updated = true; }
    if (!data.gallery || data.gallery.length === 0) { data.gallery = defaults.gallery; updated = true; }
    if (!data.policies || data.policies.length === 0) { data.policies = defaults.policies; updated = true; }
      
    if (updated) this.saveData(data);
  },


  getData: function() {
    let dataStr = localStorage.getItem(this.storageKey);
    let data = null;
    if (dataStr) {
      try { data = JSON.parse(dataStr); } catch (e) { console.error("Error parsing data", e); }
    }
    if (!data || typeof data !== 'object') {
      return this.resetData(false);
    }
    return data;
  },

  saveData: function(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  },

  getDefaultData: function() {
    return {
      categories: ["Graduation Gifts", "Scrapbook", "Đồ tốt nghiệp", "Gấu Bông", "Gấu bông", "Khung ảnh", "Đèn Ngủ", "Kẹo", "Huy Chương", "Sổ kế hoạch", "Hoa mừng"],
      settings: {
        brandName: "Gradie", tagline: "Graduation Gifts", shippingFee: 30000, currency: "VND",
        announcement: "Grand Opening • Free gift tag with every order • Celebrate her next chapter",
        promoCode: "GRAD2026", promoDiscount: 50000
      },
      products: this.normalizeProducts(window.GRADIE_DATA?.products || []),
      orders: [
        { orderNumber: "ORD-" + Math.floor(Math.random()*10000), createdAt: Date.now() - 86400000, customer: {name: "Nguyen Van A", email: "a@example.com"}, total: 350000, status: "Delivered" },
        { orderNumber: "ORD-" + Math.floor(Math.random()*10000), createdAt: Date.now() - 3600000, customer: {name: "Tran Thi B", email: "b@example.com"}, total: 520000, status: "Order Confirmed" },
        { orderNumber: "ORD-" + Math.floor(Math.random()*10000), createdAt: Date.now() - 120000, customer: {name: "Le Van C", email: "c@example.com"}, total: 150000, status: "Dispatched" }
      ],
      blogPosts: [
        { id: 'b1', title: 'Top 5 Graduation Gifts 2026', category: 'Gifting Tips', status: 'Published', content: 'Discover the most meaningful gifts for this graduation season. From personalized sashes to timeless teddy bears...', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500' },
        { id: 'b2', title: 'The Meaning Behind the Graduation Sash', category: 'Meaning of Gifts', status: 'Published', content: 'Why do we wear sashes? A brief history of this beautiful tradition and how to choose the right one.', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500' },
        { id: 'b3', title: 'How to Preserve Your Graduation Bouquet', category: 'Care Guide', status: 'Published', content: 'Don\'t let those beautiful flowers die. Here are 3 ways to dry and preserve your graduation bouquet forever.', image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500' }
      ],
      gallery: [
        { id: 'g1', type: 'Customer Photo', title: 'A Happy Graduate', status: 'Published', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500' },
        { id: 'g2', type: 'Photoshoot Concept', title: 'Studio Glam', status: 'Published', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500' },
        { id: 'g3', type: 'Product Showcase', title: 'Premium Sash Close-up', status: 'Published', image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500' }
      ],
      policies: [
        { id: 'p1', title: 'Shipping Policy', content: 'We ship nationwide within 3-5 business days. Standard shipping fee is 30,000 VND. Free shipping for orders over 1,000,000 VND.', status: 'Published' },
        { id: 'p2', title: 'Return Policy', content: 'Returns accepted within 7 days for defective items. Personalized items (custom embroidered sashes) cannot be returned.', status: 'Published' },
        { id: 'p3', title: 'Privacy Policy', content: 'Your data is safe with us. We do not sell your personal information to third parties.', status: 'Draft' }
      ],
      customization: {
        sashColors: [{name: 'Classic Black', hex: '#17181d'}, {name: 'Champagne Gold', hex: '#d8a94f'}, {name: 'Peach', hex: '#e9a08d'}],
        embroideryFonts: [{name: 'Elegant Script', price: 50000}, {name: 'Modern Sans', price: 50000}],
        wrappingStyles: [{name: 'Standard Box', price: 0}, {name: 'Premium Ribbon Box', price: 100000}],
        embroideryColors: [
          { name: 'Champagne Gold', hex: '#D8A94F' },
          { name: 'Classic Silver', hex: '#C0C0C0' },
          { name: 'Peach Gold', hex: '#E9A08D' },
          { name: 'Crisp White', hex: '#FFFFFF' },
          { name: 'Midnight Black', hex: '#17181D' }
        ],
        boxColors: [
          { name: 'Signature Cream', hex: '#F4E8D1' },
          { name: 'Pastel Peach', hex: '#E9A08D' },
          { name: 'Midnight Black', hex: '#17181D' },
          { name: 'Royal Navy', hex: '#002040' }
        ],
        ribbonColors: [
          { name: 'Champagne Gold', hex: '#D8A94F' },
          { name: 'Scarlet Red', hex: '#990000' },
          { name: 'Emerald Green', hex: '#2E7D32' },
          { name: 'Golden Tangerine', hex: '#FFB74D' }
        ],
        waxSeals: [
          { name: 'Graduation Cap', emoji: '🎓' },
          { name: 'Heart of Love', emoji: '❤️' },
          { name: 'Bespoke Rose', emoji: '🌹' },
          { name: 'Star of Success', emoji: '⭐' }
        ]
      }
    };
  },

  resetData: function(forceSave = true) {
    let defaultData = this.getDefaultData();
    if (forceSave) this.saveData(defaultData);
    return defaultData;
  },

  getCategories: function() {
    let data = this.getData();
    let storedCats = data.categories || [];
    const products = this.getProducts();
    const prodCats = products.map(p => p.category).filter(c => typeof c === 'string' && c.trim() !== '');
    return [...new Set([...storedCats, ...prodCats])];
  },
  
  addCategory: function(name) {
    let data = this.getData();
    if (!data.categories) data.categories = [];
    if (!data.categories.includes(name)) {
        data.categories.push(name);
        this.saveData(data);
    }
  },
  
  deleteCategory: function(name) {
    let data = this.getData();
    if (data.categories) {
        data.categories = data.categories.filter(c => c !== name);
    }
    // Remove category from associated products
    if (data.products) {
        data.products.forEach(p => {
            if(p.category === name) p.category = 'Uncategorized';
        });
    }
    this.saveData(data);
  },
  
  assignProductsToCategory: function(categoryName, productIds) {
    let data = this.getData();
    if (!data.products) return;
    
    data.products.forEach(p => {
        // If product is in the list, set its category to this category
        if (productIds.includes(p.id)) {
            p.category = categoryName;
        } else if (p.category === categoryName) {
            // If it was in this category but not in the new list, unset it
            p.category = 'Uncategorized';
        }
    });
    this.saveData(data);
  },
  // SETTINGS
  getSettings: function() { return this.getData().settings || this.resetData(false).settings; },
  saveSettings: function(settings) { let data = this.getData(); data.settings = { ...data.settings, ...settings }; this.saveData(data); },

  // PRODUCTS
  getProducts: function() { const p = this.getData().products; return (p && p.length > 0) ? p : this.normalizeProducts(window.GRADIE_DATA?.products || []); },
  saveProducts: function(products) { let data = this.getData(); data.products = this.normalizeProducts(products); this.saveData(data); },
  getProductById: function(id) { return this.getProducts().find(p => p.id === id); },
  addProduct: function(product) { let data = this.getData(); let norm = this.normalizeProduct(product); if(!norm.id) { norm.id = norm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(); } data.products.push(norm); this.saveData(data); },
  updateProduct: function(id, updatedProduct) { let data = this.getData(); let index = data.products.findIndex(p => p.id === id); if (index !== -1) { let merged = { ...data.products[index], ...updatedProduct }; data.products[index] = this.normalizeProduct(merged); this.saveData(data); } },
  deleteProduct: function(id) { let data = this.getData(); data.products = data.products.filter(p => p.id !== id); this.saveData(data); },
  
  normalizeProduct: function(p) {
    p.id = p.id || ''; p.name = p.name || 'Untitled Product'; p.category = p.category || 'Uncategorized'; p.price = Number(p.price) || 0;
    p.oldPrice = p.oldPrice ? Number(p.oldPrice) : null; p.stock = Number(p.stock) || 0; p.rating = Math.max(0, Math.min(5, Number(p.rating) || 4.8));
    if (!p.gallery || !Array.isArray(p.gallery)) { p.gallery = p.image ? [p.image] : []; }
    p.gallery = p.gallery.filter(img => img && typeof img === 'string' && img.trim() !== '');
    p.gallery = [...new Set(p.gallery)];
    const fallback = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80';
    while(p.gallery.length < 3) p.gallery.push(p.gallery[0] || fallback);
    p.image = p.gallery[0];
    if(!Array.isArray(p.variants)) p.variants = [];
    p.variants.forEach(v => {
      v.name = v.name || v.color || '';
      v.color = v.color || v.name || '';
      v.price = Number(v.price) || p.price;
    });
    if(!Array.isArray(p.tags)) p.tags = []; if(!p.options) p.options = { colors: [], sizes: [], personalization: [] };
    p.isTrending = Boolean(p.isTrending); p.isFeatured = Boolean(p.isFeatured);
    return p;
  },
  normalizeProducts: function(products) { if(!Array.isArray(products)) return []; return products.map(p => this.normalizeProduct(p)); },

  // ORDERS
  getOrders: function() { return this.getData().orders || []; },
  saveOrders: function(orders) { let data = this.getData(); data.orders = orders; this.saveData(data); },
  addOrder: function(order) { let data = this.getData(); if(!data.orders) data.orders = []; data.orders.unshift(order); this.saveData(data); },
  updateOrder: function(id, order) { let data = this.getData(); let i = data.orders.findIndex(o => o.orderNumber === id); if (i !== -1) { data.orders[i] = { ...data.orders[i], ...order }; this.saveData(data); } },
  deleteOrder: function(id) { let data = this.getData(); data.orders = data.orders.filter(o => o.orderNumber !== id); this.saveData(data); },
  
  // BLOG
  getBlogPosts: function() { return this.getData().blogPosts || []; },
  addBlogPost: function(post) { let data = this.getData(); data.blogPosts.push(post); this.saveData(data); },
  updateBlogPost: function(id, post) { let data = this.getData(); let i = data.blogPosts.findIndex(o => o.id === id); if (i !== -1) { data.blogPosts[i] = { ...data.blogPosts[i], ...post }; this.saveData(data); } },
  deleteBlogPost: function(id) { let data = this.getData(); data.blogPosts = data.blogPosts.filter(o => o.id !== id); this.saveData(data); },
  
  // GALLERY
  getGallery: function() { return this.getData().gallery || []; },
  saveGallery: function(gallery) { let data = this.getData(); data.gallery = gallery; this.saveData(data); },
  addGalleryItem: function(item) { let data = this.getData(); data.gallery.push(item); this.saveData(data); },
  updateGalleryItem: function(id, item) { let data = this.getData(); let i = data.gallery.findIndex(o => o.id === id); if(i !== -1) { data.gallery[i] = { ...data.gallery[i], ...item }; this.saveData(data); } },
  deleteGalleryItem: function(id) { let data = this.getData(); data.gallery = data.gallery.filter(o => o.id !== id); this.saveData(data); },
  
  // POLICIES
  getPolicies: function() { return this.getData().policies || []; },
  savePolicies: function(policies) { let data = this.getData(); data.policies = policies; this.saveData(data); },
  addPolicy: function(policy) { let data = this.getData(); data.policies.push(policy); this.saveData(data); },
  updatePolicy: function(id, policy) { let data = this.getData(); let i = data.policies.findIndex(o => o.id === id); if(i !== -1) { data.policies[i] = { ...data.policies[i], ...policy }; this.saveData(data); } },
  deletePolicy: function(id) { let data = this.getData(); data.policies = data.policies.filter(o => o.id !== id); this.saveData(data); },
  
  // CUSTOMIZATION
  getCustomizationOptions: function() { return this.getData().customization || this.resetData(false).customization; },
  saveCustomizationOptions: function(options) { let data = this.getData(); data.customization = options; this.saveData(data); },
  
  exportData: function() { return JSON.stringify(this.getData(), null, 2); },
  importData: function(jsonData) { try { const p = JSON.parse(jsonData); if (p && p.products) { this.saveData(p); return true; } } catch (e) {} return false; }
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.GradieStore) window.GradieStore.init();
});
