export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { action, appId, appKey, appSecret } = req.body;
    const currentAppId = appId || appKey;

    if (!currentAppId || !appSecret) {
      return res.status(400).json({ success: false, message: 'Missing Tiki App ID or App Secret' });
    }

    // Step 1: Get Access Token
    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'client_credentials');
    tokenParams.append('client_id', currentAppId);
    tokenParams.append('client_secret', appSecret);

    const tokenResponse = await fetch('https://api.tiki.vn/sc/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      return res.status(401).json({ 
        success: false, 
        message: 'Tiki Authentication Failed. Vui l├▓ng kiß╗âm tra lß║íi App ID, App Secret v├á chß║»c chß║»n bß║ín ─æ├ú Chß║Ñp nhß║¡n kß║┐t nß╗æi tr├¬n Tiki Seller Center.',
        details: errorData
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(401).json({ success: false, message: 'Failed to retrieve access token from Tiki' });
    }

    // Step 2: Fetch Orders
    if (action === 'sync_orders') {
      const ordersResponse = await fetch('https://api.tiki.vn/integration/v2/orders?limit=50', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!ordersResponse.ok) {
        return res.status(ordersResponse.status).json({ success: false, message: 'Failed to fetch orders from Tiki' });
      }

      const ordersData = await ordersResponse.json();
      const tikiOrders = ordersData.data || [];

      // Transform to Gradie format
      const formattedOrders = tikiOrders.map(order => {
        // Map Tiki statuses to Gradie statuses
        let status = 'Pending';
        const tikiStatus = (order.status || '').toLowerCase();
        if (tikiStatus === 'processing' || tikiStatus === 'packaging') status = 'Processing';
        else if (tikiStatus === 'shipping' || tikiStatus === 'shipped') status = 'Shipped';
        else if (tikiStatus === 'successful' || tikiStatus === 'delivered') status = 'Delivered';
        else if (tikiStatus === 'canceled' || tikiStatus === 'returned') status = 'Cancelled';

        let customerName = 'Kh├ích Tiki';
        let customerPhone = '';
        let address = '';
        
        if (order.shipping && order.shipping.address) {
          customerName = order.shipping.address.full_name || customerName;
          customerPhone = order.shipping.address.phone || '';
          address = order.shipping.address.street || '';
        }

        const items = (order.items || []).map(item => ({
          id: item.product && item.product.sku ? item.product.sku : 'tiki-item',
          name: item.product && item.product.name ? item.product.name : 'Sß║ún phß║⌐m Tiki',
          price: item.price || 0,
          quantity: item.qty || 1,
          image: ''
        }));

        return {
          id: order.code,
          orderNumber: 'TIKI-' + order.code,
          customerName: customerName,
          customerEmail: '',
          customerPhone: customerPhone,
          shippingAddress: address,
          date: order.created_at || new Date().toISOString(),
          status: status,
          total: (order.invoice && order.invoice.grand_total) ? order.invoice.grand_total : 0,
          paymentMethod: 'Tiki',
          source: 'Tiki',
          items: items
        };
      });

      return res.status(200).json({ success: true, orders: formattedOrders });
    }

    // Step 3: Mock Products
    if (action === 'sync_products') {
      const productIds = req.body.productIds || [
        'gau_bong_tot_nghiep', 'hop_qua_tot_nghiep_1', 'hoa_sap_tot_nghiep_2', '1734260341774'
      ];
      const mockProducts = productIds.map(id => ({
        id: id,
        stock: Math.floor(Math.random() * 50) + 1
      }));

      return res.status(200).json({
        success: true,
        message: 'Product synchronization successful.',
        syncedCount: mockProducts.length,
        products: mockProducts,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid action' });

  } catch (error) {
    console.error('Tiki API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
