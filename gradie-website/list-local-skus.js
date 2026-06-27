const { getDb } = require('./api/_db');

async function run() {
  try {
    const db = await getDb();
    const collection = db.collection('products');
    const products = await collection.find({}).toArray();
    
    console.log("Local Products count:", products.length);
    products.forEach(p => {
      console.log(`- ID: ${p.id}, SKU: ${p.sku}, Name: ${p.name}`);
    });
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
