# Registration API Gaps

Nguon doi chieu: `frontend/docs/ADMIN_API_SWAGGER.md` checked ngay 2026-05-21.

Ket luan ngan: Swagger hien tai chua du API cho workflow Dang ky hoc phan end-to-end. FE van dang demo duoc bang mock/fallback o cac route student/admin/teacher, nhung BE can bo sung cac endpoint va field ben duoi de flow that hoat dong dung nghiep vu.

## Coverage Tu Swagger Hien Co

Da co mot phan:

- Semester CRUD:
  - `GET /api/admin/semesters`
  - `POST /api/admin/semesters`
  - `PUT /api/admin/semesters/{id}`
  - `DELETE /api/admin/semesters/{id}`
- Class section CRUD:
  - `GET /api/admin/class-sections`
  - `GET /api/admin/class-sections/semester/{semesterId}`
  - `POST /api/admin/class-sections`
  - `PUT /api/admin/class-sections/{id}`
  - `DELETE /api/admin/class-sections/{id}`
- Admin enrollment list/override:
  - `GET /api/admin/enrollments`
  - `POST /api/admin/enrollments/override`
- Admin khoa diem theo hoc ky:
  - `POST /api/admin/academic-results/lock-semester-grades/{semesterId}`

Chua thay trong `ADMIN_API_SWAGGER.md`:

- `GET /api/student/registration/active-period`
- `POST /api/student/registration/enroll`
- `DELETE /api/student/registration/enrollments/{id}`
- `PUT /api/admin/registration-periods/{id}/open`
- `PUT /api/admin/registration-periods/{id}/close`
- `POST /api/admin/class-sections/{id}/students`
- `GET /api/admin/class-sections/{id}/students`
- `PUT /api/admin/class-sections/{id}/status`
- `PUT /api/admin/grades/lock`

## API Thieu

### 0. Faculty / Khoa

```http
GET /api/admin/faculties
POST /api/admin/faculties
PUT /api/admin/faculties/{id}
DELETE /api/admin/faculties/{id}
```

Request mong muon:

```json
{
  "code": "F-CNTT",
  "name": "Khoa Cong nghe thong tin",
  "deanTeacherId": 101,
  "description": "Khoa phu trach cac nganh CNTT"
}
```

Response mong muon:

```json
{
  "id": 1,
  "code": "F-CNTT",
  "name": "Khoa Cong nghe thong tin",
  "deanTeacherId": 101,
  "deanName": "TS. Nguyen Van An",
  "departmentCount": 4,
  "majorCount": 3,
  "teacherCount": 42,
  "status": "ACTIVE"
}
```

Field thieu:

- `facultyId`, `facultyCode`, `facultyName` trong department/major/teacher neu can hien day du cap khoa.

Business logic backend can bo sung:

- Faculty la cap cha cua Department.
- Khong xoa faculty neu dang co department/major/teacher lien ket.

FE fallback/mock:

- `/admin/faculties` dang dung mock.

### 0.0. Department / Bo mon

```http
GET /api/admin/departments
POST /api/admin/departments
PUT /api/admin/departments/{id}
DELETE /api/admin/departments/{id}
```

Request mong muon:

```json
{
  "facultyId": 1,
  "code": "BM-CNPM",
  "name": "Bo mon Cong nghe phan mem",
  "headTeacherId": 102,
  "description": "Bo mon phu trach nhom mon CNPM"
}
```

Response mong muon:

```json
{
  "id": 10,
  "facultyId": 1,
  "facultyName": "Khoa Cong nghe thong tin",
  "code": "BM-CNPM",
  "name": "Bo mon Cong nghe phan mem",
  "headTeacherId": 102,
  "headName": "TS. Pham Minh Duc",
  "majorCount": 1,
  "teacherCount": 12,
  "courseCount": 36,
  "status": "ACTIVE"
}
```

Field thieu:

- `departmentId`, `departmentCode`, `departmentName` trong teacher/course/major.

Business logic backend can bo sung:

- Department thuoc Faculty.
- Department co the quan ly Major, Teacher, Course.
- Khong xoa department neu dang co teacher/course/major lien ket.

FE fallback/mock:

