# Tâm Đức QR Candidate Registration System

Hệ thống đăng ký ứng viên qua mã QR cho Công ty Tâm Đức.

## Cấu trúc dự án
- `client/`: Ứng dụng Next.js (Frontend)
- `server/`: Ứng dụng NestJS (Backend)

## Hướng dẫn cài đặt nhanh

### 1. Backend (NestJS)
```bash
cd server
npm install
# Chỉnh sửa file .env với thông tin Google Sheets
npm run start:dev
```

### 2. Frontend (Next.js)
```bash
cd client
npm install
npm run dev
```

## Chức năng
- **Ứng viên**: Quét QR -> Điền Form -> Gửi (Dữ liệu về Google Sheets).
- **Admin**: Tạo mã QR, Quản lý link đăng ký tại `/admin`.

## Công nghệ
- Next.js 14, TailwindCSS, Framer Motion.
- NestJS, Google Sheets API.
