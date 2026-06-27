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
  const text = collectParameters(params);
  return crypto.createHmac('sha256', secret).update(apiName + text).digest('hex').toUpperCase();
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

  const defaultKey = VALID_KEY || '139567';
  const defaultSecret = VALID_SECRET || '9XXFtXZkH4RAtVWAcyDKnWZZFNYZlM6t';

  const currentKey = appKey || defaultKey;
  const currentSecret = appSecret || defaultSecret;

  const endpointUrl = (baseUrl || DEFAULT_BASE_URL).trim();
  if (!endpointUrl) {
    return res.status(400).json({ success: false, message: 'Missing Lazada API base URL.' });
  }

  try {
    if (action === 'sync_products') {
      const apiName = '/products/get';
      const params = {
        app_key: currentKey,
        access_token: accessToken,
        sign_method: 'sha256',
        timestamp: Date.now().toString(),
        format: 'json',
        version: '1.0',
        filter: 'all'
      };

      params.sign = buildLazadaSignature(apiName, currentSecret, params);

      const url = new URL(endpointUrl + apiName);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      const response = await fetch(url, { method: 'GET' });
      const lazadaData = await response.json();

      if (!response.ok || lazadaData.code !== "0") {
        return res.status(400).json({ 
          success: false, 
          message: lazadaData.message || 'Failed to fetch products from Lazada',
          details: lazadaData
        });
      }

      let realProducts = [];
      if (lazadaData.data && lazadaData.data.products) {
         lazadaData.data.products.forEach(p => {
             let totalStock = 0;
             if (p.skus) p.skus.forEach(s => totalStock += (s.quantity || s.Available || 0));
             
             let name = '';
             if (p.attributes && p.attributes.name) name = p.attributes.name;

             let skuStr = '';
             if (p.skus && p.skus[0] && p.skus[0].SellerSku) {
                 skuStr = p.skus[0].SellerSku;
             }
             
             let price = 0;
             let image = '';
             const gallery = p.images || [];
             if (gallery.length > 0) image = gallery[0];
             if (p.skus && p.skus.length > 0 && p.skus[0].price) price = p.skus[0].price;

             let description = '';
             if (p.attributes) {
                 description = p.attributes.description || p.attributes.short_description || '';
             }

             const variants = [];
             if (p.skus && p.skus.length > 1) {
                 p.skus.forEach(s => {
                     variants.push({
                         name: s.SaleProp ? Object.values(s.SaleProp).join(' / ') : (s.color_family || s.size || 'Variant'),
                         price: Number(s.price) || price,
                         stock: Number(s.quantity || s.Available) || 0,
                         sku: s.SellerSku || ''
                     });
                 });
             }

             realProducts.push({
                 id: String(p.item_id),
                 sku: skuStr,
                 name: name,
                 stock: totalStock,
                 price: price,
                 image: image,
                 gallery: gallery,
                 description: description,
                 variants: variants
             });
         });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Lazada product sync completed.', 
        syncedCount: realProducts.length, 
        products: realProducts,
        timestamp: new Date().toISOString() 
      });
    }

    if (action === 'sync_orders') {
  // Live Lazada API Call
  const method = 'GET';
  const apiName = '/orders/get';
  const params = {
    app_key: currentKey,
    sign_method: 'sha256',
    timestamp: Date.now().toString(),
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
  const mappedOrders = await Promise.all(orderList.map(async (lo) => {
    let items = [];
    try {
      const itemParams = {
        app_key: currentKey,
        sign_method: 'sha256',
        timestamp: Date.now().toString(),
        format: 'json',
        version: '1.0',
        order_id: lo.order_id || lo.order_number
      };
      if (activeAccessToken) {
        itemParams.access_token = activeAccessToken;
      }
      itemParams.sign = buildLazadaSignature('/order/items/get', currentSecret, itemParams);

      const itemResult = await callLazadaApi(endpointUrl, '/order/items/get', itemParams, 'GET');
      const fetchedItems = itemResult.body?.data || [];
      if (fetchedItems.length > 0) {
        items = fetchedItems.map(it => ({
          id: it.sku || `lazada-${it.order_item_id}`,
          name: it.name || 'Sản phẩm Lazada',
          price: Number(it.item_price) || 0,
          quantity: 1,
          image: it.product_main_image || ''
        }));
      }
    } catch (e) {
      console.error("Error fetching items for order", lo.order_id, e);
    }

    // Aggregate items with same SKU/name
    const aggregatedItems = [];
    items.forEach(it => {
      const existing = aggregatedItems.find(x => x.id === it.id || x.name === it.name);
      if (existing) {
        existing.quantity += it.quantity;
      } else {
        aggregatedItems.push({ ...it });
      }
    });

    let subtotal = aggregatedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    if (subtotal === 0) {
      subtotal = Number(lo.price) || 0;
    }
    const shippingFee = Number(lo.shipping_fee) > 0 ? Number(lo.shipping_fee) : 29000;
    const total = subtotal + shippingFee;

    return {
      id: lo.order_id || lo.order_number,
      orderNumber: `LZD-${lo.order_id || lo.order_number}`,
      customerName: `${lo.address_billing?.first_name || ''} ${lo.address_billing?.last_name || ''}`.trim() || 'Khách hàng Lazada',
      customerEmail: lo.customer_email || '',
      customerPhone: lo.address_billing?.phone || lo.address_shipping?.phone || '',
      shippingAddress: `${lo.address_shipping?.address1 || ''}, ${lo.address_shipping?.city || ''}, ${lo.address_shipping?.country || ''}`.replace(/^, | , | ,$/g, '').trim(),
      notes: lo.remarks || '',
      paymentMethod: lo.payment_method || 'Lazada Pay',
      date: lo.created_at ? new Date(lo.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      items: aggregatedItems,
      subtotal: subtotal,
      shippingFee: shippingFee,
      total: total,
      status: lo.statuses?.[0] || 'Pending',
      source: 'Lazada'
    };
  }));

  // Standardized success response matching Tiki's format
  return res.status(200).json({ success: true, orders: mappedOrders });
}
      // Live Lazada API Call
      const method = 'GET';
      const apiName = '/orders/get';
      const params = {
        app_key: currentKey,
        sign_method: 'sha256',
        timestamp: Date.now().toString(),
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
            const mappedOrders = await Promise.all(orderList.map(async (lo) => {
          
          let items = [];

          try {
              const itemParams = {
                  app_key: currentKey,
                  sign_method: 'sha256',
                  timestamp: Date.now().toString(),
                  format: 'json',
                  version: '1.0',
                  order_id: lo.order_id || lo.order_number
              };
              if (activeAccessToken) {
                  itemParams.access_token = activeAccessToken;
              }
              itemParams.sign = buildLazadaSignature('/order/items/get', currentSecret, itemParams);
              
              const itemResult = await callLazadaApi(endpointUrl, '/order/items/get', itemParams, 'GET');
              const fetchedItems = itemResult.body?.data || [];
              if (fetchedItems.length > 0) {
                  items = fetchedItems.map(it => ({
                      id: it.sku || `lazada-${it.order_item_id}`,
                      name: it.name || 'Sản phẩm Lazada',
                      price: Number(it.item_price) || 0,
                      quantity: 1, // Lazada returns one row per item quantity
                      image: it.product_main_image || ''
                  }));
              }
          } catch (e) {
              console.error("Error fetching items for order", lo.order_id, e);
          }

          // Aggregate items with same SKU/name
          const aggregatedItems = [];
          items.forEach(it => {
              const existing = aggregatedItems.find(x => x.id === it.id || x.name === it.name);
              if (existing) {
                  existing.quantity += 1;
              } else {
                  aggregatedItems.push({ ...it });
              }
          });
          
          let subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
          if (subtotal === 0) {
              subtotal = Number(lo.price) || 0;
          }
          const shippingFee = Number(lo.shipping_fee) > 0 ? Number(lo.shipping_fee) : 29000;
          const total = subtotal + shippingFee;
          
          return {
            orderNumber: `LZD-${lo.order_id || lo.order_number}`,
            customerName: `${lo.address_billing?.first_name || ''} ${lo.address_billing?.last_name || ''}`.trim() || 'Khách hàng Lazada',
            customerEmail: lo.customer_email || '',
            customerPhone: lo.address_billing?.phone || lo.address_shipping?.phone || '',
            shippingAddress: `${lo.address_shipping?.address1 || ''}, ${lo.address_shipping?.city || ''}, ${lo.address_shipping?.country || ''}`.replace(/^, | , | ,$/g, '').trim(),
            notes: lo.remarks || '',
            paymentMethod: lo.payment_method || 'Lazada Pay',
            date: lo.created_at ? new Date(lo.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            items: aggregatedItems,
            subtotal: subtotal,
            shippingFee: shippingFee,
            total: total,
            status: lo.statuses?.[0] || 'Pending',
            source: 'Lazada'
          };
        }));

      console.log('Lazada sync orders trace:', {
        code: responseBody.code,
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
        timestamp: Math.floor(Date.now() / 1000).toString(),
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

    return res.status(400).json({ success: false, message: `Unsupported action: '${action}'.` });
  } catch (error) {
    console.error('Lazada API sync error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during Lazada sync.', error: error.message });
  }
};