- `/admin/departments` dang dung mock.

### 0.1. Chuong trinh dao tao

```http
GET /api/admin/curriculums
GET /api/admin/curriculums/{id}
POST /api/admin/curriculums
PUT /api/admin/curriculums/{id}
POST /api/admin/curriculums/{id}/courses
DELETE /api/admin/curriculums/{id}/courses/{courseId}
```

Request mong muon:

```json
{
  "code": "CTDT-CNTT-2026",
  "majorId": 2,
  "effectiveYear": 2026,
  "totalCredits": 132,
  "status": "DRAFT",
  "items": [
    {
      "courseId": 10,
      "semesterIndex": 1,
      "required": true,
      "minGrade": 4.0
    }
  ]
}
```

Response mong muon:

```json
{
  "id": 1,
  "code": "CTDT-CNTT-2026",
  "majorId": 2,
  "majorName": "Cong nghe thong tin",
  "effectiveYear": 2026,
  "totalCredits": 132,
  "status": "ACTIVE",
  "items": []
}
```

Field thieu:

- `curriculumId` trong student profile/major neu can tra CTDT dang ap dung.
- `semesterIndex`, `required`, `minGrade`, `prerequisiteCourseIds` tren curriculum item.

Business logic backend can bo sung:

- Student curriculum phai lay theo `student.majorId` va `academicYear`.
- Kiem tra tien quyet khi dang ky dua vao curriculum.
- Cho phep versioning CTDT theo nam ap dung.

FE fallback/mock:

- `/admin/curriculums` dang suy ra tu Course/Major API neu co, fallback mock.
- `/student/curriculum` hien dung API/mock rieng cua student.

### 1. Active Registration Period

```http
GET /api/student/registration/active-period
```

Request mong muon:

- Khong can body.
- Optional query neu can: `semesterId`.

Response mong muon:

```json
{
  "id": 10,
  "semesterId": 1,
  "semesterName": "HK1 2026-2027",
  "status": "OPEN",
  "startTime": "2026-08-01T08:00:00",
  "endTime": "2026-08-15T17:00:00",
  "serverTime": "2026-08-10T09:30:00",
  "message": "Dang trong thoi gian dang ky"
}
```

Field thieu:

- `registrationPeriodId`
- `status`: `DRAFT`, `OPEN`, `CLOSED`
- `startTime`
- `endTime`
- `serverTime`

Business logic backend can bo sung:

- Xac dinh dot dang ky dang active theo server time, khong dua vao client time.
- Neu khong co dot OPEN, tra status CLOSED/404 co message ro.
- FE dung response nay de hien kieu thoi gian thuc, nut dang ky, countdown.

FE fallback/mock:

- `student.course-registration.tsx` hien dang dua vao `StudentSemesterResponse.registrationOpen` va mock/fallback, chua co active-period rieng.

### 2. Student Enroll

```http
POST /api/student/registration/enroll
```

Request mong muon:

```json
{
  "classSectionId": 101
}
```

Response mong muon:

```json
{
  "enrollmentId": 501,
  "classSectionId": 101,
  "classCode": "JAVA101-01",
  "studentId": 12,
  "studentCode": "SV001",
  "status": "REGISTERED",
  "registeredAt": "2026-08-10T09:32:00",
  "message": "Dang ky thanh cong"
}
```

Field thieu:

- `enrollmentId` trong response tao that.
- `registeredAt`
- `status`
- `message` theo loi nghiep vu.

Business logic backend can bo sung:

- Kiem tra registration period dang OPEN.
- Kiem tra class section status `OPEN`.
- Kiem tra trung lich.
- Kiem tra tien quyet.
- Kiem tra si so `currentSlots < maxSlots`.
- Kiem tra gioi han tin chi.
- Kiem tra duplicate enrollment cung mon/lop.
- Neu hop le thi tao enrollment `REGISTERED` va cap nhat si so.
- Neu khong hop le thi fail ngay voi message ro, khong can admin duyet tung sinh vien.

FE fallback/mock:

- FE hien dang dung `POST /api/student/enroll/{classSectionId}` trong `studentApi.enrollClass`.
- Neu API loi, cac man hinh student van co mock/fallback de demo UI.

