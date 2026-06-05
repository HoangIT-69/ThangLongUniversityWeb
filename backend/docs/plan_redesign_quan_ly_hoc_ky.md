# PLAN REDESIGN UI QUẢN LÝ HỌC KỲ

## 1. Mục tiêu

Cải thiện trải nghiệm quản trị học kỳ cho admin, tập trung vào 3 khu vực:

1. **Tạo lớp học phần**
   - Thay modal nhỏ hiện tại bằng màn hình riêng hoặc drawer lớn.
   - Bổ sung kiểm tra tự động: trùng mã lớp, trùng lịch giảng viên, trùng phòng, vượt sức chứa.
   - Có preview lớp học phần trước khi tạo.
   - Có thêm mode tạo nhiều lớp học phần.

2. **Tab Lớp học phần**
   - Không redesign lớn.
   - Chỉ bổ sung bộ lọc chi tiết hơn để admin dễ kiểm soát danh sách lớp.

3. **Tab Lịch thi**
   - Không redesign lớn.
   - Chỉ bổ sung bộ lọc chi tiết hơn để admin dễ kiểm soát lịch thi.

---

## 2. Phạm vi thay đổi

### 2.1. Không thay đổi lớn

Không cần thay đổi toàn bộ layout hiện tại của hệ thống.

Giữ nguyên:

- Sidebar hiện tại.
- Header hiện tại.
- Breadcrumb hiện tại.
- Màu nhận diện đỏ đô / maroon.
- Tab navigation trong chi tiết học kỳ.
- Bảng danh sách hiện tại của Lớp học phần và Lịch thi.

### 2.2. Thay đổi chính

Thay đổi chính nằm ở chức năng:

```txt
+ Tạo lớp học phần
```

Hiện tại chức năng này đang mở modal nhỏ. Cần chuyển sang màn hình riêng hoặc drawer lớn.

Khuyến nghị ưu tiên:

```txt
/admin/semesters/:semesterId/classes/create
```

---

## 3. Redesign chức năng Tạo lớp học phần

## 3.1. Vấn đề hiện tại

Modal tạo lớp học phần hiện tại có các vấn đề:

- Modal nhỏ, nhiều field nên khó nhìn.
- Admin phải nhập nhiều thông tin trong không gian hẹp.
- Không có preview lớp học phần trước khi tạo.
- Không kiểm tra trực quan các lỗi nghiệp vụ.
- Không biết mã lớp có trùng không.
- Không biết giảng viên có trùng lịch không.
- Không biết phòng học có trùng lịch không.
- Không biết sĩ số có vượt sức chứa phòng không.
- Không phù hợp khi cần mở nhiều lớp cùng lúc cho một môn.

---

## 3.2. Hướng giải quyết

Thay modal bằng một màn hình riêng hoặc drawer lớn.

### Option A — Màn hình riêng

Đường dẫn đề xuất:

```txt
/admin/semesters/:semesterId/classes/create
```

Ưu điểm:

- Dễ mở rộng.
- Dễ chia layout 2 cột.
- Phù hợp nghiệp vụ nhiều field.
- Dễ thêm mode tạo nhiều lớp.

### Option B — Drawer lớn

Drawer mở từ bên phải, chiếm 70–80% chiều ngang màn hình.

Ưu điểm:

- Không rời khỏi trang danh sách.
- Phù hợp nếu muốn thao tác nhanh.

Nhưng với hệ thống admin học kỳ, nên ưu tiên **Option A: màn hình riêng**.

---

## 3.3. Bố cục màn hình Tạo lớp học phần

Layout đề xuất:

```txt
-------------------------------------------------------
← Quay lại lớp học phần

Tạo lớp học phần
HK2 2025-2026 | 2/2/2026 - 15/6/2026

[Tạo 1 lớp] [Tạo nhiều lớp]

-------------------------------------------------------

Cột trái: Form nhập liệu
Cột phải: Kiểm tra tự động + Preview lớp học phần

-------------------------------------------------------
```

