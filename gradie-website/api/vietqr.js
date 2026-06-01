// api/vietqr.js - Generate VietQR payment QR code
// Uses VietQR public API (no registration needed)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, orderNumber, bankCode, accountNumber, accountName } = req.body;

  // Use env vars for bank details, fallback to demo values
  const BANK_CODE     = bankCode     || process.env.BANK_CODE    || 'TCB';
  const ACCOUNT_NO    = accountNumber || process.env.BANK_ACCOUNT || '1234567890';
  const ACCOUNT_NAME  = accountName  || process.env.BANK_NAME    || 'GRADIE SHOP';

  const description = `THANH TOAN ${orderNumber}`.toUpperCase().slice(0, 25);

  // VietQR API — completely free, no auth required
  const vietqrUrl = `https://img.vietqr.io/image/${BANK_CODE}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  res.status(200).json({
    qrUrl: vietqrUrl,
    bankCode: BANK_CODE,
    accountNumber: ACCOUNT_NO,
    accountName: ACCOUNT_NAME,
    amount,
    description
  });
}
