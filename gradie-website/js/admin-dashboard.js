// js/admin-dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    if(!window.GradieStore) return;
    
    const setStat = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    // Animate numbers
    const animateValue = (id, start, end, duration) => {
        const obj = document.getElementById(id);
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutQuart
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            obj.innerHTML = Math.floor(easeProgress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    let prevStats = { p: 0, c: 0, o: 0, u: 0, b: 0, g: 0, pol: 0 };

    function updateStats(animate = true) {
        const p = window.GradieStore.getProducts().length;
        const c = window.GradieStore.getCategories().length;
        const o = window.GradieStore.getOrders().length;
        const u = window.GradieStore.getUsers().length;
        const b = window.GradieStore.getBlogPosts().length;
        const g = window.GradieStore.getGallery().length;
        const pol = window.GradieStore.getPolicies().length;

        if (animate) {
            animateValue('stat-products', prevStats.p, p, 1500);
            animateValue('stat-categories', prevStats.c, c, 1500);
            animateValue('stat-orders', prevStats.o, o, 1500);
            animateValue('stat-users', prevStats.u, u, 1500);
            animateValue('stat-blog', prevStats.b, b, 1500);
            animateValue('stat-gallery', prevStats.g, g, 1500);
            animateValue('stat-policies', prevStats.pol, pol, 1500);
        } else {
            setStat('stat-products', p);
            setStat('stat-categories', c);
            setStat('stat-orders', o);
            setStat('stat-users', u);
            setStat('stat-blog', b);
            setStat('stat-gallery', g);
            setStat('stat-policies', pol);
        }

        prevStats = { p, c, o, u, b, g, pol };
    }

    updateStats(true);

    window.addEventListener('gradie_data_synced', () => {
        updateStats(false);
    });
});
