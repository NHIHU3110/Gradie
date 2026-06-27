#!/usr/bin/env node
/**
 * Remove invalid gallery URLs (Lazada product pages, ui-avatars placeholders, .html links)
 * from products.json and sync to global-data.js files.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PRODUCTS_JSON_PATH = path.join(ROOT, 'data', 'products.json');
const GLOBAL_DATA_PATH = path.join(ROOT, 'js', 'global-data.js');
const WEBS_GLOBAL_DATA_PATH = path.join(ROOT, 'gradie-website', 'js', 'global-data.js');

function isValidProductImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const cleaned = url.trim().replace(/^[`'"]+|[`'"]+$/g, '');
  const lower = cleaned.toLowerCase();
  if (!lower.startsWith('http')) return false;
  if (
    lower.includes('ui-avatars.com') ||
    lower.includes('placeholder') ||
    lower.includes('via.placeholder') ||
    lower.includes('unsplash.com') ||
    lower.includes('lazada.vn/products') ||
    lower.includes('tiki.vn/p/') ||
    lower.includes('shopee.vn/product')
  ) return false;
  if (/\.html(\?|#|$)/i.test(lower)) return false;
  return true;
}

function cleanProduct(product) {
  let removed = 0;
  const beforeGallery = Array.isArray(product.gallery) ? product.gallery.length : 0;

  const cleanList = (list) => {
    if (!Array.isArray(list)) return [];
    const next = [];
    list.forEach((url) => {
      if (isValidProductImageUrl(url)) {
        if (!next.includes(url)) next.push(url);
      } else if (url) {
        removed += 1;
      }
    });
    return next;
  };

  product.gallery = cleanList(product.gallery);
  if (product.image && !isValidProductImageUrl(product.image)) {
    removed += 1;
    product.image = product.gallery[0] || '';
  } else if (!product.image && product.gallery.length > 0) {
    product.image = product.gallery[0];
  }

  if (Array.isArray(product.variants)) {
    product.variants.forEach((v) => {
      if (v.image && !isValidProductImageUrl(v.image)) {
        removed += 1;
        v.image = product.image || product.gallery[0] || '';
      }
    });
  }

  return { removed, beforeGallery, afterGallery: product.gallery.length };
}

function syncGlobalData(products, filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/window\.GRADIE_DATA\s*=\s*(\{[\s\S]*?\});?\s*$/);
  if (!match) return;
  const dataObj = JSON.parse(match[1]);
  dataObj.products = products;
  fs.writeFileSync(filePath, 'window.GRADIE_DATA = ' + JSON.stringify(dataObj, null, 2) + ';', 'utf-8');
}

const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));
let totalRemoved = 0;
const changed = [];

products.forEach((p) => {
  const result = cleanProduct(p);
  if (result.removed > 0) {
    totalRemoved += result.removed;
    changed.push(`${p.sku || p.id}: -${result.removed} (${result.beforeGallery} → ${result.afterGallery})`);
  }
});

fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');
syncGlobalData(products, GLOBAL_DATA_PATH);
syncGlobalData(products, WEBS_GLOBAL_DATA_PATH);

console.log(`Cleaned ${changed.length} products, removed ${totalRemoved} invalid image URLs.`);
changed.slice(0, 20).forEach((line) => console.log(' ', line));
if (changed.length > 20) console.log(`  ... and ${changed.length - 20} more`);
