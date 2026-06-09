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
    
    if (!data.categories || data.categories.length === 0) {
      const correctCategories = ["Graduation Gifts", "Scrapbook", "Đồ tốt nghiệp", "Gấu Bông", "Gấu bông", "Khung ảnh", "Đèn Ngủ", "Kẹo", "Huy Chương", "Sổ kế hoạch", "Hoa mừng"];
      data.categories = correctCategories.map(c => ({ id: c.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: c, slug: c.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
      updated = true;
    }

    if (data.settings) {
      if (!data.settings.announcement || 
          data.settings.announcement.includes("của cô ấy") || 
          data.settings.announcement.includes("Celebrate her next") ||
          data.settings.announcement.includes("Grand Opening")) {
        data.settings.announcement = "Khai Trương Hồng Phát • Tặng thẻ quà miễn phí cho mỗi đơn hàng • Kỷ niệm hành trình mới";
        updated = true;
      }
    }

    // Force update mock data if missing
    let defaultData = this.getDefaultData();
    if (!data.users || data.users.length < 10) {
      data.users = defaultData.users;
      updated = true;
    }
    const oldFakeIds = ['gau-bong-teddy', 'hoa-huong-duong', 'scrapbook-ky-niem', 'huy-chuong-danh-du', 'khung-anh-a4'];
    const hasOldFakeIds = data.orders && data.orders.some(o => o.items && o.items.some(i => oldFakeIds.includes(i.id)));
    if (!data.orders || data.orders.length === 0 || hasOldFakeIds) {
      data.orders = defaultData.orders;
      updated = true;
    }
    if (!data.staff || data.staff.length < 5) {
      data.staff = defaultData.staff;
      updated = true;
    }
    if (!data.blogPosts || data.blogPosts.length === 0) {
      data.blogPosts = defaultData.blogPosts;
      updated = true;
    }
    if (!data.gallery || data.gallery.length === 0) {
      data.gallery = defaultData.gallery;
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
      
    // Auto-fill mock data if empty (for gallery, blog, orders, policies, users, staff, activityLogs)
    let defaults = this.getDefaultData();
    if (!data.users || data.users.length === 0) { data.users = defaults.users; updated = true; }
    if (!data.staff || data.staff.length === 0) { data.staff = defaults.staff; updated = true; }
    if (!data.activityLogs || data.activityLogs.length === 0) { data.activityLogs = defaults.activityLogs; updated = true; }
    
    // Backfill avatars and address books if missing
    if (data.users && data.users.length > 0) {
      data.users.forEach(u => {
        if (!u.avatar) {
          u.avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
          updated = true;
        }
        if (!u.addresses || !Array.isArray(u.addresses) || u.addresses.length === 0) {
          const detail = u.address || u.shippingAddress || "";
          if (detail.trim()) {
            u.addresses = [
              { id: "addr-gen-" + Math.floor(Math.random()*100000), label: "Default Address", name: u.username || "User", phone: u.phone || "", detail: detail, isDefault: true }
            ];
            updated = true;
          } else {
            u.addresses = [];
            updated = true;
          }
        }
      });
    }

    if (!data.orders || data.orders.length === 0) { data.orders = defaults.orders; updated = true; }
    // Backfill missing customerEmail without wiping all orders
    else if (data.orders.some(o => !o.customerEmail)) {
      data.orders.forEach(o => { if (!o.customerEmail) o.customerEmail = ''; });
      updated = true;
    }
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
        announcement: "Khai Trương Hồng Phát • Tặng thẻ quà miễn phí cho mỗi đơn hàng • Kỷ niệm hành trình mới",
        promoCode: "GRAD2026", promoDiscount: 50000
      },
      products: this.normalizeProducts(window.GRADIE_DATA?.products || []),
      users: [
              {
                      "id": "u-1",
                      "username": "Khách hàng 1",
                      "email": "user1@example.com",
                      "password": "password123",
                      "phone": "0900000001",
                      "address": "1 Đường Số 1, Quận 1, TP.HCM",
                      "avatar": "https://i.pravatar.cc/150?u=1",
                      "addresses": [
                              {
                                      "id": "addr-1-1",
                                      "label": "Home",
                                      "name": "Khách hàng 1",
                                      "phone": "0900000001",
                                      "detail": "1 Đường Số 1, Quận 1, TP.HCM",
                                      "isDefault": true
                              }
                      ]
              },
              {
                      "id": "u-2",
                      "username": "Khách hàng 2",
                      "email": "user2@example.com",
                      "password": "password123",
                      "phone": "0900000002",
                      "address": "2 Đường Số 2, Quận 1, TP.HCM",
                      "avatar": "https://i.pravatar.cc/150?u=2",
                      "addresses": [
                              {
                                      "id": "addr-2-1",
                                      "label": "Home",
                                      "name": "Khách hàng 2",
                                      "phone": "0900000002",
                                      "detail": "2 Đường Số 2, Quận 1, TP.HCM",
                                      "isDefault": true
                              }
                      ]
              },
              {
                      "id": "u-3",
                      "username": "Khách hàng 3",
                      "email": "user3@example.com",
                      "password": "password123",
                      "phone": "0900000003",
                      "address": "3 Đường Số 3, Quận 1, TP.HCM",
                      "avatar": "https://i.pravatar.cc/150?u=3",
                      "addresses": [
                              {
                                      "id": "addr-3-1",
                                      "label": "Home",
                                      "name": "Khách hàng 3",
                                      "phone": "0900000003",
                                      "detail": "3 Đường Số 3, Quận 1, TP.HCM",
                                      "isDefault": true
                              }
                      ]
              },
              {
                      "id": "u-4",
                      "username": "Khách hàng 4",
                      "email": "user4@example.com",
                      "password": "password123",
                      "phone": "0900000004",
                      "address": "4 Đường Số 4, Quận 1, TP.HCM",
                      "avatar": "https://i.pravatar.cc/150?u=4",
                      "addresses": [
                              {
                                      "id": "addr-4-1",
                                      "label": "Home",
                                      "name": "Khách hàng 4",
                                      "phone": "0900000004",
                                      "detail": "4 Đường Số 4, Quận 1, TP.HCM",
                                      "isDefault": true
                              }
                      ]
              },
              {
                      "id": "u-5",
                      "username": "Khách hàng 5",
                      "email": "user5@example.com",
                      "password": "password123",
                      "phone": "0900000005",
                      "address": "5 Đường Số 5, Quận 1, TP.HCM",
                      "avatar": "https://i.pravatar.cc/150?u=5",
                      "addresses": [
                              {
                                      "id": "addr-5-1",
                                      "label": "Home",
                                      "name": "Khách hàng 5",
                                      "phone": "0900000005",
                                      "detail": "5 Đường Số 5, Quận 1, TP.HCM",
                                      "isDefault": true
                              }
                      ]
              },
              {
                      "id": "u-6",
                      "username": "Khách hàng 6",
                      "email": "user6@example.com",
                      "password": "password123",
                      "phone": "0900000006",
                      "address": "6 Đường Số 6, Quận 1, TP.HCM",
                      "avatar": "https://i.pravatar.cc/150?u=6",
                      "addresses": [
                              {
                                      "id": "addr-6-1",
                                      "label": "Home",
                                      "name": "Khách hàng 6",
                                      "phone": "0900000006",
                                      "detail": "6 Đường Số 6, Quận 1, TP.HCM",
                                      "isDefault": true
                              }
                      ]
              },
              {
                      "id": "u-7",
                      "username": "Khách hàng 7",
                      "email": "user7@example.com",
                      "password": "password123",
                      "phone": "0900000007",
                      "address": "7 Đường Số 7, Quận 1, TP.HCM",
                      "avatar": "https://i.pravatar.cc/150?u=7",
                      "addresses": [
                              {
                                      "id": "addr-7-1",
                                      "label": "Home",
                                      "name": "Khách hàng 7",
                                      "phone": "0900000007",
                                      "detail": "7 Đường Số 7, Quận 1, TP.HCM",
                                      "isDefault": true
                              }
                      ]
              },
              {
                      "id": "u-8",
                      "username": "Khách hàng 8",
                      "email": "user8@example.com",
                      "password": "password123",
                      "phone": "0900000008",
                      "address": "8 Đường Số 8, Quận 1, TP.HCM",
                      "avatar": "https://i.pravatar.cc/150?u=8",
                      "addresses": [
                              {
                                      "id": "addr-8-1",
                                      "label": "Home",
                                      "name": "Khách hàng 8",
                                      "phone": "0900000008",
                                      "detail": "8 Đường Số 8, Quận 1, TP.HCM",
                                      "isDefault": true
                              }
                      ]
              },
              {
                      "id": "u-9",
                      "username": "Khách hàng 9",
                      "email": "user9@example.com",
                      "password": "password123",
                      "phone": "0900000009",
                      "address": "9 Đường Số 9, Quận 1, TP.HCM",
                      "avatar": "https://i.pravatar.cc/150?u=9",
                      "addresses": [
                              {
                                      "id": "addr-9-1",
                                      "label": "Home",
                                      "name": "Khách hàng 9",
                                      "phone": "0900000009",
                                      "detail": "9 Đường Số 9, Quận 1, TP.HCM",
                                      "isDefault": true
                              }
                      ]
              },
              {
                      "id": "u-10",
                      "username": "Khách hàng 10",
                      "email": "user10@example.com",
                      "password": "password123",
                      "phone": "09000000010",
                      "address": "10 Đường Số 10, Quận 1, TP.HCM",
                      "avatar": "https://i.pravatar.cc/150?u=10",
                      "addresses": [
                              {
                                      "id": "addr-10-1",
                                      "label": "Home",
                                      "name": "Khách hàng 10",
                                      "phone": "09000000010",
                                      "detail": "10 Đường Số 10, Quận 1, TP.HCM",
                                      "isDefault": true
                              }
                      ]
              }
      ],
      orders: [
              {
                      "orderNumber": "GRD-26-1001",
                      "customerName": "Khách hàng 4",
                      "customerEmail": "user4@example.com",
                      "customerPhone": "0900000004",
                      "shippingAddress": "4 Đường Số 4, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "09/05/2026 22:16:00",
                      "items": [
                              {
                                      "id": "sen_da_va_gau",
                                      "name": "Bó Hoa Mini Kèm Gấu Tốt Nghiệp",
                                      "quantity": 2,
                                      "price": 79000,
                                      "customization": null
                              },
                              {
                                      "id": "khung_anh_3d_totnghiep",
                                      "name": "Khung Ảnh Tốt Nghiệp",
                                      "quantity": 1,
                                      "price": 139000,
                                      "customization": null
                              },
                              {
                                      "id": "keo_mut_trai_tim",
                                      "name": "Túi Kẹo Lớn Hình Trái Tim",
                                      "quantity": 1,
                                      "price": 89000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 386000,
                      "shippingFee": 30000,
                      "total": 416000,
                      "status": "Processing"
              },
              {
                      "orderNumber": "GRD-26-1002",
                      "customerName": "Khách hàng 8",
                      "customerEmail": "user8@example.com",
                      "customerPhone": "0900000008",
                      "shippingAddress": "8 Đường Số 8, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "20/05/2026 19:39:00",
                      "items": [
                              {
                                      "id": "so-tay-a5-vintage",
                                      "name": "Sổ Tay A5 Vintage",
                                      "quantity": 2,
                                      "price": 60000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 120000,
                      "shippingFee": 30000,
                      "total": 150000,
                      "status": "Completed"
              },
              {
                      "orderNumber": "GRD-26-1003",
                      "customerName": "Khách hàng 7",
                      "customerEmail": "user7@example.com",
                      "customerPhone": "0900000007",
                      "shippingAddress": "7 Đường Số 7, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "03/06/2026 03:25:00",
                      "items": [
                              {
                                      "id": "lich_tot_nghiep",
                                      "name": "Lịch Tốt Nghiệp",
                                      "quantity": 1,
                                      "price": 69000,
                                      "customization": null
                              },
                              {
                                      "id": "khung_anh_ghep_do_tot_nghiep",
                                      "name": "Khung Ảnh Tốt Nghiệp Chibi",
                                      "quantity": 2,
                                      "price": 64000,
                                      "customization": null
                              },
                              {
                                      "id": "tui-tote-nu-vai-canvas",
                                      "name": "Túi tote nữ vải canvas",
                                      "quantity": 1,
                                      "price": 65000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 262000,
                      "shippingFee": 30000,
                      "total": 292000,
                      "status": "Delivered"
              },
              {
                      "orderNumber": "GRD-26-1004",
                      "customerName": "Khách hàng 8",
                      "customerEmail": "user8@example.com",
                      "customerPhone": "0900000008",
                      "shippingAddress": "8 Đường Số 8, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "28/05/2026 21:26:00",
                      "items": [
                              {
                                      "id": "huy_chuong_moc_khoa",
                                      "name": "Huy Chương Tốt Nghiệp",
                                      "quantity": 2,
                                      "price": 89000,
                                      "customization": null
                              },
                              {
                                      "id": "vi-mini-khoa-keo",
                                      "name": "Ví mini 2 khoá kéo",
                                      "quantity": 2,
                                      "price": 45000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 268000,
                      "shippingFee": 30000,
                      "total": 298000,
                      "status": "Completed"
              },
              {
                      "orderNumber": "GRD-26-1005",
                      "customerName": "Khách hàng 2",
                      "customerEmail": "user2@example.com",
                      "customerPhone": "0900000002",
                      "shippingAddress": "2 Đường Số 2, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "26/05/2026 13:32:00",
                      "items": [
                              {
                                      "id": "vi-nam-canvas",
                                      "name": "Ví nam dáng đứng vải canvas",
                                      "quantity": 2,
                                      "price": 60000,
                                      "customization": null
                              },
                              {
                                      "id": "gau_bong_tot_nghiep",
                                      "name": "Gấu Bông Capybara Tốt Nghiệp",
                                      "quantity": 2,
                                      "price": 115000,
                                      "customization": null
                              },
                              {
                                      "id": "hop_keo_mu_bac_si",
                                      "name": "Hộp Quà Tốt Nghiệp Hình Mũ Cử Nhân",
                                      "quantity": 1,
                                      "price": 79000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 429000,
                      "shippingFee": 30000,
                      "total": 459000,
                      "status": "Completed"
              },
              {
                      "orderNumber": "GRD-26-1006",
                      "customerName": "Khách hàng 6",
                      "customerEmail": "user6@example.com",
                      "customerPhone": "0900000006",
                      "shippingAddress": "6 Đường Số 6, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "08/06/2026 18:30:00",
                      "items": [
                              {
                                      "id": "den_ngu_silicon",
                                      "name": "Đèn LED Thú Dễ Thương",
                                      "quantity": 1,
                                      "price": 109000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 109000,
                      "shippingFee": 30000,
                      "total": 139000,
                      "status": "Confirmed"
              },
              {
                      "orderNumber": "GRD-26-1007",
                      "customerName": "Khách hàng 2",
                      "customerEmail": "user2@example.com",
                      "customerPhone": "0900000002",
                      "shippingAddress": "2 Đường Số 2, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "21/05/2026 03:26:00",
                      "items": [
                              {
                                      "id": "coc-giu-nhiet",
                                      "name": "LY giữ nhiệt hoa lá cành",
                                      "quantity": 2,
                                      "price": 99000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 198000,
                      "shippingFee": 30000,
                      "total": 228000,
                      "status": "Completed"
              },
              {
                      "orderNumber": "GRD-26-1008",
                      "customerName": "Khách hàng 6",
                      "customerEmail": "user6@example.com",
                      "customerPhone": "0900000006",
                      "shippingAddress": "6 Đường Số 6, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "12/05/2026 06:42:00",
                      "items": [
                              {
                                      "id": "vi-gap-in-hinh",
                                      "name": "Ví Gập được in hình mèo con",
                                      "quantity": 2,
                                      "price": 45000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 90000,
                      "shippingFee": 30000,
                      "total": 120000,
                      "status": "Confirmed"
              },
              {
                      "orderNumber": "GRD-26-1009",
                      "customerName": "Khách hàng 9",
                      "customerEmail": "user9@example.com",
                      "customerPhone": "0900000009",
                      "shippingAddress": "9 Đường Số 9, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "22/05/2026 19:48:00",
                      "items": [
                              {
                                      "id": "nen-thom-hoa-kho",
                                      "name": "Nến Thơm Trang Trí Hoa Khô",
                                      "quantity": 1,
                                      "price": 119000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 119000,
                      "shippingFee": 30000,
                      "total": 149000,
                      "status": "Completed"
              },
              {
                      "orderNumber": "GRD-26-1010",
                      "customerName": "Khách hàng 6",
                      "customerEmail": "user6@example.com",
                      "customerPhone": "0900000006",
                      "shippingAddress": "6 Đường Số 6, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "12/05/2026 02:28:00",
                      "items": [
                              {
                                      "id": "non_tot_nghiep_hoa_lua",
                                      "name": "Mũ Cử Nhân Trang Trí Hoa Lụa",
                                      "quantity": 1,
                                      "price": 189000,
                                      "customization": null
                              },
                              {
                                      "id": "den_ngu_gau_tot_nghiep",
                                      "name": "Hộp Tuyết Thủy Tinh",
                                      "quantity": 2,
                                      "price": 159000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 507000,
                      "shippingFee": 30000,
                      "total": 537000,
                      "status": "Shipped"
              },
              {
                      "orderNumber": "GRD-26-1011",
                      "customerName": "Khách hàng 7",
                      "customerEmail": "user7@example.com",
                      "customerPhone": "0900000007",
                      "shippingAddress": "7 Đường Số 7, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "26/05/2026 09:44:00",
                      "items": [
                              {
                                      "id": "binh_pha-ca-phe-cold-brew",
                                      "name": "Bình Pha Cà Phê Cold Brew 1400ml",
                                      "quantity": 2,
                                      "price": 239000,
                                      "customization": null
                              },
                              {
                                      "id": "khung_anh_mica_de_",
                                      "name": "Mô Hình Tốt Nghiệp",
                                      "quantity": 1,
                                      "price": 259000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 737000,
                      "shippingFee": 30000,
                      "total": 767000,
                      "status": "Pending"
              },
              {
                      "orderNumber": "GRD-26-1012",
                      "customerName": "Khách hàng 9",
                      "customerEmail": "user9@example.com",
                      "customerPhone": "0900000009",
                      "shippingAddress": "9 Đường Số 9, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "28/05/2026 02:23:00",
                      "items": [
                              {
                                      "id": "keo_mut_trai_tim",
                                      "name": "Túi Kẹo Lớn Hình Trái Tim",
                                      "quantity": 1,
                                      "price": 89000,
                                      "customization": null
                              },
                              {
                                      "id": "so-tay-bia-cung",
                                      "name": "Sổ tay dot grid",
                                      "quantity": 2,
                                      "price": 79000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 247000,
                      "shippingFee": 30000,
                      "total": 277000,
                      "status": "Completed"
              },
              {
                      "orderNumber": "GRD-26-1013",
                      "customerName": "Khách hàng 1",
                      "customerEmail": "user1@example.com",
                      "customerPhone": "0900000001",
                      "shippingAddress": "1 Đường Số 1, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "20/05/2026 18:47:00",
                      "items": [
                              {
                                      "id": "balo-da-en",
                                      "name": "Balo mini thời trang DA ÉN",
                                      "quantity": 2,
                                      "price": 69000,
                                      "customization": null
                              },
                              {
                                      "id": "tui-toe-cong-so",
                                      "name": "Túi tote túi công sở",
                                      "quantity": 1,
                                      "price": 85000,
                                      "customization": null
                              },
                              {
                                      "id": "vi-mini-khoa-keo",
                                      "name": "Ví mini 2 khoá kéo",
                                      "quantity": 2,
                                      "price": 45000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 313000,
                      "shippingFee": 30000,
                      "total": 343000,
                      "status": "Pending"
              },
              {
                      "orderNumber": "GRD-26-1014",
                      "customerName": "Khách hàng 7",
                      "customerEmail": "user7@example.com",
                      "customerPhone": "0900000007",
                      "shippingAddress": "7 Đường Số 7, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "13/05/2026 10:45:00",
                      "items": [
                              {
                                      "id": "gau_bong_tot_nghiep",
                                      "name": "Gấu Bông Capybara Tốt Nghiệp",
                                      "quantity": 1,
                                      "price": 115000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 115000,
                      "shippingFee": 30000,
                      "total": 145000,
                      "status": "Cancelled"
              },
              {
                      "orderNumber": "GRD-26-1015",
                      "customerName": "Khách hàng 2",
                      "customerEmail": "user2@example.com",
                      "customerPhone": "0900000002",
                      "shippingAddress": "2 Đường Số 2, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "18/05/2026 19:00:00",
                      "items": [
                              {
                                      "id": "balo-da-en",
                                      "name": "Balo mini thời trang DA ÉN",
                                      "quantity": 2,
                                      "price": 69000,
                                      "customization": null
                              },
                              {
                                      "id": "bo_hoa_bong_bong",
                                      "name": "Bó Hoa Bóng Bay Tốt Nghiệp",
                                      "quantity": 2,
                                      "price": 359000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 856000,
                      "shippingFee": 30000,
                      "total": 886000,
                      "status": "Refunded"
              },
              {
                      "orderNumber": "GRD-26-1016",
                      "customerName": "Khách hàng 2",
                      "customerEmail": "user2@example.com",
                      "customerPhone": "0900000002",
                      "shippingAddress": "2 Đường Số 2, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "31/05/2026 23:37:00",
                      "items": [
                              {
                                      "id": "so-len-ke-hoach",
                                      "name": "Sổ Lên Kế Hoạch",
                                      "quantity": 1,
                                      "price": 139000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 139000,
                      "shippingFee": 30000,
                      "total": 169000,
                      "status": "Confirmed"
              },
              {
                      "orderNumber": "GRD-26-1017",
                      "customerName": "Khách hàng 1",
                      "customerEmail": "user1@example.com",
                      "customerPhone": "0900000001",
                      "shippingAddress": "1 Đường Số 1, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "28/05/2026 23:55:00",
                      "items": [
                              {
                                      "id": "khung_anh_bang_khen",
                                      "name": "khung ảnh khung bằng khen",
                                      "quantity": 1,
                                      "price": 259000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 259000,
                      "shippingFee": 30000,
                      "total": 289000,
                      "status": "Confirmed"
              },
              {
                      "orderNumber": "GRD-26-1018",
                      "customerName": "Khách hàng 7",
                      "customerEmail": "user7@example.com",
                      "customerPhone": "0900000007",
                      "shippingAddress": "7 Đường Số 7, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "11/05/2026 16:14:00",
                      "items": [
                              {
                                      "id": "ky_niem_chuong_chibi",
                                      "name": "Khung Pha Lê",
                                      "quantity": 1,
                                      "price": 299000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 299000,
                      "shippingFee": 30000,
                      "total": 329000,
                      "status": "Pending"
              },
              {
                      "orderNumber": "GRD-26-1019",
                      "customerName": "Khách hàng 6",
                      "customerEmail": "user6@example.com",
                      "customerPhone": "0900000006",
                      "shippingAddress": "6 Đường Số 6, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "21/05/2026 01:33:00",
                      "items": [
                              {
                                      "id": "vi-dung-the-sang-tao",
                                      "name": "Ví đựng thẻ",
                                      "quantity": 2,
                                      "price": 85000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 170000,
                      "shippingFee": 30000,
                      "total": 200000,
                      "status": "Refunded"
              },
              {
                      "orderNumber": "GRD-26-1020",
                      "customerName": "Khách hàng 6",
                      "customerEmail": "user6@example.com",
                      "customerPhone": "0900000006",
                      "shippingAddress": "6 Đường Số 6, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "28/05/2026 22:03:00",
                      "items": [
                              {
                                      "id": "non_tot_nghiep_hoa_lua",
                                      "name": "Mũ Cử Nhân Trang Trí Hoa Lụa",
                                      "quantity": 2,
                                      "price": 189000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 378000,
                      "shippingFee": 30000,
                      "total": 408000,
                      "status": "Completed"
              },
              {
                      "orderNumber": "GRD-26-1021",
                      "customerName": "Khách hàng 4",
                      "customerEmail": "user4@example.com",
                      "customerPhone": "0900000004",
                      "shippingAddress": "4 Đường Số 4, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "29/05/2026 11:51:00",
                      "items": [
                              {
                                      "id": "lich_tot_nghiep",
                                      "name": "Lịch Tốt Nghiệp",
                                      "quantity": 1,
                                      "price": 69000,
                                      "customization": null
                              },
                              {
                                      "id": "den_ngu_silicon",
                                      "name": "Đèn LED Thú Dễ Thương",
                                      "quantity": 2,
                                      "price": 109000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 287000,
                      "shippingFee": 30000,
                      "total": 317000,
                      "status": "Completed"
              },
              {
                      "orderNumber": "GRD-26-1022",
                      "customerName": "Khách hàng 8",
                      "customerEmail": "user8@example.com",
                      "customerPhone": "0900000008",
                      "shippingAddress": "8 Đường Số 8, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "02/06/2026 23:20:00",
                      "items": [
                              {
                                      "id": "keo_khong_lo",
                                      "name": "Túi Kẹo Quà Tặng",
                                      "quantity": 1,
                                      "price": 49000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 49000,
                      "shippingFee": 30000,
                      "total": 79000,
                      "status": "Cancelled"
              },
              {
                      "orderNumber": "GRD-26-1023",
                      "customerName": "Khách hàng 8",
                      "customerEmail": "user8@example.com",
                      "customerPhone": "0900000008",
                      "shippingAddress": "8 Đường Số 8, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "31/05/2026 20:23:00",
                      "items": [
                              {
                                      "id": "bo_hoa_banh_keo",
                                      "name": "Bó Quà Tốt Nghiệp",
                                      "quantity": 1,
                                      "price": 189000,
                                      "customization": null
                              },
                              {
                                      "id": "binh-pha-ca-phe",
                                      "name": "Bình Pha Cafe Cold Brew",
                                      "quantity": 2,
                                      "price": 120000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 429000,
                      "shippingFee": 30000,
                      "total": 459000,
                      "status": "Delivered"
              },
              {
                      "orderNumber": "GRD-26-1024",
                      "customerName": "Khách hàng 2",
                      "customerEmail": "user2@example.com",
                      "customerPhone": "0900000002",
                      "shippingAddress": "2 Đường Số 2, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "22/05/2026 12:49:00",
                      "items": [
                              {
                                      "id": "binh-giu-nhiet-du-lich",
                                      "name": "Bình Giữ Nhiệt Đi Du Lịch 500ml",
                                      "quantity": 1,
                                      "price": 100000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 100000,
                      "shippingFee": 30000,
                      "total": 130000,
                      "status": "Shipped"
              },
              {
                      "orderNumber": "GRD-26-1025",
                      "customerName": "Khách hàng 6",
                      "customerEmail": "user6@example.com",
                      "customerPhone": "0900000006",
                      "shippingAddress": "6 Đường Số 6, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "21/05/2026 13:04:00",
                      "items": [
                              {
                                      "id": "khung_anh_ghep_do_tot_nghiep",
                                      "name": "Khung Ảnh Tốt Nghiệp Chibi",
                                      "quantity": 1,
                                      "price": 64000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 64000,
                      "shippingFee": 30000,
                      "total": 94000,
                      "status": "Completed"
              },
              {
                      "orderNumber": "GRD-26-1026",
                      "customerName": "Khách hàng 5",
                      "customerEmail": "user5@example.com",
                      "customerPhone": "0900000005",
                      "shippingAddress": "5 Đường Số 5, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "07/06/2026 13:24:00",
                      "items": [
                              {
                                      "id": "gau_bong_tot_nghiep_in_logo",
                                      "name": "Gấu Bông Tốt Nghiệp Gradie",
                                      "quantity": 2,
                                      "price": 65000,
                                      "customization": null
                              },
                              {
                                      "id": "so-tay-a5-vintage",
                                      "name": "Sổ Tay A5 Vintage",
                                      "quantity": 1,
                                      "price": 60000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 190000,
                      "shippingFee": 30000,
                      "total": 220000,
                      "status": "Confirmed"
              },
              {
                      "orderNumber": "GRD-26-1027",
                      "customerName": "Khách hàng 10",
                      "customerEmail": "user10@example.com",
                      "customerPhone": "09000000010",
                      "shippingAddress": "10 Đường Số 10, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "13/05/2026 18:42:00",
                      "items": [
                              {
                                      "id": "balo-vai-da",
                                      "name": "Balo đi học, đi chơi vải dạ",
                                      "quantity": 1,
                                      "price": 73000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 73000,
                      "shippingFee": 30000,
                      "total": 103000,
                      "status": "Pending"
              },
              {
                      "orderNumber": "GRD-26-1028",
                      "customerName": "Khách hàng 5",
                      "customerEmail": "user5@example.com",
                      "customerPhone": "0900000005",
                      "shippingAddress": "5 Đường Số 5, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "25/05/2026 19:34:00",
                      "items": [
                              {
                                      "id": "tui-tote-nu-vai-canvas",
                                      "name": "Túi tote nữ vải canvas",
                                      "quantity": 2,
                                      "price": 65000,
                                      "customization": null
                              },
                              {
                                      "id": "den_guong_tulip",
                                      "name": "Hộp Thủy Tinh Vuông",
                                      "quantity": 1,
                                      "price": 49000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 179000,
                      "shippingFee": 30000,
                      "total": 209000,
                      "status": "Confirmed"
              },
              {
                      "orderNumber": "GRD-26-1029",
                      "customerName": "Khách hàng 6",
                      "customerEmail": "user6@example.com",
                      "customerPhone": "0900000006",
                      "shippingAddress": "6 Đường Số 6, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "13/05/2026 21:13:00",
                      "items": [
                              {
                                      "id": "binh_pha-ca-phe-cold-brew",
                                      "name": "Bình Pha Cà Phê Cold Brew 1400ml",
                                      "quantity": 2,
                                      "price": 239000,
                                      "customization": null
                              },
                              {
                                      "id": "vi-dung-the",
                                      "name": "Ví Đựng Thẻ Zootopia",
                                      "quantity": 2,
                                      "price": 80000,
                                      "customization": null
                              },
                              {
                                      "id": "ky_niem_chuong_chibi",
                                      "name": "Khung Pha Lê",
                                      "quantity": 1,
                                      "price": 299000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 937000,
                      "shippingFee": 30000,
                      "total": 967000,
                      "status": "Completed"
              },
              {
                      "orderNumber": "GRD-26-1030",
                      "customerName": "Khách hàng 7",
                      "customerEmail": "user7@example.com",
                      "customerPhone": "0900000007",
                      "shippingAddress": "7 Đường Số 7, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "19/05/2026 21:00:00",
                      "items": [
                              {
                                      "id": "balo-mini",
                                      "name": "Balo mini dành cho nữ",
                                      "quantity": 2,
                                      "price": 71000,
                                      "customization": null
                              },
                              {
                                      "id": "vi-gap-in-hinh",
                                      "name": "Ví Gập được in hình mèo con",
                                      "quantity": 1,
                                      "price": 45000,
                                      "customization": null
                              },
                              {
                                      "id": "keo_khong_lo",
                                      "name": "Túi Kẹo Quà Tặng",
                                      "quantity": 2,
                                      "price": 49000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 285000,
                      "shippingFee": 30000,
                      "total": 315000,
                      "status": "Completed"
              },
              {
                      "orderNumber": "GRD-26-1031",
                      "customerName": "Khách hàng 3",
                      "customerEmail": "user3@example.com",
                      "customerPhone": "0900000003",
                      "shippingAddress": "3 Đường Số 3, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "30/05/2026 11:24:00",
                      "items": [
                              {
                                      "id": "binh-nuoc-the-thao",
                                      "name": "Bình Nước Thể Thao 2 Lít",
                                      "quantity": 2,
                                      "price": 48000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 96000,
                      "shippingFee": 30000,
                      "total": 126000,
                      "status": "Pending"
              },
              {
                      "orderNumber": "GRD-26-1032",
                      "customerName": "Khách hàng 3",
                      "customerEmail": "user3@example.com",
                      "customerPhone": "0900000003",
                      "shippingAddress": "3 Đường Số 3, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "20/05/2026 10:56:00",
                      "items": [
                              {
                                      "id": "bo_hoa_bong_bong",
                                      "name": "Bó Hoa Bóng Bay Tốt Nghiệp",
                                      "quantity": 2,
                                      "price": 359000,
                                      "customization": null
                              },
                              {
                                      "id": "bo_hoa_banh_keo",
                                      "name": "Bó Quà Tốt Nghiệp",
                                      "quantity": 2,
                                      "price": 189000,
                                      "customization": null
                              },
                              {
                                      "id": "khung_anh_mica_de_",
                                      "name": "Mô Hình Tốt Nghiệp",
                                      "quantity": 1,
                                      "price": 259000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 1355000,
                      "shippingFee": 30000,
                      "total": 1385000,
                      "status": "Pending"
              },
              {
                      "orderNumber": "GRD-26-1033",
                      "customerName": "Khách hàng 1",
                      "customerEmail": "user1@example.com",
                      "customerPhone": "0900000001",
                      "shippingAddress": "1 Đường Số 1, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "04/06/2026 05:33:00",
                      "items": [
                              {
                                      "id": "tui-dung-laptop",
                                      "name": "Túi đựng laptop chống sốc",
                                      "quantity": 2,
                                      "price": 138000,
                                      "customization": null
                              },
                              {
                                      "id": "nen-thom-hop",
                                      "name": "Nến thơm hộp quà",
                                      "quantity": 1,
                                      "price": 25000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 301000,
                      "shippingFee": 30000,
                      "total": 331000,
                      "status": "Refunded"
              },
              {
                      "orderNumber": "GRD-26-1034",
                      "customerName": "Khách hàng 7",
                      "customerEmail": "user7@example.com",
                      "customerPhone": "0900000007",
                      "shippingAddress": "7 Đường Số 7, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "26/05/2026 06:12:00",
                      "items": [
                              {
                                      "id": "nen-thom-hop",
                                      "name": "Nến thơm hộp quà",
                                      "quantity": 1,
                                      "price": 25000,
                                      "customization": null
                              },
                              {
                                      "id": "khung_anh_3d_totnghiep",
                                      "name": "Khung Ảnh Tốt Nghiệp",
                                      "quantity": 1,
                                      "price": 139000,
                                      "customization": null
                              },
                              {
                                      "id": "hop_keo_mu_bac_si",
                                      "name": "Hộp Quà Tốt Nghiệp Hình Mũ Cử Nhân",
                                      "quantity": 1,
                                      "price": 79000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 243000,
                      "shippingFee": 30000,
                      "total": 273000,
                      "status": "Delivered"
              },
              {
                      "orderNumber": "GRD-26-1035",
                      "customerName": "Khách hàng 2",
                      "customerEmail": "user2@example.com",
                      "customerPhone": "0900000002",
                      "shippingAddress": "2 Đường Số 2, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "28/05/2026 13:08:00",
                      "items": [
                              {
                                      "id": "khung_anh_ghep_do_tot_nghiep",
                                      "name": "Khung Ảnh Tốt Nghiệp Chibi",
                                      "quantity": 2,
                                      "price": 64000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 128000,
                      "shippingFee": 30000,
                      "total": 158000,
                      "status": "Pending"
              },
              {
                      "orderNumber": "GRD-26-1036",
                      "customerName": "Khách hàng 1",
                      "customerEmail": "user1@example.com",
                      "customerPhone": "0900000001",
                      "shippingAddress": "1 Đường Số 1, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "14/05/2026 00:36:00",
                      "items": [
                              {
                                      "id": "binh-dung-nuoc-cute",
                                      "name": "Bình Đựng Nước 2L",
                                      "quantity": 2,
                                      "price": 48000,
                                      "customization": null
                              },
                              {
                                      "id": "gau_bong_tot_nghiep",
                                      "name": "Gấu Bông Capybara Tốt Nghiệp",
                                      "quantity": 1,
                                      "price": 115000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 211000,
                      "shippingFee": 30000,
                      "total": 241000,
                      "status": "Pending"
              },
              {
                      "orderNumber": "GRD-26-1037",
                      "customerName": "Khách hàng 4",
                      "customerEmail": "user4@example.com",
                      "customerPhone": "0900000004",
                      "shippingAddress": "4 Đường Số 4, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "29/05/2026 21:19:00",
                      "items": [
                              {
                                      "id": "gau_bong_chim_canh_cut",
                                      "name": "Gấu Bông Penguin Tốt Nghiệp",
                                      "quantity": 1,
                                      "price": 129000,
                                      "customization": null
                              },
                              {
                                      "id": "qua_tang_bup_be_tot_nghiep",
                                      "name": "Búp Bê Móc Len Tốt Nghiệp",
                                      "quantity": 2,
                                      "price": 419000,
                                      "customization": null
                              },
                              {
                                      "id": "keo_khong_lo",
                                      "name": "Túi Kẹo Quà Tặng",
                                      "quantity": 2,
                                      "price": 49000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 1065000,
                      "shippingFee": 30000,
                      "total": 1095000,
                      "status": "Cancelled"
              },
              {
                      "orderNumber": "GRD-26-1038",
                      "customerName": "Khách hàng 4",
                      "customerEmail": "user4@example.com",
                      "customerPhone": "0900000004",
                      "shippingAddress": "4 Đường Số 4, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Credit Card",
                      "date": "30/05/2026 10:56:00",
                      "items": [
                              {
                                      "id": "binh-nuoc-the-thao",
                                      "name": "Bình Nước Thể Thao 2 Lít",
                                      "quantity": 1,
                                      "price": 48000,
                                      "customization": null
                              },
                              {
                                      "id": "khung_anh_3d_totnghiep",
                                      "name": "Khung Ảnh Tốt Nghiệp",
                                      "quantity": 2,
                                      "price": 139000,
                                      "customization": null
                              },
                              {
                                      "id": "bo_hoa_len_tot_nghiep",
                                      "name": "Bó Hoa Móc Len Hướng Dương",
                                      "quantity": 2,
                                      "price": 149000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 624000,
                      "shippingFee": 30000,
                      "total": 654000,
                      "status": "Processing"
              },
              {
                      "orderNumber": "GRD-26-1039",
                      "customerName": "Khách hàng 10",
                      "customerEmail": "user10@example.com",
                      "customerPhone": "09000000010",
                      "shippingAddress": "10 Đường Số 10, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "Bank Transfer",
                      "date": "02/06/2026 16:22:00",
                      "items": [
                              {
                                      "id": "sen_da_va_gau",
                                      "name": "Bó Hoa Mini Kèm Gấu Tốt Nghiệp",
                                      "quantity": 1,
                                      "price": 79000,
                                      "customization": null
                              },
                              {
                                      "id": "tui-dung-laptop-notebook",
                                      "name": "TÚI ĐỰNG laptop notebook",
                                      "quantity": 2,
                                      "price": 140000,
                                      "customization": null
                              },
                              {
                                      "id": "khung_anh_bang_khen",
                                      "name": "khung ảnh khung bằng khen",
                                      "quantity": 2,
                                      "price": 259000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 877000,
                      "shippingFee": 30000,
                      "total": 907000,
                      "status": "Pending"
              },
              {
                      "orderNumber": "GRD-26-1040",
                      "customerName": "Khách hàng 4",
                      "customerEmail": "user4@example.com",
                      "customerPhone": "0900000004",
                      "shippingAddress": "4 Đường Số 4, Quận 1, TP.HCM",
                      "notes": "",
                      "paymentMethod": "COD",
                      "date": "31/05/2026 14:46:00",
                      "items": [
                              {
                                      "id": "binh-giu-nhiet-du-lich",
                                      "name": "Bình Giữ Nhiệt Đi Du Lịch 500ml",
                                      "quantity": 2,
                                      "price": 100000,
                                      "customization": null
                              },
                              {
                                      "id": "binh-dung-nuoc-cute",
                                      "name": "Bình Đựng Nước 2L",
                                      "quantity": 2,
                                      "price": 48000,
                                      "customization": null
                              }
                      ],
                      "subtotal": 296000,
                      "shippingFee": 30000,
                      "total": 326000,
                      "status": "Shipped"
              }
      ],
      blogPosts: [
              {
                      "id": "b1",
                      "title": "Top 5 Món Quà Tốt Nghiệp Ý Nghĩa Nhất",
                      "excerpt": "Khám phá ngay những món quà được săn đón nhất mùa tốt nghiệp...",
                      "content": "Mùa tốt nghiệp là thời điểm đặc biệt để gửi gắm yêu thương đến những người thân yêu. Dưới đây là top 5 món quà được yêu thích nhất:\n\n1. Gấu Bông Cử Nhân - Biểu tượng dễ thương gắn liền với cột mốc quan trọng. Chú gấu nhỏ mặc trang phục tốt nghiệp sẽ là kỷ niệm không thể quên.\n\n2. Hoa Tươi Kèm Thiệp Chúc Mừng - Bó hoa rực rỡ cùng tấm thiệp viết tay mang lại cảm xúc chân thành nhất.\n\n3. Sổ Tay Cao Cấp & Bút Ký - Đồng hành cùng hành trình mới với những trang nhật ký đầy cảm hứng.\n\n4. Khung Ảnh Kỷ Niệm - Lưu giữ khoảnh khắc tốt nghiệp đáng nhớ trong khung ảnh sang trọng.\n\n5. Hộp Quà Tổng Hợp Gradie - Bộ quà được tuyển chọn kỹ lưỡng, kết hợp nhiều sản phẩm ý nghĩa trong một hộp quà đẹp mắt.\n\nHãy để Gradie giúp bạn chọn món quà hoàn hảo cho ngày trọng đại!",
                      "image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
                      "date": "15/05/2026",
                      "author": "Gradie",
                      "category": "Gợi ý Quà Tặng",
                      "status": "Published"
              },
              {
                      "id": "b2",
                      "title": "Tại Sao Nên Chọn Gấu Bông Cử Nhân?",
                      "excerpt": "Gấu bông cử nhân không chỉ là quà tặng mà còn là kỉ vật mãi mãi...",
                      "content": "Gấu bông cử nhân đã trở thành biểu tượng không thể thiếu trong mùa lễ tốt nghiệp. Nhưng điều gì khiến món quà này đặc biệt đến vậy?\n\nGấu bông cử nhân mang trong mình câu chuyện của cả một hành trình học tập gian khổ. Mỗi chiếc gấu nhỏ mặc áo tốt nghiệp là lời nhắc nhở về những năm tháng nỗ lực không ngừng nghỉ.\n\nĐây là món quà phù hợp với mọi đối tượng:\n- Bạn thân thân thiết\n- Anh chị em trong gia đình\n- Con cái, cháu chắt yêu quý\n- Người yêu đặc biệt\n\nTại Gradie, chúng tôi cung cấp đa dạng mẫu gấu bông cử nhân từ kích thước nhỏ xinh đến cỡ đại ôm cực đã, với nhiều màu sắc trang phục khác nhau để bạn dễ dàng lựa chọn.\n\nĐặt gấu bông cử nhân của bạn ngay hôm nay và giao hàng miễn phí cho đơn từ 500k!",
                      "image": "https://images.unsplash.com/photo-1559181567-c3190ca9be46?w=800&q=80",
                      "date": "20/05/2026",
                      "author": "Admin",
                      "category": "Kinh Nghiệm",
                      "status": "Published"
              },
              {
                      "id": "b3",
                      "title": "Cách Gói Quà Tốt Nghiệp Ghi Điểm Tuyệt Đối",
                      "excerpt": "Bật mí bí kíp gói quà cực xinh xắn và ý nghĩa cho ngày tốt nghiệp...",
                      "content": "Một món quà đẹp không chỉ nằm ở giá trị bên trong mà còn ở cách gói bên ngoài. Hãy cùng Gradie khám phá nghệ thuật gói quà tốt nghiệp đẳng cấp!\n\nBước 1: Chọn Giấy Gói Phù Hợp\nSử dụng giấy kraft nâu vintage hoặc giấy nhung màu trơn cao cấp. Tránh dùng giấy bóng rẻ tiền vì sẽ giảm đi vẻ sang trọng.\n\nBước 2: Ruy Băng & Nơ Trang Trí\nRuy băng vàng ánh kim là lựa chọn hàng đầu cho mùa tốt nghiệp. Buộc thành nơ to với nhiều vòng để tạo điểm nhấn đặc biệt.\n\nBước 3: Thiệp Chúc Mừng Viết Tay\nĐừng bao giờ bỏ qua thiệp viết tay! Một vài dòng chân thành từ trái tim sẽ khiến món quà trở nên vô giá.\n\nBước 4: Thêm Hoa Tươi Nhỏ\nCài thêm 1-2 bông hoa nhỏ hoặc nhánh lá xanh vào ruy băng sẽ tạo nên vẻ đẹp tươi mới, sống động.\n\nBước 5: Hộp Quà Cao Cấp của Gradie\nChọn hộp quà Gradie với thiết kế sang trọng, có thể tái sử dụng làm hộp lưu giữ kỷ niệm sau này.\n\nChúc bạn gói được những món quà thật ý nghĩa cho người thân yêu!",
                      "image": "https://images.unsplash.com/photo-1513201099705-a9746072f8e9?w=800&q=80",
                      "date": "22/05/2026",
                      "author": "Gradie",
                      "category": "Handmade",
                      "status": "Published"
              },
              {
                      "id": "b4",
                      "title": "Ý Nghĩa Của Lễ Tốt Nghiệp Và Những Kỷ Niệm Đáng Trân Trọng",
                      "excerpt": "Lễ tốt nghiệp không chỉ là ngày kết thúc mà còn là khởi đầu của một hành trình mới đầy hứa hẹn...",
                      "content": "Lễ tốt nghiệp là một trong những cột mốc quan trọng nhất trong cuộc đời mỗi người. Đây không chỉ là ngày kết thúc một chặng đường học tập mà còn là điểm khởi đầu của vô vàn cơ hội mới.\n\nNhìn lại hành trình:\nBốn năm đại học (hoặc hơn) là quãng thời gian đầy ắp kỷ niệm - những đêm thức khuya ôn thi, những buổi sáng vội vàng đến lớp, những bài tập nhóm căng thẳng và những chuyến đi phượt cùng bạn bè. Tất cả tạo nên một bức tranh tuổi thanh xuân đáng nhớ.\n\nGiá trị của tấm bằng:\nTấm bằng đại học không chỉ là tờ giấy xác nhận kiến thức - đó là chứng nhận cho sự kiên trì, nỗ lực và trưởng thành. Hãy tự hào vì những gì bạn đã đạt được!\n\nLời khuyên cho hành trình tiếp theo:\n- Đừng sợ bắt đầu lại từ đầu\n- Học hỏi không ngừng dù đã ra trường\n- Giữ vững mối quan hệ với bạn bè và thầy cô\n- Luôn biết ơn những người đã đồng hành cùng bạn\n\nGradie tự hào được đồng hành cùng bạn trong ngày trọng đại này với những món quà tốt nghiệp ý nghĩa nhất!",
                      "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
                      "date": "01/06/2026",
                      "author": "Gradie",
                      "category": "Câu Chuyện",
                      "status": "Published"
              }
      ],
      gallery: [
              {
                      "id": "g1",
                      "title": "Khoảnh khắc Lễ Tốt Nghiệp ĐHQG",
                      "image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500"
              },
              {
                      "id": "g2",
                      "title": "Nhóm bạn thân ngày ra trường",
                      "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500"
              },
              {
                      "id": "g3",
                      "title": "Quà tặng từ gia đình",
                      "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500"
              },
              {
                      "id": "g4",
                      "title": "Kỷ niệm thanh xuân",
                      "image": "https://images.unsplash.com/photo-1627556592933-ffe99c1c9dd0?w=500"
              },
              {
                      "id": "g5",
                      "title": "Đón nhận bằng cử nhân",
                      "image": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500"
              }
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
      },
      staff: [
        { id: "s-1", name: "Huỳnh Thảo Nhi", role: "Admin", email: "thaonhi@gradie.com", phone: "0900000001", commissionRate: 0, kpi: 0, avatar: "https://ui-avatars.com/api/?name=Huynh+Thao+Nhi&background=d8a94f&color=fff" },
        { id: "s-2", name: "Nguyễn Thị Ái Nhi", role: "Manager", email: "ainhi@gradie.com", phone: "0900000002", commissionRate: 0, kpi: 100000000, avatar: "https://ui-avatars.com/api/?name=Ai+Nhi&background=1e293b&color=fff" },
        { id: "s-3", name: "Nguyễn Vân Ngọc Khánh", role: "Sales", email: "ngockhanh@gradie.com", phone: "0900000003", commissionRate: 5, kpi: 50000000, avatar: "https://ui-avatars.com/api/?name=Ngoc+Khanh&background=3b82f6&color=fff" },
        { id: "s-4", name: "Lý Minh Thư", role: "Warehouse", email: "minhthu@gradie.com", phone: "0900000004", commissionRate: 0, kpi: 0, avatar: "https://ui-avatars.com/api/?name=Minh+Thu&background=10b981&color=fff" },
        { id: "s-5", name: "Trần Khánh Ly", role: "Accountant", email: "khanhly@gradie.com", phone: "0900000005", commissionRate: 0, kpi: 0, avatar: "https://ui-avatars.com/api/?name=Khanh+Ly&background=ef4444&color=fff" }
      ],
      activityLogs: [
        { id: "log-" + Date.now(), timestamp: Date.now(), user: "System", action: "System Initialized", details: "CMS started successfully." }
      ]
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
    const mappedStoredCats = storedCats.map(c => {
      if (typeof c === 'object' && c !== null) {
        return c.name || c.title || '';
      }
      return c;
    }).filter(Boolean);
    const products = this.getProducts();
    const prodCats = products.map(p => p.category).filter(c => typeof c === 'string' && c.trim() !== '');
    return [...new Set([...mappedStoredCats, ...prodCats])];
  },
  
  addCategory: function(name) {
    let data = this.getData();
    if (!data.categories) data.categories = [];
    
    const exists = data.categories.some(c => {
      const cName = (typeof c === 'object' && c !== null) ? (c.name || '') : String(c);
      return cName.trim().toLowerCase() === name.trim().toLowerCase();
    });

    if (!exists) {
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const newCat = { id: slug || 'cat-' + Date.now(), name: name.trim(), slug: slug || 'cat-' + Date.now() };
        data.categories.push(newCat);
        this.saveData(data);
        
        fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCat)
        })
        .then(() => {
            window.dispatchEvent(new Event('gradie_data_synced'));
        })
        .catch(e => console.error('Category POST sync error', e));
    }
  },
  
  deleteCategory: function(name) {
    let data = this.getData();
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    if (data.categories) {
        data.categories = data.categories.filter(c => {
            const cName = (typeof c === 'object' && c !== null) ? (c.name || '') : String(c);
            return cName.trim().toLowerCase() !== name.trim().toLowerCase();
        });
    }
    
    if (data.products) {
        data.products.forEach(p => {
            if (p.category && p.category.trim().toLowerCase() === name.trim().toLowerCase()) {
                p.category = 'Uncategorized';
                this.updateProduct(p.id, p);
            }
        });
    }
    this.saveData(data);
    
    fetch('/api/categories?slug=' + encodeURIComponent(slug), {
        method: 'DELETE'
    })
    .then(() => {
        window.dispatchEvent(new Event('gradie_data_synced'));
    })
    .catch(e => console.error('Category DELETE sync error', e));
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
  addProduct: function(product) { let data = this.getData(); let norm = this.normalizeProduct(product); if(!norm.id) { norm.id = norm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(); } data.products.push(norm); this.saveData(data); fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(norm) }).then(() => { window.dispatchEvent(new Event('gradie_data_synced')); }).catch(e => console.error('Sync error', e)); },
  updateProduct: function(id, updatedProduct) { let data = this.getData(); let index = data.products.findIndex(p => p.id === id); if (index !== -1) { let merged = { ...data.products[index], ...updatedProduct }; data.products[index] = this.normalizeProduct(merged); this.saveData(data); fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data.products[index]) }).then(() => { window.dispatchEvent(new Event('gradie_data_synced')); }).catch(e => console.error('Sync error', e)); } },
  deleteProduct: function(id) { let data = this.getData(); data.products = data.products.filter(p => p.id !== id); this.saveData(data); fetch('/api/products?id=' + id, { method: 'DELETE' }).then(() => { window.dispatchEvent(new Event('gradie_data_synced')); }).catch(e => console.error('Sync error', e)); },
  
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
  updateOrder: function(id, order) { 
    let data = this.getData(); 
    let i = data.orders.findIndex(o => o.orderNumber === id); 
    if (i !== -1) { 
      const oldStatus = data.orders[i].status || 'Pending';
      data.orders[i] = { ...data.orders[i], ...order }; 
      
      // Phép tính riêng khi cập nhật từ completed sang refund: hoàn lại số lượng tồn kho (restock)
      if ((oldStatus === 'Completed' || oldStatus === 'Delivered') && order.status === 'Refunded') {
        if (data.orders[i].items && data.products) {
          data.orders[i].items.forEach(item => {
            let pIndex = data.products.findIndex(p => p.id === item.id);
            if (pIndex !== -1) {
              data.products[pIndex].stock = (data.products[pIndex].stock || 0) + (parseInt(item.quantity || item.qty) || 1);
              // Push updated product to MongoDB
              fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data.products[pIndex]) }).catch(e => console.error('Sync product error', e));
            }
          });
        }
      }
      
      this.saveData(data); 
      fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data.orders[i]) }).catch(e => console.error('Sync error', e)); 
    } 
  },
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
  
  // STAFF & RBAC
  getStaff: function() { return this.getData().staff || []; },
  saveStaff: function(staffList) { let data = this.getData(); data.staff = staffList; this.saveData(data); },
  
  // ACTIVITY LOGS
  getActivityLogs: function() { return this.getData().activityLogs || []; },
  addActivityLog: function(action, details, user) {
    if (!user) user = localStorage.getItem('GRADIE_ACTIVE_USER') || "System";
    let data = this.getData();
    if (!data.activityLogs) data.activityLogs = [];
    data.activityLogs.unshift({
      id: "log-" + Date.now(),
      timestamp: Date.now(),
      user: user,
      action: action,
      details: details
    });
    // Keep only last 200 logs to save space
    if (data.activityLogs.length > 200) data.activityLogs.length = 200;
    this.saveData(data);
    
    // Push Activity Log to MongoDB
    fetch('/api/global', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'activityLogs', data: data.activityLogs }) }).catch(e => console.error('Sync error', e));
  },

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
    // No default empty address detail created on signup, starting with empty address list instead
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

  syncWithDB: async function(scope = 'all') {
    try {
      const fetchSafe = async (url) => {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          return res.ok ? res : null;
        } catch (e) {
          console.warn(`Fetch to ${url} failed`, e);
          return null;
        }
      };

      let resProducts = null;
      let resGlobal = null;
      let resUsers = null;
      let resOrders = null;

      if (scope === 'orders' || scope === true) {
        resOrders = await fetchSafe('/api/orders');
      } else if (scope === 'global') {
        resGlobal = await fetchSafe('/api/global');
      } else if (scope === 'orders_and_global') {
        const results = await Promise.all([
          fetchSafe('/api/orders'),
          fetchSafe('/api/global')
        ]);
        resOrders = results[0];
        resGlobal = results[1];
      } else {
        const results = await Promise.all([
          fetchSafe('/api/products'),
          fetchSafe('/api/global'),
          fetchSafe('/api/users'),
          fetchSafe('/api/orders')
        ]);
        resProducts = results[0];
        resGlobal = results[1];
        resUsers = results[2];
        resOrders = results[3];
      }
      
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
          if (globalData.activityLogs && globalData.activityLogs.length > 0) data.activityLogs = globalData.activityLogs;
          updated = true;
        }
      }

      if (resUsers) {
        const users = await resUsers.json().catch(() => null);
        if (users && users.length > 0) {
          if (!data.users) data.users = [];
          const currUser = this.getCurrentUser();
          
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

                // Sync current active session if details changed in DB
                if (currUser && currUser.email.toLowerCase() === dbUser.email.toLowerCase()) {
                  this.setCurrentUser(data.users[index]);
                }
              }
            }
          });
        }
      }

      if (resOrders) {
        const orders = await resOrders.json().catch(() => null);
        if (orders && orders.length > 0) {
          if (!data.orders) data.orders = [];
          
          orders.forEach(dbOrder => {
            const index = data.orders.findIndex(o => o.orderNumber === dbOrder.orderNumber);
            if (index === -1) {
              data.orders.push(dbOrder);
              updated = true;
            } else {
              // Update status/details if changed in the DB (e.g. status changed by admin)
              const localOrder = data.orders[index];
              if (localOrder.status !== dbOrder.status ||
                  JSON.stringify(localOrder) !== JSON.stringify(dbOrder)) {
                data.orders[index] = { ...localOrder, ...dbOrder };
                updated = true;
              }
            }
          });

          // Sort orders by orderNumber descending so newest are always on top
          data.orders.sort((a, b) => b.orderNumber.localeCompare(a.orderNumber));
        }
      }

      if (updated) {
        this.saveData(data);
        console.log("GradieStore: Synchronized with database.");
        // Dispatch event so UI components can re-render with fresh data
        window.dispatchEvent(new Event('gradie_data_synced'));
      }
      return { success: true };
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
      // Background synchronization every 8 seconds (dynamic based on page type)
      setInterval(() => {
        const isAdminPage = window.location.pathname.includes('admin-');
        window.GradieStore.syncWithDB(isAdminPage ? 'all' : 'orders');
      }, 8000);
    }
  }
});
