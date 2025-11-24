document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Lưu token và thông tin user
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Chuyển hướng đến trang chúc mừng
            window.location.href = '/welcome.html';
        } else {
            errorDiv.textContent = data.error || 'Đăng nhập thất bại';
        }
    } catch (error) {
        errorDiv.textContent = 'Lỗi kết nối server';
    }
});