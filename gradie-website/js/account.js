
document.addEventListener('DOMContentLoaded', () => {
    
    // Login Logic
    const loginForm = document.getElementById('user-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const pass = document.getElementById('login-password').value;
            const msg = document.getElementById('login-message');
            
            if(!email || !pass) {
                msg.textContent = 'Please fill out all fields.';
                msg.style.color = 'red';
                return;
            }

            // ADMIN LOGIN INTERCEPT
            if (email === 'admin@gradie.com' && pass === 'GradieAdmin123') {
                localStorage.setItem('GRADIE_ADMIN_AUTH', 'true');
                msg.textContent = 'Admin credentials recognized! Redirecting to dashboard...';
                msg.style.color = 'blue';
                setTimeout(() => window.location.href = 'admin-dashboard.html', 1000);
                return;
            }
            
            // Mock authentication for standard user
            const savedUser = JSON.parse(localStorage.getItem('GRADIE_USER') || 'null');
            let userObj = savedUser;
            
            if (!userObj) {
                // Allow any login if no user exists yet to test flow
                userObj = { name: "Guest User", email: email, phone: "N/A" };
            }
            
            localStorage.setItem('GRADIE_USER_AUTH', 'true');
            localStorage.setItem('GRADIE_USER', JSON.stringify(userObj));
            
            msg.textContent = 'Login successful! Redirecting...';
            msg.style.color = 'green';
            setTimeout(() => window.location.href = 'account.html', 1000);
        });
    }
    
    // Signup Logic
    const signupForm = document.getElementById('user-signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const phone = document.getElementById('signup-phone').value.trim();
            const pass = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm-password').value;
            const msg = document.getElementById('signup-message');
            
            if (pass !== confirm) {
                msg.textContent = 'Passwords do not match.';
                msg.style.color = 'red';
                return;
            }
            
            const newUser = { name, email, phone };
            localStorage.setItem('GRADIE_USER', JSON.stringify(newUser));
            localStorage.setItem('GRADIE_USER_AUTH', 'true');
            
            msg.textContent = 'Account created! Redirecting...';
            msg.style.color = 'green';
            setTimeout(() => window.location.href = 'account.html', 1000);
        });
    }
    
    // Account Dashboard Logic
    const dashboard = document.getElementById('account-dashboard');
    const prompt = document.getElementById('account-login-prompt');
    const logoutBtn = document.getElementById('user-logout-btn');
    
    if (dashboard && prompt) {
        const isAuth = localStorage.getItem('GRADIE_USER_AUTH') === 'true';
        if (isAuth) {
            dashboard.style.display = 'grid';
            prompt.style.display = 'none';
            
            const user = JSON.parse(localStorage.getItem('GRADIE_USER') || '{}');
            document.getElementById('dash-name').textContent = user.name || 'User';
            document.getElementById('dash-email').textContent = user.email || '';
            
            // Render recent orders if any
            if(window.GradieStore) {
                const orders = window.GradieStore.getOrders();
                // Filter orders by email if matching
                const myOrders = orders.filter(o => o.customer && o.customer.email === user.email);
                const orderList = document.getElementById('recent-orders-list');
                
                if(myOrders.length > 0) {
                    orderList.innerHTML = myOrders.map(o => `
                        <div style="border:1px solid var(--border-gold); padding:15px; border-radius:8px; margin-bottom:15px; display:flex; justify-content:space-between;">
                            <div>
                                <strong>${o.orderNumber}</strong><br>
                                <small style="color:var(--taupe);">${new Date(o.createdAt).toLocaleDateString()}</small>
                            </div>
                            <div style="text-align:right;">
                                <strong>${o.total.toLocaleString('vi-VN')} ₫</strong><br>
                                <span style="font-size:0.8rem; background:var(--warm-cream); padding:3px 8px; border-radius:4px;">${o.status}</span>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } else {
            dashboard.style.display = 'none';
            prompt.style.display = 'block';
        }
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('GRADIE_USER_AUTH');
            window.location.href = 'login.html';
        });
    }
});
