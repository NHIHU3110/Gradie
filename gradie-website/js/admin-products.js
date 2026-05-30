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
        alert('Product deleted successfully');
    }
}



document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('admin-product-list')) {
        renderAdminProducts();
    }
});
