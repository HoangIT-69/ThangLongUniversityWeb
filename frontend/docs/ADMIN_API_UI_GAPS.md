# Admin API UI Gaps

Trang Admin hien dang uu tien hien thi du lieu API that. Cac field backend chua tra ve van duoc FE bo sung bang placeholder co nhan "Can BE" de giao dien day du va BE co checklist bo sung.

## Users

Endpoint dang dung:

- `GET /api/admin/users`
- `POST /api/admin/users/admin`
- `PUT /api/admin/users/{id}/toggle-status`
- `DELETE /api/admin/users/admin/{id}`

API hien tra:

- `id`
- `username`
- `passwordHash`
- `email`
- `role`
- `active`

FE dang can BE bo sung:

- `fullName`
- `createdAt`
- `lastLoginAt`
- `avatarUrl` hoac thong tin profile rut gon

Ghi chu:

- FE khong hien thi `passwordHash`. Backend nen can nhac bo field nay khoi response quan tri neu khong can thiet.
- API tao user hien chi ro luong tao `ADMIN`; voi `STUDENT`/`TEACHER`, FE se dieu huong theo trang quan ly rieng.

## Students

Endpoint dang dung:

- `GET /api/admin/students`
- `DELETE /api/admin/students/{id}`

API hien tra:

- `id`
- `studentCode`
- `username`
- `fullName`
- `email`
- `dob`
- `address`
- `academicYear`
- `majorId`
- `majorCode`
- `majorName`

FE dang can BE bo sung de bang quan tri day du hon:

- `status`
- `cohort`
- `gender`
- `phone`
- `currentAddress`
- `nationalId`
- `gpa`
- `credits`
- `advisorName`

## Teachers

Endpoint dang dung:

- `GET /api/admin/teachers`
- `DELETE /api/admin/teachers/{id}`

API hien tra:

- `id`
- `teacherCode`
- `fullName`
- `dob`
- `phone`
- `department`
- `degree`
- `address`

FE dang can BE bo sung:

- `email`
- `status`
- `activeClasses`
- `facultyCode`
- `specialization`
- `createdAt`

## Courses

Endpoint mong doi:

- `GET /api/admin/courses`
- `DELETE /api/admin/courses/{id}`

Trang FE da noi API, nhung khi test local bang tai khoan `admin/password123`, `GET /api/admin/courses` dang tra `400`, nen FE fallback sang mock data.

FE dang can BE dam bao response on dinh:

- `id`
- `code`
- `name`
- `credits`
- `description`
- `courseType`
- `courseTypeLabel`
- `majorId`
- `majorName`
- `prerequisiteIds`
- `prerequisiteNames`
- `feePerCredit` neu Admin can hien hoc phi theo tin chi

## CRUD Form Status

Da noi that:

- Users: list, tao ADMIN, toggle status.
- Students: list, delete.
- Teachers: list, delete.
- Courses: list/delete da khai bao trong client, nhung list dang fallback do API 400.

Chua noi day du:

- Form tao/sua `StudentRequest`, `TeacherRequest`, `CourseRequest`.
- Can xac nhan field bat buoc va validation backend truoc khi FE bat submit that.

## Class Sections

Endpoint dang dung:

- `GET /api/admin/class-sections`
- `GET /api/admin/class-sections/{id}/students` (FE da khai bao, neu BE chua co se fallback demo)
- `POST /api/admin/class-sections`
- `PUT /api/admin/class-sections/{id}`
- `DELETE /api/admin/class-sections/{id}`

API request hien co:

- `classCode`
- `courseId`
- `semesterId`
- `teacherId`
- `schedules[]`
  - `dayOfWeek`
  - `startPeriodId`
  - `endPeriodId`
  - `roomId`
- `maxSlots`

FE da implement:

- Xem danh sach lop hoc phan tai `/admin/class-sections`, hien thi theo tung nganh.
- Tao lop hoc phan bang form co validation FE.
- Sua giang vien, phong, lich hoc, si so toi da.
- Xoa lop neu chua co sinh vien.
- Neu da co sinh vien, FE chuyen trang thai hien thi sang `CANCELLED` tam thoi.
- Doi trang thai hien thi `DRAFT/OPEN/CLOSED/CANCELLED` tam thoi tren FE.
- Check trung phong va trung giang vien trong cung hoc ky tren FE truoc khi submit.
- Xem demo danh sach sinh vien dang ky lop trong Dialog tu nut "Xem SV".