### Layout desktop

```txt
┌──────────────────────────────────────────────┬─────────────────────────────┐
│ Form tạo lớp học phần                         │ Kiểm tra mở lớp             │
│                                              │ Preview lớp học phần         │
└──────────────────────────────────────────────┴─────────────────────────────┘
```

Tỷ lệ gợi ý:

```txt
Form: 65%
Panel kiểm tra: 35%
```

---

# 4. Mode Tạo 1 lớp

## 4.1. Nhóm 1 — Thông tin lớp

Các field:

| Field | Loại input | Ghi chú |
|---|---|---|
| Môn học | Select/Search select | Chọn học phần |
| Mã lớp học phần | Input | Có thể tự gợi ý theo mã môn |
| Học kỳ | Select/Readonly | Mặc định theo học kỳ hiện tại |
| Trạng thái | Select | DRAFT / OPEN / CLOSED |

Gợi ý tự động mã lớp:

Khi chọn môn:

```txt
INT2207 - Cơ sở dữ liệu
```

Hệ thống gợi ý:

```txt
INT2207-01
INT2207-02
INT2207-03
```

Nếu mã lớp đã tồn tại, báo lỗi ngay.

---

## 4.2. Nhóm 2 — Phân công giảng dạy

Các field:

| Field | Loại input | Ghi chú |
|---|---|---|
| Giảng viên | Select/Search select | Kiểm tra trùng lịch |
| Phòng học | Select/Search select | Kiểm tra trùng phòng |
| Sĩ số tối đa | Number input | So với sức chứa phòng |
| Loại lớp | Select | Thường / Thực hành / Thi lại nếu cần |

Khi chọn phòng học, hiển thị sức chứa:

```txt
Phòng LAB301 có sức chứa 35 sinh viên.
```

Nếu sĩ số vượt sức chứa, hiển thị lỗi:

```txt
Sĩ số tối đa vượt quá sức chứa phòng LAB301.
```

---

## 4.3. Nhóm 3 — Lịch học

Các field:

| Field | Loại input | Ghi chú |
|---|---|---|
| Thứ học | Select | Thứ 2 → Chủ nhật |
| Ca học | Select | Sáng / Chiều / Tối nếu có |
| Tiết bắt đầu | Select | Theo danh mục tiết học |
| Tiết kết thúc | Select | Theo danh mục tiết học |

Sau khi chọn tiết, hiển thị preview thời gian:

```txt
Thứ 2, tiết 1-2, 07:00 - 08:50
```

---

# 5. Panel Kiểm tra mở lớp

Panel nằm bên phải màn hình tạo lớp.

## 5.1. Các rule cần kiểm tra

| Rule | Mức độ | Chặn tạo lớp? |
|---|---|---|
| Mã lớp bị trùng | Lỗi | Có |
| Giảng viên bị trùng lịch | Lỗi | Có |
| Phòng học bị trùng lịch | Lỗi | Có |
| Sĩ số vượt sức chứa phòng | Lỗi | Có |
| Môn đã mở nhiều lớp | Cảnh báo | Không |
| Lớp chưa có lịch thi | Thông tin | Không |

## 5.2. Hiển thị trạng thái

Dùng 3 loại trạng thái:

### Hợp lệ

```txt
✓ Mã lớp INT2207-02 chưa tồn tại
```

### Cảnh báo

```txt
⚠ Môn Cơ sở dữ liệu đã có 3 lớp trong học kỳ này
```

### Lỗi

```txt
✕ Phòng B202 đã có lớp MATH1101-02 vào Thứ 2 tiết 1-2
```

## 5.3. Logic nút Mở lớp

Nếu có lỗi nghiêm trọng:

```txt
Disable nút Mở lớp
```

Các lỗi nghiêm trọng gồm:

