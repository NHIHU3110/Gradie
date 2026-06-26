const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  if (!uri || uri.includes('127.0.0.1')) {
    console.log("❌ LỖI: Hãy cấu hình MONGODB_URI (database online) trong file .env trước khi chạy file này!");
    return;
  }
  try {
    await client.connect();
    const database = client.db('test'); // Vercel default is often 'test' or 'myFirstDatabase'
    const productsCollection = database.collection('products');

    console.log("Kết nối Database thành công! Đang tiến hành đồng bộ...");

    // Xóa trắng bảng cũ để tránh trùng lặp
    await productsCollection.deleteMany({});
    console.log("Đã làm sạch dữ liệu Database cũ.");

    // Đọc data từ file products.json
    const productsDataPath = path.join(__dirname, 'data', 'products.json');
    const productsRaw = fs.readFileSync(productsDataPath, 'utf8');
    const products = JSON.parse(productsRaw);

    if (products.length > 0) {
        // Chèn vào MongoDB
        await productsCollection.insertMany(products);
        console.log(`✅ THÀNH CÔNG: Đã đẩy ${products.length} sản phẩm lên MongoDB!`);
    } else {
        console.log("Không có sản phẩm nào trong file products.json.");
    }
  } finally {
    await client.close();
    console.log("Hoàn tất!");
  }
}

run().catch(console.dir);
