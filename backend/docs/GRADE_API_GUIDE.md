# Grade Management System - Hướng Dẫn Sử Dụng

## Bước A: Entity và Logic Tính Điểm

### Grade Entity

Đã tạo `Grade` entity với các trường:

- `participationScore`: Điểm chuyên cần (0-10)
- `midtermScore`: Điểm giữa kỳ (0-10)
- `finalScore`: Điểm cuối kỳ (0-10)
- `totalScore`: Tự động tính = (chuyên*cần * 0.1) + (giữa*kỳ * 0.3) + (cuối_kỳ \* 0.6)
- `letterGrade`: Tự động quy đổi sang A, B, C, D, F
- `gpa4`: Tự động quy đổi sang điểm hệ 4

### Logic Tính Điểm

- **Công thức**: `totalScore = (participationScore * 0.1) + (midtermScore * 0.3) + (finalScore * 0.6)`
- **Quy đổi sang chữ**:
    - A: totalScore >= 8.5 (gpa4 = 4.0)
    - A: 8.0 <= totalScore < 8.5 (gpa4 = 3.7)
    - B: 7.0 <= totalScore < 8.0 (gpa4 = 3.0)
    - C: 6.0 <= totalScore < 7.0 (gpa4 = 2.0)
    - D: 5.0 <= totalScore < 6.0 (gpa4 = 1.0)
    - F: totalScore < 5.0 (gpa4 = 0.0)

## Bước B: API Cho Giảng Viên Nhập Điểm

### Endpoint: PUT /api/teacher/grades/{enrollmentId}

**Mô tả**: Nhập hoặc cập nhật điểm cho sinh viên

**Request Header**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:

```json
{
    "participationScore": 9.5,
    "midTermScore": 8.0,
    "finalScore": 7.5
}
```

**Response**:

```json
{
    "id": 1,
    "enrollmentId": 123,
    "studentId": 1,
    "studentCode": "SV001",
    "studentName": "Nguyễn Văn A",
    "courseId": 5,
    "courseCode": "CNTT101",
    "courseName": "Lập trình cơ bản",
    "semesterId": 1,
    "semesterName": "Học kỳ 1 - 2025",
    "participationScore": 9.5,
    "midtermScore": 8.0,
    "finalScore": 7.5,
    "totalScore": 7.95,
    "letterGrade": "B",
    "gpa4": 3.0,
    "createdAt": "2026-05-12T11:12:00",
    "updatedAt": "2026-05-12T11:12:00"
}
```

**Ràng buộc**:

- ✅ Lớp (ClassSection) phải chưa đóng (`isClosed = false`)
- ✅ Giảng viên đang đăng nhập phải là người dạy lớp đó

### Endpoint: GET /api/teacher/grades/class/{classSectionId}

**Mô tả**: Lấy bảng điểm của toàn lớp (cho giảng viên xem)

**Response**: Mảng `GradeResponse` của tất cả sinh viên trong lớp

## Bước C: API Cho Sinh Viên Xem Bảng Điểm

### Endpoint: GET /api/student/my-grades

**Mô tả**: Lấy bảng điểm của sinh viên tất cả học kỳ

**Response**: Mảng `GradeResponse` của tất cả môn học

**Ví dụ**:

```json
[
    {
        "id": 1,
        "enrollmentId": 123,
        "studentId": 1,
        "studentCode": "SV001",
        "studentName": "Nguyễn Văn A",
        "courseId": 5,
        "courseCode": "CNTT101",
        "courseName": "Lập trình cơ bản",
        "semesterId": 1,
        "semesterName": "Học kỳ 1 - 2025",
        "participationScore": 9.5,
        "midtermScore": 8.0,
        "finalScore": 7.5,
        "totalScore": 7.95,
        "letterGrade": "B",
        "gpa4": 3.0
    }
]
```

### Endpoint: GET /api/student/grades/semester/{semesterId}

**Mô tả**: Lấy bảng điểm của sinh viên theo học kỳ cụ thể

**Response**: Mảng `GradeResponse` của môn học trong học kỳ đó

## Setup Database

### 1. Chạy SQL Migration

```bash
# Chạy file grades_migration.sql trên PostgreSQL
psql -U postgres -d university_db -f grades_migration.sql

# Chạy file class_sections_grade_lock_migration.sql để thêm cột grade_locked
psql -U postgres -d university_db -f class_sections_grade_lock_migration.sql
```

### 2. Hoặc Sử Dụng Spring Data JPA

- JPA sẽ tự động tạo bảng khi `spring.jpa.hibernate.ddl-auto=update` hoặc `create`

## Bước D: API Admin Khóa Điểm và Tính GPA

### Endpoint: POST /api/admin/academic-results/lock-semester-grades/{semesterId}

**Mô tả**: Khóa điểm cho tất cả lớp trong học kỳ và tự động tính GPA/CPA cho tất cả sinh viên

**Request Header**:

```
Authorization: Bearer <admin_token>
```

**Response**:

```json
"Đã khóa điểm toàn bộ học kỳ và bắt đầu tính GPA/CPA!"
```

**Logic**:

1. Khóa tất cả class sections trong học kỳ (`grade_locked = true`)
2. Tự động tính GPA học kỳ cho từng sinh viên
3. Tự động tính CPA tích lũy cho từng sinh viên
4. Xử lý bất đồng bộ (@Async) để không block API

### Endpoint: POST /api/admin/academic-results/calculate-semester-gpa

**Mô tả**: Tính GPA cho một học kỳ của sinh viên cụ thể

**Request Params**:

- `studentId`: ID sinh viên
- `semesterId`: ID học kỳ

**Response**: `AcademicResult` object

### Endpoint: POST /api/admin/academic-results/calculate-cumulative-gpa

**Mô tả**: Tính CPA tích lũy cho sinh viên

**Request Params**:

- `studentId`: ID sinh viên

**Response**: `AcademicResult` object

### Endpoint: GET /api/admin/academic-results/student/{studentId}

**Mô tả**: Xem kết quả học tập của sinh viên (GPA/CPA theo từng học kỳ)

**Response**: Mảng `AcademicResult`

## Lưu Ý

- Đảm bảo JWT token hợp lệ khi gọi API
- Giảng viên chỉ có thể nhập điểm cho lớp mình dạy
- Sinh viên chỉ có thể xem điểm của mình
- Admin có quyền khóa điểm và tính GPA/CPA
- Điểm sẽ tự động tính toán khi lưu vào database
- GPA/CPA được tính tự động sau khi khóa điểm học kỳ
