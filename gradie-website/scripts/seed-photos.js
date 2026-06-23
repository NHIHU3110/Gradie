require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const photos = [
  { url: 'https://example.com/photo1.jpg', category: 'gallery', uploadedAt: new Date() },
  { url: 'https://example.com/photo2.jpg', category: 'gallery', uploadedAt: new Date() }
];
(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const col = db.collection('photos');
  await col.deleteMany({});
  await col.insertMany(photos);
  console.log('✅ Seeded photos');
  await client.close();
})();
