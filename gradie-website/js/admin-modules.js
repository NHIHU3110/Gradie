// js/admin-modules.js
// DEPRECATED: Logic moved to admin-categories.js, admin-orders.js, admin-blog.js, admin-gallery.js, admin-policies.js, admin-customize.js, admin-settings.js, admin-dashboard.js. Do not load in production pages.

// Shared Admin Logic
document.addEventListener('DOMContentLoaded', () => {
    if(!window.GradieStore) return;
    
    // 1. SYSTEM HEALTH (Dashboard)
    const healthContainer = document.getElementById('system-health');
    if (healthContainer) {
        const p = window.GradieStore.getProducts().length;
        const o = window.GradieStore.getOrders().length;
        const b = window.GradieStore.getBlogPosts().length;
        const g = window.GradieStore.getGallery().length;
        const pol = window.GradieStore.getPolicies().length;
        
        healthContainer.innerHTML = `
            <div style="display:flex; flex-wrap:wrap; gap:15px;">
                <div class="stat-card"><h3>Products</h3><p>${p}</p></div>
                <div class="stat-card"><h3>Orders</h3><p>${o}</p></div>
                <div class="stat-card"><h3>Blog Posts</h3><p>${b}</p></div>
                <div class="stat-card"><h3>Gallery</h3><p>${g}</p></div>
                <div class="stat-card"><h3>Policies</h3><p>${pol}</p></div>
                <div class="stat-card" style="background:var(--admin-primary); color:white;"><h3>Database Source</h3><p style="font-size:1rem; color:white;">GRADIE_CMS_DATA</p></div>
            </div>
        `;
    }
    
    // 2. ADMIN ORDERS (admin-orders.html)
    const ordersBody = document.getElementById('admin-orders-list');
    if (ordersBody) {
        window.renderOrdersTable = function() {
            try {
                const ords = window.GradieStore.getOrders();
                if (!ords || ords.length === 0) {
                    ordersBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No orders yet.</td></tr>';
                } else {
                    ordersBody.innerHTML = ords.map(o => {
                        const total = Number(o.total) || 0;
                        const cName = (o.customer && o.customer.name) ? o.customer.name : 'Unknown';
                        return `
                        <tr>
                            <td><strong>${o.orderNumber}</strong></td>
                            <td>${new Date(o.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td>${cName}</td>
                            <td>${total.toLocaleString('vi-VN')} ₫</td>
                            <td>
                                <select onchange="window.GradieStore.updateOrder('${o.orderNumber}', {status: this.value}); alert('Status Updated!');" style="padding:5px;">
                                    <option value="Order Confirmed" ${o.status === 'Order Confirmed'?'selected':''}>Confirmed</option>
                                    <option value="Dispatched" ${o.status === 'Dispatched'?'selected':''}>Dispatched</option>
                                    <option value="Delivered" ${o.status === 'Delivered'?'selected':''}>Delivered</option>
                                    <option value="Cancelled" ${o.status === 'Cancelled'?'selected':''}>Cancelled</option>
                                </select>
                            </td>
                        </tr>
                        `;
                    }).join('');
                }
            } catch(e) { console.error("Error rendering orders:", e); }
        };
        renderOrdersTable();
    }
    
    // 3. ADMIN SETTINGS (admin-settings.html)
    const settingsForm = document.getElementById('admin-settings-form');
    if (settingsForm) {
        const s = window.GradieStore.getSettings();
        document.getElementById('set-brand').value = s.brandName || '';
        document.getElementById('set-tagline').value = s.tagline || '';
        document.getElementById('set-ann').value = s.announcement || '';
        document.getElementById('set-ship').value = s.shippingFee || 30000;
        
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.GradieStore.saveSettings({
                brandName: document.getElementById('set-brand').value,
                tagline: document.getElementById('set-tagline').value,
                announcement: document.getElementById('set-ann').value,
                shippingFee: Number(document.getElementById('set-ship').value)
            });
            alert('Settings Saved! Changes will reflect on user pages immediately.');
        });
        
        window.resetDatabase = function() {
            if(confirm("DANGER! This will wipe all current orders, custom products, and content. Restore original CSV products and defaults?")) {
                window.GradieStore.resetData(true);
                alert('Database Reset Complete.');
                window.location.reload();
            }
        }
    }


    // 4. ADMIN BLOG
    const blogList = document.getElementById('admin-blog-list');
    if (blogList) {
        window.renderAdminBlog = function() {
            const posts = window.GradieStore.getBlogPosts();
            if (posts.length === 0) {
                blogList.innerHTML = '<tr><td colspan="5" style="text-align:center;">No blog posts.</td></tr>';
            } else {
                blogList.innerHTML = posts.map(p => `
                    <tr>
                        <td><img src="${p.image}" class="img-thumb" style="width:50px;height:50px;object-fit:cover;"></td>
                        <td><strong>${p.title}</strong></td>
                        <td>${p.category}</td>
                        <td>
                            <select onchange="window.GradieStore.updateBlogPost('${p.id}', {status: this.value}); alert('Status Updated!');" style="padding:5px;">
                                <option value="Published" ${p.status==='Published'?'selected':''}>Published</option>
                                <option value="Draft" ${p.status==='Draft'?'selected':''}>Draft</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn-primary" onclick="openBlogModal('${p.id}')">Edit</button>
                            <button class="btn-danger" onclick="if(confirm('Delete post?')){ window.GradieStore.deleteBlogPost('${p.id}'); renderAdminBlog(); }">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        };
        renderAdminBlog();
        
        window.openBlogModal = function(id = null) {
            document.getElementById('blogModal').style.display = 'block';
            if (id) {
                const post = window.GradieStore.getBlogPosts().find(p => p.id === id);
                document.getElementById('blogModalTitle').textContent = 'Edit Blog Post';
                document.getElementById('blog-id').value = post.id;
                document.getElementById('blog-title').value = post.title;
                document.getElementById('blog-category').value = post.category;
                document.getElementById('blog-image').value = post.image;
                document.getElementById('blog-content').value = post.content;
                document.getElementById('blog-status').value = post.status;
            } else {
                document.getElementById('blogModalTitle').textContent = 'Add New Blog Post';
                document.getElementById('blog-id').value = '';
                document.getElementById('blog-title').value = '';
                document.getElementById('blog-category').value = 'News';
                document.getElementById('blog-image').value = '';
                document.getElementById('blog-content').value = '';
                document.getElementById('blog-status').value = 'Published';
            }
        };
        
        window.closeBlogModal = function() {
            document.getElementById('blogModal').style.display = 'none';
        };
        
        window.saveBlogPost = function() {
            const id = document.getElementById('blog-id').value;
            const post = {
                title: document.getElementById('blog-title').value,
                category: document.getElementById('blog-category').value,
                image: document.getElementById('blog-image').value,
                content: document.getElementById('blog-content').value,
                status: document.getElementById('blog-status').value
            };
            if (id) {
                window.GradieStore.updateBlogPost(id, post);
            } else {
                post.id = 'b' + Date.now();
                window.GradieStore.addBlogPost(post);
            }
            closeBlogModal();
            renderAdminBlog();
        };
    }

    // 5. ADMIN GALLERY
    const galleryList = document.getElementById('admin-gallery-list');
    if (galleryList) {
        window.renderAdminGallery = function() {
            const items = window.GradieStore.getGallery();
            if (items.length === 0) {
                galleryList.innerHTML = '<tr><td colspan="5" style="text-align:center;">No gallery items.</td></tr>';
            } else {
                galleryList.innerHTML = items.map(p => `
                    <tr>
                        <td><img src="${p.image}" class="img-thumb" style="width:50px;height:50px;object-fit:cover;"></td>
                        <td><strong>${p.title}</strong></td>
                        <td>${p.type}</td>
                        <td>
                            <select onchange="window.GradieStore.updateGalleryItem('${p.id}', {status: this.value}); alert('Status Updated!');" style="padding:5px;">
                                <option value="Published" ${p.status==='Published'?'selected':''}>Published</option>
                                <option value="Draft" ${p.status==='Draft'?'selected':''}>Draft</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn-primary" onclick="openGalleryModal('${p.id}')">Edit</button>
                            <button class="btn-danger" onclick="if(confirm('Delete item?')){ window.GradieStore.deleteGalleryItem('${p.id}'); renderAdminGallery(); }">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        };
        renderAdminGallery();
        
        window.openGalleryModal = function(id = null) {
            document.getElementById('galleryModal').style.display = 'block';
            if (id) {
                const item = window.GradieStore.getGallery().find(p => p.id === id);
                document.getElementById('galleryModalTitle').textContent = 'Edit Gallery Item';
                document.getElementById('gallery-id').value = item.id;
                document.getElementById('gallery-title').value = item.title;
                document.getElementById('gallery-type').value = item.type;
                document.getElementById('gallery-image').value = item.image;
                document.getElementById('gallery-status').value = item.status;
            } else {
                document.getElementById('galleryModalTitle').textContent = 'Add New Gallery Item';
                document.getElementById('gallery-id').value = '';
                document.getElementById('gallery-title').value = '';
                document.getElementById('gallery-type').value = 'Customer Photo';
                document.getElementById('gallery-image').value = '';
                document.getElementById('gallery-status').value = 'Published';
            }
        };
        
        window.closeGalleryModal = function() {
            document.getElementById('galleryModal').style.display = 'none';
        };
        
        window.saveGalleryItem = function() {
            const id = document.getElementById('gallery-id').value;
            const item = {
                title: document.getElementById('gallery-title').value,
                type: document.getElementById('gallery-type').value,
                image: document.getElementById('gallery-image').value,
                status: document.getElementById('gallery-status').value
            };
            if (id) {
                window.GradieStore.updateGalleryItem(id, item);
            } else {
                item.id = 'g' + Date.now();
                window.GradieStore.addGalleryItem(item);
            }
            closeGalleryModal();
            renderAdminGallery();
        };
    }

    // 6. ADMIN POLICIES
    const policyList = document.getElementById('admin-policies-list');
    if (policyList) {
        window.renderAdminPolicies = function() {
            const items = window.GradieStore.getPolicies();
            if (items.length === 0) {
                policyList.innerHTML = '<tr><td colspan="4" style="text-align:center;">No policies.</td></tr>';
            } else {
                policyList.innerHTML = items.map(p => `
                    <tr>
                        <td><strong>${p.title}</strong></td>
                        <td>${p.content.substring(0, 50)}...</td>
                        <td>
                            <select onchange="window.GradieStore.updatePolicy('${p.id}', {status: this.value}); alert('Status Updated!');" style="padding:5px;">
                                <option value="Published" ${p.status==='Published'?'selected':''}>Published</option>
                                <option value="Draft" ${p.status==='Draft'?'selected':''}>Draft</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn-primary" onclick="openPolicyModal('${p.id}')">Edit</button>
                            <button class="btn-danger" onclick="if(confirm('Delete policy?')){ window.GradieStore.deletePolicy('${p.id}'); renderAdminPolicies(); }">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        };
        renderAdminPolicies();
        
        window.openPolicyModal = function(id = null) {
            document.getElementById('policyModal').style.display = 'block';
            if (id) {
                const item = window.GradieStore.getPolicies().find(p => p.id === id);
                document.getElementById('policyModalTitle').textContent = 'Edit Policy';
                document.getElementById('policy-id').value = item.id;
                document.getElementById('policy-title').value = item.title;
                document.getElementById('policy-content').value = item.content;
                document.getElementById('policy-status').value = item.status;
            } else {
                document.getElementById('policyModalTitle').textContent = 'Add New Policy';
                document.getElementById('policy-id').value = '';
                document.getElementById('policy-title').value = '';
                document.getElementById('policy-content').value = '';
                document.getElementById('policy-status').value = 'Published';
            }
        };
        
        window.closePolicyModal = function() {
            document.getElementById('policyModal').style.display = 'none';
        };
        
        window.savePolicy = function() {
            const id = document.getElementById('policy-id').value;
            const item = {
                title: document.getElementById('policy-title').value,
                content: document.getElementById('policy-content').value,
                status: document.getElementById('policy-status').value
            };
            if (id) {
                window.GradieStore.updatePolicy(id, item);
            } else {
                item.id = 'p' + Date.now();
                window.GradieStore.addPolicy(item);
            }
            closePolicyModal();
            renderAdminPolicies();
        };
    }
    // 7. ADMIN CATEGORIES
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
    // 8. ADMIN CUSTOMIZATION
    const customizeJson = document.getElementById('admin-customize-json');
    if (customizeJson) {
        const opts = window.GradieStore.getCustomizationOptions();
        customizeJson.value = JSON.stringify(opts, null, 2);
        
        window.saveCustomization = function() {
            try {
                const updated = JSON.parse(customizeJson.value);
                window.GradieStore.saveCustomizationOptions(updated);
                alert("Customization settings saved successfully!");
            } catch(e) {
                alert("Invalid JSON format! Please fix syntax errors.");
            }
        };
    }
});
