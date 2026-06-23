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
        
        let activeFilter = 'all'; // 'all', 'selected', 'unassigned'
        let searchQuery = '';
        const modalSelectedIds = new Set();
        
        window.openAssignModal = function(catName) {
            currentEditingCategory = catName;
            document.getElementById('modalCatName').textContent = `Assign Products to "${catName}"`;
            
            // Load current products in this category into our Set
            modalSelectedIds.clear();
            const products = window.GradieStore.getProducts();
            products.forEach(p => {
                if (p.category === catName) {
                    modalSelectedIds.add(p.id);
                }
            });
            
            // Reset filters & search input
            activeFilter = 'all';
            searchQuery = '';
            const searchInput = document.getElementById('modalProductSearch');
            if (searchInput) searchInput.value = '';
            
            // Set active class on filter group buttons
            document.querySelectorAll('#filter-group button').forEach(btn => {
                if (btn.getAttribute('data-filter') === 'all') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            renderModalProducts();
            document.getElementById('assignModal').style.display = 'block';
        };
        
        window.closeModal = function() {
            document.getElementById('assignModal').style.display = 'none';
            currentEditingCategory = null;
        };
        
        window.renderModalProducts = function() {
            const products = window.GradieStore.getProducts();
            const list = document.getElementById('modalProductList');
            
            if(products.length === 0) {
                list.innerHTML = "<p style='text-align:center; padding:20px; color:var(--admin-muted);'>No products available.</p>";
                return;
            }

            // Filter items based on activeFilter and searchQuery
            const filteredProducts = products.filter(p => {
                // Search query matching
                const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      p.id.toLowerCase().includes(searchQuery.toLowerCase());
                if (!matchesSearch) return false;

                // Category status matching
                const isCurrentlySelected = modalSelectedIds.has(p.id);
                const isUnassigned = !p.category || p.category === 'Uncategorized';

                if (activeFilter === 'selected') {
                    return isCurrentlySelected;
                } else if (activeFilter === 'unassigned') {
                    return isUnassigned;
                }
                return true;
            });

            if (filteredProducts.length === 0) {
                list.innerHTML = "<p style='text-align:center; padding:20px; color:var(--admin-muted);'>No products match your filters.</p>";
                return;
            }

            list.innerHTML = filteredProducts.map(p => {
                const isSelected = modalSelectedIds.has(p.id);
                return `
                    <label class="product-checkbox ${isSelected ? 'selected' : ''}" data-id="${p.id}">
                        <input type="checkbox" value="${p.id}" ${isSelected ? 'checked' : ''} onchange="handleModalCheckboxChange(this)">
                        <img src="${p.image || 'https://via.placeholder.com/40'}">
                        <div style="flex:1;">
                            <strong>${p.name}</strong><br>
                            <small>${p.price.toLocaleString('vi-VN')} ₫ - Current: ${p.category || 'Uncategorized'}</small>
                        </div>
                    </label>
                `;
            }).join('');
        };

        window.handleModalCheckboxChange = function(checkbox) {
            const pId = checkbox.value;
            const label = checkbox.closest('.product-checkbox');
            if (checkbox.checked) {
                modalSelectedIds.add(pId);
                if (label) label.classList.add('selected');
            } else {
                modalSelectedIds.delete(pId);
                if (label) label.classList.remove('selected');
            }
        };
        
        window.saveCategoryProducts = function() {
            if(!currentEditingCategory) return;
            
            const selectedIds = Array.from(modalSelectedIds);
            window.GradieStore.assignProductsToCategory(currentEditingCategory, selectedIds);
            
            closeModal();
            renderAdminCategories();
            alert(`Assigned ${selectedIds.length} products to "${currentEditingCategory}"`);
        };

        // Attach modal event listeners once elements are ready
        setTimeout(() => {
            const searchInput = document.getElementById('modalProductSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    searchQuery = e.target.value;
                    renderModalProducts();
                });
            }

            // Filter group buttons
            document.querySelectorAll('#filter-group button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('#filter-group button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeFilter = btn.getAttribute('data-filter');
                    renderModalProducts();
                });
            });

            // Bulk buttons
            const btnSelectAll = document.getElementById('btn-select-all');
            if (btnSelectAll) {
                btnSelectAll.addEventListener('click', () => {
                    const checkboxes = document.querySelectorAll('#modalProductList input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        cb.checked = true;
                        modalSelectedIds.add(cb.value);
                        const label = cb.closest('.product-checkbox');
                        if (label) label.classList.add('selected');
                    });
                });
            }

            const btnDeselectAll = document.getElementById('btn-deselect-all');
            if (btnDeselectAll) {
                btnDeselectAll.addEventListener('click', () => {
                    const checkboxes = document.querySelectorAll('#modalProductList input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        cb.checked = false;
                        modalSelectedIds.delete(cb.value);
                        const label = cb.closest('.product-checkbox');
                        if (label) label.classList.remove('selected');
                    });
                });
            }
        }, 100);

        // Listen to Database sync events to update categories list dynamically
        window.addEventListener('gradie_data_synced', () => {
            if (typeof renderAdminCategories === 'function') {
                renderAdminCategories();
            }
        });
    }
});
