// js/gallery.js
document.addEventListener('DOMContentLoaded', () => {
    if (!window.GradieStore) return;
    const galleryContainer = document.getElementById('gallery-container');
    if (galleryContainer) {
        const typeFilter = galleryContainer.dataset.galleryType;
        const allItems = window.GradieStore.getGallery().filter(p => p.status === 'Published');
        const items = typeFilter ? allItems.filter(p => p.type === typeFilter) : allItems;
        if (items.length === 0) {
            galleryContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--taupe); font-style: italic; border: 1px dashed var(--border-gold); border-radius: 8px;">No gallery items found for this category yet. Please check back later.</div>';
        } else {
            galleryContainer.innerHTML = items.map(p => `
                <div style="position:relative; overflow:hidden; border-radius:8px; border:1px solid var(--border-gold);">
                    <img src="${p.image}" style="width:100%; display:block;">
                    <div style="position:absolute; bottom:0; left:0; width:100%; background:rgba(255,255,255,0.9); padding:10px; text-align:center;">
                        <strong>${p.title}</strong><br>
                        <small>${p.type}</small>
                    </div>
                </div>
            `).join('');
        }
    }
});
