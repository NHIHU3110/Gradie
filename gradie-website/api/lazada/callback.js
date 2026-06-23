require('dotenv').config();

module.exports = async (req, res) => {
  // Allow GET requests (OAuth redirects usually use GET with query parameters)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Lấy tham số code từ URL (query string)
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter in URL' });
  }

  // Lấy App Key và App Secret từ biến môi trường (hoặc dùng mặc định nếu không có)
  const appKey = process.env.LAZADA_APP_KEY || '139567';
  const appSecret = process.env.LAZADA_APP_SECRET || '9XXFtXZkH4RAtVWAcyDKnWZZFNYZlM6t';

  try {
    // Gọi API Lazada để đổi code lấy access_token
    const response = await fetch('https://auth.lazada.com/rest/oauth/session/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        app_key: appKey,
        app_secret: appSecret
      })
    });

    const data = await response.json();
    
    // Trả về kết quả để hiển thị (bao gồm access_token, refresh_token, vv.)
    // Bạn có thể lưu vào DB ở bước này nếu cần
    return res.status(200).json({
      message: 'Successfully exchanged token',
      data: data
    });
  } catch (error) {
    console.error('Lazada Callback Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