- Trùng mã lớp.
- Trùng giảng viên.
- Trùng phòng.
- Sĩ số vượt sức chứa.

Nếu chỉ có cảnh báo, vẫn cho tạo lớp.

---

# 6. Preview lớp học phần

Panel preview nằm bên phải, bên dưới phần kiểm tra.

Nội dung preview:

```txt
Mã lớp: INT2207-02
Môn học: Cơ sở dữ liệu
Giảng viên: Nguyễn Minh Anh
Phòng học: LAB301
Lịch học: Thứ 2, tiết 1-2
Sĩ số: 35 sinh viên
Trạng thái: DRAFT
```

Preview phải cập nhật theo form.

---

# 7. Mode Tạo nhiều lớp

## 7.1. Mục tiêu

Hỗ trợ admin mở nhiều lớp học phần cho cùng một môn trong một lần thao tác.

Ví dụ:

```txt
Cơ sở dữ liệu
- INT2207-01
- INT2207-02
- INT2207-03
- INT2207-04
```

## 7.2. Flow đề xuất

Admin nhập:

```txt
Môn học: INT2207 - Cơ sở dữ liệu
Số lớp muốn mở: 4
Sĩ số mỗi lớp: 35
```

Bấm:

```txt
Tạo đề xuất
```

Hệ thống sinh bảng đề xuất:

| Mã lớp | Giảng viên | Phòng | Thứ | Tiết | Sĩ số | Kiểm tra |
|---|---|---|---|---|---|---|
| INT2207-01 | Nguyễn Minh Anh | LAB301 | Thứ 2 | 1-2 | 35 | Hợp lệ |
| INT2207-02 | Nguyễn Minh Anh | B202 | Thứ 2 | 1-2 | 35 | Trùng GV |
| INT2207-03 | Trần Hoàng Nam | C303 | Thứ 4 | 3-4 | 35 | Hợp lệ |
| INT2207-04 | Phạm Thu Hà | LAB301 | Thứ 6 | 5-6 | 35 | Cảnh báo |

## 7.3. Rule tạo nhiều lớp

- Dòng hợp lệ được phép tạo.
- Dòng có cảnh báo vẫn được phép tạo nếu admin xác nhận.
- Dòng có lỗi đỏ không được phép tạo.
- Admin có thể sửa từng dòng trực tiếp trong bảng.
- Nên có nút:

```txt
Tạo các lớp hợp lệ
```

---

# 8. Cải thiện tab Lớp học phần

## 8.1. Không redesign lớn

Giữ nguyên bảng hiện tại.

Chỉ cần bổ sung bộ lọc chi tiết hơn.

## 8.2. Bộ lọc đề xuất

Thêm filter bar phía trên bảng:

```txt
[Tìm kiếm mã lớp / môn học / giảng viên]
[Môn học]
[Giảng viên]
[Phòng học]
[Trạng thái]
[Loại thi]
[Tình trạng sĩ số]
[Lịch thi]
```

## 8.3. Chi tiết các filter

### Tìm kiếm

Tìm theo:

- Mã lớp học phần.
- Tên môn học.
- Tên giảng viên.
- Phòng học.

### Môn học

Select hoặc searchable select.

### Giảng viên

Select hoặc searchable select.

### Phòng học

Select theo danh mục phòng.

### Trạng thái

Các option đề xuất:

```txt
Tất cả
DRAFT
OPEN
CLOSED
CANCELLED
```

### Loại thi

Các option:

```txt
Tất cả
Thường
Thi lại
Nâng điểm
```

### Tình trạng sĩ số

Các option:

```txt
Tất cả
Chưa có sinh viên
Còn chỗ
Gần đầy
Đã đầy
```

Rule gợi ý:

```txt
Chưa có sinh viên: current_students = 0
Còn chỗ: current_students < max_students
Gần đầy: current_students / max_students >= 80%
Đã đầy: current_students >= max_students
```

