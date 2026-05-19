# Prompt Lovable: Prototype giao diện University Management System

Bạn là một senior frontend engineer. Hãy tạo **prototype giao diện frontend** cho hệ thống quản lý trường đại học **Thang Long University Web / University Management System**.

## 1. Mục tiêu

Tôi chỉ cần **xem và đánh giá giao diện trước**. Chưa cần kết nối backend thật, chưa cần gọi API thật, chưa cần xử lý auth thật.

Hãy tạo một frontend chạy độc lập bằng mock data/local state để tôi có thể xem đầy đủ các màn hình chính. Sau khi tôi ưng giao diện, tôi sẽ tải frontend về và tự tích hợp backend Spring Boot sau.

Ứng dụng có 3 nhóm người dùng:

- **Admin**: quản trị hệ thống, sinh viên, giảng viên, ngành, môn học, học kỳ, phòng học, tiết học, lớp học phần, đăng ký học, kết quả học tập.
- **Teacher**: xem lớp đang dạy, danh sách sinh viên, nhập điểm, chat.
- **Student**: đăng ký môn học, xem thời khóa biểu, lịch thi, điểm, GPA/CPA, học phí, chat.

## 2. Quan trọng: không tích hợp backend

Không gọi API backend thật trong phiên bản này.

Yêu cầu:

- Dùng mock data rõ ràng, thực tế, đủ nhiều để giao diện nhìn giống sản phẩm thật.
- Login chỉ là mock login.
- Cho phép chọn role nhanh để xem giao diện: `Admin`, `Teacher`, `Student`.
- Có thể dùng tài khoản demo hoặc nút chuyển role ngay ở màn hình login.
- CRUD chỉ cần thao tác trên local state.
- Nút tạo/sửa/xóa/đăng ký/thanh toán/nhập điểm chỉ cần mô phỏng trạng thái thành công bằng toast hoặc cập nhật local state.
- Chat chỉ cần mock UI và mock tin nhắn, chưa cần WebSocket.
- Không cần viết Axios client thật, không cần refresh token, không cần API interceptor.

Sau này tôi sẽ tự nối backend, nên hãy tổ chức code sạch để dễ thay mock data bằng API.

## 3. Tech Stack yêu cầu

Tạo project frontend với:

- React 18 + Vite
- TypeScript
- React Router
- Tailwind CSS
- shadcn/ui hoặc component system tương đương
- lucide-react cho icon
- react-hook-form + zod cho form validation nếu cần
- TanStack Table nếu làm bảng dữ liệu

Không cần:

- Axios
- React Query
- STOMP/WebSocket
- Tích hợp backend
- Tích hợp thanh toán thật

## 4. Phong cách giao diện

Thiết kế theo hướng dashboard vận hành cho trường đại học:

- Gọn, sáng, chuyên nghiệp, dễ đọc dữ liệu.
- Layout gồm sidebar cố định, topbar, breadcrumb, vùng nội dung chính.
- Màu chủ đạo: đỏ đô / crimson, kết hợp trắng, xám nhạt, xanh trạng thái, vàng cảnh báo.
- Không tạo landing page marketing.
- Màn hình đầu tiên là **Login / Role Selection**.
- Sau login chuyển đến dashboard theo role.
- Không dùng hero section, không dùng nền gradient trang trí quá nhiều.
- Bảng dữ liệu cần có search, filter, pagination giả lập nếu có thể.
- Form tạo/sửa dùng dialog hoặc drawer.
- Có loading skeleton giả lập ở một số màn hình nếu hợp lý.
- Có empty state, success toast, error toast giả lập.
- Responsive tốt cho desktop và tablet; mobile dùng sidebar dạng drawer.

## 5. Kiến trúc thư mục mong muốn

Tạo frontend trong thư mục `frontend-uni`:

```txt
frontend-uni/
  src/
    app/
      router.tsx
      providers.tsx
    components/
      layout/
      ui/
      data-table/
      forms/
    features/
      auth/
      admin/
      student/
      teacher/
      chat/
    data/
      mock-admin.ts
      mock-student.ts
      mock-teacher.ts
      mock-chat.ts
    hooks/
    lib/
    types/
    main.tsx
  package.json
```

## 6. Login mock và chuyển role

Tạo trang `/login`:

- Card đăng nhập ở giữa màn hình.
- Logo/text: **Thang Long University**
- Có 3 nút chọn nhanh:
  - Continue as Admin
  - Continue as Teacher
  - Continue as Student
- Có form username/password demo để giao diện giống thật.
- Không cần xác thực thật.
- Khi chọn role, lưu role vào localStorage và chuyển route:
  - Admin: `/admin/dashboard`
  - Teacher: `/teacher/dashboard`
  - Student: `/student/dashboard`

