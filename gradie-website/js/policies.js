// js/policies.js
document.addEventListener('DOMContentLoaded', () => {
    if (!window.GradieStore) return;
    const policyContainer = document.getElementById('policy-container');
    if (policyContainer) {
        const policies = window.GradieStore.getPolicies().filter(p => p.status === 'Published');
        if (policies.length === 0) {
            policyContainer.innerHTML = '<p>Chưa có chính sách nào được ban hành.</p>';
        } else {
            policyContainer.innerHTML = policies.map(p => `
                <div style="margin-bottom:20px; padding:20px; background:var(--white); border:1px solid var(--border-gold); border-radius:8px;">
                    <h3 style="color:var(--champagne);">${p.title}</h3>
                    <p style="margin-top:10px; line-height:1.6;">${p.content}</p>
                </div>
            `).join('');
        }
    }
});
