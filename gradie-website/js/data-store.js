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
        { name: 'Congratulations Motif', emoji: '✦' },
        { name: 'Classic Romance', emoji: '❦' },
        { name: 'Royal Fleur-de-lis', emoji: '⚜' },
        { name: 'Gradie Monogram', emoji: 'G' }
      ],
      services: [
        {
          title: 'Virtual Sash Designer',
          desc: 'Use our live interactive designer to preview your sash color, select font styles, and see your name beautifully displayed in real-time.',
          img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80',
          btnText: 'Design Now',
          link: 'diy-sash-design.html'
        },
        {
          title: 'Bespoke Embroidery',
          desc: 'Add elegant monogramming, graduation year, or personal messages in metallic gold, silver, or classic black thread embroidery.',
          img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80',
          btnText: 'Learn More',
          link: 'embroidery-services.html'
        },
        {
          title: 'Luxury Gift Wrapping',
          desc: 'Choose premium textured paper wraps, champagne gold ribbons, wax-sealed custom greeting tags, and luxury box packaging.',
          img: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&q=80',
          btnText: 'Explore Wraps',
          link: 'gift-wrapping.html'
        },
        {
          title: 'Precision Engraving',
          desc: 'Personalize metal tumblers and medals with elegant laser engraving. Preview your name in multiple classic fonts.',
          img: 'https://images.unsplash.com/photo-1582210173510-18e31003f901?w=600&q=80',
          btnText: 'Test Engraving',
          link: 'engraving-services.html'
        }
      ]
    };

    if (!data.customization || !data.customization.embroideryColors) {
      data.customization = defaultCustomization;
      updated = true;
    } else {
      // Migrate old emojis to clean luxury symbols if present
      if (data.customization.waxSeals) {
        data.customization.waxSeals.forEach(s => {
          if (s.emoji === '🎓') { s.name = 'Congratulations Motif'; s.emoji = '✦'; updated = true; }
          else if (s.emoji === '❤️') { s.name = 'Classic Romance'; s.emoji = '❦'; updated = true; }
          else if (s.emoji === '🌹') { s.name = 'Royal Fleur-de-lis'; s.emoji = '⚜'; updated = true; }
          else if (s.emoji === '⭐') { s.name = 'Gradie Monogram'; s.emoji = 'G'; updated = true; }
          else if (s.emoji === '✨') { s.name = 'Classic Sparkle'; s.emoji = '✦'; updated = true; }
        });
      }
      if (!data.customization.services) {
        data.customization.services = defaultCustomization.services;
        updated = true;
      }
    }

    // Clean up invalid or undefined gallery items from localStorage
    if (data.gallery) {
      const originalLength = data.gallery.length;
      data.gallery = data.gallery.filter(item => 
        item && 
        typeof item === 'object' && 
        item.id && 
        item.id !== 'undefined' && 
        item.title && 
        item.title !== 'undefined' && 
        item.image && 
        item.image !== 'undefined'
      );
      if (data.gallery.length !== originalLength) {
        updated = true;
      }
    }
    
    if (!data || !data.products || data.products.length === 0 || needsCatalogUpdate) {
      let defaults = this.getDefaultData();
      if (!data) data = defaults;
      data.products = this.normalizeProducts(window.GRADIE_DATA?.products || []);
      updated = true;
    } else {
      data.products = this.normalizeProducts(data.products);
      // Merge any new products added to global-data.js that are missing from localStorage
      // AND update existing products so they get the latest options and gallery images.
      if (window.GRADIE_DATA && window.GRADIE_DATA.products) {
        let hasUpdates = false;
        const globalProducts = window.GRADIE_DATA.products;
        
        globalProducts.forEach(gp => {
          const localIndex = data.products.findIndex(p => p.id === gp.id);
          if (localIndex === -1) {
            data.products.push(gp);
            hasUpdates = true;
          } else {
            // Update the existing product to ensure it has the latest variants and gallery
            if (JSON.stringify(data.products[localIndex].variants) !== JSON.stringify(gp.variants) || 
                JSON.stringify(data.products[localIndex].gallery) !== JSON.stringify(gp.gallery)) {
              data.products[localIndex] = gp;
              hasUpdates = true;
            }
          }
        });
        if (hasUpdates) updated = true;
      }
    }
      
    // Auto-fill mock data if empty (for gallery, blog, orders, policies, users)
    let defaults = this.getDefaultData();
    if (!data.users || data.users.length === 0) { data.users = defaults.users; updated = true; }
    
    // Backfill avatars and address books if missing
    if (data.users && data.users.length > 0) {
      data.users.forEach(u => {
        if (!u.avatar) {
          u.avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
          updated = true;
        }
        if (!u.addresses || !Array.isArray(u.addresses) || u.addresses.length === 0) {
          u.addresses = [
            { id: "addr-gen-" + Math.floor(Math.random()*100000), label: "Default Address", name: u.username || "User", phone: u.phone || "", detail: u.address || u.shippingAddress || "", isDefault: true }
          ];
          updated = true;
        }
      });
    }

    if (!data.orders || data.orders.length === 0 || data.orders.some(o => !o.customerEmail)) { data.orders = defaults.orders; updated = true; }
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
      users: [
        {
          id: 'u-1',
          username: "Nhi Huynh",
          email: "nhi@gradie.com",
          password: "password123",
          phone: "0901234567",
          address: "123 Le Loi, District 1, HCMC",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
          addresses: [
            { id: "addr-1-1", label: "Home", name: "Nhi Huynh", phone: "0901234567", detail: "123 Le Loi, District 1, HCMC", isDefault: true },
            { id: "addr-1-2", label: "Office", name: "Huynh Thao Nhi", phone: "0909998887", detail: "Tower A, 88 Dong Khoi, District 1, HCMC", isDefault: false }
          ]
        },
        {
          id: 'u-2',
          username: "Alex Mercer",
          email: "alex@gradie.com",
          password: "password123",
          phone: "0987654321",
          address: "456 Nguyen Hue, District 1, HCMC",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
          addresses: [
            { id: "addr-2-1", label: "Apartment", name: "Alex Mercer", phone: "0987654321", detail: "Room 405, 456 Nguyen Hue, District 1, HCMC", isDefault: true }
          ]
        },
        {
          id: 'u-3',
          username: "Helena Rostova",
          email: "helena@gradie.com",
          password: "password123",
          phone: "0912345678",
          address: "789 Dong Khoi, District 1, HCMC",
          avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
          addresses: [
            { id: "addr-3-1", label: "Home Villa", name: "Helena Rostova", phone: "0912345678", detail: "789 Dong Khoi, District 1, HCMC", isDefault: true }
          ]
        }
      ],
      orders: [
        {
          orderNumber: "GRD-26-9821",
          customerName: "Nhi Huynh",
          customerEmail: "nhi@gradie.com",
          customerPhone: "0901234567",
          shippingAddress: "123 Le Loi, District 1, HCMC",
          notes: "Giao giờ hành chính, gọi trước khi giao 15p",
          paymentMethod: "COD",
          date: "30/05/2026 14:30:15",
          items: [
            { id: "gau-bong-teddy", name: "Gấu Bông Tốt Nghiệp Teddy", quantity: 1, price: 250000, customization: { embroideryText: "Nhi Huynh", threadColor: "Champagne Gold" } },
            { id: "hoa-huong-duong", name: "Hoa Hướng Dương Tốt Nghiệp", quantity: 1, price: 120000, customization: null }
          ],
          subtotal: 370000,
          shippingFee: 30000,
          total: 400000,
          status: "Delivered"
        },
        {
          orderNumber: "GRD-26-4412",
          customerName: "Alex Mercer",
          customerEmail: "alex@gradie.com",
          customerPhone: "0987654321",
          shippingAddress: "456 Nguyen Hue, District 1, HCMC",
          notes: "Xin hãy gói kỹ giúp mình, làm quà tặng bạn thân",
          paymentMethod: "COD",
          date: "31/05/2026 08:15:22",
          items: [
            { id: "scrapbook-ky-niem", name: "Scrapbook Kỷ Niệm Graduation", quantity: 1, price: 380000, customization: { boxColor: "Signature Cream", ribbonColor: "Champagne Gold", waxSeal: "Gradie Monogram" } }
          ],
          subtotal: 380000,
          shippingFee: 30000,
          total: 410000,
          status: "Shipped"
        },
        {
          orderNumber: "GRD-26-7731",
          customerName: "Helena Rostova",
          customerEmail: "helena@gradie.com",
          customerPhone: "0912345678",
          shippingAddress: "789 Dong Khoi, District 1, HCMC",
          notes: "Giao cổng sau tòa nhà",
          paymentMethod: "COD",
          date: "31/05/2026 10:05:00",
          items: [
            { id: "huy-chuong-danh-du", name: "Huy Chương Tốt Nghiệp Danh Dự", quantity: 1, price: 180000, customization: null }
          ],
          subtotal: 180000,
          shippingFee: 30000,
          total: 210000,
          status: "Pending"
        }
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
          { name: 'Congratulations Motif', emoji: '✦' },
          { name: 'Classic Romance', emoji: '❦' },
          { name: 'Royal Fleur-de-lis', emoji: '⚜' },
          { name: 'Gradie Monogram', emoji: 'G' }
        ],
        services: [
          {
            title: 'Virtual Sash Designer',
            desc: 'Use our live interactive designer to preview your sash color, select font styles, and see your name beautifully displayed in real-time.',
            img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80',
            btnText: 'Design Now',
            link: 'diy-sash-design.html'
          },
          {
            title: 'Bespoke Embroidery',
            desc: 'Add elegant monogramming, graduation year, or personal messages in metallic gold, silver, or classic black thread embroidery.',
            img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80',
            btnText: 'Learn More',
            link: 'embroidery-services.html'
          },
          {
            title: 'Luxury Gift Wrapping',
            desc: 'Choose premium textured paper wraps, champagne gold ribbons, wax-sealed custom greeting tags, and luxury box packaging.',
            img: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&q=80',
            btnText: 'Explore Wraps',
            link: 'gift-wrapping.html'
          },
          {
            title: 'Precision Engraving',
            desc: 'Personalize metal tumblers and medals with elegant laser engraving. Preview your name in multiple classic fonts.',
            img: 'https://images.unsplash.com/photo-1582210173510-18e31003f901?w=600&q=80',
            btnText: 'Test Engraving',
            link: 'engraving-services.html'
          }
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
  saveSettings: function(settings) { let data = this.getData(); data.settings = { ...data.settings, ...settings }; this.saveData(data); fetch('/api/global', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'settings', data: data.settings }) }).catch(e => console.error('Sync error', e)); },

  // PRODUCTS
  getProducts: function() { const p = this.getData().products; return (p && p.length > 0) ? p : this.normalizeProducts(window.GRADIE_DATA?.products || []); },
  saveProducts: function(products) { let data = this.getData(); data.products = this.normalizeProducts(products); this.saveData(data); },
  getProductById: function(id) { return this.getProducts().find(p => p.id === id); },
  addProduct: function(product) { let data = this.getData(); let norm = this.normalizeProduct(product); if(!norm.id) { norm.id = norm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(); } data.products.push(norm); this.saveData(data); fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(norm) }).catch(e => console.error('Sync error', e)); },
  updateProduct: function(id, updatedProduct) { let data = this.getData(); let index = data.products.findIndex(p => p.id === id); if (index !== -1) { let merged = { ...data.products[index], ...updatedProduct }; data.products[index] = this.normalizeProduct(merged); this.saveData(data); fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data.products[index]) }).catch(e => console.error('Sync error', e)); } },
  deleteProduct: function(id) { let data = this.getData(); data.products = data.products.filter(p => p.id !== id); this.saveData(data); fetch('/api/products?id=' + id, { method: 'DELETE' }).catch(e => console.error('Sync error', e)); },
  
  normalizeProduct: function(p) {
    p.id = p.id || ''; p.name = p.name || 'Untitled Product'; p.category = p.category || 'Uncategorized'; p.price = Number(p.price) || 0;
    p.oldPrice = p.oldPrice ? Number(p.oldPrice) : null; p.stock = Number(p.stock) || 0; p.rating = Math.max(0, Math.min(5, Number(p.rating) || 4.8));
    if (!p.gallery || !Array.isArray(p.gallery)) { p.gallery = p.image ? [p.image] : []; }
    p.gallery = p.gallery.filter(img => img && typeof img === 'string' && img.trim() !== '');
    p.gallery = [...new Set(p.gallery)];
    const fallback = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80';
    if (p.gallery.length === 0) p.gallery.push(fallback);
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
  addOrder: function(order) { let data = this.getData(); if(!data.orders) data.orders = []; data.orders.unshift(order); this.saveData(data); fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) }).catch(e => console.error('Sync error', e)); },
  updateOrder: function(id, order) { let data = this.getData(); let i = data.orders.findIndex(o => o.orderNumber === id); if (i !== -1) { data.orders[i] = { ...data.orders[i], ...order }; this.saveData(data); fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data.orders[i]) }).catch(e => console.error('Sync error', e)); } },
  deleteOrder: function(id) { let data = this.getData(); data.orders = data.orders.filter(o => o.orderNumber !== id); this.saveData(data); /* Missing delete api, but usually handled by status 'Cancelled' in updateOrder */ },
  
  // BLOG
  getBlogPosts: function() { return this.getData().blogPosts || []; },
  addBlogPost: function(post) { let data = this.getData(); data.blogPosts.push(post); this.saveData(data); fetch('/api/global', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'blogPosts', data: data.blogPosts }) }).catch(e => console.error('Sync error', e)); },
  updateBlogPost: function(id, post) { let data = this.getData(); let i = data.blogPosts.findIndex(o => (o.id === id || o._id === id || o._id?.toString() === id)); if (i !== -1) { data.blogPosts[i] = { ...data.blogPosts[i], ...post }; this.saveData(data); fetch('/api/global', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'blogPosts', data: data.blogPosts }) }).catch(e => console.error('Sync error', e)); } },
  deleteBlogPost: function(id) { let data = this.getData(); data.blogPosts = data.blogPosts.filter(o => (o.id !== id && o._id !== id && o._id?.toString() !== id)); this.saveData(data); fetch('/api/global', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'blogPosts', data: data.blogPosts }) }).catch(e => console.error('Sync error', e)); },
  
  // GALLERY
  getGallery: function() { const d = this.getData(); return (d && d.gallery) ? d.gallery : []; },
  saveGallery: function(gallery) { let data = this.getData(); data.gallery = gallery || []; this.saveData(data); },
  addGalleryItem: function(item) { let data = this.getData(); if(!data.gallery) data.gallery = []; data.gallery.push(item); this.saveData(data); fetch('/api/global', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'gallery', data: data.gallery }) }).catch(e => console.error('Sync error', e)); },
  updateGalleryItem: function(id, item) { let data = this.getData(); if(!data.gallery) data.gallery = []; let i = data.gallery.findIndex(o => (o.id === id || o._id === id || o._id?.toString() === id)); if(i !== -1) { data.gallery[i] = { ...data.gallery[i], ...item }; this.saveData(data); fetch('/api/global', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'gallery', data: data.gallery }) }).catch(e => console.error('Sync error', e)); } },
  deleteGalleryItem: function(id) { let data = this.getData(); if(!data.gallery) data.gallery = []; data.gallery = data.gallery.filter(o => (o.id !== id && o._id !== id && o._id?.toString() !== id)); this.saveData(data); fetch('/api/global', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'gallery', data: data.gallery }) }).catch(e => console.error('Sync error', e)); },
  
  // POLICIES
  getPolicies: function() { return this.getData().policies || []; },
  savePolicies: function(policies) { let data = this.getData(); data.policies = policies; this.saveData(data); },
  addPolicy: function(policy) { let data = this.getData(); data.policies.push(policy); this.saveData(data); },
  updatePolicy: function(id, policy) { let data = this.getData(); let i = data.policies.findIndex(o => (o.id === id || o._id === id || o._id?.toString() === id)); if(i !== -1) { data.policies[i] = { ...data.policies[i], ...policy }; this.saveData(data); } },
  deletePolicy: function(id) { let data = this.getData(); data.policies = data.policies.filter(o => (o.id !== id && o._id !== id && o._id?.toString() !== id)); this.saveData(data); },
  
  // CUSTOMIZATION
  getCustomizationOptions: function() { 
    const defaultCust = this.resetData(false).customization;
    let storedCust = this.getData().customization;
    if (storedCust && storedCust.services && storedCust.services.length < 4) {
      storedCust.services = defaultCust.services;
      this.saveCustomizationOptions(storedCust);
    }
    return storedCust || defaultCust; 
  },
  saveCustomizationOptions: function(options) { let data = this.getData(); data.customization = options; this.saveData(data); fetch('/api/global', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'customization', data: options }) }).catch(e => console.error('Sync error', e)); },
  
  // USER AUTHENTICATION & SESSIONS
  getUsers: function() { return this.getData().users || []; },
  registerUser: function(username, email, password, phone = '') {
    let data = this.getData();
    if (!data.users) data.users = [];
    if (data.users.some(u => u.email.toLowerCase() === email.toLowerCase())) return { success: false, message: "Email is already registered." };
    const newUser = { 
      id: 'u-' + Date.now(), 
      username, 
      email: email.toLowerCase(), 
      password,
      phone: phone,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      addresses: []
    };
    if (phone) {
      newUser.addresses.push({
        id: "addr-gen-" + Date.now(),
        label: "Default Address",
        name: username,
        phone: phone,
        detail: "",
        isDefault: true
      });
    }
    data.users.push(newUser);
    this.saveData(data);
    this.setCurrentUser(newUser);
    fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) }).catch(e => console.error('Sync error', e));
    return { success: true, user: newUser };
  },
  loginUser: function(email, password) {
    const user = this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      this.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: "Invalid email or password." };
  },
  logoutUser: function() {
    this.setCurrentUser(null);
  },

  syncWithDB: async function() {
    try {
      const fetchSafe = async (url) => {
        try {
          const res = await fetch(url);
          return res.ok ? res : null;
        } catch (e) {
          console.warn(`Fetch to ${url} failed`, e);
          return null;
        }
      };

      const [resProducts, resGlobal, resUsers] = await Promise.all([
        fetchSafe('/api/products'),
        fetchSafe('/api/global'),
        fetchSafe('/api/users')
      ]);
      
      let data = this.getData();
      let updated = false;

      if (resProducts) {
        const products = await resProducts.json().catch(() => null);
        if (products && products.length > 0) {
          data.products = this.normalizeProducts(products);
          updated = true;
        }
      }

      if (resGlobal) {
        const globalData = await resGlobal.json().catch(() => null);
        if (globalData) {
          if (globalData.categories && globalData.categories.length > 0) data.categories = globalData.categories;
          if (globalData.customization && Object.keys(globalData.customization).length > 0) data.customization = globalData.customization;
          if (globalData.gallery && globalData.gallery.length > 0) data.gallery = globalData.gallery;
          if (globalData.blogPosts && globalData.blogPosts.length > 0) data.blogPosts = globalData.blogPosts;
          if (globalData.settings && Object.keys(globalData.settings).length > 0) data.settings = globalData.settings;
          updated = true;
        }
      }

      if (resUsers) {
        const users = await resUsers.json().catch(() => null);
        if (users && users.length > 0) {
          if (!data.users) data.users = [];
          
          // Merge users from DB, keeping local ones and avoiding duplicates by email
          users.forEach(dbUser => {
            const index = data.users.findIndex(u => u.email.toLowerCase() === dbUser.email.toLowerCase());
            if (index === -1) {
              data.users.push(dbUser);
              updated = true;
            } else {
              // Update details if they changed in the DB
              const localUser = data.users[index];
              if (localUser.username !== dbUser.username || 
                  localUser.password !== dbUser.password || 
                  localUser.phone !== dbUser.phone || 
                  localUser.address !== dbUser.address || 
                  JSON.stringify(localUser.addresses) !== JSON.stringify(dbUser.addresses)) {
                data.users[index] = { ...localUser, ...dbUser };
                updated = true;
              }
            }
          });
        }
      }

      if (updated) {
        this.saveData(data);
      }
    } catch (e) {
      console.warn('API sync failed. Falling back to local storage.', e);
    }
  },
  getCurrentUser: function() {
    try {
      const sess = localStorage.getItem('GRADIE_USER_SESSION');
      return sess ? JSON.parse(sess) : null;
    } catch(e) { return null; }
  },
  setCurrentUser: function(user) {
    localStorage.setItem('GRADIE_USER_SESSION', JSON.stringify(user));
  },
  logoutUser: function() {
    localStorage.removeItem('GRADIE_USER_SESSION');
  },
  updateUserProfile: function(email, updatedData) {
    let data = this.getData();
    if (!data.users) data.users = [];
    let index = data.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
      data.users[index] = { ...data.users[index], ...updatedData };
      this.saveData(data);
      this.setCurrentUser(data.users[index]);
      
      // Sync profile updates (including phone and addresses) to MongoDB Atlas!
      fetch('/api/users', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data.users[index]) 
      }).catch(e => console.error('Sync error', e));

      return { success: true, user: data.users[index] };
    }
    return { success: false, message: "User not found." };
  },

  // STOCK MANIPULATION
  deductStock: function(productId, quantity) {
    let data = this.getData();
    if (!data.products) return;
    let index = data.products.findIndex(p => p.id === productId);
    if (index !== -1) {
      data.products[index].stock = Math.max(0, (data.products[index].stock || 0) - quantity);
      this.saveData(data);
    }
  },
  
  exportData: function() { return JSON.stringify(this.getData(), null, 2); },
  importData: function(jsonData) { try { const p = JSON.parse(jsonData); if (p && p.products) { this.saveData(p); return true; } } catch (e) {} return false; }
};

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem(window.GradieStore.storageKey)) {
    window.GradieStore.resetData();
  }
  if (window.GradieStore) {
    window.GradieStore.init();
    if (window.GradieStore.syncWithDB) {
      window.GradieStore.syncWithDB();
    }
  }
});
