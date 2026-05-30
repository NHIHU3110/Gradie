// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Sync Settings
    if (window.GradieStore) {
        const settings = window.GradieStore.getSettings();
        
        // Announcement bar
        const annBar = document.querySelector('.announcement-bar');
        if (annBar && settings.announcement) {
            annBar.textContent = settings.announcement;
        }
        
        // Removed dynamic logo injection to prevent duplicate logos.
        // Logo is now standardized across all HTML files.
    }

    // 2. Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // 3. Cart Count Initial Sync
    if(window.updateCartCount) {
        window.updateCartCount();
    }
});

window.updateCartCount = function() {
    const cart = JSON.parse(localStorage.getItem('gradie_cart') || '[]');
    let count = 0;
    cart.forEach(item => count += (item.qty || 1));
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}


window.addToCart = function(productId, qty = 1, variant = '') {
    if (!window.GradieStore) return;
    const product = window.GradieStore.getProductById(productId);
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('gradie_cart') || '[]');
    
    // Determine actual price if variant is selected
    let actualPrice = product.price;
    if (variant && product.variants) {
        let v = product.variants.find(x => x.name === variant);
        if (v && v.price) actualPrice = v.price;
    }
    
    // Unique ID for cart item (product + variant)
    let cartItemId = product.id + (variant ? '-' + variant : '');
    
    let existingItem = cart.find(i => i.cartItemId === cartItemId);
    
    if (existingItem) {
        existingItem.qty += parseInt(qty);
    } else {
        cart.push({
            cartItemId: cartItemId,
            id: product.id,
            name: product.name + (variant ? ` (${variant})` : ''),
            price: actualPrice,
            image: product.image || (product.gallery && product.gallery[0]) || '',
            qty: parseInt(qty)
        });
    }
    
    localStorage.setItem('gradie_cart', JSON.stringify(cart));
    window.updateCartCount();
    
    // Add a visual feedback
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.style.transform = 'scale(1.5)';
        badge.style.backgroundColor = 'var(--champagne)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
            badge.style.backgroundColor = 'var(--text-color)';
        }, 300);
    }
    alert(product.name + " added to cart!");
};

window.toggleFavorite = function(productId, btn) {
    let favs = JSON.parse(localStorage.getItem('gradie_favs') || '[]');
    if (favs.includes(productId)) {
        favs = favs.filter(id => id !== productId);
        if(btn) { btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`; btn.style.borderColor = 'var(--border-gold)'; }
    } else {
        favs.push(productId);
        if(btn) { btn.innerHTML = `<svg width="18" height="18" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`; btn.style.borderColor = 'red'; }
    }
    localStorage.setItem('gradie_favs', JSON.stringify(favs));
};

// Auto-style favorites on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        let favs = JSON.parse(localStorage.getItem('gradie_favs') || '[]');
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            // we need to extract productId from onclick attribute which is toggleFavorite('id', this)
            const match = btn.getAttribute('onclick').match(/toggleFavorite\('([^']+)'/);
            if (match && match[1] && favs.includes(match[1])) {
                btn.innerHTML = `<svg width="18" height="18" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`; btn.style.borderColor = 'red';
            } else {
                btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`; btn.style.borderColor = 'var(--border-gold)';
            }
        });
    }, 500);
});