API/BE dang thieu so voi nghiep vu:

- `ClassSectionResponse` chua tra `majorId`/`majorName`. FE dang suy ra nganh tu `CourseResponse.majorName`; neu `/api/admin/courses` loi thi se fallback/mock.
- Field `status` cho lop hoc phan. FE can enum: `DRAFT`, `OPEN`, `CLOSED`, `CANCELLED`.
- Endpoint/behavior doi status rieng, vi `ClassSectionRequest` hien chua co status.
- Delete semantic: neu `currentSlots > 0`, BE nen chuyen `status = CANCELLED` thay vi xoa.
- Response nen tra ro `status` thay vi chi co `closed`.
- `GET /api/admin/courses` va `GET /api/admin/semesters` can on dinh de form tao lop lay danh muc that. Hien test local co luc tra `400`, FE co fallback tu class-sections/mock.
- Backend hien cho phep `startPeriod == endPeriod` trong `validatePeriodOrder`; FE dang chan theo rule moi: `startPeriod < endPeriod`.
- Nen co validation trung lich phong va trung lich giang vien trong BE theo status, bo qua lop `CANCELLED`.
- Can them API tao nhieu lop hoc phan tu danh sach mon hoc.
- Can them API xem danh sach sinh vien da dang ky theo lop hoc phan.

De xuat API xem sinh vien trong lop:

```http
GET /api/admin/class-sections/{id}/students
```

Response de xuat:

```json
[
  {
    "enrollmentId": 501,
    "studentId": 12,
    "studentCode": "SV001",
    "fullName": "Nguyen Van A",
    "email": "sv001@tlu.edu.vn",
    "majorId": 2,
    "majorCode": "CNTT",
    "majorName": "Cong nghe thong tin",
    "cohort": "K2024",
    "academicYear": 2024,
    "enrolledAt": "2026-08-15T08:30:00",
    "status": "SUCCESS"
  }
]
```

Logic mong doi:

- Chi tra sinh vien co enrollment thuoc `classSectionId`.
- Nen ho tro status dang ky: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED` hoac enum BE dang dung.
- Admin can thay duoc ma sinh vien, ho ten, email, nganh, khoa, ngay dang ky va trang thai dang ky.
- Neu lop bi huy, van nen xem duoc danh sach sinh vien da tung dang ky de xu ly hoc vu.

De xuat API bulk create:

```http
POST /api/admin/class-sections/bulk-draft
```

Request de xuat:

```json
{
  "semesterId": 1,
  "items": [
    {
      "courseId": 10,
      "expectedStudents": 180,
      "maxSlots": 60,
      "classCount": 3
    }
  ]
}
```

Response de xuat:

```json
[
  {
    "id": 101,
    "classCode": "JAVA101-01",
    "courseId": 10,
    "courseCode": "JAVA101",
    "courseName": "Java co ban",
    "majorId": 2,
    "majorName": "Cong nghe thong tin",
    "semesterId": 1,
    "semesterName": "HK1 2026-2027",
    "maxSlots": 60,
    "currentSlots": 0,
    "status": "DRAFT"
  }
]
```

Logic mong doi:

- Neu FE gui `expectedStudents` va `maxSlots`, BE co the tu tinh `classCount = ceil(expectedStudents / maxSlots)`.
- Tu sinh ma lop theo course code: `JAVA101-01`, `JAVA101-02`, `JAVA101-03`.
- Bulk draft khong bat buoc `teacherId`, `roomId`, `schedules` vi admin se gan sau.
- Sau do can API update tung lop de gan `teacherId`, `roomId`, `dayOfWeek`, `startPeriodId`, `endPeriodId` va doi `status`.

Mock/TODO FE:

- `status` cua class section dang la FE override tam thoi, khong persist sau reload neu BE chua tra status.
- `DRAFT/CANCELLED` chua the an/hien that cho Student Registration cho den khi BE support status.
- Bulk create tu mon hoc chua the persist dung nghiep vu vi endpoint hien tai bat buoc co lich/phong ngay luc tao.
- Danh sach sinh vien trong lop dang fallback demo neu `GET /api/admin/class-sections/{id}/students` chua co hoac tra loi.
