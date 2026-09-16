# VOCABLY – Nền Tảng Học Từ Vựng TOEIC Ứng Dụng Thuật Toán Phân Tích Nhận Thức

[![Live Demo](https://img.shields.io/badge/Live%20Demo-vocably--english--learning.vercel.app-10b981?style=for-the-badge&logo=vercel)](https://vocably-english-learning.vercel.app/)
[![Database](https://img.shields.io/badge/Database-Supabase-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> 🌐 **Website chính thức**: [https://vocably-english-learning.vercel.app/](https://vocably-english-learning.vercel.app/)

Vocably là ứng dụng web học từ vựng TOEIC được thiết kế theo kiến trúc **Hybrid (Offline-first & Cloud-ready)**, tập trung tối ưu hóa khả năng ghi nhớ dài hạn thông qua thuật toán lặp lại ngắt quãng **FSRS-4.5 (Free Spaced Repetition Scheduler)**. Dự án giải quyết bài toán cốt lõi của người học ngoại ngữ: ghi nhớ khối lượng lớn từ vựng chuẩn ETS một cách tự nhiên, phản xạ cao, không học vẹt, đồng thời đảm bảo quyền riêng tư và tốc độ phản hồi tức thì.

---

## 1. Kiến Trúc & Công Nghệ Cốt Lõi (Tech Stack)

Dự án được xây dựng trên hệ sinh thái Frontend hiện đại:

- **Core Framework**: React 19 kết hợp với bộ build tool Vite 8, mang lại hiệu năng render tối ưu và tốc độ HMR tức thì.
- **Routing**: TanStack Router (File-based Routing), cung cấp khả năng điều hướng type-safe 100% kèm Route Guards phân quyền.
- **State Management**: Quản lý state toàn cục bằng **Zustand**.
- **Cơ sở Dữ liệu Hai Chế độ (Dual-mode Database)**:
  - **Chế độ Cục bộ (Offline-first)**: Sử dụng **Dexie.js (IndexedDB)** lưu trữ từ vựng, lịch sử phiên học và tiến độ FSRS ngay trên trình duyệt với độ trễ 0ms.
  - **Chế độ Đám mây (Cloud-ready)**: Tích hợp sẵn **Supabase (PostgreSQL + Supabase Auth + RLS)** để đồng bộ đa thiết bị và quản trị người dùng tập trung.
- **UI/UX Framework**: Tailwind CSS v4, Headless UI từ Radix UI, biểu tượng Lucide Icons, typography phong cách editorial sang trọng (Fraunces, Figtree, IBM Plex Mono).
- **Phát âm Tự nhiên**: Web Speech API với cơ chế tự động cache giọng đọc bản ngữ (Natural/Google voices).

---

## 2. Thuật Toán Trí Tuệ Nhận Thức FSRS-4.5

Thay vì các phương pháp ghi nhớ truyền thống, Vocably tích hợp thuật toán **FSRS (Free Spaced Repetition Scheduler)** giúp đẩy tỷ lệ ghi nhớ lên đến 92% sau 30 ngày:

- **Đánh giá 4 cấp độ**: Mỗi từ được đánh giá qua 4 mức độ: Again (Quên), Hard (Khó), Good (Nhớ), Easy (Dễ).
- **Tính toán nhận thức**: Tự động tính toán độ ổn định (`stability`), độ khó (`difficulty`), số lần quên (`lapses`) và số lần lặp lại (`reps`) để dự đoán chính xác "thời điểm vàng" cần ôn tập.
- **Tích hợp toàn diện trên cả 4 chế độ học**: Bất kể người học chọn Flashcard, Quiz trắc nghiệm, Điền từ ngữ cảnh hay Nghe chép chính tả, thuật toán FSRS đều tự động cập nhật tiến độ học của từng từ vào cơ sở dữ liệu.

---

## 3. Hệ Sinh Thái Tính Năng Luyện Tập

Vocably cung cấp kho dữ liệu gồm 500+ từ vựng cốt lõi bám sát cấu trúc đề thi TOEIC ETS thực tế:

- **Bộ lọc cá nhân hóa tại Study Hub**: Người học có thể tùy chọn lọc theo **Chủ đề** (Business, Finance, HR, Marketing...), **Nguồn từ** (Từ đến hạn ôn hôm nay, Từ mới chưa học, Từ đang học) và **Số lượng từ mỗi phiên** (10, 20, 30, 50 từ).
- **Flashcard 3D**: Lật thẻ 3D mượt mà kết hợp phát âm bản ngữ, hiển thị phiên âm IPA và chấm điểm FSRS trực tiếp qua phím tắt (1, 2, 3, 4, Space).
- **Quiz Trắc Nghiệm**: Trắc nghiệm 2 chiều (Anh ↔ Việt) mô phỏng bẫy từ vựng Part 5-6 của bài thi TOEIC, tích hợp nút nghe phát âm từ vựng.
- **Điền Từ Ngữ Cảnh (Context Fill)**: Đặt từ vựng vào các câu văn thực tế trong môi trường công sở, có hỗ trợ gợi ý ký tự thông minh.
- **Nghe Chép Chính Tả (Spelling)**: Luyện phản xạ Listening Part 1-2 thông qua việc nghe phát âm và gõ lại chính xác từng ký tự.

---

## 4. Hệ Thống Bảo Mật & Phân Quyền (RBAC)

Ứng dụng hỗ trợ 3 nhóm vai trò người dùng:

- **Tài khoản Khách (Demo Guest)**: Trải nghiệm thử 50 từ vựng đầu tiên, làm quen với giao diện và thuật toán FSRS mà không cần đăng ký.
- **Người dùng thường (User)**: Mở khóa toàn bộ kho từ TOEIC, có quyền thêm, sửa, xóa các từ vựng tự tạo và theo dõi tiến độ FSRS cá nhân.
- **Quản trị viên (Admin)**: Quản lý người dùng, chỉnh sửa/bổ sung kho từ hệ thống (Seed words) và xuất dữ liệu CSV.

---

## 5. Quản Lý & Sao Lưu Dữ Liệu

- **Heatmap 365 Ngày Đa Sắc Độ**: Hiển thị trực quan cường độ học tập theo 4 cấp độ màu (0 từ, 1–9 từ, 10–24 từ, 25+ từ) kèm tooltip chi tiết từng ngày, tương tự phong cách GitHub/Anki.
- **Sao lưu & Khôi phục Toàn diện (Full JSON Backup & Restore)**: Cho phép xuất/nhập toàn bộ dữ liệu gồm từ vựng cá nhân, tiến độ FSRS, lịch sử phiên học và chuỗi ngày học (streak) dưới dạng file `.json`.
- **Nhập / Xuất CSV**: Hỗ trợ xuất và nhập kho từ theo định dạng CSV chuẩn quốc tế, tự động phát hiện và bỏ qua từ trùng lặp.

---

## 6. Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu môi trường
- Node.js >= 18.0.0
- Trình quản lý gói: `npm` (hoặc `pnpm`, `yarn`)

### Các bước cài đặt
```bash
# 1. Clone repository
git clone https://github.com/tranhohoangvu/vocably.git
cd vocably

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Tạo file môi trường
cp .env.example .env

# 4. Khởi chạy môi trường phát triển (Dev Server)
npm run dev
```
Mở trình duyệt tại: `http://localhost:5173`

### Các lệnh kiểm tra & đóng gói
```bash
npm run typecheck    # Kiểm tra kiểu dữ liệu TypeScript
npm run lint         # Kiểm tra lỗi cú pháp với ESLint
npm run build        # Đóng gói bản production (Client & SSR)
npm run preview      # Xem thử bản đóng gói production
```

---

## 7. Cấu Hình Tích Hợp Supabase (Tùy Chọn)

Mặc định, Vocably hoạt động **100% Offline** không cần mạng. Khi bạn muốn đưa hệ thống lên môi trường đám mây và đồng bộ nhiều thiết bị, chỉ cần thực hiện 2 bước:

1. **Khởi tạo Database**:
   - Truy cập trang quản trị [Supabase](https://supabase.com) của bạn, vào mục **SQL Editor**.
   - Mở file `supabase/schema.sql`, dán toàn bộ nội dung và bấm **Run** để tự động khởi tạo bảng (`profiles`, `words`, `user_word_progress`, `study_sessions`) cùng chính sách bảo mật RLS.

2. **Cập nhật file `.env`**:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   Khởi động lại app (`npm run dev`), Vocably sẽ tự động chuyển sang chế độ **Cloud-connected** mà không cần sửa bất kỳ dòng code nào.

---

## 8. Triển Khai Production (Vercel & Supabase)

Hệ thống đã được tối ưu hóa sẵn sàng cho việc triển khai lên **Vercel** thông qua **Nitro Server Toolkit**:

1. **Khởi tạo cơ sở dữ liệu trên Supabase**:
   - Chạy toàn bộ kịch bản trong file `supabase/schema.sql` tại Supabase SQL Editor.
   - Lấy `Project URL` và `anon key` tại **Project Settings** $\rightarrow$ **API**.

2. **Deploy lên Vercel**:
   - Kết nối repository GitHub với Vercel.
   - Thiết lập các biến môi trường tại **Project Settings** $\rightarrow$ **Environment Variables**:
     - `VITE_SUPABASE_URL`: URL project Supabase (ví dụ: `https://xxxx.supabase.co`).
     - `VITE_SUPABASE_ANON_KEY`: Anon public key của Supabase.
     - `VITE_ADMIN_EMAIL`: Email của tài khoản Quản trị viên.
     - `VITE_ADMIN_PASSWORD`: Mật khẩu tài khoản Quản trị viên.
   - Bấm **Deploy**. Vercel sẽ tự động đóng gói ứng dụng qua Nitro Serverless Function.

3. **Cấu hình Redirect URL tại Supabase**:
   - Truy cập Supabase $\rightarrow$ **Authentication** $\rightarrow$ **URL Configuration**.
   - Cập nhật **Site URL** và thêm `https://vocably-english-learning.vercel.app/**` vào **Redirect URLs**.

