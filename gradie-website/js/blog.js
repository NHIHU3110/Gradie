// js/blog.js — fetch from MongoDB API first, fallback to GradieStore
document.addEventListener('DOMContentLoaded', async () => {
    const blogContainer = document.getElementById('blog-container');
    if (!blogContainer) return;

    const categoryFilter = blogContainer.dataset.blogCategory;

    // ── 1. Try fetching from MongoDB API ──────────────────────────────────────
    let posts = [];
    try {
        const res = await fetch('/api/global');
        if (res.ok) {
            const data = await res.json();
            if (data.blogPosts && data.blogPosts.length > 0) {
                posts = data.blogPosts;
            }
        }
    } catch (e) {
        console.warn('API unavailable, falling back to GradieStore', e);
    }

    // ── 2. Fallback to localStorage / GradieStore ─────────────────────────────
    if (posts.length === 0 && window.GradieStore) {
        posts = window.GradieStore.getBlogPosts();
    }

    // ── 3. Filter ──────────────────────────────────────────────────────────────
    const published = posts.filter(p => !p.status || p.status === 'Published');
    const filtered  = categoryFilter
        ? published.filter(p => p.category === categoryFilter)
        : published;

    // ── 4. Blog Modal ─────────────────────────────────────────────────────────
    if (!document.getElementById('blog-modal')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="blog-modal" style="display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); overflow-y:auto;">
                <div style="background:var(--white); max-width:800px; margin:40px auto; border-radius:12px; position:relative; overflow:hidden;">
                    <button onclick="document.getElementById('blog-modal').style.display='none'" style="position:absolute; top:20px; right:20px; background:white; border:none; width:40px; height:40px; border-radius:50%; cursor:pointer; font-size:1.5rem; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,0.1); z-index:10;">✕</button>
                    <img id="blog-modal-img" src="" style="width:100%; height:400px; object-fit:cover;">
                    <div style="padding:40px;">
                        <span id="blog-modal-cat" style="font-size:0.9rem; color:var(--taupe); text-transform:uppercase; letter-spacing:1px;"></span>
                        <h2 id="blog-modal-title" style="margin:15px 0 25px; font-size:2.5rem; line-height:1.2;"></h2>
                        <div id="blog-modal-content" style="font-size:1.1rem; line-height:1.8; color:var(--ink); white-space:pre-wrap;"></div>
                    </div>
                </div>
            </div>
        `);
    }

    window.openBlogModal = function(id) {
        const post = filtered.find(p => (p.id === id || p._id === id || p._id?.toString() === id));
        if (post) {
            const modal = document.getElementById('blog-modal');
            const img = document.getElementById('blog-modal-img');
            // Set content first
            document.getElementById('blog-modal-cat').textContent = post.category || '';
            document.getElementById('blog-modal-title').textContent = post.title || '';
            document.getElementById('blog-modal-content').textContent = post.content || post.excerpt || '';
            // Force image reload (remove src first so browser re-fetches)
            img.src = '';
            img.src = post.image || '';
            // Show modal and reset scroll to top
            modal.style.display = 'block';
            modal.scrollTop = 0;
        } else {
            console.warn('Blog post not found for ID:', id, 'Available posts:', filtered);
        }
    };

    // ── 5. Render cards ────────────────────────────────────────────────────────
    if (filtered.length === 0) {
        blogContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--taupe); font-style: italic; border: 1px dashed var(--border-gold); border-radius: 8px;">No blog posts found for this category yet. Please check back later.</div>';
    } else {
        blogContainer.innerHTML = filtered.map(p => `
            <div class="product-card blog-card" style="cursor:pointer; display:flex; flex-direction:column; height:100%; border:none; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.06); overflow:hidden; transition:transform 0.3s, box-shadow 0.3s;" onclick="openBlogModal('${p.id || p._id}')" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 30px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.06)';">
                <div style="position:relative; overflow:hidden; border-radius:16px 16px 0 0; background:#f4f4f4; height:240px;">
                    <img src="${p.image || ''}" alt="${p.title}" style="width:100%; height:240px; object-fit:cover; transition:transform 0.7s cubic-bezier(0.2,0.8,0.2,1); display:block; opacity:0; transition:opacity 0.4s ease, transform 0.7s cubic-bezier(0.2,0.8,0.2,1);" onload="this.style.opacity=1" onerror="this.src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80'; this.style.opacity=1;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
                </div>
                <div style="padding:30px; flex-grow:1; display:flex; flex-direction:column; background:white;">
                    <span style="font-size:0.75rem; color:var(--champagne); text-transform:uppercase; letter-spacing:1.5px; font-weight:700; margin-bottom:12px; display:block;">${p.category || ''}</span>
                    <h3 style="margin:0 0 15px; font-size:1.4rem; line-height:1.4; color:var(--ink); font-family:'Playfair Display', serif;">${p.title}</h3>
                    <p style="font-size:0.95rem; color:var(--taupe); line-height:1.6; margin-bottom:25px; flex-grow:1;">${(p.excerpt || p.content || '').substring(0, 120)}...</p>
                    <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border-gold); padding-top:15px; margin-top:auto;">
                        <span style="font-size:0.9rem; font-weight:600; color:var(--ink); text-transform:uppercase; letter-spacing:1px;">Read Story</span>
                        <span style="color:var(--champagne); font-size:1.2rem;">→</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
});
