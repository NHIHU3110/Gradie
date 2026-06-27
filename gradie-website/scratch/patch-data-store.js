const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../js/data-store.js');
let content = fs.readFileSync(targetPath, 'utf8');

// Target segment to replace
const targetStr = `      if (res.ok && data.success) {
        if (data.products && Array.isArray(data.products)) {
          let all = this.getProducts();
             data.products.forEach(lzdp => {
                let p = all.find(x => {
                  let matchId = String(x.id) === String(lzdp.id);
                  let matchSku = x.sku && lzdp.sku && String(x.sku).trim().toLowerCase() === String(lzdp.sku).trim().toLowerCase();
                  let n1 = x.name ? x.name.trim().toLowerCase() : '';
                  let n2 = lzdp.name ? lzdp.name.trim().toLowerCase() : '';
                  let matchName = n1 && n2 && (n1 === n2 || n1.includes(n2) || n2.includes(n1));
                  return matchId || matchSku || matchName;
                });
                 if (p) {
                     if (lzdp.image) {
                         p.image = lzdp.image;
                         fetch('/api/products', {
                             method: 'PUT',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify(p)
                         }).catch(e => console.error('Sync product error', e));
                     }
                 } else {
                    all.push({
                        id: String(Date.now() + Math.floor(Math.random() * 1000)),
                        sku: lzdp.sku || '',
                        name: lzdp.name || 'Sản phẩm mới từ Lazada',
                        price: lzdp.price || 0,
                        stock: 0,
                        lazadaStock: lzdp.stock,
                        category: 'Uncategorized',
                        image: lzdp.image || '',
                        dateAdded: new Date().toISOString()
                    });
                }
             });
          let currentData = this.getData();
          currentData.products = all;
          this.saveData(currentData);
          window.dispatchEvent(new Event('gradie_data_synced'));
        }`;

const replacementStr = `      if (res.ok && data.success) {
        if (data.products && Array.isArray(data.products)) {
          let all = this.getProducts();
          data.products.forEach(lzdp => {
               const rSku = String(lzdp.sku || '').trim().toLowerCase().replace(/_/g, '-');
               const rName = lzdp.name ? lzdp.name.trim().toLowerCase() : '';
               
               let p = all.find(x => {
                 const pSku = String(x.sku || '').trim().toLowerCase().replace(/_/g, '-');
                 const matchSku = pSku && rSku && pSku === rSku;
                 const matchId = String(x.id) === String(lzdp.id);
                 const pName = x.name ? x.name.trim().toLowerCase() : '';
                 const matchName = pName && rName && (pName === rName || pName.includes(rName) || rName.includes(pName));
                 
                 const matchVariant = x.variants && x.variants.some(v => {
                     const vSku = String(v.sku || '').trim().toLowerCase().replace(/_/g, '-');
                     return vSku && rSku && vSku === rSku;
                 });
                 
                 return matchId || matchSku || matchVariant || matchName;
               });

               if (p) {
                   let variantMatched = false;
                   if (p.variants && p.variants.length > 0) {
                       p.variants.forEach(v => {
                           const vSku = String(v.sku || '').trim().toLowerCase().replace(/_/g, '-');
                           if (vSku && rSku && vSku === rSku) {
                               v.lazadaStock = lzdp.stock;
                               if (lzdp.image) v.image = lzdp.image;
                               variantMatched = true;
                           }
                       });
                       p.lazadaStock = p.variants.reduce((acc, curr) => acc + (Number(curr.lazadaStock) || 0), 0);
                   }
                   
                   if (!variantMatched || !p.variants || p.variants.length === 0) {
                       p.lazadaStock = lzdp.stock;
                   }
                   if (lzdp.image) {
                       p.image = lzdp.image;
                   }
                   
                   fetch('/api/products', {
                       method: 'PUT',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify(p)
                   }).catch(e => console.error('Sync product error', e));
               } else {
                   const newProd = {
                       id: String(Date.now() + Math.floor(Math.random() * 1000)),
                       sku: lzdp.sku || '',
                       name: lzdp.name || 'Sản phẩm mới từ Lazada',
                       price: lzdp.price || 0,
                       stock: 0,
                       lazadaStock: lzdp.stock,
                       category: 'Uncategorized',
                       image: lzdp.image || '',
                       dateAdded: new Date().toISOString()
                   };
                   all.push(newProd);
                   fetch('/api/products', {
                       method: 'PUT',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify(newProd)
                   }).catch(e => console.error('Sync new product error', e));
               }
          });
          let currentData = this.getData();
          currentData.products = all;
          this.saveData(currentData);
          window.dispatchEvent(new Event('gradie_data_synced'));
        }`;

// Standardize line endings to avoid \r\n vs \n issues
const normalizeStr = s => s.replace(/\r\n/g, '\n').trim();

if (normalizeStr(content).includes(normalizeStr(targetStr))) {
  // Simple replace
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log("SUCCESS: Patched gradie-website/js/data-store.js successfully!");
} else {
  // Let's print some diagnostic info
  console.error("ERROR: Target string not found in data-store.js!");
  // Write target string to temp for comparison
  fs.writeFileSync(path.join(__dirname, 'target.txt'), normalizeStr(targetStr));
  fs.writeFileSync(path.join(__dirname, 'actual_slice.txt'), normalizeStr(content).slice(0, 1000));
}
