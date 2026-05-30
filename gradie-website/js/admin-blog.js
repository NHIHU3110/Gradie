// js/admin-blog.js
document.addEventListener('DOMContentLoaded', () => {
    if(!window.GradieStore) return;
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
});
