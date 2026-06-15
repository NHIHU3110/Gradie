const fs = require('fs');
const path = require('path');

// 1. Read global-data.js to extract actual products
const globalDataPath = path.join(__dirname, '../js/global-data.js');
let globalDataContent = fs.readFileSync(globalDataPath, 'utf8');

// Use regex to extract the window.GRADIE_DATA object
const gradieDataMatch = globalDataContent.match(/window\.GRADIE_DATA\s*=\s*(\{[\s\S]*?\});/);
if (!gradieDataMatch) {
    console.error("Could not find GRADIE_DATA in global-data.js");
    process.exit(1);
}

let gradieData;
try {
    gradieData = JSON.parse(gradieDataMatch[1]);
} catch (e) {
    console.error("Failed to parse GRADIE_DATA json", e);
    process.exit(1);
}

const products = gradieData.products || [];
const productIds = products.map(p => ({
    id: p.id,
    name: p.name,
    price: parseInt(p.price) || 0
}));

if (productIds.length === 0) {
    console.error("No products found in GRADIE_DATA");
    process.exit(1);
}

const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Refunded'];
// Skew towards completed for analytics
const weightedStatuses = [...statuses, 'Completed', 'Completed', 'Completed', 'Completed']; 
const paymentMethods = ['COD', 'Bank Transfer', 'Credit Card'];

let newUsers = [];
let newOrders = [];

// Generate 10 users
for (let i = 1; i <= 10; i++) {
  const email = `user${i}@example.com`;
  const name = `Khách hàng ${i}`;
  const phone = `090000000${i}`;
  const address = `${i} Đường Số ${i}, Quận 1, TP.HCM`;
  
  newUsers.push({
    id: `u-${i}`,
    username: name,
    email: email,
    password: "password123",
    phone: phone,
    address: address,
    avatar: `https://i.pravatar.cc/150?u=${i}`,
    addresses: [
      { id: `addr-${i}-1`, label: "Home", name: name, phone: phone, detail: address, isDefault: true }
    ]
  });
}

// Generate 40 orders mapped to ACTUAL products
for (let i = 1; i <= 40; i++) {
  const user = newUsers[Math.floor(Math.random() * newUsers.length)];
  const status = weightedStatuses[Math.floor(Math.random() * weightedStatuses.length)];
  const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
  
  // Random items 1 to 3
  const itemsCount = Math.floor(Math.random() * 3) + 1;
  const items = [];
  let subtotal = 0;
  
  for(let j=0; j<itemsCount; j++) {
      const p = productIds[Math.floor(Math.random() * productIds.length)];
      const qty = Math.floor(Math.random() * 2) + 1;
      items.push({
          id: p.id,
          name: p.name,
          quantity: qty,
          price: p.price,
          customization: null
      });
      subtotal += p.price * qty;
  }

  // Random Date within last 30 days
  const d = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
  const dateStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`;

  newOrders.push({
    orderNumber: `GRD-26-${1000 + i}`,
    customerName: user.username,
    customerEmail: user.email,
    customerPhone: user.phone,
    shippingAddress: user.address,
    notes: "",
    paymentMethod: method,
    date: dateStr,
    items: items,
    subtotal: subtotal,
    shippingFee: 30000,
    total: subtotal + 30000,
    status: status
  });
}

// Generate Blog Posts Mock
const mockBlogs = [
    {
        id: "b1", title: "Top 5 Món Quà Tốt Nghiệp Ý Nghĩa Nhất", 
        excerpt: "Khám phá ngay những món quà được săn đón nhất mùa tốt nghiệp...", 
        date: "15/05/2026", author: "Gradie", category: "Gợi ý Quà Tặng", status: "Published"
    },
    {
        id: "b2", title: "Tại Sao Nên Chọn Gấu Bông Cử Nhân?", 
        excerpt: "Gấu bông cử nhân không chỉ là quà tặng mà còn là kỉ vật...", 
        date: "20/05/2026", author: "Admin", category: "Kinh Nghiệm", status: "Published"
    },
    {
        id: "b3", title: "Cách Gói Quà Tốt Nghiệp Ghi Điểm Tuyệt Đối", 
        excerpt: "Bật mí bí kíp gói quà cực xinh xắn và ý nghĩa...", 
        date: "22/05/2026", author: "Gradie", category: "Handmade", status: "Published"
    }
];

// Generate Gallery Mock
const mockGallery = [
    { id: "g1", title: "Khoảnh khắc Lễ Tốt Nghiệp ĐHQG", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500" },
    { id: "g2", title: "Nhóm bạn thân ngày ra trường", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500" },
    { id: "g3", title: "Quà tặng từ gia đình", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500" },
    { id: "g4", title: "Kỷ niệm thanh xuân", image: "https://images.unsplash.com/photo-1627556592933-ffe99c1c9dd0?w=500" },
    { id: "g5", title: "Đón nhận bằng cử nhân", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500" }
];

const newUsersStr = JSON.stringify(newUsers, null, 8).replace(/^/gm, '      ').trim();
const newOrdersStr = JSON.stringify(newOrders, null, 8).replace(/^/gm, '      ').trim();
const newBlogsStr = JSON.stringify(mockBlogs, null, 8).replace(/^/gm, '      ').trim();
const newGalleryStr = JSON.stringify(mockGallery, null, 8).replace(/^/gm, '      ').trim();

const dataStorePath = path.join(__dirname, '../js/data-store.js');
let content = fs.readFileSync(dataStorePath, 'utf8');

// Regex replacement
content = content.replace(/users:\s*\[[\s\S]*?\],\n\s*orders:\s*\[[\s\S]*?\],\n\s*blogPosts:\s*\[[\s\S]*?\],\n\s*gallery:\s*\[[\s\S]*?\]/, 
    `users: ${newUsersStr},\n      orders: ${newOrdersStr},\n      blogPosts: ${newBlogsStr},\n      gallery: ${newGalleryStr}`);

fs.writeFileSync(dataStorePath, content, 'utf8');
console.log('Successfully generated correctly mapped orders, blogs, gallery and users.');
