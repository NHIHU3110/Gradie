/**
 * Script: sync-products-to-db.js
 * Đồng bộ toàn bộ products.json lên MongoDB (upsert theo ID)
 * Chạy: node sync-products-to-db.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ Không tìm thấy MONGODB_URI trong .env');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('gradie_db');
    const col = db.collection('products');

    const products = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8')
    );

    console.log(`📦 Đang upsert ${products.length} sản phẩm từ products.json...`);

    let upserted = 0;
    let updated = 0;

    for (const p of products) {
      const { _id, ...doc } = p;
      const result = await col.updateOne(
        { id: p.id },
        { $set: doc },
        { upsert: true }
      );
      if (result.upsertedCount > 0) upserted++;
      else if (result.modifiedCount > 0) updated++;
    }

    console.log(`✅ Hoàn thành: ${upserted} mới, ${updated} cập nhật.`);

    // Kiểm tra sau sync
    const total = await col.countDocuments();
    console.log(`📊 MongoDB hiện có: ${total} sản phẩm`);

    // Thống kê ảnh sau sync
    const allInDb = await col.find({}).toArray();
    const tikiImgCount = allInDb.filter(p => p.image && p.image.includes('salt.tikicdn.com')).length;
    const lazadaImgCount = allInDb.filter(p => p.image && p.image.includes('slatic.net')).length;
    const hstaticCount = allInDb.filter(p => p.image && p.image.includes('hstatic.net')).length;

    console.log('\n📸 Phân bổ nguồn ảnh sau sync:');
    console.log(`  - Ảnh Tiki (salt.tikicdn.com): ${tikiImgCount}`);
    console.log(`  - Ảnh Lazada (slatic.net):     ${lazadaImgCount}`);
    console.log(`  - Ảnh gốc (hstatic.net/cdn):   ${hstaticCount}`);

    // Sản phẩm còn thiếu ảnh marketplace
    const tikiMissing = allInDb.filter(
      p => p.tikiStock > 0 && (!p.image || !p.image.includes('salt.tikicdn.com'))
    );
    const lazadaMissing = allInDb.filter(
      p => p.lazadaStock > 0 && (!p.image || !p.image.includes('slatic.net'))
    );
    console.log(`\n⚠️  Vẫn còn thiếu:`);
    console.log(`  - Sản phẩm Tiki chưa có ảnh Tiki: ${tikiMissing.length}`);
    console.log(`  - Sản phẩm Lazada chưa có ảnh Lazada: ${lazadaMissing.length}`);

  } catch (err) {
    console.error('❌ Lỗi:', err);
  } finally {
    await client.close();
    console.log('\n🔌 Đã ngắt kết nối.');
  }
}

run();
