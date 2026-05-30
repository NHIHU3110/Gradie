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
                <div style="position:relative; overflow:hidden; border-radius:16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'; this.querySelector('img').style.transform='scale(1.08)'; this.querySelector('.overlay').style.opacity='1'" onmouseout="this.style.transform='translateY(0)'; this.querySelector('img').style.transform='scale(1)'; this.querySelector('.overlay').style.opacity='0'">
                    <img src="${p.image}" style="width:100%; height: 400px; object-fit: cover; display:block; transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);">
                    <div class="overlay" style="position:absolute; bottom:0; left:0; width:100%; height: 50%; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%); padding: 30px; display: flex; flex-direction: column; justify-content: flex-end; opacity: 0; transition: opacity 0.4s ease;">
                        <span style="font-size:0.8rem; text-transform:uppercase; letter-spacing:2px; color: var(--champagne); font-weight: 600; margin-bottom: 8px;">${p.type}</span>
                        <h3 style="margin: 0; font-size: 1.5rem; color: white; font-family: 'Playfair Display', serif;">${p.title}</h3>
                    </div>
                </div>
            `).join('');
        }
    }
});