### 3. Student Cancel Enrollment

```http
DELETE /api/student/registration/enrollments/{id}
```

Request mong muon:

- Path `id`: enrollmentId.

Response mong muon:

```json
{
  "enrollmentId": 501,
  "status": "CANCELLED",
  "cancelledAt": "2026-08-11T10:00:00",
  "message": "Da huy dang ky"
}
```

Field thieu:

- `cancelledAt`
- response co `status`.

Business logic backend can bo sung:

- Chi cho huy trong registration period OPEN.
- Khong cho huy sau khi admin khoa dang ky/chot lop.
- Giam/currentSlots hoac tinh lai si so theo enrollment hop le.

FE fallback/mock:

- FE hien dang dung `DELETE /api/student/enroll/{classSectionId}`, chua dung `enrollmentId`.

### 4. Registration Period Admin Open

```http
PUT /api/admin/registration-periods/{id}/open
```

Request mong muon:

```json
{
  "note": "Mo dang ky dot 1"
}
```

Response mong muon:

```json
{
  "id": 10,
  "semesterId": 1,
  "status": "OPEN",
  "startTime": "2026-08-01T08:00:00",
  "endTime": "2026-08-15T17:00:00",
  "openedAt": "2026-08-01T08:00:00"
}
```

Field thieu:

- registration period entity/DTO rieng.
- `openedAt`
- `openedBy`

Business logic backend can bo sung:

- Chi co 1 active OPEN period cho cung hoc ky.
- Khong mo period neu thieu class sections hoac hoc ky da locked.
- Ghi audit admin.

FE fallback/mock:

- Admin semesters/class sections hien chi demo `registrationOpen`/status, chua co route registration-periods rieng.

### 5. Registration Period Admin Close

```http
PUT /api/admin/registration-periods/{id}/close
```

Request mong muon:

```json
{
  "note": "Dong dang ky va chot danh sach lop"
}
```

Response mong muon:

```json
{
  "id": 10,
  "semesterId": 1,
  "status": "CLOSED",
  "closedAt": "2026-08-15T17:00:00",
  "finalizedClassSections": 42
}
```

Field thieu:

- `closedAt`
- `closedBy`
- `finalizedClassSections`

Business logic backend can bo sung:

- Dong period thi student khong the them/huy enrollment.
- Chot si so lop.
- Freeze danh sach teacher class roster.
- Chuyen enrollment hop le sang `ENROLLED` neu BE tach `REGISTERED` va `ENROLLED`.

FE fallback/mock:

- `/admin/enrollments` demo nut `Khoa dang ky lop`, hien dang khoa local theo class section neu BE chua co.

### 6. Admin Add Student To Class

```http
POST /api/admin/class-sections/{id}/students
```

Request mong muon:

```json
{
  "studentId": 12,
  "overrideCapacity": true,
  "overrideScheduleConflict": true,
  "overridePrerequisite": false,
  "note": "Dieu chinh hoc vu"
}
```

Response mong muon:

```json
{
  "enrollmentId": 501,
  "studentId": 12,
  "studentCode": "SV001",
  "fullName": "Nguyen Van A",
  "classSectionId": 101,
  "classCode": "JAVA101-01",
  "status": "REGISTERED",
  "registrationSource": "ADMIN_OVERRIDE",
  "note": "Dieu chinh hoc vu"
}
```

Field thieu:

- `registrationSource`
- override flags.
- `note`.

Business logic backend can bo sung:

- Admin co the them thu cong ngay ca khi student khong tu dang ky.
- Tuy chinh override si so/trung lich/tien quyet phai ro rang va audit.
- Khong cho them vao lop `CANCELLED`.
- Neu registration period da CLOSED, chi admin co quyen override dac biet moi them duoc.

FE fallback/mock:

- `/admin/enrollments` hien co dialog `Them SV thu cong`, dung `POST /api/admin/enrollments/override`; neu loi thi them local mock.

### 7. Admin View Class Students

```http
GET /api/admin/class-sections/{id}/students
```

Request mong muon:

- Path `id`: classSectionId.

Response mong muon:

