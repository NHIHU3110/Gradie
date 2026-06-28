// js/admin-products.js

window.currentProductFilter = window.currentProductFilter || 'all';

window.setProductFilter = function(filter) {
    window.currentProductFilter = filter;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.filter === filter) btn.classList.add('active');
    });
    renderAdminProducts();
}

function renderAdminProducts() {
    const tbody = document.getElementById('admin-product-list');
    if(!tbody) return;
    
    let products = window.GradieStore.getProducts() || [];
    
    // Auto-enrich products missing key fields from GRADIE_DATA
    let needsSave = false;
    const origProducts = window.GRADIE_DATA?.products || [];
    products.forEach(p => {
        const isNumeric = s => /^\d+$/.test(String(s || '').trim());
        if (!p.name || !p.sku || !p.category || p.category === 'Uncategorized' || isNumeric(p.category)) {
            const origMatch = origProducts.find(op => {
                if (op.id === p.id) return true;
                if (op.sku && p.sku && String(op.sku).trim().toLowerCase() === String(p.sku).trim().toLowerCase()) return true;
                if (op.image && p.image && op.image === p.image) return true;
                if (op.gallery && p.gallery && Array.isArray(op.gallery) && Array.isArray(p.gallery)) {
                    if (op.gallery.some(g => p.gallery.includes(g))) return true;
                }
                return false;
            });
            if (origMatch) {
                if (!p.name && origMatch.name) { p.name = origMatch.name; needsSave = true; }
                if (!p.sku && origMatch.sku) { p.sku = origMatch.sku; needsSave = true; }
                if ((!p.category || p.category === 'Uncategorized' || isNumeric(p.category)) && origMatch.category) { p.category = origMatch.category; needsSave = true; }
                if ((!p.price || p.price === 0) && origMatch.price) { p.price = origMatch.price; needsSave = true; }
                if (!p.description && origMatch.description) { p.description = origMatch.description; needsSave = true; }
            }
        }
        
        // Nếu ảnh của sản phẩm cha là placeholder nhưng các phân loại con đã có ảnh thật từ Tiki/Lazada
        const isPlaceholder = url => {
            if (!url || typeof url !== 'string') return true;
            const u = url.trim().toLowerCase();
            return u.includes('placeholder') || u.includes('unsplash.com') || u.includes('ui-avatars.com') || !u.startsWith('http');
        };
        if (isPlaceholder(p.image) && p.variants && p.variants.length > 0) {
            const realVariantImg = p.variants.find(v => v.image && !isPlaceholder(v.image));
            if (realVariantImg) {
                p.image = realVariantImg.image;
                needsSave = true;
            }
        }
    });
    // Tự động tính toán tồn kho cha từ các biến thể con trước khi lọc
    products.forEach(p => {
        if (p.variants && p.variants.length > 0) {
            const sumTiki = p.variants.reduce((sum, v) => sum + (v.tikiStock || 0), 0);
            const sumLazada = p.variants.reduce((sum, v) => sum + (v.lazadaStock || 0), 0);
            const hasVariantWebStock = p.variants.some(v => v.stock !== undefined && v.stock !== null);
            const sumStock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
            if (p.tikiStock !== sumTiki || p.lazadaStock !== sumLazada || (hasVariantWebStock && p.stock !== sumStock)) {
                p.tikiStock = sumTiki;
                p.lazadaStock = sumLazada;
                if (hasVariantWebStock) p.stock = sumStock;
                needsSave = true;
            }
        }
    });

    if (needsSave) {
        let data = window.GradieStore.getData();
        data.products = window.GradieStore.getProducts().map(origP => {
            const updated = products.find(up => up.id === origP.id);
            return updated ? updated : origP;
        });
        window.GradieStore.saveData(data);
    }
    
    if (window.currentProductFilter === 'tiki') {
        products = products.filter(p => (p.tikiStock !== undefined && p.tikiStock > 0) || p.marketplaceSource === 'Tiki');
    } else if (window.currentProductFilter === 'lazada') {
        products = products.filter(p => (p.lazadaStock !== undefined && p.lazadaStock > 0) || p.marketplaceSource === 'Lazada');
    } else if (window.currentProductFilter === 'website') {
        products = products.filter(p => !p.marketplaceSource || p.marketplaceSource === 'Website');
    }

    // Sắp xếp sản phẩm theo mã SKU (nhóm các biến thể cạnh nhau)
    products.sort((a, b) => {
        const skuA = String(a.sku || '').trim().toLowerCase();
        const skuB = String(b.sku || '').trim().toLowerCase();
        if (skuA && skuB) {
            return skuA.localeCompare(skuB, undefined, { numeric: true, sensitivity: 'base' });
        }
        return (a.name || '').localeCompare(b.name || '');
    });

    console.log("GradieStore products count (Admin):", products.length);
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No products found for this category.</td></tr>';
        return;
    }
    
    try {
        tbody.innerHTML = products.map((p, index) => {
            const img = p.image || (p.gallery && p.gallery.length > 0 ? p.gallery[0] : 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200');
            const imgFallback = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200';
            const safeId = String(p.id || '');
            const encodedId = encodeURIComponent(safeId);
            const safeIdForClick = safeId.replace(/'/g, "\\'");
            const price = Number(p.price) || 0;
            const featuredBadge = p.isFeatured ? '<span style="color:#d8a94f; margin-left:5px;">★</span>' : '';
            
            let variantsHtml = '';
            if (p.variants && p.variants.length > 0) {
                const variantsListHtml = p.variants.map(v => {
                    const vName = v.name || (v.options && Array.isArray(v.options) ? v.options.join(' / ') : '') || 'Phân loại';
                    const vPrice = Number(v.price) || price;
                    return `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-bottom: 1px dashed #e2e8f0; font-size: 0.78rem; background: #f8fafc; gap: 8px;">
                        <div style="flex: 1; min-width: 140px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            <span style="background: #e2e8f0; color: #475569; padding: 1px 4px; border-radius: 3px; font-weight: 600; font-family: monospace; font-size: 0.72rem;">${v.sku || 'No SKU'}</span>
                            <span style="color: #334155; font-weight: 500;">${vName}</span>
                        </div>
                        <div style="color: #64748b; font-weight: 600; min-width: 70px; text-align: right;">${vPrice.toLocaleString('vi-VN')} ₫</div>
                        <div style="display: flex; gap: 10px; align-items: center; min-width: 130px; justify-content: flex-end;">
                            <span style="color:#3b82f6; display: flex; align-items: center; gap: 3px; font-weight: 600;" title="Website Stock">
                                <img src="images/12953846.png" style="width:11px; height:11px; object-fit:contain;"> ${v.stock || 0}
                            </span>
                            <span style="color:#1A94FF; display: flex; align-items: center; gap: 3px; font-weight: 600;" title="Tiki Stock">
                                <img src="images/tiki-logo.png" style="width:11px; height:11px; object-fit:contain; border-radius: 2px;"> ${v.tikiStock !== undefined ? v.tikiStock : 0}
                            </span>
                            <span style="color:#f97316; display: flex; align-items: center; gap: 3px; font-weight: 600;" title="Lazada Stock">
                                <img src="images/lazada-seeklogo.png" style="width:11px; height:11px; object-fit:contain; border-radius: 2px;"> ${v.lazadaStock !== undefined ? v.lazadaStock : 0}
                            </span>
                        </div>
                    </div>
                    `;
                }).join('');

                variantsHtml = `
                <div style="margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                    <div style="background: #f1f5f9; padding: 4px 10px; font-size: 0.72rem; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                        <span>📋 PHÂN LOẠI / BIẾN THỂ (${p.variants.length})</span>
                        <span>Tồn (Web / Tiki / Lazada)</span>
                    </div>
                    <div style="max-height: 200px; overflow-y: auto;">
                        ${variantsListHtml}
                    </div>
                </div>
                `;
            }

            return `
            <tr>
                <td style="text-align:center;"><input type="checkbox" class="product-select-cb" value="${safeIdForClick}"></td>
                <td style="text-align:center; font-weight:600; color:#64748b;">${index + 1}</td>
                <td><img src="${img}" class="img-thumb" style="width:50px; height:50px; object-fit:cover; border-radius:4px;" onerror="this.onerror=null;this.src='${imgFallback}'"></td>
                <td>
                    <strong>${p.name || 'Untitled'}</strong>${featuredBadge}
                    ${p.variants && p.variants.length > 0 ? `<span style="background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; margin-left: 8px; display: inline-block; vertical-align: middle;">${p.variants.length} Phân loại</span>` : ''}
                    <br>
                    <small style="color:var(--admin-muted)">ID: ${safeId} ${p.sku ? `| SKU: ${p.sku}` : ''}</small>
                    ${variantsHtml}
                </td>
                <td>${p.category || 'Uncategorized'}</td>
                <td>${price.toLocaleString('vi-VN')} ₫</td>
                <td>
                      <div style="display:flex; flex-direction:column; font-size:0.85rem; line-height:1.4; gap: 4px;">
                          ${(window.currentProductFilter === 'all' || window.currentProductFilter === 'website') ? `
                          <div style="display:flex; align-items:center; gap:6px;" title="Website Stock">
                              <img src="images/12953846.png" alt="Web" style="width:16px; height:16px; object-fit:contain; border-radius:50%;">
                              <span style="color:#3b82f6; font-weight: 600;">${p.stock || 0}</span>
                          </div>` : ''}
                          ${(window.currentProductFilter === 'all' || window.currentProductFilter === 'tiki') ? `
                          <div style="display:flex; align-items:center; gap:6px;" title="Tiki Stock">
                              <img src="images/tiki-logo.png" alt="Tiki" style="width:16px; height:16px; object-fit:contain; border-radius:4px;">
                              <span style="color:#1A94FF; font-weight: 600;">${p.tikiStock !== undefined ? p.tikiStock : 0}</span>
                          </div>` : ''}
                          ${(window.currentProductFilter === 'all' || window.currentProductFilter === 'lazada') ? `
                          <div style="display:flex; align-items:center; gap:6px;" title="Lazada Stock">
                              <img src="images/lazada-seeklogo.png" alt="Lazada" style="width:16px; height:16px; object-fit:contain; border-radius:4px;">
                              <span style="color:#f97316; font-weight: 600;">${p.lazadaStock !== undefined ? p.lazadaStock : 0}</span>
                          </div>` : ''}
                      </div>
                </td>
                <td class="actions">
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <button onclick="window.location.href='admin-product-form.html?id=${encodedId}'">Edit</button>
                        <button class="btn-danger" onclick="deleteProduct('${safeIdForClick}')">Delete</button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');

        // Attach Bulk Checkbox Listeners
        const selectAllCb = document.getElementById('select-all-products');
        const itemCbs = document.querySelectorAll('.product-select-cb');
        const bulkContainer = document.getElementById('bulk-actions-container');
        const selectedCountEl = document.getElementById('selected-count');

        const updateBulkUI = () => {
            const checkedCount = document.querySelectorAll('.product-select-cb:checked').length;
            if (checkedCount > 0) {
                bulkContainer.style.display = 'flex';
                selectedCountEl.innerText = checkedCount;
            } else {
                bulkContainer.style.display = 'none';
                if(selectAllCb) selectAllCb.checked = false;
            }
        };

        if (selectAllCb) {
            selectAllCb.addEventListener('change', (e) => {
                itemCbs.forEach(cb => cb.checked = e.target.checked);
                updateBulkUI();
            });
        }

        itemCbs.forEach(cb => {
            cb.addEventListener('change', updateBulkUI);
        });

    } catch (e) {
        console.error("Error rendering admin products:", e);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:red;">Error rendering products. Check console.</td></tr>';
    }
}

window.deleteProduct = function(id) {
    if(confirm('Are you sure you want to delete this product?')) {
        window.GradieStore.deleteProduct(id);
        renderAdminProducts();
        showToast('Đã xóa sản phẩm thành công!', 'success');
    }
}

function getProductExportData(products) {
    return products.map(p => {
        const galleryStr = Array.isArray(p.gallery) ? p.gallery.join(', ') : '';
        const tagsStr = Array.isArray(p.tags) ? p.tags.join(', ') : '';
        const colorsStr = (p.options && Array.isArray(p.options.colors)) ? p.options.colors.join(', ') : '';
        const sizesStr = (p.options && Array.isArray(p.options.sizes)) ? p.options.sizes.join(', ') : '';
        const persStr = (p.options && Array.isArray(p.options.personalization)) ? p.options.personalization.join(', ') : '';
        const variantsStr = Array.isArray(p.variants) ? p.variants.map(v => 
            `[Name: ${v.name || ''}, Color: ${v.color || ''}, Price: ${v.price || ''}, SKU: ${v.sku || ''}, Stock: ${v.stock || ''}]`
        ).join('; ') : '';

        return {
            "ID": p.id || '',
            "Name": p.name || '',
            "Category": p.category || '',
            "Price": p.price || 0,
            "Old Price": p.oldPrice !== null && p.oldPrice !== undefined ? p.oldPrice : '',
            "Website Stock": p.stock || 0,
            "Tiki Stock": p.tikiStock !== undefined ? p.tikiStock : 0,
            "Lazada Stock": p.lazadaStock !== undefined ? p.lazadaStock : 0,
            "Rating": p.rating || '',
            "Reviews Count": p.reviews || '',
            "Main Image": p.image || '',
            "Gallery": galleryStr,
            "Badge": p.badge || '',
            "Tags": tagsStr,
            "Is Trending": p.isTrending ? 'Yes' : 'No',
            "Is Featured": p.isFeatured ? 'Yes' : 'No',
            "Short Description": p.shortDescription || '',
            "Description": p.description || '',
            "Options Colors": colorsStr,
            "Options Sizes": sizesStr,
            "Options Personalization": persStr,
            "Variants": variantsStr
        };
    });
}

function exportToCSV() {
    const products = window.GradieStore.getProducts();
    if (!products || products.length === 0) {
        showToast('Không có sản phẩm nào để xuất.', 'warning');
        return;
    }
    
    const data = getProductExportData(products);
    const headers = Object.keys(data[0]);
    const rows = [headers];
    
    data.forEach(item => {
        rows.push(headers.map(header => {
            const val = item[header];
            return String(val).replace(/"/g, '""');
        }));
    });
    
    const csvContent = "\uFEFF" + rows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `products_gradie_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToXLSX() {
    const products = window.GradieStore.getProducts();
    if (!products || products.length === 0) {
        showToast('Không có sản phẩm nào để xuất.', 'warning');
        return;
    }
    
    if (typeof XLSX === 'undefined') {
        showToast('Thư viện đang tải, vui lòng thử lại.', 'warning');
        return;
    }
    
    const data = getProductExportData(products);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    
    XLSX.writeFile(workbook, `products_gradie_${new Date().toISOString().slice(0,10)}.xlsx`);
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('gradie_data_synced', () => {
        if (window.renderProductsTable) window.renderProductsTable();
    });
    if(document.getElementById('admin-product-list')) {
        renderAdminProducts();
    }
    
    const btnCSV = document.getElementById('btn-export-csv');
    const btnXLSX = document.getElementById('btn-export-xlsx');
    const btnSyncTiktokProducts = document.getElementById('btn-sync-tiki-products');
    const btnSyncLazadaProducts = document.getElementById('btn-sync-lazada-products');
    
    if (btnCSV) btnCSV.addEventListener('click', exportToCSV);
    if (btnXLSX) btnXLSX.addEventListener('click', exportToXLSX);

    if (btnSyncTiktokProducts) {
        btnSyncTiktokProducts.addEventListener('click', async () => {
            const originalText = btnSyncTiktokProducts.innerHTML;
            btnSyncTiktokProducts.innerHTML = 'Đang đồng bộ...';
            btnSyncTiktokProducts.disabled = true;
            try {
                const res = await window.GradieStore.syncTikiProducts();
                if (res && res.success) {
                    showToast(`Đồng bộ thành công ${res.syncedCount || 0} sản phẩm từ Tiki`, 'success');
                    renderAdminProducts();
                } else {
                    showToast(res?.message || 'Đồng bộ thất bại', 'error');
                }
            } catch (err) {
                showToast('Lỗi khi đồng bộ Tiki', 'error');
            } finally {
                btnSyncTiktokProducts.innerHTML = originalText;
                btnSyncTiktokProducts.disabled = false;
            }
        });
    }

    if (btnSyncLazadaProducts) {
        btnSyncLazadaProducts.addEventListener('click', async () => {
            const originalText = btnSyncLazadaProducts.innerHTML;
            btnSyncLazadaProducts.innerHTML = 'Đang đồng bộ...';
            btnSyncLazadaProducts.disabled = true;
            try {
                const res = await window.GradieStore.syncLazadaProducts();
                if (res && res.success) {
                    showToast(`Đồng bộ thành công ${res.syncedCount || 0} sản phẩm từ Lazada`, 'success');
                    renderAdminProducts();
                } else {
                    showToast(res?.message || 'Đồng bộ thất bại', 'error');
                }
            } catch (err) {
                showToast('Lỗi khi đồng bộ Lazada', 'error');
            } finally {
                btnSyncLazadaProducts.innerHTML = originalText;
                btnSyncLazadaProducts.disabled = false;
            }
        });
    }

    // Bulk Actions Handlers
    const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
    const bulkFeatureBtn = document.getElementById('bulk-feature-btn');

    const getSelectedIds = () => {
        return Array.from(document.querySelectorAll('.product-select-cb:checked')).map(cb => cb.value);
    };

    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', () => {
            const ids = getSelectedIds();
            if (ids.length === 0) return;
            if (confirm(`Bạn có chắc chắn muốn xóa ${ids.length} sản phẩm đã chọn không?`)) {
                let data = window.GradieStore.getData();
                data.products = data.products.filter(p => !ids.includes(p.id));
                window.GradieStore.saveData(data);
                
                window.GradieStore.addActivityLog('Xóa hàng loạt sản phẩm', `Đã xóa ${ids.length} sản phẩm khỏi hệ thống.`);
                
                renderAdminProducts();
                document.getElementById('bulk-actions-container').style.display = 'none';
                if(document.getElementById('select-all-products')) document.getElementById('select-all-products').checked = false;
            }
        });
    }

    if (bulkFeatureBtn) {
        bulkFeatureBtn.addEventListener('click', () => {
            const ids = getSelectedIds();
            if (ids.length === 0) return;
            let data = window.GradieStore.getData();
            data.products.forEach(p => {
                if(ids.includes(p.id)) {
                    p.isFeatured = true;
                }
            });
            window.GradieStore.saveData(data);
            
            window.GradieStore.addActivityLog('Đánh dấu Nổi Bật', `Đã đánh dấu ${ids.length} sản phẩm là Nổi bật.`);
            
            renderAdminProducts();
            document.getElementById('bulk-actions-container').style.display = 'none';
            if(document.getElementById('select-all-products')) document.getElementById('select-all-products').checked = false;
        });
    }
});
