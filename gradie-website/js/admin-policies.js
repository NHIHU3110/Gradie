// js/admin-policies.js
document.addEventListener('DOMContentLoaded', () => {
    if(!window.GradieStore) return;
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
});
