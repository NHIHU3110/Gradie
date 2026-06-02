// js/gallery.js — fetch from MongoDB API first, fallback to GradieStore
document.addEventListener('DOMContentLoaded', async () => {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return;

    const typeFilter = galleryContainer.dataset.galleryType;

    // ── 1. Try fetching from MongoDB API ──────────────────────────────────────
    let items = [];
    try {
        const res = await fetch('/api/global');
        if (res.ok) {
            const data = await res.json();
            if (data.gallery && data.gallery.length > 0) {
                items = data.gallery;
            }
        }
    } catch (e) {
        console.warn('API unavailable, falling back to GradieStore', e);
    }

    // ── 2. Fallback to localStorage / GradieStore ─────────────────────────────
    if (items.length === 0 && window.GradieStore) {
        items = window.GradieStore.getGallery();
    }

    // ── 3. Filter ──────────────────────────────────────────────────────────────
    const published = items.filter(p => p.status === 'Published');
    const filtered  = typeFilter
        ? published.filter(p => p.type === typeFilter)
        : published;

    // ── 4. Render ──────────────────────────────────────────────────────────────
    if (filtered.length === 0) {
        galleryContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--taupe); font-style: italic; border: 1px dashed var(--border-gold); border-radius: 8px;">No gallery items found. Please check back later.</div>';
    } else {
        galleryContainer.innerHTML = filtered.map(p => `
            <div style="position:relative; overflow:hidden; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.08); cursor:pointer; transition:transform 0.3s ease; background:#f4f4f4;"
                onmouseover="this.style.transform='translateY(-5px)'; this.querySelector('img').style.transform='scale(1.08)'; this.querySelector('.overlay').style.opacity='1'"
                onmouseout="this.style.transform='translateY(0)'; this.querySelector('img').style.transform='scale(1)'; this.querySelector('.overlay').style.opacity='0'">
                <img src="${p.image || ''}" alt="${p.title}"
                    style="width:100%; height:400px; object-fit:cover; display:block; opacity:0; transition:opacity 0.5s ease, transform 0.7s cubic-bezier(0.2,0.8,0.2,1);"
                    onload="this.style.opacity=1"
                    onerror="this.src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80'; this.style.opacity=1;">
                <div class="overlay" style="position:absolute; bottom:0; left:0; width:100%; height:50%; background:linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%); padding:30px; display:flex; flex-direction:column; justify-content:flex-end; opacity:0; transition:opacity 0.4s ease;">
                    <span style="font-size:0.8rem; text-transform:uppercase; letter-spacing:2px; color:var(--champagne); font-weight:600; margin-bottom:8px;">${p.type || ''}</span>
                    <h3 style="margin:0; font-size:1.5rem; color:white; font-family:'Playfair Display', serif;">${p.title || ''}</h3>
                </div>
            </div>
        `).join('');
    }
});
