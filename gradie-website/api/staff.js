const { getDb } = require('./_db');

module.exports = async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection('staff');
    
    if (req.method === 'GET') {
      const staffList = await collection.find({}).toArray();
      res.status(200).json(staffList);
    } else if (req.method === 'POST') {
      const newStaff = req.body;
      const result = await collection.insertOne(newStaff);
      res.status(201).json(result);
    } else if (req.method === 'PUT') {
      const updatedStaff = req.body;
      const { _id, ...updateData } = updatedStaff;
      await collection.updateOne({ id: updatedStaff.id }, { $set: updateData }, { upsert: true });
      res.status(200).json({ success: true });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
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
