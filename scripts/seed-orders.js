require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;
const orders = [
  {
    orderNumber: 'ORD001',
    userId: new ObjectId(),
    items: [{ productId: new ObjectId(), quantity: 2 }],
    total: 199.99,
    status: 'pending',
    createdAt: new Date()
  },
  {
    orderNumber: 'ORD002',
    userId: new ObjectId(),
    items: [{ productId: new ObjectId(), quantity: 1 }],
    total: 99.5,
    status: 'completed',
    createdAt: new Date()
  }
];
(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const col = db.collection('orders');
  await col.deleteMany({});
  await col.insertMany(orders);
  console.log('✅ Seeded orders');
  await client.close();
})();
