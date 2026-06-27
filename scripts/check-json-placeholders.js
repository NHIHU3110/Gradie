const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log(`Total products in products.json: ${products.length}`);
const isPlaceholder = url => {
  if (!url || typeof url !== 'string') return true;
  const u = url.trim().toLowerCase();
  return u.includes('placeholder') || u.includes('unsplash.com') || u.includes('ui-avatars.com') || !u.startsWith('http');
};

const bad = products.filter(p => isPlaceholder(p.image));
console.log(`Bad products: ${bad.length}`);
bad.forEach(p => {
  console.log(`- ID: ${p.id}, Name: ${p.name}, SKU: ${p.sku}, Image: "${p.image}"`);
  if (p.variants && p.variants.length > 0) {
    p.variants.forEach(v => {
      console.log(`    Variant SKU: ${v.sku}, Name: ${v.name}, Image: "${v.image}"`);
    });
  }
});
