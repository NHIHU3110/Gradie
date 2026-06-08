require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const posts = [
  {
    title: 'Welcome to Gradie',
    slug: 'welcome-to-gradie',
    content: 'This is the first blog post.',
    authorId: null,
    createdAt: new Date()
  },
  {
    title: 'How to Choose a Gift',
    slug: 'how-to-choose-a-gift',
    content: 'Tips and tricks for picking the perfect gift.',
    authorId: null,
    createdAt: new Date()
  }
];
(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const col = db.collection('blogPosts');
  await col.deleteMany({});
  await col.insertMany(posts);
  console.log('✅ Seeded blogPosts');
  await client.close();
})();
