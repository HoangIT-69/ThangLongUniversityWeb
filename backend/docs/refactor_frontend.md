# Chuyển giao diện từ Testing/Mock sang Production

Sau khi rà soát toàn bộ **59 route files**, **6 feature directories**, và **các shared components**, dưới đây là bản kế hoạch chi tiết để đưa giao diện sang trạng thái production-ready.

---

## User Review Required

> [!IMPORTANT]
> **Ảnh thật của trường**: Landing page hiện tại sử dụng **12 ảnh stock từ Unsplash** (hero, gallery, testimonials) — không phải ảnh thực tế của Đại học Thăng Long. Bạn cần cung cấp ảnh thật của trường (khuôn viên, sinh viên, sự kiện) để thay thế, hoặc cho phép giữ ảnh stock tạm thời.(tôi sẽ thay ảnh vào sau)

> [!IMPORTANT]
> **Tên miền production**: Tất cả canonical URL và OG meta đang trỏ đến `https://academe-view-pro.lovable.app` — một URL của nền tảng Lovable.dev. Bạn cần cung cấp tên miền production thật (ví dụ: `https://portal.thanglong.edu.vn`).

> [!IMPORTANT]
> **Landing page CMS**: Admin Landing CMS hiện lưu nội dung vào `localStorage` (không có backend API). Bạn muốn giữ cách này hay chuyển sang lưu qua API backend?(chưa cần làm vội giúp tôi sửa lại giao diện trước đã)

> [!WARNING]
> **Form tuyển sinh**: Form đăng ký tư vấn tuyển sinh (trang `/admissions`) hiện **chỉ hiện toast thành công** mà không gửi dữ liệu đến backend. Cần API endpoint để submit form.(tạm thời không động gì vào landing page cả , tôi sẽ tự sửa lại riêng)

## Open Questions

> [!IMPORTANT]
> 1. **Testimonials**: 3 lời nhận xét của "sinh viên" trên landing page là giả (Nguyễn Hải Đăng, Trần Bảo Ngọc, Lê Hoàng Nam). Bạn có testimonials thật không, hay nên xóa phần này?
> 2. **Social Media Links**: Footer landing page có icon Facebook, Youtube, LinkedIn, Instagram nhưng **không có link thật**. Bạn cung cấp được link MXH chính thức không?
> 3. **Video giới thiệu**: Có nút Play ở phần "Đời sống sinh viên" nhưng **không có video**. Có video giới thiệu trường không?
> 4. **Tên Knowledge Base**: Sidebar admin hiện hiển thị `"Knowledge Base"` bằng tiếng Anh. Đổi thành `"Cơ sở tri thức"` hay giữ nguyên?

---

## Proposed Changes

Tổ chức theo mức ưu tiên: 🔴 Critical → 🟡 Medium → 🟢 Low

---

### 🔴 Phần 1: Xóa Test Credentials & Quick Login (CRITICAL — Bảo mật)

#### [MODIFY] [login.tsx](file:///d:/universityweb/frontend/src/routes/login.tsx)
- **Dòng 31–35**: Xóa constant `QUICK_CREDENTIALS` chứa mật khẩu hardcoded (`password123`)
- **Dòng 77–78**: Đổi `useState("admin")` và `useState("password123")` → `useState("")`
- **Dòng 122–127**: Xóa function `loginAs()` 
- **Dòng 242**: Đổi placeholder `"admin / gv101 / sv001"` → `"Nhập tên đăng nhập"`
- **Dòng 275–320**: Xóa toàn bộ section **"Đăng nhập nhanh"** (3 nút quick-login)
- **Dòng 108**: Xóa `console.error("[Login]", error)` (debug log)

---

### 🔴 Phần 2: Sửa tiếng Việt không dấu (~90+ chuỗi)

