// js/admin-products.js

function renderAdminProducts() {
    const tbody = document.getElementById('admin-product-list');
    if(!tbody) return;
    
    const products = window.GradieStore.getProducts();
    console.log("GradieStore products count (Admin):", products.length);
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products found.</td></tr>';
        return;
    }
    
    try {
        tbody.innerHTML = products.map(p => {
            const img = p.image || (p.gallery && p.gallery.length > 0 ? p.gallery[0] : 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200');
            const safeId = String(p.id || '');
            const encodedId = encodeURIComponent(safeId);
            const safeIdForClick = safeId.replace(/'/g, "\\'");
            const price = Number(p.price) || 0;
            
            return `
            <tr>
                <td><img src="${img}" class="img-thumb" style="width:50px; height:50px; object-fit:cover; border-radius:4px;"></td>
                <td><strong>${p.name || 'Untitled'}</strong><br><small style="color:var(--admin-muted)">ID: ${safeId}</small></td>
                <td>${p.category || 'Uncategorized'}</td>
                <td>${price.toLocaleString('vi-VN')} ₫</td>
                <td>${p.stock || 0}</td>
                <td class="actions">
                    <button onclick="window.location.href='admin-product-form.html?id=${encodedId}'">Edit</button>
                    <button class="btn-danger" onclick="deleteProduct('${safeIdForClick}')">Delete</button>
                </td>
            </tr>
            `;
        }).join('');
    } catch (e) {
        console.error("Error rendering admin products:", e);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Error rendering products. Check console.</td></tr>';
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
            "Stock": p.stock || 0,
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
    if(document.getElementById('admin-product-list')) {
        renderAdminProducts();
    }
    
    const btnCSV = document.getElementById('btn-export-csv');
    const btnXLSX = document.getElementById('btn-export-xlsx');
    
    if (btnCSV) btnCSV.addEventListener('click', exportToCSV);
    if (btnXLSX) btnXLSX.addEventListener('click', exportToXLSX);
});
