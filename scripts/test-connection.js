require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI missing in .env');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri, {});
  try {
    await client.connect();
    const db = client.db(); // DB name from URI
    const cols = await db.listCollections().toArray();
    console.log('✅ Connected! Collections in this DB:');
    cols.forEach(c => console.log(' -', c.name));
  } catch (e) {
    console.error('❌ Connection error:', e);
  } finally {
    await client.close();
  }
}

main();
