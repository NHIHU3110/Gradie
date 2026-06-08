const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Missing MONGODB_URI in environment variables.");
  process.exit(1);
}

function extractData() {
    const dataStorePath = path.join(__dirname, '../js/data-store.js');
    let content = fs.readFileSync(dataStorePath, 'utf8');
    
    const globalDataPath = path.join(__dirname, '../js/global-data.js');
    let globalDataContent = fs.readFileSync(globalDataPath, 'utf8');

    // Extract GRADIE_DATA
    const gradieDataMatch = globalDataContent.match(/window\.GRADIE_DATA\s*=\s*(\{[\s\S]*?\});/);
    let gradieData = {};
    if (gradieDataMatch) {
        try { gradieData = JSON.parse(gradieDataMatch[1]); } catch(e) {}
    }

    // Extract users, orders, blogPosts, gallery, staff from data-store.js
    const usersMatch = content.match(/users:\s*(\[[\s\S]*?\]),\n\s*orders:/);
    const ordersMatch = content.match(/orders:\s*(\[[\s\S]*?\]),\n\s*blogPosts:/);
    const blogMatch = content.match(/blogPosts:\s*(\[[\s\S]*?\]),\n\s*gallery:/);
    const galleryMatch = content.match(/gallery:\s*(\[[\s\S]*?\]),\n\s*policies:/);
    const staffMatch = content.match(/staff:\s*(\[[\s\S]*?\])\n\s*\}/);

    let data = {
        products: gradieData.products || [],
        categories: gradieData.categories || [],
        users: [],
        orders: [],
        blogPosts: [],
        gallery: [],
        staff: []
    };

    try {
        if (usersMatch) data.users = eval(usersMatch[1]);
        if (ordersMatch) data.orders = eval(ordersMatch[1]);
        if (blogMatch) data.blogPosts = eval(blogMatch[1]);
        if (galleryMatch) data.gallery = eval(galleryMatch[1]);
        if (staffMatch) data.staff = eval(staffMatch[1]);
    } catch(e) {
        console.error("Parse error:", e);
    }
    
    return data;
}

async function sync() {
    const data = extractData();
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB.");

        const db = client.db('gradie_db');
        
        // 1. Users
        const usersCol = db.collection('users');
        await usersCol.deleteMany({ role: { $ne: 'admin' } }); 
        if (data.users.length > 0) {
            await usersCol.insertMany(data.users);
            console.log(`Synced ${data.users.length} users to MongoDB.`);
        }

        // 2. Orders
        const ordersCol = db.collection('orders');
        await ordersCol.deleteMany({}); 
        if (data.orders.length > 0) {
            await ordersCol.insertMany(data.orders);
            console.log(`Synced ${data.orders.length} orders to MongoDB.`);
        }

        // 3. Products
        const productsCol = db.collection('products');
        await productsCol.deleteMany({});
        if (data.products.length > 0) {
            await productsCol.insertMany(data.products);
            console.log(`Synced ${data.products.length} products to MongoDB.`);
        }

        // 4. Categories
        const catsCol = db.collection('categories');
        await catsCol.deleteMany({});
        if (data.categories.length > 0) {
            await catsCol.insertMany(data.categories);
            console.log(`Synced ${data.categories.length} categories to MongoDB.`);
        }

        // 5. Blog Posts
        const blogCol = db.collection('blogPosts');
        await blogCol.deleteMany({});
        if (data.blogPosts.length > 0) {
            await blogCol.insertMany(data.blogPosts);
            console.log(`Synced ${data.blogPosts.length} blog posts to MongoDB.`);
        }

        // 6. Gallery
        const galleryCol = db.collection('gallery');
        await galleryCol.deleteMany({});
        if (data.gallery.length > 0) {
            await galleryCol.insertMany(data.gallery);
            console.log(`Synced ${data.gallery.length} gallery items to MongoDB.`);
        }

        // 7. Staff
        const staffCol = db.collection('staff');
        await staffCol.deleteMany({});
        if (data.staff.length > 0) {
            await staffCol.insertMany(data.staff);
            console.log(`Synced ${data.staff.length} staff members to MongoDB.`);
        }

        console.log("Full sync complete!");
    } catch(err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

sync();