#### [MODIFY] [admin.users.tsx](file:///d:/universityweb/frontend/src/routes/admin.users.tsx)
**Toàn bộ file này viết tiếng Việt không dấu — ~45 chuỗi cần sửa.** Ví dụ:
| Dòng | Hiện tại | Sửa thành |
|------|----------|-----------|
| 42 | `"Quan tri he thong"` | `"Quản trị hệ thống"` |
| 43 | `"Giang vien"` | `"Giảng viên"` |
| 44 | `"Sinh vien"` | `"Sinh viên"` |
| 111 | `"Vui long nhap ma giang vien va ho ten"` | `"Vui lòng nhập mã giảng viên và họ tên"` |
| 236 | `"Quan ly tai khoan"` | `"Quản lý tài khoản"` |
| 263 | `"Tim theo username, ho ten, email, role..."` | `"Tìm theo username, họ tên, email, role..."` |
| 291 | `"Ho ten"` | `"Họ tên"` |
| 305 | `"Vai tro"` | `"Vai trò"` |
| 316 | `"Trang thai"` | `"Trạng thái"` |
| 370 | `"Xoa"` | `"Xóa"` |
| 404 | `"Mat khau"` | `"Mật khẩu"` |
| 438 | `"Ho ten hien thi"` | `"Họ tên hiển thị"` |
| 448 | `"Ma giang vien"` | `"Mã giảng viên"` |
| 459 | `"Ma sinh vien"` | `"Mã sinh viên"` |
| 476 | `"Nganh"` | `"Ngành"` |
| 501 | `"Sua tai khoan"` | `"Sửa tài khoản"` |
| 538 | `"Xoa tai khoan?"` | `"Xóa tài khoản?"` |
| 561 | `"Chua dang nhap"` | `"Chưa đăng nhập"` |
| *...và ~27 chuỗi khác tương tự* | | |

#### [MODIFY] [AdminClassSectionsContent.tsx](file:///d:/universityweb/frontend/src/features/admin-class-sections/AdminClassSectionsContent.tsx)
- 5 toast messages không dấu: `"Da mo lop hoc phan"`, `"Da cap nhat lop hoc phan"`, `"Da xoa lop hoc phan"`, v.v.

#### [MODIFY] [ClassSectionFormDialog.tsx](file:///d:/universityweb/frontend/src/features/admin-class-sections/ClassSectionFormDialog.tsx)
- ~20 chuỗi form label và validation không dấu: `"Ma lop khong duoc de trong"`, `"Mon hoc"`, `"Giang vien"`, `"Phong hoc"`, `"Si so toi da"`, v.v.

#### [MODIFY] [ClassSectionsTable.tsx](file:///d:/universityweb/frontend/src/features/admin-class-sections/ClassSectionsTable.tsx)
- ~13 column headers không dấu: `"Ma lop"`, `"Mon hoc"`, `"Nganh"`, `"Hoc ky"`, `"Giang vien"`, `"Trang thai"`, v.v.

#### [MODIFY] [ClassSectionsByMajor.tsx](file:///d:/universityweb/frontend/src/features/admin-class-sections/ClassSectionsByMajor.tsx)
- Dòng 41: `"Chua phan nganh"` → `"Chưa phân ngành"`

#### [MODIFY] [validation.ts](file:///d:/universityweb/frontend/src/features/admin-class-sections/validation.ts)
- 4 validation messages không dấu

#### [MODIFY] [admin.chat.tsx](file:///d:/universityweb/frontend/src/routes/admin.chat.tsx)
- Dòng 8: `"Chat noi bo"` → `"Chat nội bộ"`

---

### 🟡 Phần 3: Xóa URL Lovable.app (SEO/Meta)

#### [MODIFY] [__root.tsx](file:///d:/universityweb/frontend/src/routes/__root.tsx)
- **Dòng 21, 23, 24**: `"Thang Long University"` → `"Đại học Thăng Long"` hoặc giữ tiếng Anh theo branding
- **Dòng 27–28**: Thay og:image URL từ Lovable.dev placeholder bằng ảnh OG thật

