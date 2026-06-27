#!/usr/bin/env node
/**
 * QA & Integration Monitor — Gradie Omnichannel
 * Usage:
 *   node scripts/integration-monitor.js           # single run
 *   node scripts/integration-monitor.js --loop 5m # every 5 minutes
 *   node scripts/integration-monitor.js --loop 15m
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PRODUCT_ID = process.env.MONITOR_PRODUCT_ID || 'keo_khong_lo';
const SKUS = ['SP007-1', 'SP007-2', 'SP007-3'];
const LOG_FILE = path.join(ROOT, 'logs', 'integration-monitor.log');

const UI_EXPECTED = {
  'SP007-1': { web: 721, tiki: 1000, lazada: 100 },
  'SP007-2': { web: 424, tiki: 1100, lazada: 100 },
  'SP007-3': { web: 608, tiki: 1100, lazada: 100 },
};

const TIKI_KEY = process.env.TIKI_APP_KEY || process.env.TIKI_APP_ID;
const TIKI_SECRET = process.env.TIKI_APP_SECRET;
const LAZADA_KEY = process.env.LAZADA_APP_KEY;
const LAZADA_SECRET = process.env.LAZADA_APP_SECRET;
const LAZADA_TOKEN = process.env.LAZADA_ACCESS_TOKEN || '';
const LAZADA_BASE = process.env.LAZADA_API_BASE_URL || 'https://api.lazada.vn/rest';
const API_BASE = process.env.MONITOR_API_BASE || 'http://localhost:3000';

function ts() {
  return new Date().toISOString();
}

function parseInterval(arg) {
  const m = String(arg || '').match(/^(\d+)(s|m|h)$/);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2];
  if (unit === 's') return n * 1000;
  if (unit === 'm') return n * 60 * 1000;
  if (unit === 'h') return n * 3600 * 1000;
  return null;
}

function normSku(s) {
  return String(s || '').replace(/[\s\-_]/g, '').toLowerCase();
}

function loadCatalogProduct() {
  const productsPath = path.join(ROOT, 'data', 'products.json');
  const globalPath = path.join(ROOT, 'js', 'global-data.js');
  let fromJson = null;
  let fromGlobal = null;

  if (fs.existsSync(productsPath)) {
    const list = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    fromJson = list.find(p => p.id === PRODUCT_ID);
  }
  if (fs.existsSync(globalPath)) {
    const raw = fs.readFileSync(globalPath, 'utf8');
    const match = raw.match(/window\.GRADIE_DATA\s*=\s*(\{[\s\S]*?\});?\s*$/);
    if (match) {
      const data = JSON.parse(match[1]);
      fromGlobal = (data.products || []).find(p => p.id === PRODUCT_ID);
    }
  }
  return { fromJson, fromGlobal };
}

async function checkImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return { ok: false, status: 0, reason: 'MISSING_URL' };
  }
  const cleaned = url.trim().replace(/^[`'"]+|[`'"]+$/g, '');
  if (!cleaned.startsWith('http')) {
    return { ok: false, status: 0, reason: 'INVALID_FORMAT', url: cleaned };
  }
  if (cleaned.includes('ui-avatars.com')) {
    return { ok: false, status: 0, reason: 'PLACEHOLDER_AVATAR', url: cleaned };
  }
  try {
    const res = await fetch(cleaned, { method: 'HEAD', redirect: 'follow' });
    const ct = res.headers.get('content-type') || '';
    const isImage = ct.startsWith('image/');
    return {
      ok: res.ok && isImage,
      status: res.status,
      contentType: ct,
      url: cleaned,
      reason: res.ok ? (isImage ? 'OK' : 'NOT_IMAGE') : 'HTTP_ERROR'
    };
  } catch (err) {
    return { ok: false, status: 0, reason: 'FETCH_ERROR', error: err.message, url: cleaned };
  }
}

async function checkImages(product) {
  const results = [];
  if (!product) return results;

  results.push({ scope: 'parent', sku: product.sku, ...(await checkImageUrl(product.image)) });

  for (const v of product.variants || []) {
    results.push({ scope: 'variant', sku: v.sku, ...(await checkImageUrl(v.image)) });
  }
  return results;
}

async function getTikiToken() {
  if (!TIKI_KEY || !TIKI_SECRET) {
    throw new Error('MISSING_TIKI_CREDENTIALS — set TIKI_APP_KEY and TIKI_APP_SECRET in .env');
  }
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: TIKI_KEY,
    client_secret: TIKI_SECRET,
  });
  const res = await fetch('https://api.tiki.vn/sc/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(`Tiki auth failed: ${data.error || data.message || res.status}`);
  }
  return data.access_token;
}

async function fetchTikiProducts() {
  const token = await getTikiToken();
  const res = await fetch(
    'https://api.tiki.vn/integration/v2/products?include=inventory&limit=50',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Tiki products HTTP ${res.status}: ${data.message || data.error || ''}`);
  return data.data || [];
}

function extractTikiStock(inventory) {
  if (!inventory) return 0;
  if (typeof inventory.quantity_sellable === 'number') return inventory.quantity_sellable;
  if (typeof inventory.quantity_available === 'number') return inventory.quantity_available;
  if (Array.isArray(inventory.warehouse_quantities)) {
    return inventory.warehouse_quantities.reduce((s, w) => s + (Number(w.qty_available) || 0), 0);
  }
  return 0;
}

function matchTikiListing(products, sku, colorHint) {
  const skuNorm = normSku(sku);
  const exactSkuMatches = products.filter(p => {
    const orig = p.original_sku || p.originalSku || '';
    const seller = p.seller_sku || '';
    const tikiSku = p.sku || '';
    return (orig && normSku(orig) === skuNorm) ||
      (seller && normSku(seller) === skuNorm) ||
      (tikiSku && normSku(tikiSku) === skuNorm);
  });
  if (exactSkuMatches.length > 0) return exactSkuMatches;

  return products.filter(p => {
    const name = String(p.name || '').toLowerCase();
    if (name.includes('kẹo quà tặng') || name.includes('túi kẹo')) {
      if (colorHint && name.includes(colorHint.toLowerCase())) return true;
    }
    return false;
  });
}

async function fetchLazadaProducts() {
  if (!LAZADA_KEY || !LAZADA_SECRET) {
    return { error: 'MISSING_LAZADA_APP_CREDENTIALS', products: [] };
  }
  if (!LAZADA_TOKEN) {
    return { error: 'MISSING_LAZADA_ACCESS_TOKEN', products: [] };
  }
  const crypto = require('crypto');
  const apiName = '/products/get';
  const params = {
    app_key: LAZADA_KEY,
    access_token: LAZADA_TOKEN,
    sign_method: 'sha256',
    timestamp: Date.now().toString(),
    format: 'json',
    version: '1.0',
    filter: 'all',
  };
  const text = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('');
  params.sign = crypto.createHmac('sha256', LAZADA_SECRET).update(apiName + text).digest('hex').toUpperCase();
  const url = new URL(LAZADA_BASE + apiName);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.code !== '0') {
    return { error: data.message || `Lazada HTTP ${res.status}`, code: data.code, products: [] };
  }
  return { products: data.data?.products || [] };
}

function findLazadaSkuStock(products, sku) {
  const skuNorm = normSku(sku);
  for (const p of products) {
    for (const s of p.skus || []) {
      if (normSku(s.SellerSku) === skuNorm) {
        return Number(s.sellableQuantity ?? s.quantity ?? s.Available ?? 0) || 0;
      }
    }
  }
  return null;
}

function countPendingOrders(product) {
  const ordersPath = path.join(ROOT, 'js', 'global-data.js');
  if (!fs.existsSync(ordersPath)) return { pending: 0, pendingQty: 0 };
  const raw = fs.readFileSync(ordersPath, 'utf8');
  const match = raw.match(/window\.GRADIE_DATA\s*=\s*(\{[\s\S]*?\});?\s*$/);
  if (!match) return { pending: 0, pendingQty: 0 };
  const data = JSON.parse(match[1]);
  const orders = data.orders || [];
  let pending = 0;
  let pendingQty = 0;
  for (const o of orders) {
    if (!['Pending', 'Processing', 'Confirmed'].includes(o.status)) continue;
    for (const it of o.items || []) {
      if (it.id === PRODUCT_ID || String(it.name || '').toLowerCase().includes('kẹo quà tặng')) {
        pending += 1;
        pendingQty += Number(it.quantity || 1);
      }
    }
  }
  return { pending, pendingQty };
}

function formatReport(report) {
  const lines = [];
  lines.push(`[${report.timestamp}] - [STATUS: ${report.status}]`);
  lines.push(`- Lỗi hình ảnh: ${report.imageSummary}`);
  lines.push(`- Trạng thái API: ${report.apiSummary}`);
  lines.push(`- Trạng thái Đơn hàng: ${report.orderSummary}`);
  if (report.actions.length) {
    lines.push(`- Hành động đề xuất: ${report.actions.join(' | ')}`);
  }
  if (report.details.length) {
    lines.push('--- Chi tiết ---');
    lines.push(...report.details);
  }
  return lines.join('\n');
}

async function runMonitor() {
  const { fromJson, fromGlobal } = loadCatalogProduct();
  const product = fromGlobal || fromJson;
  const details = [];
  const actions = [];
  let hasError = false;

  // 1. Image checks
  const imageChecks = await checkImages(fromJson);
  const imageChecksGlobal = await checkImages(fromGlobal);
  const badImages = [...imageChecks, ...imageChecksGlobal].filter(r => !r.ok);
  const placeholderAvatar = badImages.filter(r => r.reason === 'PLACEHOLDER_AVATAR' || r.reason === 'INVALID_FORMAT');

  let imageSummary;
  if (placeholderAvatar.length) {
    hasError = true;
    imageSummary = `Lỗi hiển thị frontend — URL placeholder/invalid (${placeholderAvatar.map(r => r.sku + ':' + (r.url || r.reason)).join(', ')})`;
    actions.push('Chạy Sync Tiki/Lazada để cập nhật ảnh thật; xóa localStorage GRADIE_CMS_DATA nếu cache cũ');
  } else if (badImages.some(r => r.reason === 'HTTP_ERROR' || r.status === 404)) {
    hasError = true;
    imageSummary = `Link 404/CDN lỗi (${badImages.filter(r => r.status === 404).map(r => r.sku).join(', ')})`;
    actions.push('Kiểm tra CDN Haravan/Tiki; cập nhật gallery trong CMS');
  } else if (badImages.length) {
    hasError = true;
    imageSummary = badImages.map(r => `${r.sku}:${r.reason}`).join('; ');
  } else {
    imageSummary = 'SUCCESS — Tất cả URL ảnh trong catalog hợp lệ (HTTP 200, image/*). Lưu ý: UI có thể hiển thị "Gradie+SP007-1" nếu localStorage cache ảnh placeholder cũ';
  }

  details.push('Ảnh catalog (products.json):');
  imageChecks.forEach(r => {
    details.push(`  ${r.sku}: ${r.ok ? 'OK' : r.reason} ${r.status || ''} ${r.url || ''}`);
  });

  // 2. CMS stock from catalog
  const cmsStock = {};
  if (fromGlobal) {
    for (const v of fromGlobal.variants || []) {
      cmsStock[v.sku] = {
        web: Number(v.stock ?? fromGlobal.stock ?? 0),
        tiki: v.tikiStock ?? fromGlobal.tikiStock ?? 0,
        lazada: v.lazadaStock ?? fromGlobal.lazadaStock ?? 0,
      };
    }
  }
  details.push('Tồn kho CMS (global-data.js — keo_khong_lo):');
  for (const sku of SKUS) {
    const s = cmsStock[sku] || { web: fromGlobal?.stock, tiki: fromGlobal?.tikiStock, lazada: fromGlobal?.lazadaStock };
    details.push(`  ${sku}: Web=${s.web ?? 'N/A'} Tiki=${s.tiki ?? 'N/A'} Lazada=${s.lazada ?? 'N/A'}`);
  }

  // 3. Tiki API
  let tikiApi = {};
  let tikiError = null;
  try {
    const tikiProducts = await fetchTikiProducts();
    const colorMap = { 'SP007-1': 'hồng', 'SP007-2': 'đỏ', 'SP007-3': 'xanh' };
    for (const sku of SKUS) {
      const matches = matchTikiListing(tikiProducts, sku, colorMap[sku]);
      if (matches.length === 0) {
        tikiApi[sku] = { stock: null, note: 'NOT_FOUND' };
      } else if (matches.length > 1) {
        tikiApi[sku] = {
          stock: matches.map(m => extractTikiStock(m.inventory)),
          note: 'MULTIPLE_LISTINGS',
          names: matches.map(m => m.name),
        };
      } else {
        tikiApi[sku] = {
          stock: extractTikiStock(matches[0].inventory),
          original_sku: matches[0].original_sku || matches[0].originalSku,
          tiki_sku: matches[0].sku,
          name: matches[0].name,
        };
      }
    }
  } catch (err) {
    tikiError = err.message;
    hasError = true;
  }

  // 4. Lazada API
  let lazadaApi = {};
  let lazadaError = null;
  const lazadaResult = await fetchLazadaProducts();
  if (lazadaResult.error) {
    lazadaError = lazadaResult.error;
    hasError = true;
  } else {
    for (const sku of SKUS) {
      lazadaApi[sku] = findLazadaSkuStock(lazadaResult.products, sku);
    }
  }

  // 5. Compare with UI expected values
  const mismatches = [];
  for (const sku of SKUS) {
    const exp = UI_EXPECTED[sku];
    const tikiVal = Array.isArray(tikiApi[sku]?.stock) ? tikiApi[sku].stock[0] : tikiApi[sku]?.stock;
    const lazVal = lazadaApi[sku];
    const cms = cmsStock[sku] || {};

    if (tikiVal != null && tikiVal !== exp.tiki) {
      mismatches.push(`${sku} Tiki API=${tikiVal} vs UI=${exp.tiki}`);
    }
    if (lazVal != null && lazVal !== exp.lazada) {
      mismatches.push(`${sku} Lazada API=${lazVal} vs UI=${exp.lazada}`);
    }
    if (cms.tiki != null && cms.tiki !== exp.tiki && cms.tiki !== 0) {
      mismatches.push(`${sku} CMS tikiStock=${cms.tiki} vs UI=${exp.tiki}`);
    }
  }

  if (mismatches.length) hasError = true;

  let apiSummary = '';
  if (tikiError) apiSummary += `Tiki ERROR: ${tikiError}. `;
  if (lazadaError) apiSummary += `Lazada ERROR: ${lazadaError}. `;
  if (mismatches.length) {
    apiSummary += `Lệch số liệu: ${mismatches.join('; ')}`;
    actions.push('Chạy lại Sync Tiki + Sync Lazada sau khi deploy fix original_sku mapping');
  } else if (!tikiError && !lazadaError) {
    apiSummary = 'API kết nối OK — xem chi tiết đối chiếu bên dưới';
  }

  details.push('Tiki API (live):');
  for (const sku of SKUS) {
    details.push(`  ${sku}: ${JSON.stringify(tikiApi[sku] || {})}`);
  }
  details.push('Lazada API (live):');
  for (const sku of SKUS) {
    details.push(`  ${sku}: stock=${lazadaApi[sku] ?? 'N/A'}`);
  }
  details.push('UI mong đợi (screenshot):');
  for (const sku of SKUS) {
    const e = UI_EXPECTED[sku];
    details.push(`  ${sku}: Web=${e.web} Tiki=${e.tiki} Lazada=${e.lazada}`);
  }

  // 6. Pending orders
  const { pending, pendingQty } = countPendingOrders(product);
  const orderSummary = pending
    ? `${pending} đơn Pending/Processing chứa SP007 (tổng ${pendingQty} sp — có thể gây lệch tồn kho Web nếu chưa trừ)`
    : '0 đơn Pending chứa keo_khong_lo trong mock data';

  if (pending > 0) {
    actions.push('Rà soát đơn Pending và xác nhận logic trừ kho Web đã chạy');
  }

  const report = {
    timestamp: ts(),
    status: hasError ? 'ERROR' : 'SUCCESS',
    imageSummary,
    apiSummary: apiSummary.trim() || 'N/A',
    orderSummary,
    actions,
    details,
  };

  const text = formatReport(report);
  console.log(text);

  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, text + '\n\n');

  return report;
}

async function main() {
  const loopArg = process.argv.indexOf('--loop');
  const intervalMs = loopArg >= 0 ? parseInterval(process.argv[loopArg + 1] || '5m') : null;

  if (loopArg >= 0 && !intervalMs) {
    console.error('Usage: node scripts/integration-monitor.js --loop 5m|15m|1h');
    process.exit(1);
  }

  await runMonitor();

  if (intervalMs) {
    console.log(`\n[MONITOR] Loop armed — next run in ${process.argv[loopArg + 1] || '5m'}`);
    setInterval(runMonitor, intervalMs);
  }
}

main().catch(err => {
  console.error(`[${ts()}] - [STATUS: ERROR]`, err.message);
  process.exit(1);
});
