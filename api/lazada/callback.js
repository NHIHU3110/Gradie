require('dotenv').config();
const crypto = require('crypto');

function generateSign(apiPath, params, secret) {
  const keys = Object.keys(params).sort();
  let stringToSign = apiPath;
  for (const key of keys) {
    stringToSign += key + params[key];
  }
  return crypto.createHmac('sha256', secret).update(stringToSign).digest('hex').toUpperCase();
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter in URL' });
  }

  const appKey = process.env.LAZADA_APP_KEY || '139567';
  const appSecret = process.env.LAZADA_APP_SECRET || '9XXFtXZkH4RAtVWAcyDKnWZZFNYZlM6t';

  try {
    const apiPath = '/auth/token/create';
    const paramsObj = {
      app_key: appKey,
      timestamp: Date.now().toString(),
      sign_method: 'sha256',
      code: code
    };

    paramsObj.sign = generateSign(apiPath, paramsObj, appSecret);

    const urlParams = new URLSearchParams();
    for (const key in paramsObj) {
      urlParams.append(key, paramsObj[key]);
    }

    const apiUrl = `https://auth.lazada.com/rest/auth/token/create?${urlParams.toString()}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    if (data.code && data.code !== "0") {
      return res.status(400).json({ 
        error: 'Lazada API Error', 
        details: data 
      });
    }

    return res.status(200).json({
      message: 'Kết nối thành công!',
      tokens: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        account: data.account,
        country: data.country
      }
    });
  } catch (error) {
    console.error('Lazada Callback Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
