const fs = require('fs');
const path = require('path');

const dataStorePath = path.join(__dirname, '../js/data-store.js');
let content = fs.readFileSync(dataStorePath, 'utf8');

const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Refunded'];
const paymentMethods = ['COD', 'Bank Transfer', 'Credit Card'];
const productIds = [
  { id: "gau-bong-teddy", name: "Gấu Bông Tốt Nghiệp Teddy", price: 250000 },
  { id: "hoa-huong-duong", name: "Hoa Hướng Dương Tốt Nghiệp", price: 120000 },
  { id: "scrapbook-ky-niem", name: "Scrapbook Kỷ Niệm Graduation", price: 380000 },
  { id: "huy-chuong-danh-du", name: "Huy Chương Tốt Nghiệp Danh Dự", price: 180000 },
  { id: "khung-anh-a4", name: "Khung Ảnh Tốt Nghiệp A4", price: 150000 }
];

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

// Generate 40 orders
for (let i = 1; i <= 40; i++) {
  const user = newUsers[Math.floor(Math.random() * newUsers.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
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

// Ensure at least one of each status to test
statuses.forEach((s, i) => {
    if(newOrders[i]) {
        newOrders[i].status = s;
    }
});

const newUsersStr = JSON.stringify(newUsers, null, 8).replace(/^/gm, '      ').trim();
const newOrdersStr = JSON.stringify(newOrders, null, 8).replace(/^/gm, '      ').trim();

// Regex replacement
content = content.replace(/users:\s*\[[\s\S]*?\],\n\s*orders:\s*\[[\s\S]*?\],\n\s*blogPosts:/, `users: ${newUsersStr},\n      orders: ${newOrdersStr},\n      blogPosts:`);

fs.writeFileSync(dataStorePath, content, 'utf8');
console.log('Successfully generated new users and orders');