```json
[
  {
    "enrollmentId": 501,
    "studentId": 12,
    "studentCode": "SV001",
    "fullName": "Nguyen Van A",
    "email": "sv001@tlu.edu.vn",
    "majorName": "Cong nghe thong tin",
    "cohort": "K2024",
    "enrolledAt": "2026-08-10T09:32:00",
    "status": "REGISTERED",
    "registrationSource": "STUDENT"
  }
]
```

Field thieu:

- `registrationSource`
- `enrolledAt`
- `cohort`
- `email`

Business logic backend can bo sung:

- Tra roster theo class section.
- Co the filter status: `REGISTERED`, `ENROLLED`, `CANCELLED`, `FAILED`.

FE fallback/mock:

- `/admin/class-sections` co Dialog xem SV dang ky lop; neu API loi thi fallback mock.

### 8. Update Class Section Status

```http
PUT /api/admin/class-sections/{id}/status
```

Request mong muon:

```json
{
  "status": "OPEN",
  "note": "Mo lop cho sinh vien dang ky"
}
```

Response mong muon:

```json
{
  "id": 101,
  "classCode": "JAVA101-01",
  "status": "OPEN",
  "registrationLocked": false,
  "updatedAt": "2026-08-01T08:00:00"
}
```

Field thieu:

- `ClassSectionResponse.status`: `DRAFT`, `OPEN`, `CLOSED`, `CANCELLED`.
- `registrationLocked`
- `updatedAt`

Business logic backend can bo sung:

- `DRAFT`: student khong thay.
- `OPEN`: student thay va co the dang ky neu period OPEN.
- `CLOSED`: student thay nhung khong dang ky/huy.
- `CANCELLED`: lop bi huy, khong cho enrollment moi.

FE fallback/mock:

- `/admin/class-sections` dang override status tam thoi tren FE, khong persist sau reload neu BE chua tra status.

### 8.1. Thoi khoa bieu

```http
GET /api/admin/timetables?semesterId=1
GET /api/student/timetable?semesterId=1
GET /api/teacher/timetable?semesterId=1
```

Response mong muon:

```json
[
  {
    "classSectionId": 1001,
    "classCode": "JAVA101-01",
    "courseId": 10,
    "courseName": "Java co ban",
    "teacherId": 101,
    "teacherName": "GV 101",
    "roomId": 5,
    "roomName": "A101",
    "dayOfWeek": 2,
    "startPeriod": 1,
    "endPeriod": 3,
    "semesterId": 1
  }
]
```

Field thieu:

- `teacherId`, `teacherName`, `roomId`, `roomName`, `dayOfWeek`, `startPeriod`, `endPeriod` can on dinh tren DTO lich hoc.

Business logic backend can bo sung:

- Validate khong trung phong/giang vien trong cung hoc ky.
- Bo qua lop `CANCELLED`.
- Student timetable chi gom enrollment hop le sau khi dang ky/chot lop.
- Teacher timetable chi gom lop teacher duoc phan cong.

FE fallback/mock:

- `/admin/timetables` dang suy ra tu ClassSection API, fallback mock.
- `/student/schedule` va `/teacher/classes` dang co UI demo rieng.

### 8.2. Phan cong giang day

```http
GET /api/admin/teaching-assignments?semesterId=1
POST /api/admin/teaching-assignments
PUT /api/admin/teaching-assignments/{id}
DELETE /api/admin/teaching-assignments/{id}
```

Request mong muon:

```json
{
  "teacherId": 101,
  "classSectionId": 1001,
  "role": "PRIMARY"
}
```

Response mong muon:

```json
{
  "id": 1,
  "teacherId": 101,
  "teacherName": "GV 101",
  "classSectionId": 1001,
  "classCode": "JAVA101-01",
  "courseName": "Java co ban",
  "semesterName": "HK1 2026-2027",
  "status": "ACTIVE"
}
```

Business logic backend can bo sung:

- Cho phep 1 primary teacher va optional assistant teachers.
- Khong cho teacher trung lich trong cung hoc ky.
- Khi class section `CANCELLED`, assignment nen inactive.

FE fallback/mock:

- `/admin/teaching-assignments` dang suy ra tu ClassSection/Teacher API.

