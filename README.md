# SaaS Credit Packages - Bài tập thực tập Web Developer

Một module full-stack để bán các gói credit cho SaaS. Người dùng có thể mua gói với thanh toán mô phỏng, nhận credit, mở khóa các tính năng của gói, xem lịch sử mua hàng và gọi API tính năng (API sẽ kiểm tra quyền và trừ credit).

## Công nghệ

- Backend: Python, FastAPI, SQLAlchemy, JWT
- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Cơ sở dữ liệu: PostgreSQL
- DevOps: Docker, Docker Compose

## Tính năng

### Người dùng
- Đăng ký và đăng nhập với JWT
- Xem số credit hiện tại
- Xem các tính năng đã mở khóa
- Xem lịch sử giao dịch
- Mua gói credit với thanh toán mô phỏng
- Gọi API tính năng nếu đã mở khóa và đủ credit

### Quản trị viên (Admin)
- Đăng nhập với quyền admin
- Tạo/cập nhật/xóa các gói
- Gắn tính năng vào các gói

### Ví dụ chi phí tính năng
- `generate_image` tốn 5 credit
- `auto_post` tốn 3 credit
- `advanced_analytics` tốn 2 credit

## Tài khoản dùng thử

Admin:

```txt
admin@example.com
password
```

Người dùng (User):

```txt
user@example.com
password
```

## Chạy bằng Docker

```bash
docker-compose up --build
```

Mở các địa chỉ sau trong trình duyệt:

```txt
Frontend: http://localhost:5173
Backend API: http://localhost:8000
FastAPI Docs: http://localhost:8000/docs
Health: http://localhost:8000/health
```

## Các endpoint chính của API

### Xác thực (Auth)

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Gói (Packages)

```txt
GET    /api/packages
POST   /api/packages             (chỉ admin)
PUT    /api/packages/{id}        (chỉ admin)
DELETE /api/packages/{id}        (chỉ admin, xóa mềm)
```

### Mua hàng / Credit

```txt
POST /api/purchases
GET  /api/transactions/me
GET  /api/credits/me
GET  /api/credit-logs/me
```

### Tính năng (Features)

```txt
GET  /api/features
GET  /api/features/me
POST /api/features/generate-image/use
POST /api/features/auto-post/use
POST /api/features/advanced-analytics/use
```

## Luồng nghiệp vụ (Business Flow)

```txt
Người dùng mua gói
→ Backend tạo giao dịch thành công
→ Backend cộng credit vào tài khoản người dùng
→ Backend mở khóa các tính năng của gói cho người dùng
→ Người dùng gọi API tính năng
→ Backend kiểm tra tính năng đã được mở khóa chưa
→ Backend kiểm tra người dùng có đủ credit không
→ Backend trừ credit tương ứng
→ Backend ghi log credit
```

## Các bảng trong cơ sở dữ liệu

- users
- packages
- features
- package_features
- transactions
- user_features
- credit_logs

Các bảng sẽ được tạo tự động bởi SQLAlchemy khi backend khởi động. Dữ liệu seed cũng được chèn tự động khi backend chạy lần đầu.

## Phát triển cục bộ (không dùng Docker)

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Tạo file `frontend/.env` nếu cần:

```txt
VITE_API_BASE_URL=http://localhost:8000/api
```