Tạo `ProtectedRoute` mock:

- Nếu chưa có role thì quay về `/login`.
- Nếu role không đúng route thì redirect về dashboard của role hiện tại.

## 7. Routes và màn hình cần tạo

### 7.1 Admin Portal

Base route: `/admin`

Tạo các màn hình:

1. `/admin/dashboard`
   - Cards tổng quan: sinh viên, giảng viên, môn học, lớp học phần, đăng ký đang chờ, hóa đơn chưa thanh toán.
   - Biểu đồ nhỏ hoặc cards thống kê theo học kỳ.
   - Bảng hoạt động gần đây.

2. `/admin/users`
   - Bảng tài khoản.
   - Search theo tên/email/role.
   - Badge role và trạng thái.
   - Dialog tạo tài khoản admin demo.
   - Toggle active/inactive bằng local state.

3. `/admin/students`
   - CRUD sinh viên bằng mock data.
   - Cột gợi ý: mã SV, họ tên, email, ngành, khóa, trạng thái.

4. `/admin/teachers`
   - CRUD giảng viên.
   - Cột gợi ý: mã GV, họ tên, email, khoa/ngành, số lớp đang dạy, trạng thái.

5. `/admin/majors`
   - CRUD ngành học.
   - Cột gợi ý: mã ngành, tên ngành, số sinh viên, số môn học.

6. `/admin/courses`
   - CRUD môn học.
   - Cột gợi ý: mã môn, tên môn, số tín chỉ, ngành, học phí/tín chỉ, môn tiên quyết.

7. `/admin/semesters`
   - CRUD học kỳ.
   - Cột gợi ý: tên kỳ, ngày bắt đầu/kết thúc, thời gian đăng ký, trạng thái mở/khóa.

8. `/admin/rooms`
   - CRUD phòng học.
   - Cột gợi ý: tên phòng, sức chứa, loại phòng, trạng thái.

9. `/admin/periods`
   - CRUD tiết học.
   - Cột gợi ý: tiết, giờ bắt đầu, giờ kết thúc.

10. `/admin/class-sections`
    - Quản lý lớp học phần.
    - Cột gợi ý: mã lớp, môn học, giảng viên, học kỳ, lịch học, phòng, sĩ số, trạng thái.
    - Form tạo/sửa cần có nhiều lịch học để nhìn đúng nghiệp vụ.

