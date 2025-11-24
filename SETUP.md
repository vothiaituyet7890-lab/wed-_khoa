# Hướng dẫn Cài đặt và Chạy Dự án

## 1. Cài đặt PostgreSQL

1. Tải PostgreSQL từ https://www.postgresql.org/download/
2. Chạy file cài đặt:
   - Chọn port: 5432
   - Đặt mật khẩu cho user postgres
   - Cài đặt pgAdmin nếu được hỏi

## 2. Tạo Database

Có 2 cách:

### Cách 1: Sử dụng pgAdmin

1. Mở pgAdmin
2. Kết nối vào PostgreSQL Server
3. Click chuột phải vào Databases -> Create -> Database
4. Đặt tên database là: saas_edu

### Cách 2: Sử dụng Command Line

1. Mở Command Prompt
2. Kết nối PostgreSQL:
   ```bash
   psql -U postgres
   ```
3. Tạo database:
   ```sql
   CREATE DATABASE saas_edu;
   ```

## 3. Cài đặt Dự án

1. Mở terminal, clone dự án:

   ```bash
   git clone https://github.com/Quanmingcao/SaaS.git
   cd SaaS
   ```

2. Tạo file .env trong thư mục gốc với nội dung:

   ```
   DATABASE_URL="postgresql://postgres:YourPassword@localhost:5432/saas_edu"
   JWT_SECRET="your-secret-key-change-this"
   PORT=3000
   ```

   (Thay YourPassword bằng mật khẩu postgres của bạn)

3. Cài đặt dependencies:

   ```bash
   # Cài đặt backend
   npm install

   # Cài đặt frontend
   cd frontend
   npm install
   cd ..
   ```

4. Tạo cấu trúc database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Tạo dữ liệu mẫu:
   ```bash
   node src/seed.js
   ```

## 4. Chạy Dự án

1. Chạy backend (terminal 1):

   ```bash
   npm run dev
   ```

2. Chạy frontend (terminal 2):

   ```bash
   cd frontend
   npm run dev
   ```

3. Truy cập: http://localhost:5173

## 5. Thông tin đăng nhập

### Super Admin:

- Email: admin@system.com
- Password: admin123

### Demo Tenant:

- Email: admin@demo.edu
- Password: tenant123

## Xử lý lỗi thường gặp

### Lỗi "Could not connect to database"

- Kiểm tra PostgreSQL đang chạy
- Kiểm tra mật khẩu trong file .env
- Kiểm tra database saas_edu đã được tạo

### Lỗi "Port already in use"

- Backend: Đổi PORT trong .env
- Frontend: Đổi port trong vite.config.js

### Lỗi CORS

- Đảm bảo backend chạy ở http://localhost:3000
- Đảm bảo đã cài đặt cors package

### Lỗi "prisma generate" hoặc "prisma push"

1. Xóa thư mục node_modules
2. Xóa file prisma/migrations
3. Chạy lại:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   ```
