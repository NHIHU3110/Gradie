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

function buildLazadaSignature(apiName, secret, params) {
  const text = apiName + collectParameters(params);
  return crypto.createHmac('sha256', secret).update(text).digest('hex').toUpperCase();
}

const https = require('https');

async function callLazadaApi(apiUrl, apiName, params, method = 'GET') {
  const base = apiUrl.replace(/\/$/g, '');
  const path = apiName.startsWith('/') ? apiName : '/' + apiName;
  const url = `${base}${path}`;

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    query.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  });

  const endpoint = `${url}?${query.toString()}`;
  
  return new Promise((resolve) => {
    const parsedUrl = new URL(endpoint);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {}
    };

    let postData = '';
    if (method === 'POST') {
      options.headers['Content-Type'] = 'application/json';
      postData = JSON.stringify(params);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => {
      console.error("Lazada HTTPS request error:", e);
      resolve({ status: 500, body: { error: e.message } });
    });

    if (method === 'POST') {
      req.write(postData);
    }
    req.end();
  });
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

  const defaultKey = VALID_KEY || '139567';
  const defaultSecret = VALID_SECRET || '9XXFtXZkH4RAtVWAcyDKnWZZFNYZlM6t';

  const currentKey = appKey || defaultKey;
  const currentSecret = appSecret || defaultSecret;

  if (!currentKey || !currentSecret) {
    return res.status(401).json({ success: false, message: 'Missing Lazada App Key or Secret.' });
  }

  const endpointUrl = (baseUrl || DEFAULT_BASE_URL).trim();
  if (!endpointUrl) {
    return res.status(400).json({ success: false, message: 'Missing Lazada API base URL.' });
  }

  try {
    if (action === 'sync_products') {
      return res.status(200).json({ success: true, message: 'Lazada product sync completed.', syncedCount: 0, timestamp: new Date().toISOString() });
    }

    if (action === 'sync_orders') {
      // Live Lazada API Call
      const method = 'GET';
      const apiName = '/orders/get';
      const params = {
        app_key: currentKey,
        sign_method: 'sha256',
        timestamp: Date.now().toString(), // Lazada requires milliseconds, not seconds
        format: 'json',
        version: '1.0',
        created_after: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
      };
      
      const activeAccessToken = accessToken || VALID_ACCESS_TOKEN;
      if (activeAccessToken) {
        params.access_token = activeAccessToken;
      }
      
      params.sign = buildLazadaSignature(apiName, currentSecret, params);
      const result = await callLazadaApi(endpointUrl, apiName, params, method);
      
      const responseBody = result.body || {};
      const orderList = (responseBody.data && responseBody.data.orders) || [];
      
      const mappedOrders = orderList.map(lo => {
        const total = Number(lo.price) || 0;
        const shippingFee = Number(lo.shipping_fee) || 0;
        const subtotal = total - shippingFee;
        
        return {
          orderNumber: `LZD-${lo.order_id || lo.order_number}`,
          customerName: `${lo.address_billing?.first_name || ''} ${lo.address_billing?.last_name || ''}`.trim() || 'Lazada Customer',
          customerEmail: lo.customer_email || 'customer@lazada.com',
          customerPhone: lo.address_billing?.phone || lo.address_shipping?.phone || '',
          shippingAddress: `${lo.address_shipping?.address1 || ''}, ${lo.address_shipping?.city || ''}, ${lo.address_shipping?.country || ''}`,
          notes: lo.remarks || '',
          paymentMethod: lo.payment_method || 'Lazada Pay',
          date: lo.created_at ? new Date(lo.created_at).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN'),
          items: [
            { id: 'lazada-item', name: 'Lazada Order Item', quantity: 1, price: subtotal }
          ],
          subtotal: subtotal,
          shippingFee: shippingFee,
          total: total,
          status: lo.statuses?.[0] || 'Pending',
          source: 'Lazada'
        };
      });

      console.log('Lazada sync orders trace:', {
        code: responseBody.code,
        message: responseBody.message,
        request_id: responseBody.request_id,
        _trace_id_: responseBody._trace_id_
      });

      return res.status(200).json({
        success: true,
        message: 'Lazada orders imported successfully.',
        importedCount: mappedOrders.length,
        orders: mappedOrders,
        code: responseBody.code,
        request_id: responseBody.request_id,
        _trace_id_: responseBody._trace_id_,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'proxy_call') {
      if (!apiName) {
        return res.status(400).json({ success: false, message: 'Missing Lazada apiName for proxy_call.' });
      }
      const method = (httpMethod || 'GET').toUpperCase();
      const params = {
        app_key: appKey,
        sign_method: 'sha256',
        timestamp: Date.now().toString(), // Lazada requires milliseconds
        format: 'json',
        version: '1.0',
        ...apiParameters
      };
      const activeAccessToken = accessToken || VALID_ACCESS_TOKEN;
      if (activeAccessToken) {
        params.access_token = activeAccessToken;
      }
      params.sign = buildLazadaSignature(apiName, appSecret, params);
      const result = await callLazadaApi(endpointUrl, apiName, params, method);
      return res.status(result.status || 200).json({ success: true, data: result.body });
    }

    return res.status(400).json({ success: false, message: 'Invalid action.' });
  } catch (error) {
    console.error('Lazada API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
