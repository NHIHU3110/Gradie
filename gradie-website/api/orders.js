const { getDb } = require('./_db');

function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
}

module.exports = async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection('orders');
    const cookies = parseCookies(req);
    const sessionEmail = cookies['gradie_session'];
    
    if (req.method === 'GET') {
      const orders = await collection.find({}).toArray();
      res.status(200).json(orders);
    } else if (req.method === 'POST') {
      const newOrder = req.body;
      
      // Security Check: Enforce session matches order customer email
      if (!sessionEmail || sessionEmail.toLowerCase() !== newOrder.customerEmail.toLowerCase()) {
        return res.status(401).json({ message: 'Unauthorized. Session does not match customer email.' });
      }
      
      // Security Check: Server-side price recalculation (Option 1)
      const productsCollection = db.collection('products');
      let calculatedSubtotal = 0;
      
      for (const item of newOrder.items) {
        const prod = await productsCollection.findOne({ id: item.id });
        let itemPrice = prod ? Number(prod.price) : 0;
        
        // Account for customizations in pricing if item price is custom
        if (item.customization) {
          const c = item.customization;
          if (c.embroideryText) itemPrice += 50000;
          if (c.boxColor || c.ribbonColor || c.waxSeal) itemPrice += 30000;
        }
        
        calculatedSubtotal += itemPrice * (Number(item.quantity) || 1);
      }
      
      // Enforce recalculated total matches subtotal sent
      if (Math.abs(calculatedSubtotal - Number(newOrder.subtotal)) > 100) { // allow small rounding diff
        return res.status(400).json({ message: 'Bad request. Order total mismatch.' });
      }
      
      const result = await collection.insertOne(newOrder);
      res.status(201).json(result);
    } else if (req.method === 'PUT') {
      const updatedOrder = req.body;
      const { _id, ...updateData } = updatedOrder;
      
      // Let admin perform PUT updates, or users if their session matches customerEmail
      const existingOrder = await collection.findOne({ orderNumber: updatedOrder.orderNumber });
      if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const isAdminSession = req.headers['x-admin-auth'] === 'true' || cookies['gradie_admin_session'] === 'true'; 
      if (!isAdminSession && (!sessionEmail || sessionEmail.toLowerCase() !== existingOrder.customerEmail.toLowerCase())) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }
      
      await collection.updateOne({ orderNumber: updatedOrder.orderNumber }, { $set: updateData }, { upsert: true });
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
