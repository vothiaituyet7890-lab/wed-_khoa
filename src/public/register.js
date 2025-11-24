document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorDiv = document.getElementById('registerError');

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            // Chuyển hướng đến trang đăng nhập
            window.location.href = '/login.html';
        } else {
            errorDiv.textContent = data.error || 'Đăng ký thất bại';
        }
    } catch (error) {
        errorDiv.textContent = 'Lỗi kết nối server';
    }
});