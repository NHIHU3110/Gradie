// js/admin-categories.js
document.addEventListener('DOMContentLoaded', () => {
    if(!window.GradieStore) return;
    const categoryList = document.getElementById('admin-category-list');
    let currentEditingCategory = null;
    
    if (categoryList) {
        window.renderAdminCategories = function() {
            const categories = window.GradieStore.getCategories() || [];
            const products = window.GradieStore.getProducts();
            
            if (categories.length === 0) {
                categoryList.innerHTML = '<tr><td colspan="3" style="text-align:center;">No categories found.</td></tr>';
            } else {
                categoryList.innerHTML = categories.map(c => {
                    const count = products.filter(p => p.category === c).length;
                    return `
                        <tr>
                            <td><strong>${c}</strong></td>
                            <td>${count} products</td>
                            <td>
                                <button class="btn-primary" onclick="openAssignModal('${typeof c === 'string' ? c.replace(/'/g, "\\'") : c}')">Assign Products</button>
                                <button class="btn-danger" onclick="if(confirm('Delete category?')){ window.GradieStore.deleteCategory('${typeof c === 'string' ? c.replace(/'/g, "\\'") : c}'); renderAdminCategories(); }">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        };
        renderAdminCategories();
        
        window.createNewCategory = function() {
            const name = prompt("Enter new category name:");
            if (name && name.trim()) {
                window.GradieStore.addCategory(name.trim());
                renderAdminCategories();
            }
        };
        
        window.openAssignModal = function(catName) {
            currentEditingCategory = catName;
            document.getElementById('modalCatName').textContent = `Assign Products to "${catName}"`;
            
            const products = window.GradieStore.getProducts();
            const list = document.getElementById('modalProductList');
            
            if(products.length === 0) {
                list.innerHTML = "<p>No products available to assign.</p>";
            } else {
                list.innerHTML = products.map(p => `
                    <label class="product-checkbox">
                        <input type="checkbox" value="${p.id}" ${p.category === catName ? 'checked' : ''}>
                        <img src="${p.image || 'https://via.placeholder.com/40'}">
                        <div>
                            <strong>${p.name}</strong><br>
                            <small>${p.price.toLocaleString('vi-VN')} ₫ - Current: ${p.category}</small>
                        </div>
                    </label>
                `).join('');
            }
            
            document.getElementById('assignModal').style.display = 'block';
        };
        
        window.closeModal = function() {
            document.getElementById('assignModal').style.display = 'none';
            currentEditingCategory = null;
        };
        
        window.saveCategoryProducts = function() {
            if(!currentEditingCategory) return;
            
            const checkboxes = document.querySelectorAll('#modalProductList input[type="checkbox"]');
            const selectedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
            
            window.GradieStore.assignProductsToCategory(currentEditingCategory, selectedIds);
            
            closeModal();
            renderAdminCategories();
            alert(`Assigned ${selectedIds.length} products to ${currentEditingCategory}`);
        };
    }
});
