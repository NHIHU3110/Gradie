require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const uri = process.env.MONGODB_URI;
const users = [
  { email: 'admin@example.com', username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
  { email: 'user1@example.com', username: 'user1', password: bcrypt.hashSync('user123', 10), role: 'customer' }
];
(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const col = db.collection('users');
  await col.deleteMany({});
  await col.insertMany(users);
  console.log('✅ Seeded users');
  await client.close();
})();
