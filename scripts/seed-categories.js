require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const categories = [
  { name: 'Jewelry', slug: 'jewelry' },
  { name: 'Embroidery', slug: 'embroidery' },
  { name: 'Personalized Gifts', slug: 'personalized-gifts' },
  { name: 'Sash Design', slug: 'sash-design' }
];
(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const col = db.collection('categories');
  await col.deleteMany({});
  await col.insertMany(categories);
  console.log('✅ Seeded categories');
  await client.close();
})();
