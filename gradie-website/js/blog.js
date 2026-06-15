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
        // Make sure GradieStore is initialized
        if (typeof window.GradieStore.init === 'function') {
            window.GradieStore.init();
        }
        posts = window.GradieStore.getBlogPosts();
        
        // If existing posts are missing content/image, refresh from defaults
        const needsUpdate = posts.some(p => !p.content || !p.image);
        if (needsUpdate) {
            const defaultData = window.GradieStore.getDefaultData ? window.GradieStore.getDefaultData() : null;
            if (defaultData && defaultData.blogPosts) {
                const data = window.GradieStore.getData();
                // Merge: keep custom posts but update default ones with missing fields
                data.blogPosts = data.blogPosts.map(post => {
                    const defaultPost = defaultData.blogPosts.find(dp => dp.id === post.id);
                    if (defaultPost && (!post.content || !post.image)) {
                        return { ...defaultPost, ...post, content: post.content || defaultPost.content, image: post.image || defaultPost.image };
                    }
                    return post;
                });
                // Add any new default posts not already present
                defaultData.blogPosts.forEach(dp => {
                    if (!data.blogPosts.find(p => p.id === dp.id)) {
                        data.blogPosts.push(dp);
                    }
                });
                window.GradieStore.saveData(data);
                posts = data.blogPosts;
            }
        }
    }

    // ── 3. Filter ──────────────────────────────────────────────────────────────
    const published = posts.filter(p => !p.status || p.status === 'Published');
    const filtered  = categoryFilter
        ? published.filter(p => p.category === categoryFilter)
        : published;

    // ── 4. Blog Modal ─────────────────────────────────────────────────────────
    // Always remove any existing modal elements and style tags to prevent caching issues in the DOM
    const oldModal = document.getElementById('blog-modal');
    if (oldModal) oldModal.remove();
    const oldStyle = document.getElementById('blog-modal-style-tag');
    if (oldStyle) oldStyle.remove();

    const modalStyle = document.createElement('style');
    modalStyle.id = 'blog-modal-style-tag';
    modalStyle.textContent = `
        #blog-modal {
            display: none;
            position: fixed;
            z-index: 99999;
            left: 0; top: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.65);
            backdrop-filter: blur(8px);
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            padding: 20px;
        }
        #blog-modal-inner {
            background: var(--white, #fff);
            max-width: 800px;
            width: 100%;
            max-height: 85vh;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 24px 60px rgba(0,0,0,0.3);
            animation: blogModalFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            box-sizing: border-box;
        }
        @keyframes blogModalFadeIn {
            from { opacity: 0; transform: scale(0.96) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        #blog-modal-scrollable-content {
            overflow-y: auto;
            max-height: 85vh;
            width: 100%;
            -webkit-overflow-scrolling: touch;
            box-sizing: border-box;
        }
        #blog-modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: #ffffff;
            color: #17181d !important;
            border: 1px solid rgba(0, 0, 0, 0.15);
            width: 44px;
            height: 44px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.4rem;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.2);
            z-index: 999999;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #blog-modal-close:hover {
            transform: scale(1.1);
            background: #f4f3f0;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        body.blog-modal-open {
            overflow: hidden !important;
        }
    `;
    document.head.appendChild(modalStyle);

    document.body.insertAdjacentHTML('beforeend', `
        <div id="blog-modal" role="dialog" aria-modal="true">
            <div id="blog-modal-inner">
                <button id="blog-modal-close" onclick="closeBlogModal()" aria-label="Đóng bài viết">✕</button>
                <div id="blog-modal-scrollable-content">
                    <img id="blog-modal-img" src="" alt="" style="width:100%; height:400px; object-fit:cover; display:block;">
                    <div style="padding:40px;">
                        <span id="blog-modal-cat" style="font-size:0.9rem; color:var(--champagne); text-transform:uppercase; letter-spacing:1px; font-weight:700;"></span>
                        <h2 id="blog-modal-title" style="margin:15px 0 25px; font-size:2.2rem; line-height:1.2; font-family:'Playfair Display', serif;"></h2>
                        <div id="blog-modal-content" style="font-size:1.05rem; line-height:1.9; color:var(--ink); white-space:pre-wrap;"></div>
                    </div>
                </div>
            </div>
        </div>
    `);

    window.openBlogModal = function(e, id) {
        // Prevent default link behavior
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();

        const modal = document.getElementById('blog-modal');
        const scrollContent = document.getElementById('blog-modal-scrollable-content');
        const img = document.getElementById('blog-modal-img');
        const cat = document.getElementById('blog-modal-cat');
        const title = document.getElementById('blog-modal-title');
        const content = document.getElementById('blog-modal-content');

        // Search in filtered first, then all posts as fallback
        let post = filtered.find(p => (p.id === id || p._id === id || p._id?.toString() === id));
        if (!post) {
            // Fallback: search in all posts from GradieStore
            if (window.GradieStore) {
                const allPosts = window.GradieStore.getBlogPosts();
                post = allPosts.find(p => (p.id === id || p._id === id || p._id?.toString() === id));
            }
        }

        // Lock body scroll and prevent layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        const header = document.querySelector('.header');
        if (header) {
            header.style.paddingRight = `${scrollbarWidth}px`;
        }
        document.body.classList.add('blog-modal-open');

        // Show modal as flex
        if (modal) modal.style.display = 'flex';

        if (!post) {
            console.warn('Blog post not found for ID:', id);
            if (img) img.style.display = 'none';
            if (cat) cat.textContent = 'Lỗi';
            if (title) title.textContent = 'Không tìm thấy bài viết';
            if (content) content.innerHTML = '<p style="color:#b91c1c; font-weight:600; text-align:center;">Xin lỗi, bài viết bạn yêu cầu không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>';
            return;
        }

        // Populate modal content
        if (img) {
            img.style.display = 'block';
            img.src = '';
            img.alt = post.title || '';
            img.src = post.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80';
        }
        if (cat) cat.textContent = post.category || '';
        if (title) title.textContent = post.title || '';
        if (content) {
            const contentText = post.content || post.excerpt || 'Nội dung bài viết đang được cập nhật. Vui lòng quay lại sau!';
            content.textContent = contentText;
        }

        // Reset internal scroll of the scrollable content wrapper
        if (scrollContent) scrollContent.scrollTop = 0;

        // Focus close button for accessibility
        setTimeout(() => {
            const closeBtn = document.getElementById('blog-modal-close');
            if (closeBtn) closeBtn.focus();
        }, 50);
    };

    window.closeBlogModal = function() {
        const modal = document.getElementById('blog-modal');
        if (modal) modal.style.display = 'none';

        // Unlock scroll and reset padding
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        const header = document.querySelector('.header');
        if (header) {
            header.style.paddingRight = '';
        }
        document.body.classList.remove('blog-modal-open');
    };

    // Đóng modal khi click ra ngoài (vào overlay)
    const blogModal = document.getElementById('blog-modal');
    if (blogModal) {
        blogModal.addEventListener('click', function(e) {
            if (e.target === blogModal) {
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
