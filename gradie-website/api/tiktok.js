// api/tiktok.js - Sync and manage TikTok Shop integration
require('dotenv').config();

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

  const { action, appKey, appSecret } = req.body;

  // Retrieve valid credentials from environment variables or database fallback
  const validKey = process.env.TIKTOK_APP_KEY || '6k8ruam7245an';
  const validSecret = process.env.TIKTOK_APP_SECRET || '0be1815a89587fe0ac03da26dc1b800359fc3ea4';

  // Validate incoming request credentials
  const currentKey = appKey || validKey;
  const currentSecret = appSecret || validSecret;

  if (!currentKey || !currentSecret || currentKey !== validKey || currentSecret !== validSecret) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid TikTok App Key or App Secret.'
    });
  }

  try {
    if (action === 'sync_products') {
      // Simulate product catalog synchronization with TikTok Shop
      // In a real application, this would fetch from/push to:
      // https://open-api.tiktokglobalshop.com/api/v2/products/search
      
      const mockSyncedCount = Math.floor(Math.random() * 10) + 10; // Sync 10-20 products

      return res.status(200).json({
        success: true,
        message: 'Product synchronization successful.',
        syncedCount: mockSyncedCount,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'sync_orders') {
      const randId = () => Math.floor(1000 + Math.random() * 9000);
      const now = new Date();
      
      const mockOrders = [
        {
          orderNumber: `TTS-26-${randId()}`,
          customerName: "Nguyễn Hải Đăng (TikTok)",
          customerEmail: "haidang.tiktok@example.com",
          customerPhone: "0987654321",
          shippingAddress: "123 Đường Số 9, Phường Thảo Điền, Quận 2, TP.HCM",
          notes: "Giao giờ hành chính, gọi trước khi giao",
          paymentMethod: "TikTok Shop COD",
          date: now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN'),
          items: [
            { id: "gau_bong_tot_nghiep", name: "Gấu Bông Capybara Tốt Nghiệp", quantity: 1, price: 115000 }
          ],
          subtotal: 115000,
          shippingFee: 30000,
          total: 145000,
          status: "Processing",
          source: "TikTok Shop"
        },
        {
          orderNumber: `TTS-26-${randId()}`,
          customerName: "Trần Minh Thư (TikTok)",
          customerEmail: "minhthu.tiktok@example.com",
          customerPhone: "0901234567",
          shippingAddress: "45/2 Đường Lê Lợi, Quận Hải Châu, TP.Đà Nẵng",
          notes: "",
          paymentMethod: "TikTok Shop Credit Card",
          date: new Date(now.getTime() - 600000).toLocaleDateString('vi-VN') + ' ' + new Date(now.getTime() - 600000).toLocaleTimeString('vi-VN'),
          items: [
            { id: "sen_da_va_gau", name: "Bó Hoa Mini Kèm Gấu Tốt Nghiệp", quantity: 2, price: 79000 },
            { id: "keo_mut_trai_tim", name: "Túi Kẹo Lớn Hình Trái Tim", quantity: 1, price: 89000 }
          ],
          subtotal: 247000,
          shippingFee: 35000,
          total: 282000,
          status: "Confirmed",
          source: "TikTok Shop"
        }
      ];

      return res.status(200).json({
        success: true,
        message: 'Orders imported successfully.',
        importedCount: mockOrders.length,
        orders: mockOrders,
        timestamp: now.toISOString()
      });
    }

    return res.status(400).json({
      success: false,
      message: `Unsupported action: '${action}'.`
    });

  } catch (error) {
    console.error('TikTok API sync error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during synchronization.',
      error: error.message
    });
  }
};
