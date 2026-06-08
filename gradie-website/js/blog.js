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
    // Track scroll position to restore when modal closes
    let _savedScrollY = 0;

    if (!document.getElementById('blog-modal')) {
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            #blog-modal {
                display: none;
                position: fixed;
                z-index: 9999;
                left: 0; top: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(4px);
                /* DO NOT set overflow-y here — we scroll the inner wrapper */
            }
            #blog-modal-wrapper {
                width: 100%;
                height: 100%;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding: 40px 16px;
                box-sizing: border-box;
            }
            #blog-modal-inner {
                background: var(--white, #fff);
                max-width: 800px;
                width: 100%;
                border-radius: 12px;
                position: relative;
                overflow: hidden;
                flex-shrink: 0;
            }
            #blog-modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.15);
                z-index: 10;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            #blog-modal-close:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            }
            body.blog-modal-open {
                overflow: hidden;
            }
        `;
        document.head.appendChild(modalStyle);

        document.body.insertAdjacentHTML('beforeend', `
            <div id="blog-modal" role="dialog" aria-modal="true">
                <div id="blog-modal-wrapper">
                    <div id="blog-modal-inner">
                        <button id="blog-modal-close" onclick="closeBlogModal()" aria-label="Đóng bài viết">✕</button>
                        <img id="blog-modal-img" src="" alt="" style="width:100%; height:400px; object-fit:cover; display:block;">
                        <div style="padding:40px;">
                            <span id="blog-modal-cat" style="font-size:0.9rem; color:var(--taupe); text-transform:uppercase; letter-spacing:1px;"></span>
                            <h2 id="blog-modal-title" style="margin:15px 0 25px; font-size:2.2rem; line-height:1.2;"></h2>
                            <div id="blog-modal-content" style="font-size:1.05rem; line-height:1.9; color:var(--ink); white-space:pre-wrap;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    window.openBlogModal = function(e, id) {
        // Chặn mọi hành vi mặc định (href scroll, link navigation...)
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();

        const post = filtered.find(p => (p.id === id || p._id === id || p._id?.toString() === id));
        if (!post) {
            console.warn('Blog post not found for ID:', id);
            return;
        }

        const modal = document.getElementById('blog-modal');
        const wrapper = document.getElementById('blog-modal-wrapper');
        const img = document.getElementById('blog-modal-img');

        // 1. Lưu lại vị trí cuộn hiện tại của trang
        _savedScrollY = window.scrollY || window.pageYOffset || 0;

        // 2. Set nội dung
        document.getElementById('blog-modal-cat').textContent = post.category || '';
        document.getElementById('blog-modal-title').textContent = post.title || '';
        document.getElementById('blog-modal-content').textContent = post.content || post.excerpt || '';
        img.src = '';
        img.alt = post.title || '';
        img.src = post.image || '';

        // 3. Reset scroll của WRAPPER (bên trong modal), không phải page
        if (wrapper) wrapper.scrollTop = 0;

        // 4. Lock scroll của body (giữ nguyên vị trí trang)
        document.body.classList.add('blog-modal-open');
        // Giữ body tại đúng vị trí bằng cách set top
        document.body.style.top = `-${_savedScrollY}px`;
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';

        // 5. Hiển thị modal
        modal.style.display = 'block';
        // Focus vào modal để hỗ trợ keyboard navigation
        setTimeout(() => {
            const closeBtn = document.getElementById('blog-modal-close');
            if (closeBtn) closeBtn.focus();
        }, 50);
    };

    window.closeBlogModal = function() {
        const modal = document.getElementById('blog-modal');
        if (modal) modal.style.display = 'none';

        // 1. Bỏ lock scroll
        document.body.classList.remove('blog-modal-open');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        // 2. Khôi phục đúng vị trí scroll trước khi mở modal
        window.scrollTo({ top: _savedScrollY, behavior: 'instant' });
    };

    // Đóng modal khi click ra ngoài (vào overlay)
    const blogModal = document.getElementById('blog-modal');
    if (blogModal) {
        blogModal.addEventListener('click', function(e) {
            if (e.target === blogModal || e.target.id === 'blog-modal-wrapper') {
                window.closeBlogModal();
            }
        });
    }

    // Đóng modal khi nhấn ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('blog-modal');
            if (modal && modal.style.display !== 'none') {
                window.closeBlogModal();
            }
        }
    });

    // ── 5. Render cards ────────────────────────────────────────────────────────
    if (filtered.length === 0) {
        blogContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--taupe); font-style: italic; border: 1px dashed var(--border-gold); border-radius: 8px;">No blog posts found for this category yet. Please check back later.</div>';
    } else {
        blogContainer.innerHTML = filtered.map(p => `
            <div class="product-card blog-card" style="cursor:pointer; display:flex; flex-direction:column; height:100%; border:none; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.06); overflow:hidden; transition:transform 0.3s, box-shadow 0.3s;"
                onclick="openBlogModal(event, '${p.id || p._id}')"
                onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 30px rgba(0,0,0,0.1)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.06)';">
                <div style="position:relative; overflow:hidden; border-radius:16px 16px 0 0; background:#f4f4f4; height:240px;">
                    <img src="${p.image || ''}" alt="${p.title}" style="width:100%; height:240px; object-fit:cover; display:block; opacity:0; transition:opacity 0.4s ease, transform 0.7s cubic-bezier(0.2,0.8,0.2,1);" onload="this.style.opacity=1" onerror="this.src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80'; this.style.opacity=1;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
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
