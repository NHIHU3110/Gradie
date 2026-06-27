#!/usr/bin/env node
/**
 * QA & Auto-heal Omnichannel Agent Loop
 * Usage:
 *   node scripts/auto-heal-and-qa.js           # single run
 *   node scripts/auto-heal-and-qa.js --loop 5m # run every 5 minutes
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const ROOT = path.join(__dirname, '..');
const PRODUCTS_JSON_PATH = path.join(ROOT, 'data', 'products.json');
const GLOBAL_DATA_PATH = path.join(ROOT, 'js', 'global-data.js');
const WEBS_GLOBAL_DATA_PATH = path.join(ROOT, 'gradie-website', 'js', 'global-data.js');
const LOG_FILE = path.join(ROOT, 'logs', 'integration-monitor.log');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/';

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

// -------------------------------------------------------------
// Image Validation Utilities
// -------------------------------------------------------------
function isPlaceholder(url) {
  if (!url || typeof url !== 'string') return true;
  const u = url.trim().toLowerCase();
  return (
    u.includes('placeholder') ||
    u.includes('unsplash.com') ||
    u.includes('ui-avatars.com') ||
    !u.startsWith('http')
  );
}

async function isImageOk(url) {
  if (isPlaceholder(url)) {
    return { ok: false, reason: 'PLACEHOLDER_OR_INVALID' };
  }
  try {
    const res = await fetch(url.trim(), { method: 'HEAD', redirect: 'follow' });
    if (!res.ok) {
      return { ok: false, reason: `HTTP_STATUS_${res.status}` };
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.startsWith('image/')) {
      return { ok: false, reason: `CONTENT_TYPE_${ct || 'NONE'}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: `FETCH_ERROR_${err.message}` };
  }
}

// -------------------------------------------------------------
// Settings Loader
// -------------------------------------------------------------
async function loadMergedSettings(db) {
  const settings = {
    tikiAppKey: process.env.TIKI_APP_KEY || process.env.TIKI_APP_ID,
    tikiAppSecret: process.env.TIKI_APP_SECRET,
    lazadaAppKey: process.env.LAZADA_APP_KEY,
    lazadaAppSecret: process.env.LAZADA_APP_SECRET,
    lazadaAccessToken: process.env.LAZADA_ACCESS_TOKEN,
    lazadaApiBaseUrl: process.env.LAZADA_API_BASE_URL || 'https://api.lazada.vn/rest'
  };

  // 1. Try reading from MongoDB
  try {
    const dbSettings = await db.collection('settings').findOne({});
    if (dbSettings) {
      if (dbSettings.tikiAppKey) settings.tikiAppKey = dbSettings.tikiAppKey;
      if (dbSettings.tikiAppSecret) settings.tikiAppSecret = dbSettings.tikiAppSecret;
      if (dbSettings.lazadaAppKey) settings.lazadaAppKey = dbSettings.lazadaAppKey;
      if (dbSettings.lazadaAppSecret) settings.lazadaAppSecret = dbSettings.lazadaAppSecret;
      if (dbSettings.lazadaAccessToken) settings.lazadaAccessToken = dbSettings.lazadaAccessToken;
      if (dbSettings.lazadaApiBaseUrl) settings.lazadaApiBaseUrl = dbSettings.lazadaApiBaseUrl;
    }
  } catch (e) {
    console.warn("Could not load settings from MongoDB", e.message);
  }

  // 2. Try fallback to global-data.js settings if keys are still missing
  try {
    if (fs.existsSync(GLOBAL_DATA_PATH)) {
      const content = fs.readFileSync(GLOBAL_DATA_PATH, 'utf-8');
      const match = content.match(/window\.GRADIE_DATA\s*=\s*(\{[\s\S]*?\});/);
      if (match) {
        const dataObj = JSON.parse(match[1]);
        const gSettings = dataObj.settings || {};
        if (!settings.tikiAppKey) settings.tikiAppKey = gSettings.tikiAppKey || gSettings.tikiAppId;
        if (!settings.tikiAppSecret) settings.tikiAppSecret = gSettings.tikiAppSecret;
        if (!settings.lazadaAppKey) settings.lazadaAppKey = gSettings.lazadaAppKey;
        if (!settings.lazadaAppSecret) settings.lazadaAppSecret = gSettings.lazadaAppSecret;
        if (!settings.lazadaAccessToken) settings.lazadaAccessToken = gSettings.lazadaAccessToken;
        if (!settings.lazadaApiBaseUrl) settings.lazadaApiBaseUrl = gSettings.lazadaApiBaseUrl;
      }
    }
  } catch (e) {
    console.warn("Could not read fallback settings from global-data.js", e.message);
  }

  return settings;
}

// -------------------------------------------------------------
// Synchronization Helper
// -------------------------------------------------------------
function syncToLocalFiles(products) {
  try {
    // 1. Write to products.json
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');

    // 2. Write to js/global-data.js
    if (fs.existsSync(GLOBAL_DATA_PATH)) {
      let content = fs.readFileSync(GLOBAL_DATA_PATH, 'utf-8');
      const match = content.match(/window\.GRADIE_DATA\s*=\s*(\{[\s\S]*?\});?\s*$/);
      if (match) {
        let dataObj = JSON.parse(match[1]);
        dataObj.products = products;
        fs.writeFileSync(GLOBAL_DATA_PATH, "window.GRADIE_DATA = " + JSON.stringify(dataObj, null, 2) + ";", 'utf-8');
      }
    }

    // 3. Write to gradie-website/js/global-data.js
    if (fs.existsSync(WEBS_GLOBAL_DATA_PATH)) {
      let content = fs.readFileSync(WEBS_GLOBAL_DATA_PATH, 'utf-8');
      const match = content.match(/window\.GRADIE_DATA\s*=\s*(\{[\s\S]*?\});?\s*$/);
      if (match) {
        let dataObj = JSON.parse(match[1]);
        dataObj.products = products;
        fs.writeFileSync(WEBS_GLOBAL_DATA_PATH, "window.GRADIE_DATA = " + JSON.stringify(dataObj, null, 2) + ";", 'utf-8');
      }
    }
  } catch (err) {
    console.error("Error writing files in syncToLocalFiles:", err.message);
  }
}

// -------------------------------------------------------------
// Lazada API helpers
// -------------------------------------------------------------
const crypto = require('crypto');
function buildLazadaSignature(apiName, secret, params) {
  const text = Object.keys(params)
    .sort()
    .map(key => `${key}${typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key]}`)
    .join('');
  return crypto.createHmac('sha256', secret).update(apiName + text).digest('hex').toUpperCase();
}

async function fetchLazadaProductsLive(settings) {
  if (!settings.lazadaAppKey || !settings.lazadaAppSecret || !settings.lazadaAccessToken) {
    return { error: 'MISSING_CREDENTIALS', products: [] };
  }
  const apiName = '/products/get';
  const params = {
    app_key: settings.lazadaAppKey,
    access_token: settings.lazadaAccessToken,
    sign_method: 'sha256',
    timestamp: Date.now().toString(),
    format: 'json',
    version: '1.0',
    filter: 'all'
  };
  params.sign = buildLazadaSignature(apiName, settings.lazadaAppSecret, params);
  const url = new URL(settings.lazadaApiBaseUrl.replace(/\/$/g, '') + apiName);
  Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));

  try {
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();
    if (!res.ok || data.code !== "0") {
      return { error: data.message || `Lazada HTTP ${res.status}`, code: data.code, products: [] };
    }
    return { products: data.data?.products || [] };
  } catch (e) {
    return { error: `FETCH_ERROR: ${e.message}`, products: [] };
  }
}

// -------------------------------------------------------------
// Tiki API helpers
// -------------------------------------------------------------
async function fetchTikiProductsLive(settings) {
  if (!settings.tikiAppKey || !settings.tikiAppSecret) {
    return { error: 'MISSING_CREDENTIALS', products: [] };
  }
  try {
    // Auth Token
    const tokenParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: settings.tikiAppKey,
      client_secret: settings.tikiAppSecret
    });
    const tokenRes = await fetch('https://api.tiki.vn/sc/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });
    const tokenData = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenData.access_token) {
      return { error: tokenData.error || tokenData.message || `Tiki Auth HTTP ${tokenRes.status}`, products: [] };
    }

    // Fetch Products
    const res = await fetch('https://api.tiki.vn/integration/v2/products?include=inventory&limit=50', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: data.message || `Tiki Products HTTP ${res.status}`, products: [] };
    }
    return { products: data.data || [] };
  } catch (e) {
    return { error: `FETCH_ERROR: ${e.message}`, products: [] };
  }
}

// -------------------------------------------------------------
// Main Monitor Loop Routine
// -------------------------------------------------------------
async function runLoop() {
  console.log(`\n--- Starting QA & Auto-heal cycle at ${ts()} ---`);
  const client = new MongoClient(MONGODB_URI);
  let logsToWrite = [];

  try {
    await client.connect();
    const db = client.db('gradie_db');

    // Load Settings
    const settings = await loadMergedSettings(db);

    // 1. Task 1: Auto-heal Parent Product Image
    const products = await db.collection('products').find({}).toArray();
    let updatedProductsList = [...products];
    let fileSyncRequired = false;

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const imageStatus = await isImageOk(p.image);
      if (!imageStatus.ok) {
        // Image is missing, placeholder, or broken. Start Auto-heal
        console.log(`[AUTO-HEAL TRIGGERED] Product ID: ${p.id} has invalid parent image ("${p.image}"). Reason: ${imageStatus.reason}`);
        
        let healed = false;
        if (p.variants && p.variants.length > 0) {
          // Find first variant with a valid image
          for (let v of p.variants) {
            const varImageStatus = await isImageOk(v.image);
            if (varImageStatus.ok) {
              // Found! Overwrite parent image
              p.image = v.image;
              await db.collection('products').updateOne({ id: p.id }, { $set: { image: v.image } });
              
              const logMsg = `[${ts()}] - [LOG TYPE: AUTO-HEAL]\n` +
                             `Nhật ký Auto-heal: ${p.id} bị trống ảnh -> [Kết quả: Đã sửa thành công bằng ảnh của Biến thể ${v.sku}].`;
              logsToWrite.push(logMsg);
              console.log(logMsg);
              
              updatedProductsList[i] = p;
              fileSyncRequired = true;
              healed = true;
              break;
            }
          }
        }

        if (!healed) {
          const logMsg = `[${ts()}] - [LOG TYPE: AUTO-HEAL]\n` +
                         `Nhật ký Auto-heal: ${p.id} bị trống ảnh -> [Kết quả: Thất bại do không biến thể nào có ảnh].`;
          logsToWrite.push(logMsg);
          console.log(logMsg);
        }
      }
    }

    if (fileSyncRequired) {
      syncToLocalFiles(updatedProductsList);
    }

    // 2. Task 2: Lazada & Tiki Integration QA & Isolation Verification
    // A. Verify Lazada
    let lazadaLiveProducts = [];
    let lazadaErrorLog = null;
    if (!settings.lazadaAppKey || !settings.lazadaAppSecret || !settings.lazadaAccessToken) {
      lazadaErrorLog = `Lazada -> [Tất cả SKU] -> [Nguyên nhân kỹ thuật bóc tách được từ API: thiếu Credentials kết nối]`;
    } else {
      const res = await fetchLazadaProductsLive(settings);
      if (res.error) {
        lazadaErrorLog = `Lazada -> [Tất cả SKU] -> [Nguyên nhân kỹ thuật bóc tách được từ API: lỗi phân quyền API / Token hết hạn (${res.error})]`;
      } else {
        lazadaLiveProducts = res.products;
      }
    }

    // B. Verify Tiki
    let tikiLiveProducts = [];
    let tikiErrorLog = null;
    if (!settings.tikiAppKey || !settings.tikiAppSecret) {
      tikiErrorLog = `Tiki -> [Tất cả SKU] -> [Nguyên nhân kỹ thuật bóc tách được từ API: thiếu Credentials kết nối]`;
    } else {
      const res = await fetchTikiProductsLive(settings);
      if (res.error) {
        tikiErrorLog = `Tiki -> [Tất cả SKU] -> [Nguyên nhân kỹ thuật bóc tách được từ API: lỗi phân quyền API / Token hết hạn (${res.error})]`;
      } else {
        tikiLiveProducts = res.products;
      }
    }

    // D. Scan CMS products for potential payload problems (empty/placeholder images mapped to marketplaces)
    // and check if any contaminated products are present (Website isolation)
    let webSyncIsNormal = true;
    let contaminationDetails = [];

    products.forEach(p => {
      // Data Isolation check: Verify if Lazada/Tiki products are mistakenly flagged showOnWebsite: true
      const isMarketplaceProduct = p.marketplaceSource === 'Lazada' || p.marketplaceSource === 'Tiki';
      if (isMarketplaceProduct && p.showOnWebsite === true) {
        webSyncIsNormal = false;
        contaminationDetails.push(`Sản phẩm sàn ${p.marketplaceSource} bị nhảy vào catalog web (showOnWebsite = true): ID ${p.id}, SKU ${p.sku}`);
      }

      const isWebProduct = !p.marketplaceSource || p.marketplaceSource === 'Website';
      if (isWebProduct) {
        const dup = products.find(x => x.id === p.id && x.marketplaceSource && x.marketplaceSource !== p.marketplaceSource);
        if (dup) {
          webSyncIsNormal = false;
          contaminationDetails.push(`Xung đột ID sản phẩm: ID ${p.id} bị trùng lặp giữa Web và Sàn ${dup.marketplaceSource}`);
        }
      }

      // Payload QA verification: if this product is mapped to Lazada/Tiki, verify we don't send placeholders
      const hasLazadaStock = p.lazadaStock > 0 || (p.variants && p.variants.some(v => v.lazadaStock > 0));
      const hasTikiStock = p.tikiStock > 0 || (p.variants && p.variants.some(v => v.tikiStock > 0));

      if (hasLazadaStock && isPlaceholder(p.image)) {
        const logMsg = `[${ts()}] - [LOG TYPE: API ERROR]\n` +
                       `Nhật ký Lỗi Lazada/Tiki: Lazada -> [SKU: ${p.sku || p.id}] bị lỗi mất ảnh thật khi update -> [Nguyên nhân kỹ thuật bóc tách được từ API: payload gửi thiếu trường hoặc CMS chứa ảnh placeholder].`;
        logsToWrite.push(logMsg);
        console.log(logMsg);
      }
      if (hasTikiStock && isPlaceholder(p.image)) {
        const logMsg = `[${ts()}] - [LOG TYPE: API ERROR]\n` +
                       `Nhật ký Lỗi Lazada/Tiki: Tiki -> [SKU: ${p.sku || p.id}] bị lỗi mất ảnh thật khi update -> [Nguyên nhân kỹ thuật bóc tách được từ API: payload gửi thiếu trường hoặc CMS chứa ảnh placeholder].`;
        logsToWrite.push(logMsg);
        console.log(logMsg);
      }
    });

    if (lazadaErrorLog) {
      const logMsg = `[${ts()}] - [LOG TYPE: API ERROR]\nNhật ký Lỗi Lazada/Tiki: ${lazadaErrorLog}`;
      logsToWrite.push(logMsg);
      console.log(logMsg);
    }
    if (tikiErrorLog) {
      const logMsg = `[${ts()}] - [LOG TYPE: API ERROR]\nNhật ký Lỗi Lazada/Tiki: ${tikiErrorLog}`;
      logsToWrite.push(logMsg);
      console.log(logMsg);
    }

    // Log isolation state
    const isolationStatus = webSyncIsNormal 
      ? `Trạng thái đồng bộ sản phẩm Web: Bình thường (Không bị sản phẩm sàn nhảy vào)`
      : `Trạng thái đồng bộ sản phẩm Web: Cảnh báo bị đè dữ liệu (${contaminationDetails.join('; ')})`;
    
    const isolationLogMsg = `[${ts()}] - [LOG TYPE: WEB SYNC STATUS]\n${isolationStatus}`;
    logsToWrite.push(isolationLogMsg);
    console.log(isolationStatus);

    // 3. Task 3: Inventory Parity Checks
    // Compare stocks between database and APIs
    console.log("Checking inventory parity...");
    
    if (lazadaLiveProducts.length > 0) {
      products.forEach(p => {
        if (p.marketplaceSource === 'Lazada' || p.lazadaStock !== undefined) {
          const lzMatch = lazadaLiveProducts.find(lp => String(lp.item_id) === String(p.id) || lp.skus?.some(s => s.SellerSku === p.sku));
          if (lzMatch) {
            let apiStock = 0;
            if (lzMatch.skus) {
              apiStock = lzMatch.skus.reduce((sum, s) => sum + (Number(s.sellableQuantity ?? s.quantity ?? s.Available ?? 0) || 0), 0);
            }
            const cmsStock = p.lazadaStock || 0;
            if (cmsStock !== apiStock) {
              const logMsg = `[${ts()}] - [LOG TYPE: INVENTORY MISMATCH]\nLazada -> SKU ${p.sku || p.id} -> CMS Lazada Stock: ${cmsStock} vs API Stock: ${apiStock}`;
              logsToWrite.push(logMsg);
              console.log(logMsg);
            }
          }
        }
      });
    }

    if (tikiLiveProducts.length > 0) {
      products.forEach(p => {
        if (p.marketplaceSource === 'Tiki' || p.tikiStock !== undefined) {
          // Find all Tiki products that match this parent or any variant
          const matches = tikiLiveProducts.filter(tp => {
            const tpId = String(tp.product_id || tp.id);
            const tpSku = tp.sku || '';
            const tpOrig = tp.original_sku || tp.originalSku || '';
            const pSkuNorm = normSku(p.sku);
            
            if (tpId === String(p.id) || (tpSku && normSku(tpSku) === pSkuNorm) || (tpOrig && normSku(tpOrig) === pSkuNorm)) {
              return true;
            }
            if (p.variants && p.variants.length > 0) {
              return p.variants.some(v => {
                const vSkuNorm = normSku(v.sku);
                return (tpSku && normSku(tpSku) === vSkuNorm) || (tpOrig && normSku(tpOrig) === vSkuNorm);
              });
            }
            return false;
          });

          if (matches.length > 0) {
            const apiStock = matches.reduce((sum, m) => {
              const stock = m.inventory ? (m.inventory.quantity_sellable ?? m.inventory.quantity_available ?? 0) : 0;
              return sum + stock;
            }, 0);
            const cmsStock = p.tikiStock || 0;
            if (cmsStock !== apiStock) {
              const logMsg = `[${ts()}] - [LOG TYPE: INVENTORY MISMATCH]\nTiki -> SKU ${p.sku || p.id} -> CMS Tiki Stock: ${cmsStock} vs API Stock: ${apiStock}`;
              logsToWrite.push(logMsg);
              console.log(logMsg);
            }
          }
        }
      });
    }

    // Append all generated logs to log file
    if (logsToWrite.length > 0) {
      fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
      fs.appendFileSync(LOG_FILE, logsToWrite.join('\n\n') + '\n\n', 'utf-8');
    }

  } catch (err) {
    console.error("QA loop encountered an error:", err.message);
  } finally {
    await client.close();
  }
}

// -------------------------------------------------------------
// Command Line Runner
// -------------------------------------------------------------
async function main() {
  const loopArg = process.argv.indexOf('--loop');
  const intervalMs = loopArg >= 0 ? parseInterval(process.argv[loopArg + 1] || '5m') : null;

  await runLoop();

  if (intervalMs) {
    console.log(`[QA MONITOR] Continuous loop armed — executing every ${process.argv[loopArg + 1]}`);
    setInterval(runLoop, intervalMs);
  }
}

main().catch(err => {
  console.error("QA monitor error in main:", err.message);
  process.exit(1);
});
