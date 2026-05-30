// js/blog.js
document.addEventListener('DOMContentLoaded', () => {
    if (!window.GradieStore) return;
    const blogContainer = document.getElementById('blog-container');
    if (blogContainer) {
        const categoryFilter = blogContainer.dataset.blogCategory;
        const allPosts = window.GradieStore.getBlogPosts().filter(p => p.status === 'Published');
        const posts = categoryFilter ? allPosts.filter(p => p.category === categoryFilter) : allPosts;
        
        if (!document.getElementById('blog-modal')) {
            const modalHtml = `
                <div id="blog-modal" style="display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); overflow-y:auto;">
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
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        window.openBlogModal = function(id) {
            const post = posts.find(p => p.id === id);
            if(post) {
                document.getElementById('blog-modal-img').src = post.image;
                document.getElementById('blog-modal-cat').textContent = post.category;
                document.getElementById('blog-modal-title').textContent = post.title;
                document.getElementById('blog-modal-content').textContent = post.content;
                document.getElementById('blog-modal').style.display = 'block';
            }
        };

        if (posts.length === 0) {
            blogContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--taupe); font-style: italic; border: 1px dashed var(--border-gold); border-radius: 8px;">No blog posts found for this category yet. Please check back later.</div>';
        } else {
            blogContainer.innerHTML = posts.map(p => `
                <div class="product-card" style="padding-bottom:15px; cursor:pointer;" onclick="openBlogModal('${p.id}')">
                    <img src="${p.image}" style="width:100%; height:200px; object-fit:cover;">
                    <div style="padding:15px;">
                        <span style="font-size:0.8rem; color:var(--taupe); text-transform:uppercase;">${p.category}</span>
                        <h3 style="margin:10px 0;">${p.title}</h3>
                        <p style="font-size:0.9rem; color:var(--soft-black);">${p.content.substring(0, 100)}...</p>
                        <button class="outline-button" style="margin-top:15px; width:100%;">Read More</button>
                    </div>
                </div>
            `).join('');
        }
    }
});
