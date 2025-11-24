# Hướng dẫn Đóng góp

## Quy trình làm việc

### 1. Fork và Clone
1. Fork repository này về tài khoản GitHub của bạn
2. Clone repository đã fork về máy local:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SaaS.git
   cd SaaS
   ```
3. Thêm upstream remote:
   ```bash
   git remote add upstream https://github.com/Quanmingcao/SaaS.git
   ```

### 2. Tạo Branch Mới
Tạo branch mới cho mỗi tính năng hoặc fix:
```bash
git checkout -b feature/ten-tinh-nang
# hoặc
git checkout -b fix/ten-loi
```

Quy ước đặt tên branch:
- `feature/` cho tính năng mới
- `fix/` cho sửa lỗi
- `docs/` cho cập nhật tài liệu
- `refactor/` cho cải tiến code

### 3. Phát triển
1. Làm các thay đổi trong branch của bạn
2. Commit thường xuyên với message rõ ràng:
   ```bash
   git add .
   git commit -m "feat: mô tả ngắn gọn về thay đổi"
   ```

Quy ước commit message:
- `feat:` cho tính năng mới
- `fix:` cho sửa lỗi
- `docs:` cho cập nhật tài liệu
- `refactor:` cho cải tiến code
- `style:` cho thay đổi style code
- `test:` cho thêm/sửa test

### 4. Đồng bộ với Upstream
Trước khi tạo Pull Request:
```bash
git fetch upstream
git rebase upstream/master
```

### 5. Tạo Pull Request
1. Push code lên fork của bạn:
   ```bash
   git push origin feature/ten-tinh-nang
   ```
2. Tạo Pull Request trên GitHub
3. Điền thông tin:
   - Tiêu đề rõ ràng
   - Mô tả chi tiết thay đổi
   - Link đến issue liên quan (nếu có)
   - Screenshots (nếu có UI changes)

## Coding Standards

### Backend (Node.js)
- Sử dụng ES6+ features
- Async/await cho xử lý bất đồng bộ
- Try/catch cho xử lý lỗi
- Validate input trong controllers
- Tách logic phức tạp vào services

### Frontend (React)
- Function components với hooks
- Props validation với PropTypes
- Tách UI components và container components
- Sử dụng CSS modules hoặc styled-components
- Responsive design

### Database
- Luôn có migrations cho thay đổi schema
- Không thay đổi trực tiếp production DB
- Sử dụng transactions khi cần

## Testing
- Viết unit tests cho logic quan trọng
- Test API endpoints với integration tests
- Test UI flows với E2E tests

## Code Review
- Review code của người khác
- Respond to comments nhanh chóng
- Giữ thái độ tích cực và xây dựng
- Focus vào code, không phải người viết

## Quy trình Release
1. Code được merge vào master
2. CI/CD tự động test và build
3. Deploy to staging
4. QA kiểm tra
5. Deploy to production

## Báo lỗi
Khi tìm thấy lỗi:
1. Kiểm tra issue list
2. Tạo issue mới nếu chưa có
3. Mô tả:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots
   - Environment info

## Liên hệ
- Tạo issue cho câu hỏi chung
- Dùng Discussions cho thảo luận
- Email cho vấn đề bảo mật