### Lịch thi

Các option:

```txt
Tất cả
Đã có lịch thi
Chưa có lịch thi
```

## 8.4. Hành động phụ

Có thể thêm nút:

```txt
Xóa lọc
```

và hiển thị số kết quả:

```txt
Hiển thị 12/24 lớp học phần
```

---

# 9. Cải thiện tab Lịch thi

## 9.1. Không redesign lớn

Giữ nguyên bảng hiện tại.

Chỉ cần bổ sung bộ lọc chi tiết hơn.

## 9.2. Bộ lọc đề xuất

Thêm filter bar phía trên bảng:

```txt
[Tìm kiếm mã lớp / môn học / giảng viên]
[Ngày thi]
[Ca thi]
[Phòng thi]
[Môn học]
[Loại thi]
[Trạng thái công bố]
[Cảnh báo]
```

## 9.3. Chi tiết các filter

### Tìm kiếm

Tìm theo:

- Mã lớp học phần.
- Tên môn học.
- Tên giảng viên.
- Phòng thi.

### Ngày thi

Date picker hoặc range picker:

```txt
Từ ngày - Đến ngày
```

### Ca thi

Các option:

```txt
Tất cả
Ca sáng
Ca chiều
Ca tối
```

### Phòng thi

Select theo danh mục phòng.

### Môn học

Select hoặc searchable select.

### Loại thi

Các option:

```txt
Tất cả
Thi kết thúc
Thi lại
Nâng điểm
```

### Trạng thái công bố

Các option:

```txt
Tất cả
Đã công bố
Chưa công bố
```

### Cảnh báo

Các option:

```txt
Tất cả
Không có cảnh báo
Trùng phòng
Trùng sinh viên
Không có sinh viên thi
Chưa xếp phòng
Chưa xếp giờ
```

## 9.4. Hành động phụ

Có thể thêm:

```txt
Xóa lọc
Xuất Excel
```

Nếu đã có `Xuất Excel`, giữ nguyên.

---

# 10. API / Logic gợi ý

## 10.1. API kiểm tra tạo lớp học phần

Endpoint gợi ý:

```http
POST /api/admin/semesters/{semesterId}/classes/validate
```

Request:

```json
{
  "classCode": "INT2207-02",
  "courseId": 1,
  "teacherId": 3,
  "roomId": 5,
  "weekday": "MONDAY",
  "startPeriodId": 1,
  "endPeriodId": 2,
  "maxStudents": 35
}
```

Response:

```json
{
  "valid": false,
  "errors": [
    {
      "code": "TEACHER_CONFLICT",
      "message": "Giảng viên Nguyễn Minh Anh đang dạy lớp INT2213-02 vào Thứ 2 tiết 1-2"
    }
  ],
  "warnings": [
    {
      "code": "COURSE_ALREADY_HAS_CLASSES",
      "message": "Môn Cơ sở dữ liệu đã có 3 lớp trong học kỳ này"
    }
  ]
}
```

## 10.2. API tạo lớp học phần

```http
POST /api/admin/semesters/{semesterId}/classes
```

## 10.3. API tạo nhiều lớp

```http
POST /api/admin/semesters/{semesterId}/classes/bulk
```

## 10.4. API filter lớp học phần

```http
GET /api/admin/semesters/{semesterId}/classes
```

Query params gợi ý:

```txt
keyword
courseId
teacherId
roomId
status
examType
capacityStatus
examScheduleStatus
page
size
sort
```

## 10.5. API filter lịch thi

```http
GET /api/admin/semesters/{semesterId}/exam-schedules
```

Query params gợi ý:

```txt
keyword
dateFrom
dateTo
session
roomId
courseId
examType
publishStatus
warningType
page
size
sort
```

---

# 11. Checklist triển khai frontend

## 11.1. Tạo lớp học phần

