/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Cảnh báo: Việc này cho phép quá trình build hoàn tất ngay cả khi 
    // dự án có lỗi ESLint. 
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tương tự, bỏ qua kiểm tra kiểu dữ liệu khi build để tránh lỗi vặt
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
