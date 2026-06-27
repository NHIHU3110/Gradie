/**
 * Script: patch-gradie-website-data-store.js
 * Patch syncTikiProducts và syncLazadaProducts trong gradie-website/js/data-store.js
 * với improved SKU matching và updatedImageCount tracking
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'gradie-website', 'js', 'data-store.js');
let content = fs.readFileSync(filePath, 'utf8');

// === PATCH 1: syncTikiProducts ===
// Cũ: không track updatedImageCount, không dùng normSku partial match
const OLD_TIKI = `    data.products.forEach(ttp => {
               let p = all.find(x => {
                 let matchId = String(x.id) === String(ttp.id);
                 let matchSku = x.sku && ttp.sku && String(x.sku).trim().toLowerCase() === String(ttp.sku).trim().toLowerCase();
                 let n1 = x.name ? x.name.trim().toLowerCase() : '';
                 let n2 = ttp.name ? ttp.name.trim().toLowerCase() : '';
                 let matchName = n1 && n2 && (n1 === n2 || n1.includes(n2) || n2.includes(n1));
                 return matchId || matchSku || matchName;
               });
               if (p) {
                   if (ttp.image) p.image = ttp.image;
               } else {
                   all.push({
                       id: String(Date.now() + Math.floor(Math.random() * 1000)),
                       sku: ttp.sku || '',
                       name: ttp.name || 'Sản phẩm mới từ Tiki',
                       price: ttp.price || 0,
                       stock: 0,
                       tikiStock: ttp.stock,
                       category: 'Uncategorized',
                       image: ttp.image || '',
                       dateAdded: new Date().toISOString()
                   });
               }
            });
          let currentData = this.getData();
          currentData.products = all;
          this.saveData(currentData);
          window.dispatchEvent(new Event('gradie_data_synced'));
        }
        this.addActivityLog('Tiki Sync', \`Đã đồng bộ tồn kho \${data.syncedCount || data.products?.length || 0} sản phẩm Tiki.\`);
        return { success: true, message: data.message, syncedCount: data.syncedCount || data.products?.length || 0 };
      }
      return { success: false, message: data.message || 'Không rõ nguyên nhân' };
    } catch (err) {
      console.error('Failed to sync Tiki products:', err);
      return { success: false, message: 'Lỗi kết nối mạng.' };
    }
  },

  syncTikiOrders:`;

const NEW_TIKI = `    let updatedImageCount = 0;
          const normSku = s => (s || '').replace(/[\\s\\-_]/g, '').toLowerCase();
          const normName = s => (s || '').trim().toLowerCase().replace(/\\s+/g, ' ');
          data.products.forEach(ttp => {
            if (!ttp.image) return;
            const rSku = normSku(ttp.sku);
            const rName = normName(ttp.name);
            let p = all.find(x => {
              const pSku = normSku(x.sku);
              if (String(x.id) === String(ttp.id)) return true;
              if (pSku && rSku && pSku === rSku) return true;
              if (pSku && rSku && (pSku.startsWith(rSku) || rSku.startsWith(pSku))) return true;
              if (x.variants && x.variants.some(v => normSku(v.sku) === rSku)) return true;
              const pName = normName(x.name);
              if (pName && rName && (pName === rName || pName.includes(rName) || rName.includes(pName))) return true;
              return false;
            });
            if (p) {
              const oldImage = p.image;
              p.image = ttp.image;
              if (!p.gallery) p.gallery = [];
              if (!p.gallery.includes(ttp.image)) p.gallery.unshift(ttp.image);
              if (oldImage !== ttp.image) updatedImageCount++;
              fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
                .catch(e => console.error('Sync product error', e));
            } else {
              all.push({
                id: String(Date.now() + Math.floor(Math.random() * 1000)),
                sku: ttp.sku || '',
                name: ttp.name || 'Sản phẩm mới từ Tiki',
                price: ttp.price || 0,
                stock: 0,
                tikiStock: ttp.stock,
                category: 'Uncategorized',
                image: ttp.image || '',
                gallery: [ttp.image],
                dateAdded: new Date().toISOString()
              });
              updatedImageCount++;
            }
          });
          let currentData = this.getData();
          currentData.products = all;
          this.saveData(currentData);
          window.dispatchEvent(new Event('gradie_data_synced'));
          this.addActivityLog('Tiki Sync', \`Đã đồng bộ \${data.syncedCount || data.products?.length || 0} sản phẩm, cập nhật \${updatedImageCount} ảnh từ Tiki.\`);
          return { success: true, message: data.message, syncedCount: data.syncedCount || data.products?.length || 0, updatedImageCount };
        }
        this.addActivityLog('Tiki Sync', \`Tiki trả về 0 sản phẩm.\`);
        return { success: true, message: data.message, syncedCount: 0, updatedImageCount: 0 };
      }
      return { success: false, message: data.message || 'Không rõ nguyên nhân' };
    } catch (err) {
      console.error('Failed to sync Tiki products:', err);
      return { success: false, message: 'Lỗi kết nối mạng.' };
    }
  },

  syncTikiOrders:`;

// === PATCH 2: syncLazadaProducts ===
const OLD_LAZADA = `    data.products.forEach(lzdp => {
               let p = all.find(x => {
                 let matchId = String(x.id) === String(lzdp.id);
                 let matchSku = x.sku && lzdp.sku && String(x.sku).trim().toLowerCase() === String(lzdp.sku).trim().toLowerCase();
                 let n1 = x.name ? x.name.trim().toLowerCase() : '';
                 let n2 = lzdp.name ? lzdp.name.trim().toLowerCase() : '';
                 let matchName = n1 && n2 && (n1 === n2 || n1.includes(n2) || n2.includes(n1));
                 return matchId || matchSku || matchName;
               });
               if (p) {
                   if (lzdp.image) p.image = lzdp.image;
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
        }
        this.addActivityLog('Lazada Sync', \`Đã đồng bộ tồn kho \${data.syncedCount || data.products?.length || 0} sản phẩm Lazada.\`);
        return { success: true, message: data.message, syncedCount: data.syncedCount || data.products?.length || 0 };
      }
      return { success: false, message: data.message || 'Không rõ nguyên nhân' };
    } catch (err) {
      console.error('Failed to sync Lazada products:', err);
      return { success: false, message: 'Lỗi kết nối mạng.' };
    }
  },

  syncLazadaOrders:`;

const NEW_LAZADA = `    let updatedImageCount = 0;
          const normSku = s => (s || '').replace(/[\\s\\-_]/g, '').toLowerCase();
          const normName = s => (s || '').trim().toLowerCase().replace(/\\s+/g, ' ');
          data.products.forEach(lzdp => {
            if (!lzdp.image) return;
            const lSku = normSku(lzdp.sku);
            const lName = normName(lzdp.name);
            let p = all.find(x => {
              const xs = normSku(x.sku);
              if (String(x.id) === String(lzdp.id)) return true;
              if (xs && lSku && xs === lSku) return true;
              if (xs && lSku && (xs.startsWith(lSku) || lSku.startsWith(xs))) return true;
              if (x.variants && x.variants.some(v => normSku(v.sku) === lSku)) return true;
              const xn = normName(x.name);
              if (xn && lName && (xn === lName || xn.includes(lName) || lName.includes(xn))) return true;
              return false;
            });
            if (p) {
              const oldImage = p.image;
              p.image = lzdp.image;
              if (!p.gallery) p.gallery = [];
              if (!p.gallery.includes(lzdp.image)) p.gallery.unshift(lzdp.image);
              if (oldImage !== lzdp.image) updatedImageCount++;
              fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
                .catch(e => console.error('Sync product error', e));
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
                gallery: [lzdp.image],
                dateAdded: new Date().toISOString()
              });
              updatedImageCount++;
            }
          });
          const crossFallback = all.filter(p =>
            p.lazadaStock > 0 && p.image && p.image.includes('salt.tikicdn.com') && !p.image.includes('slatic.net')
          );
          if (crossFallback.length > 0) {
            console.log(\`[Lazada Sync] \${crossFallback.length} sản phẩm dùng ảnh Tiki làm fallback cho Lazada.\`);
          }
          let currentData = this.getData();
          currentData.products = all;
          this.saveData(currentData);
          window.dispatchEvent(new Event('gradie_data_synced'));
          this.addActivityLog('Lazada Sync', \`Đã đồng bộ \${data.syncedCount || data.products?.length || 0} sản phẩm, cập nhật \${updatedImageCount} ảnh từ Lazada.\`);
          return { success: true, message: data.message, syncedCount: data.syncedCount || data.products?.length || 0, updatedImageCount };
        }
        this.addActivityLog('Lazada Sync', \`Lazada trả về 0 sản phẩm.\`);
        return { success: true, message: data.message, syncedCount: 0, updatedImageCount: 0 };
      }
      return { success: false, message: data.message || 'Không rõ nguyên nhân' };
    } catch (err) {
      console.error('Failed to sync Lazada products:', err);
      return { success: false, message: 'Lỗi kết nối mạng.' };
    }
  },

  syncLazadaOrders:`;

// Apply patches
let patchedContent = content;
let changed = false;

if (patchedContent.includes(OLD_TIKI)) {
  patchedContent = patchedContent.replace(OLD_TIKI, NEW_TIKI);
  console.log('✅ Patched syncTikiProducts');
  changed = true;
} else {
  console.warn('⚠️  syncTikiProducts OLD pattern NOT found - already patched or different format');
}

if (patchedContent.includes(OLD_LAZADA)) {
  patchedContent = patchedContent.replace(OLD_LAZADA, NEW_LAZADA);
  console.log('✅ Patched syncLazadaProducts');
  changed = true;
} else {
  console.warn('⚠️  syncLazadaProducts OLD pattern NOT found - already patched or different format');
}

if (changed) {
  fs.writeFileSync(filePath, patchedContent, 'utf8');
  console.log('💾 Saved gradie-website/js/data-store.js');
} else {
  console.log('ℹ️  No changes made.');
}