11. `/admin/enrollments`
    - Danh sách đăng ký môn học.
    - Cột gợi ý: sinh viên, lớp học phần, học kỳ, thời gian đăng ký, trạng thái.
    - Có filter trạng thái: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`.

12. `/admin/academic-results`
    - Màn hình xem/tính kết quả học tập demo.
    - Có chọn sinh viên, chọn học kỳ.
    - Hiển thị GPA kỳ, CPA tích lũy, số tín chỉ đạt, bảng môn học.
    - Nút mock: Calculate GPA, Lock Semester Grades.

13. `/admin/chat`
    - Dùng module chat mock chung.

### 7.2 Teacher Portal

Base route: `/teacher`

Tạo các màn hình:

1. `/teacher/dashboard`
   - Cards: số lớp đang dạy, số sinh viên, lớp chưa nhập đủ điểm, tin nhắn mới.
   - Lịch dạy hôm nay.

2. `/teacher/classes`
   - Bảng lớp đang dạy.
   - Filter theo học kỳ.
   - Cột gợi ý: mã lớp, môn học, lịch học, phòng, sĩ số, trạng thái điểm.

3. `/teacher/classes/:classSectionId/students`
   - Danh sách sinh viên trong lớp.
   - Cột gợi ý: mã SV, họ tên, email, trạng thái đăng ký, điểm hiện tại.

4. `/teacher/grades`
   - Chọn lớp học phần.
   - Bảng nhập điểm dạng spreadsheet.
   - Cột: sinh viên, chuyên cần, giữa kỳ, cuối kỳ, thi lại/cải thiện, tổng, chữ, GPA4.
   - Validate điểm 0-10.
   - Nút Save changes mock.
   - Nút Lock grades mock.

5. `/teacher/chat`
   - Dùng module chat mock chung.

### 7.3 Student Portal

Base route: `/student`

Tạo các màn hình:

1. `/student/dashboard`
   - Cards: GPA, CPA, tín chỉ tích lũy, học phí còn nợ, lịch học hôm nay.
   - Timeline thông báo đăng ký môn/học phí/điểm.

2. `/student/course-registration`
   - Chọn học kỳ.
   - Danh sách lớp học phần dạng table hoặc card.
   - Hiển thị môn, giảng viên, lịch học, phòng, số chỗ còn lại, học phí.
   - Nút Register/Cancel mock.
   - Khi register, hiển thị trạng thái mô phỏng: `PENDING` -> `PROCESSING` -> `SUCCESS`.

3. `/student/schedule`
   - Thời khóa biểu theo tuần.
   - Có view tuần và view bảng.
   - Các block lịch học cần hiển thị môn, phòng, giảng viên, tiết học.

4. `/student/exams`
   - Danh sách lịch thi.
   - Cột gợi ý: môn học, ngày thi, giờ thi, phòng thi, hình thức.

5. `/student/grades`
   - Bảng điểm theo học kỳ.
   - Cột: môn học, tín chỉ, chuyên cần, giữa kỳ, cuối kỳ, tổng, chữ, GPA4.
   - Có summary GPA kỳ.

6. `/student/academic-results`
   - GPA từng kỳ, CPA tích lũy.
   - Có biểu đồ nhỏ hoặc cards theo kỳ.

7. `/student/tuition`
   - Hóa đơn học phí theo học kỳ.
   - Hiển thị tổng tiền, đã thanh toán, còn lại, hạn thanh toán.
   - Nút Pay with VNPay mock, khi bấm đổi trạng thái hoặc hiện toast.
   - Format tiền VND.

8. `/student/chat`
   - Dùng module chat mock chung.

## 8. Chat mock

Tạo module chat giao diện giống app chat nội bộ:

- Sidebar danh sách phòng chat.
- Search người dùng/phòng chat.
- Khu vực danh sách tin nhắn.
- Bubble tin nhắn bên trái/phải.
- Ô nhập tin nhắn.
- Khi gửi tin nhắn, thêm vào local state.
- Có mock rooms:
  - Lớp Lập trình Web
  - Cố vấn học tập
  - Phòng Công tác sinh viên
  - Nhóm học Cơ sở dữ liệu

Không cần WebSocket, không cần backend.

## 9. Component quan trọng cần tạo

- `AppLayout`
- `Sidebar`
- `Topbar`
- `RoleSwitcher`
- `MockLogin`
- `DataTable`
- `StatusBadge`
- `ConfirmDialog`
- `EntityFormDialog`
- `SemesterSelect`
- `CourseSectionCard`
- `WeeklySchedule`
- `GradeTable`
- `TuitionCard`
- `ChatLayout`
- `MessageList`
- `MessageComposer`

## 10. Mock data cần đủ thực tế

Tạo mock data tiếng Việt/Anh phù hợp môi trường đại học:

- 20 sinh viên
- 10 giảng viên
- 8 ngành học
- 20 môn học
- 5 học kỳ
- 10 phòng học
- 8 tiết học
- 20 lớp học phần
- 30 đăng ký môn
- 10 hóa đơn học phí
- 4 phòng chat, mỗi phòng 8-15 tin nhắn

Ví dụ tên môn:

- Lập trình Web
- Cơ sở dữ liệu
- Cấu trúc dữ liệu và giải thuật
- Mạng máy tính
- Trí tuệ nhân tạo
- Công nghệ phần mềm
- Phân tích thiết kế hệ thống
- An toàn thông tin

## 11. Yêu cầu UX chi tiết

- Sau khi chọn role phải chuyển đúng dashboard.
- Có nút logout.
- Có role switcher ở topbar để tôi xem nhanh từng role.
- Tất cả nút submit có loading state giả lập ngắn.
- Tất cả thao tác xóa có confirm dialog.
- Bảng điểm báo lỗi nếu điểm ngoài 0-10.
- Đăng ký môn hiển thị trạng thái xử lý bất đồng bộ giả lập.
- Học phí format tiền VND.
- Ngày giờ hiển thị theo định dạng Việt Nam.
- Sidebar có icon rõ ràng cho từng module.
- UI không được trống. Mỗi màn hình phải có dữ liệu mock để xem được thiết kế.

## 12. Menu theo role

Admin:

- Dashboard
- Users
- Students
- Teachers
- Majors
- Courses
- Semesters
- Rooms
- Periods
- Class Sections
- Enrollments
- Academic Results
- Chat

Teacher:

- Dashboard
- My Classes
- Students
- Grades
- Chat

Student:

- Dashboard
- Course Registration
- Schedule
- Exams
- Grades
- Academic Results
- Tuition
- Chat

## 13. Kết quả mong muốn

Generate code frontend hoàn chỉnh, chạy được bằng:

```bash
cd frontend-uni
npm install
npm run dev
```

Quan trọng nhất: tôi muốn **xem giao diện đẹp, đầy đủ màn hình, thao tác mock mượt**, chưa cần backend. Hãy ưu tiên UI/UX, layout, mock data, navigation và các trạng thái giao diện.

