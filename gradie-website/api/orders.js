const { getDb } = require('./_db');

module.exports = async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection('orders');
    
    if (req.method === 'GET') {
      const orders = await collection.find({}).toArray();
      res.status(200).json(orders);
    } else if (req.method === 'POST') {
      const newOrder = req.body;
      const result = await collection.insertOne(newOrder);
      res.status(201).json(result);
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
