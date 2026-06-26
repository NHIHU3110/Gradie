const { getDb } = require('./_db');

module.exports = async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection('products');
    
    if (req.method === 'GET') {
      const products = await collection.find({}).toArray();
      res.status(200).json(products);
    } else if (req.method === 'POST') {
      const newProduct = req.body;
      await collection.insertOne(newProduct);
      res.status(201).json({ success: true });
    } else if (req.method === 'PUT') {
      const updatedProduct = req.body;
      const { _id, ...updateData } = updatedProduct; // Remove _id if it exists to avoid Mongo immutable field error
      await collection.updateOne({ id: updatedProduct.id }, { $set: updateData }, { upsert: true });
      res.status(200).json({ success: true });
    } else if (req.method === 'DELETE') {
      const { id } = req.query; // e.g. /api/products?id=abc
      await collection.deleteOne({ id: id });
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
