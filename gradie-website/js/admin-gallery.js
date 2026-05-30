// js/admin-gallery.js
document.addEventListener('DOMContentLoaded', () => {
    if(!window.GradieStore) return;
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
});
