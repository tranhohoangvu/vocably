> **Bản standalone** — đã loại bỏ toàn bộ lớp Grok App Builder (auth provider hệ thống, PGLite, preview bridge, multiplayer…). Giữ nguyên các cải tiến phân quyền guest/seed/admin, `session.ts`, `guest-upgrade`, `convertGuest` từ bản BNY.

# VOCABLY – Nền Tảng Học Từ Vựng TOEIC Ứng Dụng Thuật Toán Phân Tích Nhận Thức

Vocably là một ứng dụng web học từ vựng TOEIC được thiết kế theo kiến trúc Offline-first, tập trung vào việc tối ưu hóa trí nhớ dài hạn thông qua thuật toán lặp lại ngắt quãng (Spaced Repetition) tiên tiến. Dự án giải quyết bài toán cốt lõi của người học ngoại ngữ: ghi nhớ khối lượng từ vựng lớn mà không bị học vẹt, đồng thời đảm bảo tính riêng tư tuyệt đối về dữ liệu.

## 1. Kiến Trúc & Công Nghệ Cốt Lõi (Tech Stack)

Dự án được xây dựng trên hệ sinh thái Frontend hiện đại, tối ưu hóa cho tốc độ và trải nghiệm mượt mà:

- **Core Framework**: Sử dụng React 19 kết hợp với bộ build tool Vite, mang lại tốc độ biên dịch cực nhanh và hiệu năng render tối ưu.
- **Routing & SSR Ready**: Tích hợp TanStack Router / React Start, cung cấp khả năng điều hướng type-safe, Route Guards bảo mật cấp độ cao và quản lý trạng thái URL đồng bộ.
- **State Management & Storage**: Quản lý state toàn cục bằng Zustand kết hợp với Dexie.js để lưu trữ cơ sở dữ liệu ngay trên trình duyệt (IndexedDB).
- **UI/UX Framework**: Giao diện được xây dựng bằng Tailwind CSS v4 kết hợp với các component không đầu (headless UI) từ Radix UI, đảm bảo tính trợ năng (Accessibility) và khả năng tùy biến cao.

## 2. Thuật Toán Trí Tuệ Nhận Thức FSRS-4.5

Thay vì các phương pháp học truyền thống với tỷ lệ ghi nhớ chỉ khoảng 18%, Vocably tích hợp thuật toán FSRS (Free Spaced Repetition Scheduler) giúp đẩy tỷ lệ ghi nhớ lên đến 92% sau 30 ngày.

- **Đánh giá 4 cấp độ**: Mỗi thẻ từ được đánh giá qua 4 mức độ: Again (Quên), Hard (Khó), Good (Nhớ), Easy (Dễ).
- **Tính toán độ khó**: Hệ thống tự động tính toán độ ổn định (stability) và độ khó (difficulty) của từng từ để dự đoán thời điểm người dùng sắp quên, từ đó lên lịch ôn tập vào "thời điểm vàng".

## 3. Hệ Sinh Thái Tính Năng Luyện Tập

Vocably cung cấp kho dữ liệu gồm 500+ từ vựng cốt lõi bám sát chuẩn ETS, được chia theo các mốc mục tiêu: 550+, 750+, 850+, và 990. Hệ thống hỗ trợ 4 chế độ rèn luyện từ thụ động đến phản xạ:

- **Flashcard 3D**: Lật thẻ tương tác 3D kết hợp phát âm chuẩn giọng US, chấm điểm FSRS trực tiếp qua phím tắt.
- **Quiz Trắc Nghiệm**: Trắc nghiệm 2 chiều (Anh-Việt, Việt-Anh) mô phỏng bẫy từ vựng trong Part 5-6 của bài thi TOEIC.
- **Điền Từ Ngữ Cảnh (Context Fill)**: Đặt từ vựng vào các câu ví dụ thực tế trong môi trường công sở, có hỗ trợ gợi ý ký tự thông minh.
- **Nghe Chép Chính Tả (Spelling)**: Tích hợp Web Speech API để luyện kỹ năng Listening Part 1-2 thông qua việc nghe và gõ lại chính xác từng ký tự.

## 4. Hệ Thống Bảo Mật & Phân Quyền (RBAC)

Mặc dù là ứng dụng chạy phía Client, Vocably sở hữu cơ chế phân quyền (Role-Based Access Control) vô cùng chặt chẽ:

- **Tài khoản Khách (Demo)**: Trải nghiệm giới hạn 50 từ vựng, không có quyền can thiệp vào kho dữ liệu hoặc import file.
- **Người dùng thường (User)**: Sở hữu toàn bộ kho dữ liệu, có quyền thêm, sửa, xóa các từ vựng tự tạo và theo dõi tiến độ cá nhân.
- **Quản trị viên (Admin)**: Được bảo mật qua biến môi trường (`VITE_ADMIN_EMAIL`), Admin nắm quyền kiểm soát bảng điều khiển quản lý người dùng, xuất file định dạng CSV và đặc quyền chỉnh sửa/xóa các "Seed words" (từ vựng hệ thống).
- **Bảo mật Route & Dữ liệu**: Các Route được bảo vệ chặt chẽ để chặn người dùng truy cập trái phép, đồng thời việc kiểm tra quyền sửa/xóa dữ liệu được xác thực ở cả 2 lớp UI và Database Store.

## 5. Trải Nghiệm Người Dùng (UX) Khác Biệt

- **Kiến trúc 100% Offline-First**: Toàn bộ dữ liệu, lịch học, và Heatmap theo dõi thói quen 365 ngày đều được lưu cục bộ trên thiết bị. Hoạt động mượt mà không độ trễ, không quảng cáo và không cần kết nối mạng.
- **Thiết Kế Tĩnh Lặng & Hiện Đại**: Giao diện áp dụng phong cách Glassmorphism (hiệu ứng kính mờ), hỗ trợ chuyển đổi mượt mà giữa chế độ Sáng/Tối (Dark/Light mode).
- **Quản Lý Dữ Liệu Linh Hoạt**: Hỗ trợ nhập và xuất toàn bộ quá trình học dưới định dạng CSV (tương thích chuẩn Anki và Excel), tự động đối chiếu từ trùng lặp để bảo toàn tiến độ thuật toán FSRS.
