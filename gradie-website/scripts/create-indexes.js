require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
  await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
  await db.collection('blogPosts').createIndex({ slug: 1 }, { unique: true });
  await db.collection('photos').createIndex({ url: 1 }, { unique: true });
  console.log('✅ Indexes created');
  await client.close();
})();