### 9. Lock Grades

```http
PUT /api/admin/grades/lock
```

Request mong muon:

```json
{
  "semesterId": 1,
  "classSectionId": 101,
  "note": "Khoa diem cuoi ky"
}
```

Response mong muon:

```json
{
  "semesterId": 1,
  "classSectionId": 101,
  "locked": true,
  "lockedAt": "2027-01-20T17:00:00",
  "lockedBy": 1
}
```

Field thieu:

- `locked`
- `lockedAt`
- `lockedBy`
- lock scope: semester/classSection.

Business logic backend can bo sung:

- Sau khi khoa diem, teacher khong sua diem.
- Student moi thay diem chinh thuc neu policy yeu cau.
- Ghi audit.

FE fallback/mock:

- `teacher.grades.tsx` hien dang mock nhap diem/khoa diem lop.
- Admin Swagger hien co `POST /api/admin/academic-results/lock-semester-grades/{semesterId}`, nhung chua dung dung API `PUT /api/admin/grades/lock` theo yeu cau va chua ro lock scope class/semester.

### 10. Notification

```http
GET /api/admin/notifications
POST /api/admin/notifications
GET /api/student/notifications
PUT /api/notifications/{id}/read
```

Request mong muon:

```json
{
  "title": "Mo dang ky hoc phan HK1",
  "content": "Sinh vien co the dang ky tu 01/08 den 20/08.",
  "targetRole": "STUDENT",
  "targetIds": [],
  "channel": "IN_APP"
}
```

Response mong muon:

```json
{
  "id": 1,
  "title": "Mo dang ky hoc phan HK1",
  "targetRole": "STUDENT",
  "channel": "IN_APP",
  "sentAt": "2026-08-01T08:00:00",
  "status": "SENT"
}
```

Field thieu:

- `targetRole`, `targetIds`, `channel`, `sentAt`, `readAt`, `status`.

Business logic backend can bo sung:

- Gui thong bao khi mo/khoa dang ky, doi lich hoc, huy lop, teacher gui diem, admin khoa diem.
- Student/teacher co API danh dau da doc.

FE fallback/mock:

- `/admin/notifications` dang mock.
- `/student/notifications` dang dung mock hien co.

### 11. Bao cao / thong ke

```http
GET /api/admin/reports/overview?semesterId=1
GET /api/admin/reports/enrollments?semesterId=1
GET /api/admin/reports/grades?semesterId=1
```

Response overview mong muon:

```json
{
  "semesterId": 1,
  "studentCount": 1200,
  "teacherCount": 86,
  "courseCount": 140,
  "classSectionCount": 220,
  "enrollmentCount": 3560,
  "openClassSectionCount": 180,
  "lockedGradeClassSectionCount": 0
}
```

FE fallback/mock:

- `/admin/reports` dang tinh tu API hien co neu co, bo sung mock cho chi so BE chua tra.

## Field Thieu Tong Hop

Semester/Registration period:

- `registrationPeriodId`
- `registrationStatus`: `DRAFT`, `OPEN`, `CLOSED`
- `registrationStartTime` hoac `startTime`
- `registrationEndTime` hoac `endTime`
- `serverTime`
- `registrationLocked`
- `openedAt`, `openedBy`, `closedAt`, `closedBy`

Class section:

- `status`: `DRAFT`, `OPEN`, `CLOSED`, `CANCELLED`
- `registrationLocked`
- `majorId`, `majorName`
- `currentSlots`, `maxSlots` bat buoc on dinh

Enrollment:

- `enrollmentId`
- `registeredAt` / `enrolledAt`
- `cancelledAt`
- `status`: `REGISTERED`, `ENROLLED`, `CANCELLED`, `FAILED`, `PASSED`
- `registrationSource`: `STUDENT`, `ADMIN_OVERRIDE`
- `note`

Grades:

- `locked`
- `lockedAt`
- `lockedBy`
- `submittedAt`
- `submittedBy`

Department/Curriculum:

- `departmentId`
- `departmentCode`
- `departmentName`
- `curriculumId`
- `effectiveYear`
- `semesterIndex`
- `required`
- `minGrade`

