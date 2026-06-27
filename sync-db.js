const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ LỖI: Không tìm thấy MONGODB_URI trong file .env");
  process.exit(1);
}

// 1. Giả lập môi trường trình duyệt để load data-store.js
const store = {};
global.window = {
  location: { pathname: '' }
};
global.document = {
  addEventListener: () => {}
};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = val; }
};

// Đọc và chạy file javascript để lấy cấu trúc dữ liệu mặc định
try {
  const globalDataPath = path.join(__dirname, 'gradie-website', 'js', 'global-data.js');
  const dataStorePath = path.join(__dirname, 'gradie-website', 'js', 'data-store.js');
  
  const globalDataCode = fs.readFileSync(globalDataPath, 'utf8');
  eval(globalDataCode);
  
  const dataStoreCode = fs.readFileSync(dataStorePath, 'utf8');
  eval(dataStoreCode);
  
  // Chạy init để điền đầy đủ dữ liệu mặc định vào localStorage giả lập
  global.window.GradieStore.init();
} catch (err) {
  console.error("❌ Lỗi khi đọc dữ liệu từ file js:", err);
  process.exit(1);
}

// Lấy dữ liệu đã được khởi tạo
const initializedData = JSON.parse(store['GRADIE_CMS_DATA']);
if (!initializedData) {
  console.error("❌ Lỗi: Không thể khởi tạo dữ liệu.");
  process.exit(1);
}

// Chuẩn bị danh sách các collection cần đồng bộ
const categoriesMapped = (initializedData.categories || []).map(c => {
  if (typeof c === 'string') {
    return { id: c.toLowerCase().replace(/[^a-z0-9\u00C0-\u1EF9]+/g, '-'), name: c, slug: c.toLowerCase().replace(/[^a-z0-9\u00C0-\u1EF9]+/g, '-') };
  }
  return c;
});

const collectionsToSync = {
  products: initializedData.products || [],
  blogPosts: initializedData.blogPosts || [],
  categories: categoriesMapped,
  gallery: initializedData.gallery || [],
  customizations: initializedData.customization ? [initializedData.customization] : [],
  settings: initializedData.settings ? [initializedData.settings] : [],
  users: initializedData.users || [],
  staff: initializedData.staff || []
};

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    // Kết nối đến database 'gradie_db' (mặc định của dự án)
    const db = client.db('gradie_db');
    console.log("🔌 Đã kết nối thành công tới MongoDB Atlas!");

    for (const [colName, data] of Object.entries(collectionsToSync)) {
      if (data.length === 0) {
        console.log(`⚠️ Bỏ qua collection '${colName}' vì không có dữ liệu.`);
        continue;
      }
      
      console.log(`🔄 Đang đồng bộ collection '${colName}' (${data.length} bản ghi)...`);
      
      // Xóa dữ liệu cũ
      await db.collection(colName).deleteMany({});
      
      // Chèn dữ liệu mới
      await db.collection(colName).insertMany(data);
      console.log(`✅ Đồng bộ thành công '${colName}'!`);
    }

    console.log("\n🚀 TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC ĐỒNG BỘ LÊN MONGODB ATLAS THÀNH CÔNG!");
  } catch (err) {
    console.error("❌ Lỗi khi đồng bộ lên database:", err);
  } finally {
    await client.close();
    console.log("🔌 Ngắt kết nối database.");
  }
}

run();