- [ ] Tạo route `/admin/semesters/:semesterId/classes/create`.
- [ ] Tạo màn hình `CreateCourseClassPage`.
- [ ] Chia layout 2 cột.
- [ ] Tạo mode switch: `Tạo 1 lớp` / `Tạo nhiều lớp`.
- [ ] Tạo form nhóm thông tin lớp.
- [ ] Tạo form nhóm phân công giảng dạy.
- [ ] Tạo form nhóm lịch học.
- [ ] Tạo panel kiểm tra mở lớp.
- [ ] Tạo panel preview lớp học phần.
- [ ] Disable nút `Mở lớp` khi có lỗi.
- [ ] Thêm mock validation nếu API chưa có.
- [ ] Sau khi tạo thành công, redirect về tab Lớp học phần.

## 11.2. Tạo nhiều lớp

- [ ] Tạo form chọn môn, số lớp, sĩ số mỗi lớp.
- [ ] Sinh bảng đề xuất.
- [ ] Cho sửa từng dòng trong bảng.
- [ ] Kiểm tra trạng thái từng dòng.
- [ ] Chỉ cho tạo dòng hợp lệ.
- [ ] Hiển thị cảnh báo rõ ràng.

## 11.3. Tab Lớp học phần

- [ ] Thêm filter bar.
- [ ] Thêm filter môn học.
- [ ] Thêm filter giảng viên.
- [ ] Thêm filter phòng.
- [ ] Thêm filter trạng thái.
- [ ] Thêm filter loại thi.
- [ ] Thêm filter tình trạng sĩ số.
- [ ] Thêm filter lịch thi.
- [ ] Thêm nút xóa lọc.
- [ ] Kết nối filter với API hoặc state mock.

## 11.4. Tab Lịch thi

- [ ] Thêm filter bar.
- [ ] Thêm filter ngày thi.
- [ ] Thêm filter ca thi.
- [ ] Thêm filter phòng thi.
- [ ] Thêm filter môn học.
- [ ] Thêm filter loại thi.
- [ ] Thêm filter trạng thái công bố.
- [ ] Thêm filter cảnh báo.
- [ ] Thêm nút xóa lọc.
- [ ] Kết nối filter với API hoặc state mock.

---

# 12. Thứ tự triển khai khuyến nghị

## Phase 1 — UI mock

1. Tạo trang riêng `CreateCourseClassPage`.
2. Dựng UI tạo 1 lớp.
3. Dựng panel kiểm tra bằng mock data.
4. Dựng preview lớp.
5. Dựng mode tạo nhiều lớp bằng mock data.

## Phase 2 — Filter

1. Bổ sung filter cho tab Lớp học phần.
2. Bổ sung filter cho tab Lịch thi.
3. Kết nối filter vào state hiện tại.

## Phase 3 — Backend integration

1. Tạo API validate mở lớp.
2. Tạo API create class.
3. Tạo API bulk create.
4. Tạo API filter lớp học phần.
5. Tạo API filter lịch thi.

## Phase 4 — Polish

1. Loading state.
2. Empty state.
3. Error state.
4. Confirm trước khi tạo nhiều lớp.
5. Toast thông báo kết quả.
6. Responsive desktop 1366px trở lên.

---

# 13. Tiêu chí hoàn thành

Chức năng được coi là hoàn thành khi:

- Admin tạo được 1 lớp học phần từ màn hình riêng.
- Admin nhìn được preview lớp trước khi tạo.
- Admin thấy rõ lỗi trùng mã, trùng phòng, trùng giảng viên, vượt sức chứa.
- Nút mở lớp bị disable khi có lỗi nghiêm trọng.
- Admin có thể chuyển sang mode tạo nhiều lớp.
- Tab Lớp học phần có filter chi tiết.
- Tab Lịch thi có filter chi tiết.
- Không phá vỡ layout hiện tại của hệ thống.
- UI giữ đúng phong cách màu sắc hiện tại.
