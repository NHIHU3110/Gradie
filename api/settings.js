const { getDb } = require('./_db');
module.exports = async (req, res) => {
  const db = await getDb();
  const col = db.collection('settings');
  if (req.method === 'GET') {
    const data = await col.find({}).toArray();
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    const doc = req.body;
    const result = await col.insertOne(doc);
    return res.status(201).json(result);
  }
  if (req.method === 'PUT') {
    const { key, ...update } = req.body;
    const result = await col.updateOne({ key }, { $set: update });
    return res.status(200).json(result);
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
};
