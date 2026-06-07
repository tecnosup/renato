document.addEventListener('DOMContentLoaded', () => {
    
    // Login Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.getElementById('loginBtn');
            const errorMsg = document.getElementById('errorMsg');
            
            // Simple loading state
            const originalText = btn.innerText;
            btn.innerText = 'Autenticando...';
            btn.style.opacity = '0.8';
            errorMsg.style.display = 'none';
            
            // Simulate API Call delay
            setTimeout(() => {
                // Dummy validation just for example (admin / 123)
                // In a real app, this should be a backend call
                if (email === 'admin@admin.com' && password === '123') {
                    // Success -> Redirect to dashboard
                    btn.innerText = 'Sucesso!';
                    btn.style.backgroundColor = '#10b981'; // Green
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                } else {
                    // Error state
                    btn.innerText = originalText;
                    btn.style.opacity = '1';
                    errorMsg.style.display = 'block';
                    
                    // Shake animation for error
                    const container = document.querySelector('.glass-container');
                    container.style.transform = 'translatex(10px)';
                    setTimeout(() => container.style.transform = 'translatex(-10px)', 100);
                    setTimeout(() => container.style.transform = 'translatex(10px)', 200);
                    setTimeout(() => container.style.transform = 'translatex(0)', 300);
                }
            }, 1000);
        });
    }

    // Dashboard Logout Logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});