#### Thay `SITE` URL trong 8 files (đổi từ `"https://academe-view-pro.lovable.app"` sang domain production):
- [index.tsx](file:///d:/universityweb/frontend/src/routes/index.tsx) dòng 4
- [about.tsx](file:///d:/universityweb/frontend/src/routes/about.tsx) dòng 22
- [admissions.tsx](file:///d:/universityweb/frontend/src/routes/admissions.tsx) dòng 28
- [articles.index.tsx](file:///d:/universityweb/frontend/src/routes/articles.index.tsx) dòng 10
- [contact.tsx](file:///d:/universityweb/frontend/src/routes/contact.tsx) dòng 6
- [programs.tsx](file:///d:/universityweb/frontend/src/routes/programs.tsx) dòng 18
- [scholarships.tsx](file:///d:/universityweb/frontend/src/routes/scholarships.tsx) dòng 7
- [tuition.tsx](file:///d:/universityweb/frontend/src/routes/tuition.tsx) dòng 23
- [sitemap[.]xml.tsx](file:///d:/universityweb/frontend/src/routes/sitemap[.]xml.tsx) dòng 4

> [!TIP]
> Nên extract SITE URL ra một file cấu hình chung (ví dụ `lib/config.ts`) thay vì duplicate trong 9 files.

---

### 🟡 Phần 4: Landing Page — Xóa code thừa & sửa UI

#### [MODIFY] [ThangLongLanding.tsx](file:///d:/universityweb/frontend/src/features/landing/ThangLongLanding.tsx)
- **Dòng 46–67**: Thay testimonials giả bằng testimonials thật (hoặc xóa section nếu không có)
- **Dòng 69–75**: Thay ảnh gallery stock bằng ảnh thật của trường
- **Dòng 77–94**: Thay ảnh hero stock bằng ảnh thật
- **Dòng 215, 249**: `"Portal"` → `"Đăng nhập"` hoặc `"Cổng thông tin"`
- **Dòng 297**: `"Scroll"` → Xóa hoặc đổi thành `"Cuộn xuống"`
- **Dòng 299–334**: Xóa **hidden dead code** (hero cũ ẩn bằng `className="hidden"`)
- **Dòng 470–472**: Nút Play không hoạt động → xóa hoặc thêm link video
- **Dòng 593–599**: Social icons không có link → thêm `href` thật hoặc xóa

#### [MODIFY] [MarketingLayout.tsx](file:///d:/universityweb/frontend/src/components/marketing/MarketingLayout.tsx)
- **Dòng 99–100**: `href="#"` placeholder links → thêm URL MXH thật

#### [MODIFY] [scholarships.tsx](file:///d:/universityweb/frontend/src/routes/scholarships.tsx)
- **Dòng 61–67**: Xóa placeholder card `"Thêm nhiều học bổng doanh nghiệp đang được cập nhật..."`
- **Dòng 86**: `"Top tier"` → `"Xuất sắc"` hoặc `"Cao nhất"`

---

### 🟡 Phần 5: Student Pages — Sửa nhỏ

#### [MODIFY] [student.curriculum.tsx](file:///d:/universityweb/frontend/src/routes/student.curriculum.tsx)
- **Dòng 124**: `"Tín bắt buộc"` → `"Tín chỉ bắt buộc"` (thuật ngữ nhất quán)
- **Dòng 125**: `"Tín tự do"` → `"Tín chỉ tự chọn"`

#### [MODIFY] [student.retake-registration.tsx](file:///d:/universityweb/frontend/src/routes/student.retake-registration.tsx)
- **Dòng 228**: Xóa ghi chú dev `"Phí lấy từ backend theo từng môn"` — thay bằng text user-friendly hoặc xóa

---

### 🟡 Phần 6: Teacher Pages — Sửa nhỏ

#### [MODIFY] [teacher.attendance.tsx](file:///d:/universityweb/frontend/src/routes/teacher.attendance.tsx)
- **Dòng 70**: `"Chưa điểm"` → `"Chưa điểm danh"` (nhãn bị cắt ngắn)

#### [MODIFY] [teacher.ts](file:///d:/universityweb/frontend/src/lib/api/teacher.ts)
- **Dòng 19–23**: Xóa duplicate `listMyClasses` / `getMyClasses` (giữ 1 method)
- **Dòng 25–29**: Xóa duplicate `listClassStudents` / `getClassStudents`
- **Dòng 40–44**: Xóa method legacy `updateStudentGradeLegacy` (không sử dụng)

#### [MODIFY] [teacherMappers.ts](file:///d:/universityweb/frontend/src/features/teacher/teacherMappers.ts)
- **Dòng 168–169**: `canEdit: true` hardcoded → đọc từ API response

---

### 🟡 Phần 7: Admin Pages — Sửa nhỏ

#### [MODIFY] [admin.users.tsx](file:///d:/universityweb/frontend/src/routes/admin.users.tsx)
- **Dòng 58**: Xóa default password `"password123"` trong form tạo user
- **Dòng 135**: Xóa hardcoded DOB `"2000-01-01"` placeholder

#### [MODIFY] [admin.exam-registrations.tsx](file:///d:/universityweb/frontend/src/routes/admin.exam-registrations.tsx)
- **Toàn bộ file**: Trang placeholder `Hello "/admin/exam-registrations"!` — cần implement hoặc ẩn khỏi navigation

#### [MODIFY] [AppLayout.tsx](file:///d:/universityweb/frontend/src/components/layout/AppLayout.tsx)
- **Dòng 95**: `"Knowledge Base"` → `"Cơ sở tri thức"` (nếu chọn Việt hóa)

---

### 🟢 Phần 8: Hardcoded Constants (Low Priority)

#### [MODIFY] [teacher.attendance.tsx](file:///d:/universityweb/frontend/src/routes/teacher.attendance.tsx)
- **Dòng 50**: `WEEKS_PER_COURSE = 15` — nên lấy từ API semester data
- **Dòng 51**: `ABSENT_LIMIT = 3` — nên lấy từ API course config

#### [MODIFY] [teacher.timetable.tsx](file:///d:/universityweb/frontend/src/routes/teacher.timetable.tsx)
- **Dòng 32–41**: 8 period times hardcoded — nên lấy từ API periods data

---

### 🟢 Phần 9: Nâng cấp dữ liệu Landing (Low Priority)

#### [MODIFY] [landing-content.tsx](file:///d:/universityweb/frontend/src/lib/landing-content.tsx)
- Toàn bộ CMS hiện dùng `localStorage` — xem xét chuyển sang API backend

#### [MODIFY] [admissions.tsx](file:///d:/universityweb/frontend/src/routes/admissions.tsx)
- **Dòng 238**: Form tư vấn chỉ `toast.success()` — cần gọi API submit thật

---

## Tổng hợp số liệu

| Hạng mục | Số lượng |
|----------|----------|
| 🔴 **Test credentials cần xóa** | 1 file (login.tsx) |
| 🔴 **Chuỗi tiếng Việt không dấu** | ~90+ chuỗi trong 7 files |
| 🟡 **URL Lovable.app cần thay** | 9 files + 2 meta tags |
| 🟡 **Ảnh stock Unsplash** | 12 ảnh trong landing page |
| 🟡 **UI không hoạt động** | 4 (nút Play, social links, form, placeholder card) |
| 🟡 **Code chết/ẩn cần xóa** | 2 blocks trong landing |
| 🟡 **Text tiếng Anh cần Việt hóa** | 5 instances |
| 🟡 **Trang placeholder** | 1 (admin.exam-registrations) |
| 🟢 **Hardcoded constants** | 3 files |
| 🟢 **API methods thừa** | 3 methods |

---

## Verification Plan

### Automated Tests
```bash
cd d:\universityweb\frontend
# Kiểm tra build thành công (không lỗi TypeScript)
npm run build

# Kiểm tra grep: không còn chuỗi test
grep -r "lovable.app" src/
grep -r "password123" src/
grep -r "QUICK_CREDENTIALS" src/
grep -r "loginAs" src/routes/login.tsx
```

### Manual Verification
- Mở trang login → xác nhận không còn "Đăng nhập nhanh", form trống khi load
- Duyệt qua tất cả trang admin → xác nhận text tiếng Việt có dấu đầy đủ
- Kiểm tra landing page → xác nhận không còn code ẩn, nút Play đã xử lý
- View source → xác nhận meta tags trỏ đúng domain
