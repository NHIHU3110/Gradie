const { getDb } = require('./_db');

module.exports = async (req, res) => {
  try {
    const db = await getDb();
    
    if (req.method === 'GET') {
      // Fetch all global configuration data concurrently
      const [categories, customizations, gallery, blogPosts, settings] = await Promise.all([
        db.collection('categories').find({}).toArray(),
        db.collection('customizations').findOne({}), // Assuming only 1 document holds the customization object
        db.collection('gallery').find({}).toArray(),
        db.collection('blogPosts').find({}).toArray(),
        db.collection('settings').findOne({}) // Assuming 1 document holds the settings
      ]);

      res.status(200).json({
        categories,
        customization: customizations || {},
        gallery,
        blogPosts,
        settings: settings || {}
      });
    } else if (req.method === 'POST') {
      const payload = req.body; // Expects { type: 'settings', data: {...} }
      if (payload.type === 'settings') {
        await db.collection('settings').deleteMany({});
        await db.collection('settings').insertOne(payload.data);
      } else if (payload.type === 'customization') {
        await db.collection('customizations').deleteMany({});
        await db.collection('customizations').insertOne(payload.data);
      } else if (payload.type === 'gallery') {
        await db.collection('gallery').deleteMany({});
        await db.collection('gallery').insertMany(payload.data);
      } else if (payload.type === 'blogPosts') {
        await db.collection('blogPosts').deleteMany({});
        await db.collection('blogPosts').insertMany(payload.data);
      }
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
