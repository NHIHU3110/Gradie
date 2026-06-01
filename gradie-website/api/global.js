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
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
