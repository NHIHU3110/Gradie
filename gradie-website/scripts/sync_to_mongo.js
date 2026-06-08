const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Missing MONGODB_URI in environment variables.");
  process.exit(1);
}

// Function to extract JS object from data-store.js
function extractData() {
    const dataStorePath = path.join(__dirname, '../js/data-store.js');
    let content = fs.readFileSync(dataStorePath, 'utf8');
    
    // We can use a trick to evaluate just the defaultData object
    // Extract everything between 'const defaultData = {' and the closing '};'
    // But GradieStore has window.GradieStore = { ... users: [], orders: [] ... }
    
    // Let's use regex to extract users and orders array text
    const usersMatch = content.match(/users:\s*(\[[\s\S]*?\]),\n\s*orders:/);
    const ordersMatch = content.match(/orders:\s*(\[[\s\S]*?\]),\n\s*blogPosts:/);
    
    if (usersMatch && ordersMatch) {
        // Need to parse as JSON or JS? It's valid JSON if we used JSON.stringify earlier.
        // Wait, earlier I generated it with JSON.stringify, so it IS valid JSON.
        try {
            const users = eval(usersMatch[1]);
            const orders = eval(ordersMatch[1]);
            return { users, orders };
        } catch(e) {
            console.error("Parse error:", e);
            return null;
        }
    }
    return null;
}

async function sync() {
    const data = extractData();
    if(!data) {
        console.error("Failed to extract data from data-store.js");
        process.exit(1);
    }
    
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB.");

        const db = client.db('gradie_db');
        
        // Update Users
        const usersCol = db.collection('users');
        await usersCol.deleteMany({ role: { $ne: 'admin' } }); // Keep admin if any
        if (data.users.length > 0) {
            await usersCol.insertMany(data.users);
            console.log(`Synced ${data.users.length} users to MongoDB.`);
        }

        // Update Orders
        const ordersCol = db.collection('orders');
        await ordersCol.deleteMany({}); // Delete all existing orders
        if (data.orders.length > 0) {
            await ordersCol.insertMany(data.orders);
            console.log(`Synced ${data.orders.length} orders to MongoDB.`);
        }

        console.log("Sync complete!");
    } catch(err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

sync();
