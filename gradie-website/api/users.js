const { getDb } = require('./_db');

module.exports = async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection('users');
    
    if (req.method === 'GET') {
      const users = await collection.find({}).toArray();
      res.status(200).json(users);
    } else if (req.method === 'POST') {
      const newUser = req.body;
      const result = await collection.insertOne(newUser);
      res.status(201).json(result);
    } else if (req.method === 'PUT') {
      const updatedUser = req.body;
      const { _id, ...updateData } = updatedUser;
      await collection.updateOne({ id: updatedUser.id }, { $set: updateData });
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
