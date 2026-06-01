const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Missing MONGODB_URI in environment variables.");
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    const db = client.db('gradie_db');
    // 1. Clear and Seed Products
    const productsCollection = db.collection('products');
    await productsCollection.deleteMany({});
    const dataPath = path.join(__dirname, '../data/products.json');
    const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    await productsCollection.insertMany(products);
    console.log(`Inserted ${products.length} products.`);

    // 2. Clear and Seed Users
    const usersCollection = db.collection('users');
    await usersCollection.deleteMany({});
    const defaultUsers = [
      { id: 'u-admin-1', username: 'Admin Gradie', email: 'admin@gradie.com', password: 'password', role: 'admin' },
      { id: 'u-user-1', username: 'Khách Hàng', email: 'user@gmail.com', password: 'password', role: 'customer' }
    ];
    await usersCollection.insertMany(defaultUsers);
    console.log(`Inserted ${defaultUsers.length} users.`);

    // 3. Clear and Seed Orders
    const ordersCollection = db.collection('orders');
    await ordersCollection.deleteMany({});
    const orders = [
      { orderNumber: "GRD-26-9821", customerName: "Nhi Huynh", customerEmail: "nhi@gradie.com", customerPhone: "0901234567", shippingAddress: "123 Le Loi, District 1, HCMC", notes: "Giao giờ hành chính", paymentMethod: "COD", date: "30/05/2026 14:30:15", items: [{ id: "gau-bong-teddy", name: "Gấu Bông Tốt Nghiệp Teddy", quantity: 1, price: 250000, customization: { embroideryText: "Nhi Huynh", threadColor: "Champagne Gold" } }, { id: "hoa-huong-duong", name: "Hoa Hướng Dương Tốt Nghiệp", quantity: 1, price: 120000, customization: null }], subtotal: 370000, shippingFee: 30000, total: 400000, status: "Delivered" },
      { orderNumber: "GRD-26-4412", customerName: "Alex Mercer", customerEmail: "alex@gradie.com", customerPhone: "0987654321", shippingAddress: "456 Nguyen Hue, District 1, HCMC", notes: "Làm quà tặng", paymentMethod: "COD", date: "31/05/2026 08:15:22", items: [{ id: "scrapbook-ky-niem", name: "Scrapbook Kỷ Niệm Graduation", quantity: 1, price: 380000, customization: { boxColor: "Signature Cream", ribbonColor: "Champagne Gold", waxSeal: "Gradie Monogram" } }], subtotal: 380000, shippingFee: 30000, total: 410000, status: "Shipped" },
      { orderNumber: "GRD-26-7731", customerName: "Helena Rostova", customerEmail: "helena@gradie.com", customerPhone: "0912345678", shippingAddress: "789 Dong Khoi, District 1, HCMC", notes: "Giao cổng sau", paymentMethod: "COD", date: "31/05/2026 10:05:00", items: [{ id: "huy-chuong-danh-du", name: "Huy Chương Tốt Nghiệp Danh Dự", quantity: 1, price: 180000, customization: null }], subtotal: 180000, shippingFee: 30000, total: 210000, status: "Pending" }
    ];
    await ordersCollection.insertMany(orders);
    console.log(`Inserted ${orders.length} mock orders.`);
    
    // 4. Seed Categories
    const categoriesCol = db.collection('categories');
    await categoriesCol.deleteMany({});
    const categories = [
      { id: "gau-bong", name: "Gấu Bông", slug: "gau-bong" },
      { id: "hoa-mung", name: "Hoa Mừng", slug: "hoa-mung" },
      { id: "keo", name: "Kẹo", slug: "keo" },
      { id: "khung-anh", name: "Khung Ảnh", slug: "khung-anh" },
      { id: "so", name: "Sổ", slug: "so" },
      { id: "binh-nuoc", name: "Bình Nước", slug: "binh-nuoc" },
      { id: "tui", name: "Túi", slug: "tui" },
      { id: "balo", name: "Balo", slug: "balo" },
      { id: "huy-chuong", name: "Huy Chương", slug: "huy-chuong" },
      { id: "den-ngu", name: "Đèn Ngủ", slug: "den-ngu" },
      { id: "do-tot-nghiep", name: "Đồ Tốt Nghiệp", slug: "do-tot-nghiep" },
      { id: "chau-cay", name: "Chậu Cây", slug: "chau-cay" },
      { id: "vi", name: "Ví", slug: "vi" },
      { id: "nen-thom", "name": "Nến Thơm", "slug": "nen-thom" },
      { id: "tui-dung-laptop", name: "Túi Đựng Laptop", slug: "tui-dung-laptop" }
    ];
    await categoriesCol.insertMany(categories);
    console.log(`Inserted ${categories.length} categories.`);

    // 5. Seed Customizations
    const custCol = db.collection('customizations');
    await custCol.deleteMany({});
    const customizationData = {
        sashColors: [{name: 'Classic Black', hex: '#17181d'}, {name: 'Champagne Gold', hex: '#d8a94f'}, {name: 'Peach', hex: '#e9a08d'}],
        embroideryFonts: [{name: 'Elegant Script', price: 50000}, {name: 'Modern Sans', price: 50000}],
        wrappingStyles: [{name: 'Standard Box', price: 0}, {name: 'Premium Ribbon Box', price: 100000}],
        embroideryColors: [
          { name: 'Champagne Gold', hex: '#D8A94F' }, { name: 'Classic Silver', hex: '#C0C0C0' },
          { name: 'Peach Gold', hex: '#E9A08D' }, { name: 'Crisp White', hex: '#FFFFFF' }, { name: 'Midnight Black', hex: '#17181D' }
        ],
        boxColors: [
          { name: 'Signature Cream', hex: '#F4E8D1' }, { name: 'Pastel Peach', hex: '#E9A08D' },
          { name: 'Midnight Black', hex: '#17181D' }, { name: 'Royal Navy', hex: '#002040' }
        ],
        ribbonColors: [
          { name: 'Champagne Gold', hex: '#D8A94F' }, { name: 'Scarlet Red', hex: '#990000' },
          { name: 'Emerald Green', hex: '#2E7D32' }, { name: 'Golden Tangerine', hex: '#FFB74D' }
        ],
        waxSeals: [
          { name: 'Congratulations Motif', emoji: '✦' }, { name: 'Classic Romance', emoji: '❦' },
          { name: 'Royal Fleur-de-lis', emoji: '⚜' }, { name: 'Gradie Monogram', emoji: 'G' }
        ],
        services: [
          { title: 'Virtual Sash Designer', desc: 'Use our live interactive designer...', img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80', btnText: 'Design Now', link: 'diy-sash-design.html' },
          { title: 'Bespoke Embroidery', desc: 'Add elegant monogramming...', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80', btnText: 'Learn More', link: 'embroidery-services.html' },
          { title: 'Luxury Gift Wrapping', desc: 'Choose premium textured paper wraps...', img: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&q=80', btnText: 'Explore Wraps', link: 'gift-wrapping.html' },
          { title: 'Precision Engraving', desc: 'Personalize metal tumblers...', img: 'https://images.unsplash.com/photo-1582210173510-18e31003f901?w=600&q=80', btnText: 'Test Engraving', link: 'engraving-services.html' }
        ]
    };
    await custCol.insertOne(customizationData);
    console.log(`Inserted customizations settings.`);

    // 6. Seed Gallery
    const galleryCol = db.collection('gallery');
    await galleryCol.deleteMany({});
    const gallery = [
        { id: 'g1', type: 'Customer Photo', title: 'A Happy Graduate', status: 'Published', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500' },
        { id: 'g2', type: 'Photoshoot Concept', title: 'Studio Glam', status: 'Published', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500' },
        { id: 'g3', type: 'Product Showcase', title: 'Premium Sash Close-up', status: 'Published', image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500' }
    ];
    await galleryCol.insertMany(gallery);
    console.log(`Inserted ${gallery.length} gallery items.`);

    // 7. Seed Blog Posts
    const blogCol = db.collection('blogPosts');
    await blogCol.deleteMany({});
    const blogPosts = [
        { id: 'b1', title: 'Top 5 Graduation Gifts 2026', category: 'Gifting Tips', status: 'Published', content: 'Discover the most meaningful gifts for this graduation season.', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500' },
        { id: 'b2', title: 'The Meaning Behind the Graduation Sash', category: 'Meaning of Gifts', status: 'Published', content: 'Why do we wear sashes?', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500' },
        { id: 'b3', title: 'How to Preserve Your Graduation Bouquet', category: 'Care Guide', status: 'Published', content: 'Don\'t let those beautiful flowers die.', image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500' }
    ];
    await blogCol.insertMany(blogPosts);
    console.log(`Inserted ${blogPosts.length} blog posts.`);

    // 8. Seed Settings
    const settingsCol = db.collection('settings');
    await settingsCol.deleteMany({});
    const settings = {
        brandName: "Gradie", tagline: "Graduation Gifts", shippingFee: 30000, currency: "VND",
        announcement: "Grand Opening • Free gift tag with every order • Celebrate her next chapter",
        promoCode: "GRAD2026", promoDiscount: 50000,
        email: "hello@gradie.com", phone: "+84 987 654 321", address: "123 Graduation Blvd, HCMC",
        policies: [
            { id: 'p1', title: 'Shipping Policy', content: 'We ship nationwide within 3-5 business days...', status: 'Published' },
            { id: 'p2', title: 'Return Policy', content: 'Returns accepted within 7 days for defective items...', status: 'Published' }
        ]
    };
    await settingsCol.insertOne(settings);
    console.log(`Inserted system settings.`);

    console.log("Database seed complete!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.close();
  }
}

seed();
