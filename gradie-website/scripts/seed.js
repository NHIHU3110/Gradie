const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Missing MONGODB_URI in environment variables.");
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    const db = client.db('gradie_db');
    const productsCollection = db.collection('products');

    // Read products JSON
    const dataPath = path.join(__dirname, '../data/products.json');
    const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Clear existing products
    await productsCollection.deleteMany({});
    console.log("Cleared existing products collection.");

    // Insert new products
    const result = await productsCollection.insertMany(products);
    console.log(`Successfully inserted ${result.insertedCount} products.`);
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.close();
  }
}

seed();
