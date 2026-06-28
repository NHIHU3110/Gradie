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
    const collection = db.collection('users');
    const cookies = parseCookies(req);
    const sessionEmail = cookies['gradie_session'];
    const { action } = req.query;

    if (action === 'me') {
      if (!sessionEmail) {
        return res.status(200).json({ loggedIn: false });
      }
      const user = await collection.findOne({ email: sessionEmail.toLowerCase() });
      if (user) {
        const { password, ...safeUser } = user;
        return res.status(200).json({ loggedIn: true, user: safeUser });
      }
      return res.status(200).json({ loggedIn: false });
    }

    if (req.method === 'GET') {
      const users = await collection.find({}).toArray();
      // Map to remove passwords
      const safeUsers = users.map(u => {
        const { password, ...safe } = u;
        return safe;
      });
      res.status(200).json(safeUsers);
    } else if (req.method === 'POST') {
      const body = req.body;

      if (body.action === 'login') {
        const { email, password, rememberMe } = body;
        if (!email || !password) {
          return res.status(400).json({ success: false, message: 'Missing fields.' });
        }
        const user = await collection.findOne({ email: email.toLowerCase() });
        if (user && user.password === password) {
          const { password: _, ...safeUser } = user;
          
          // Set httpOnly secure cookie: 30 days if rememberMe is true, else 1 day (86400 seconds)
          const maxAge = rememberMe ? 2592000 : 86400;
          res.setHeader('Set-Cookie', `gradie_session=${encodeURIComponent(user.email)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`);
          return res.status(200).json({ success: true, user: safeUser });
        }
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (body.action === 'reset_password') {
        const { email, newPassword } = body;
        if (!email || !newPassword) {
          return res.status(400).json({ success: false, message: 'Thiếu thông tin email hoặc mật khẩu mới.' });
        }
        const user = await collection.findOne({ email: email.toLowerCase() });
        if (!user) {
          return res.status(404).json({ success: false, message: 'Email không tồn tại trên hệ thống.' });
        }
        await collection.updateOne({ email: email.toLowerCase() }, { $set: { password: newPassword } });
        return res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công.' });
      }

      if (body.action === 'logout') {
        res.setHeader('Set-Cookie', 'gradie_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
        return res.status(200).json({ success: true });
      }

      // Default POST (Registration)
      const newUser = body;
      const exists = await collection.findOne({ email: newUser.email.toLowerCase() });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Email already exists.' });
      }
      const result = await collection.insertOne(newUser);
      
      // Set session cookie on registration
      res.setHeader('Set-Cookie', `gradie_session=${encodeURIComponent(newUser.email)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`);
      res.status(201).json(result);
    } else if (req.method === 'PUT') {
      const updatedUser = req.body;
      const { _id, ...updateData } = updatedUser;
      
      // Security Check: Ensure user updates their own profile
      if (!sessionEmail || sessionEmail.toLowerCase() !== updatedUser.email.toLowerCase()) {
        return res.status(401).json({ message: 'Unauthorized. Cannot update another user\'s profile.' });
      }
      
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
