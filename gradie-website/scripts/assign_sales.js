const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('gradie_db');
        
        const staff = await db.collection('staff').find({ role: 'Sales' }).toArray();
        if(staff.length === 0) {
            console.log('No sales staff found');
            return;
        }

        const orders = await db.collection('orders').find({}).toArray();
        let updateCount = 0;

        for (let order of orders) {
            if (!order.salesperson_id) {
                // randomly assign to a sales staff
                const randomStaff = staff[Math.floor(Math.random() * staff.length)];
                await db.collection('orders').updateOne(
                    { _id: order._id },
                    { $set: { salesperson_id: randomStaff.id } }
                );
                updateCount++;
            }
        }
        console.log(`Assigned salesperson_id to ${updateCount} orders.`);
    } finally {
        await client.close();
    }
}
run();