Notification/Report:

- `targetRole`
- `targetIds`
- `channel`
- `sentAt`
- `readAt`
- report aggregate fields theo semester

## Business Logic Backend Can Bo Sung

- Kiem tra thoi gian mo dang ky bang server time.
- Kiem tra lop status `OPEN` va registration period `OPEN`.
- Kiem tra trung lich.
- Kiem tra tien quyet.
- Kiem tra si so.
- Kiem tra gioi han tin chi.
- Kiem tra duplicate enrollment.
- Admin override them sinh vien thu cong co audit va flags override ro rang.
- Khoa dang ky chan student enroll/cancel.
- Chot enrollment va si so lop khi dong dang ky.
- Teacher chi nhap diem cho danh sach lop da chot.
- Admin khoa diem de dong sua diem va chot ket qua hoc tap.

## FE Dang Fallback/Mock Phan Nao

- Student registration:
  - Dang dung `GET /api/student/semesters`, `GET /api/student/classes/semester/{semesterId}`, `POST /api/student/enroll/{classSectionId}`, `DELETE /api/student/enroll/{classSectionId}`.
  - Chua dung cac endpoint `/api/student/registration/*` theo yeu cau.
- Admin class sections:
  - Status `DRAFT/OPEN/CLOSED/CANCELLED` dang co FE override tam thoi neu BE chua tra status.
  - Xem SV trong lop fallback mock neu `GET /api/admin/class-sections/{id}/students` loi/chua co.
- Admin enrollments:
  - Them SV thu cong goi `POST /api/admin/enrollments/override`; neu API loi thi them local mock.
  - Khoa dang ky lop goi endpoint de xuat `/api/admin/class-sections/{id}/enrollments/finalize`; neu API loi thi khoa local mock.
- Teacher grading:
  - `teacher.grades.tsx` dang mock nhap diem/khoa diem.
- Admin grades lock:
  - Swagger co `POST /api/admin/academic-results/lock-semester-grades/{semesterId}` nhung FE chua co luong lock grades dung `PUT /api/admin/grades/lock`.

## Flow Test Ngan

### 1. Admin mo dang ky

1. Login `admin/password123`.
2. Tao hoc ky hoac chon hoc ky co san.
3. Tao class sections, dat status `OPEN`.
4. Mo registration period:
   - Mong doi sau khi BE co API: `PUT /api/admin/registration-periods/{id}/open`.
   - Tam thoi FE demo bang `registrationOpen`/mock.
5. Kiem tra student thay ky dang ky dang OPEN.

### 2. Student dang ky

1. Login `sv001/password123`.
2. Vao `/student/course-registration`.
3. Chon hoc ky dang OPEN.
4. Bam dang ky mot lop.
5. BE can kiem tra trung lich, tien quyet, si so, tin chi.
6. Mong doi enrollment thanh `REGISTERED` hoac response loi nghiep vu ro.

### 3. Admin them sinh vien thu cong

1. Login admin.
2. Vao `/admin/enrollments`.
3. Bam `Them SV thu cong`.
4. Chon sinh vien va class section.
5. Submit.
6. Mong doi BE tao enrollment voi `registrationSource = ADMIN_OVERRIDE`.
7. Neu API loi, FE hien demo local.

### 4. Admin khoa dang ky

1. Vao `/admin/enrollments`.
2. Chon class section.
3. Bam `Khoa dang ky lop`.
4. Mong doi BE chot roster, cap nhat si so, chan student them/huy.
5. Student quay lai `/student/course-registration` khong the them/huy lop da khoa.

### 5. Teacher nhap diem

1. Login `gv101/password123`.
2. Vao `/teacher/grades`.
3. Chon lop da chot roster.
4. Nhap diem chuyen can/giua ky/cuoi ky.
5. Luu diem.
6. Mong doi BE luu grade theo enrollment.

### 6. Admin khoa diem

1. Login admin.
2. Goi luong khoa diem theo semester/class section.
3. Mong doi API de xuat: `PUT /api/admin/grades/lock`.
4. Sau khi khoa, teacher khong sua diem.
5. Student vao trang diem thay ket qua chinh thuc.
