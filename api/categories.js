const { getDb } = require('./_db');
module.exports = async (req, res) => {
  const db = await getDb();
  const col = db.collection('categories');
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
    const { slug, ...update } = req.body;
    const result = await col.updateOne({ slug }, { $set: update });
    return res.status(200).json(result);
  }
  if (req.method === 'DELETE') {
    const { slug } = req.query;
    const result = await col.deleteOne({ slug });
    return res.status(200).json(result);
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
};
