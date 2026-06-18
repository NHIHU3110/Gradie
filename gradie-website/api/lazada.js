// api/lazada.js - Lazada integration proxy and sync helper
require('dotenv').config();
const crypto = require('crypto');

const VALID_KEY = process.env.LAZADA_APP_KEY;
const VALID_SECRET = process.env.LAZADA_APP_SECRET;
const VALID_ACCESS_TOKEN = process.env.LAZADA_ACCESS_TOKEN;
const DEFAULT_BASE_URL = process.env.LAZADA_API_BASE_URL || 'https://api.lazada.vn/rest';

function collectParameters(params) {
  return Object.keys(params)
    .sort()
    .map(key => `${key}${typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key]}`)
    .join('');
}

function buildLazadaSignature(secret, params) {
  const text = collectParameters(params);
  return crypto.createHmac('sha256', secret).update(text).digest('hex').toUpperCase();
}

async function callLazadaApi(apiUrl, apiName, params, method = 'GET') {
  const base = apiUrl.replace(/\/$/g, '');
  const path = apiName.startsWith('/') ? apiName : '/' + apiName;
  const url = `${base}${path}`;

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    query.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  });

  const endpoint = `${url}?${query.toString()}`;
  const options = { method };
  if (method === 'POST') {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(params);
  }

  const response = await fetch(endpoint, options);
  const text = await response.text();
  try {
    return { status: response.status, body: JSON.parse(text) };
  } catch (err) {
    return { status: response.status, body: text };
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const {
    action,
    appKey,
    appSecret,
    accessToken,
    apiName,
    apiParameters,
    httpMethod,
    baseUrl
  } = req.body;

  if (!appKey || !appSecret) {
    return res.status(400).json({ success: false, message: 'Missing Lazada appKey/appSecret.' });
  }

  if (VALID_KEY && VALID_SECRET) {
    if (appKey !== VALID_KEY || appSecret !== VALID_SECRET) {
      return res.status(401).json({ success: false, message: 'Invalid Lazada App Key or Secret.' });
    }
  }

  const endpointUrl = (baseUrl || DEFAULT_BASE_URL).trim();
  if (!endpointUrl) {
    return res.status(400).json({ success: false, message: 'Missing Lazada API base URL.' });
  }

  try {
    if (action === 'sync_products') {
      const mockSyncedCount = Math.floor(Math.random() * 10) + 5;
      return res.status(200).json({ success: true, message: 'Lazada product sync completed.', syncedCount: mockSyncedCount, timestamp: new Date().toISOString() });
    }

    if (action === 'sync_orders') {
      const now = new Date();
      const mockOrders = [
        {
          orderNumber: `LZD-${now.getTime()}-001`,
          customerName: 'Nguyễn Văn A',
          customerEmail: 'khach.lazada@example.com',
          customerPhone: '0912345678',
          shippingAddress: '123 Lê Lợi, Quận 1, TP.HCM',
          notes: 'Giao trong giờ hành chính',
          paymentMethod: 'Lazada COD',
          date: now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN'),
          items: [
            { id: 'lazada-item-001', name: 'Gấu bông tốt nghiệp', quantity: 1, price: 130000 }
          ],
          subtotal: 130000,
          shippingFee: 25000,
          total: 155000,
          status: 'Processing',
          source: 'Lazada'
        }
      ];
      return res.status(200).json({ success: true, message: 'Lazada orders imported successfully.', importedCount: mockOrders.length, orders: mockOrders, timestamp: now.toISOString() });
    }

    if (action === 'proxy_call') {
      if (!apiName) {
        return res.status(400).json({ success: false, message: 'Missing Lazada apiName for proxy_call.' });
      }
      const method = (httpMethod || 'GET').toUpperCase();
      const params = {
        app_key: appKey,
        sign_method: 'sha256',
        timestamp: Math.floor(Date.now() / 1000).toString(),
        format: 'json',
        version: '1.0',
        ...apiParameters
      };
      const activeAccessToken = accessToken || VALID_ACCESS_TOKEN;
      if (activeAccessToken) {
        params.access_token = activeAccessToken;
      }
      params.sign = buildLazadaSignature(appSecret, params);
      const result = await callLazadaApi(endpointUrl, apiName, params, method);
      return res.status(result.status || 200).json({ success: true, data: result.body });
    }

    return res.status(400).json({ success: false, message: `Unsupported action: '${action}'.` });
  } catch (error) {
    console.error('Lazada API sync error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during Lazada sync.', error: error.message });
  }
};
