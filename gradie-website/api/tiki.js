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
    let body = req.body;
    if (typeof body === 'string' && body.trim().startsWith('{')) {
      try { body = JSON.parse(body); } catch(e) {}
    }
    console.log("DEBUG: Tiki API received body:", body);
    const { action, appId, appKey, appSecret } = body || {};
    const currentAppId = appId || appKey;

    if (!currentAppId || !appSecret) {
      console.log("DEBUG: Tiki validation failed. appId/appKey:", currentAppId, "appSecret:", appSecret ? "PRESENT" : "MISSING");
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
      const tikiOrders = [];
      const pageLimit = 50;
      let page = 1;
      let lastStatus = 200;

      while (page <= 50) {
        const ordersResponse = await fetch(`https://api.tiki.vn/integration/v2/orders?limit=${pageLimit}&page=${page}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        lastStatus = ordersResponse.status;
        const ordersData = await ordersResponse.json().catch(() => ({}));

        console.log('[TIKI ORDERS RAW]', {
          status: ordersResponse.status,
          page,
          count: ordersData.data?.length || 0,
          paging: ordersData.paging || ordersData.meta || null
        });

        if (!ordersResponse.ok) {
          return res.status(ordersResponse.status).json({
            success: false,
            message: 'Failed to fetch orders from Tiki',
            details: ordersData
          });
        }

        const batch = ordersData.data || [];
        tikiOrders.push(...batch);

        const totalPages = ordersData.paging?.total_pages || ordersData.paging?.last_page || ordersData.meta?.total_pages || ordersData.meta?.last_page;
        if (totalPages && page >= totalPages) break;
        if (batch.length < pageLimit) break;
        page += 1;
      }

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
          image: (item.product && (item.product.thumbnail || item.product.thumbnail_url || item.product.image_url)) || ''
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

      return res.status(lastStatus === 200 ? 200 : lastStatus).json({
        success: true,
        importedCount: formattedOrders.length,
        orders: formattedOrders,
        timestamp: new Date().toISOString()
      });
    }

    // Step 3: Fetch Real Products
    if (action === 'sync_products') {
      const extractTikiStock = (inventory) => {
        if (!inventory) return 0;
        if (typeof inventory.quantity_sellable === 'number') return inventory.quantity_sellable;
        if (typeof inventory.quantity_available === 'number') return inventory.quantity_available;
        if (Array.isArray(inventory.warehouse_quantities) && inventory.warehouse_quantities.length > 0) {
          return inventory.warehouse_quantities.reduce((sum, w) => sum + (Number(w.qty_available) || 0), 0);
        }
        return 0;
      };

      const extractTikiImage = (product) => {
        if (product.thumbnail && String(product.thumbnail).startsWith('http')) return product.thumbnail;
        if (Array.isArray(product.images) && product.images.length > 0) {
          const img = product.images.find(i => i && i.url && String(i.url).startsWith('http'));
          if (img) return img.url;
        }
        return '';
      };

      const sellerSku = (product) =>
        product.original_sku || product.originalSku || product.seller_sku || '';

      const tikiProducts = [];
      let page = 1;
      let lastStatus = 200;

      const pageLimit = 50;
      while (page <= 50) {
        const pageQuery = `https://api.tiki.vn/integration/v2/products?include=inventory&limit=${pageLimit}&page=${page}`;
        const productsResponse = await fetch(pageQuery, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );

        lastStatus = productsResponse.status;
        const productsData = await productsResponse.json().catch(() => ({}));

        console.log('[TIKI INVENTORY RAW]', {
          status: productsResponse.status,
          page,
          count: productsData.data?.length || 0,
          paging: productsData.paging || productsData.meta || null,
          sample: (productsData.data || []).slice(0, 2).map(p => ({
            product_id: p.product_id || p.id,
            sku: p.sku,
            original_sku: sellerSku(p),
            name: p.name,
            inventory: p.inventory
          }))
        });

        if (!productsResponse.ok) {
          return res.status(productsResponse.status).json({
            success: false,
            message: 'Failed to fetch products from Tiki',
            details: productsData
          });
        }

        const batch = productsData.data || [];
        if (batch.length === 0) break;
        tikiProducts.push(...batch);

        const totalPages = productsData.paging?.total_pages || productsData.paging?.last_page;
        if (totalPages && page >= totalPages) break;
        if (batch.length < pageLimit) break;
        page += 1;
      }

      const formattedProducts = tikiProducts.map(product => {
        const stock = extractTikiStock(product.inventory);
        const origSku = sellerSku(product);
        return {
          id: String(product.product_id || product.id),
          sku: origSku || product.sku || '',
          original_sku: origSku,
          tiki_sku: product.sku || '',
          name: product.name,
          stock,
          price: product.price || 0,
          image: extractTikiImage(product),
          master_id: product.master_id || null,
          master_sku: product.master_sku || null
        };
      });

      return res.status(lastStatus === 200 ? 200 : lastStatus).json({
        success: true,
        message: 'Product synchronization successful.',
        syncedCount: formattedProducts.length,
        products: formattedProducts,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid action' });

  } catch (error) {
    console.error('Tiki API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
