# Teacher API Gaps

Tai lieu nay danh cho BE doc. Noi dung gom API thieu, field thieu, business logic can bo sung cho Teacher Portal. API hien co cua BE da duoc tach sang `frontend/docs/TEACHER_API_SWAGGER.md` de FE doc khi code.

## 1. Teacher Dashboard Summary

API thieu:

```http
GET /api/teacher/dashboard/summary?semesterId=1
```

Response mong muon:

```json
{
  "semesterId": 1,
  "semesterName": "HK1 2026-2027",
  "assignedClassCount": 4,
  "studentCount": 180,
  "todaySchedule": [
    {
      "classSectionId": 10,
      "classCode": "JAVA101-01",
      "courseName": "Java co ban",
      "room": "A301",
      "dayOfWeek": 2,
      "startPeriod": 1,
      "endPeriod": 3
    }
  ],
  "pendingGradeCount": 42,
  "unreadMessages": 3
}
```

FE fallback/mock:

- `/teacher/dashboard` dang tong hop tu `GET /api/teacher/my-classes/semester/{semesterId}` neu goi duoc.
- Neu API classes loi hoac teacher semester endpoint chua co, FE fallback sang mock class sections de dashboard van demo duoc.

## 2. Teacher Semesters / Reference Data

API thieu hoac chua ro:

```http
GET /api/teacher/semesters
```

Hoac cho phep teacher dung endpoint chung:

```http
GET /api/admin/semesters
```

Response mong muon:

```json
[
  {
    "id": 1,
    "name": "HK1 2026-2027",
    "academicYear": "2026-2027",
    "status": "OPEN"
  }
]
```

FE fallback/mock:

- Semester selector tren `/teacher/classes` va `/teacher/grades` dang dung local options: `API: Hoc ky 1`, `API: Hoc ky 2` va mock semesters.
- Khi BE co endpoint semester dung role TEACHER, FE se thay local options bang response that.

## 3. Teacher Timetable

API thieu:

```http
GET /api/teacher/timetable?semesterId=1
```

Response mong muon:

```json
[
  {
    "classSectionId": 10,
    "classCode": "JAVA101-01",
    "courseCode": "JAVA101",
    "courseName": "Java co ban",
    "semesterId": 1,
    "teacherId": 101,
    "teacherName": "GV 101",
    "roomId": 3,
    "roomName": "A301",
    "dayOfWeek": 2,
    "startPeriod": 1,
    "endPeriod": 3,
    "currentSlots": 58,
    "maxSlots": 60
  }
]
```

Business logic can co:

- Chi tra lop ma teacher hien tai duoc phan cong.
- Bo qua lop `CANCELLED`.
- Chi hien lop trong hoc ky filter.

## 4. Grade Submit / Lock Workflow

Hien co:

- Teacher co API nhap/sua diem.
- Admin co API khoa diem hoc ky trong grade guide: `POST /api/admin/academic-results/lock-semester-grades/{semesterId}`.

API thieu hoac chua ro:

```http
POST /api/teacher/classes/{classSectionId}/grades/submit
```

Request mong muon:

```json
{
  "note": "Da nhap du diem thanh phan"
}
```

Response mong muon:

```json
{
  "classSectionId": 10,
  "classCode": "JAVA101-01",
  "gradeStatus": "SUBMITTED",
  "submittedAt": "2026-05-21T09:30:00",
  "submittedByTeacherId": 101
}
```

Business logic can co:

- Teacher chi submit lop minh day.
- Khong cho submit neu con sinh vien thieu diem bat buoc.
- Sau khi submit, teacher khong sua diem neu policy yeu cau admin tra ve.
- Sau khi admin khoa diem, teacher khong sua diem.
- Can response loi ro rang khi lop da closed/locked.

FE fallback/mock:

- `/teacher/grades` dang demo nut "Gui bang diem" bang state local `SUBMITTED`; trang khong persist sau reload vi chua co API submit.

## 5. Grade Lock Status On Class And Grade Response

Field thieu:

- `ClassSectionResponse.gradeLocked`
- `ClassSectionResponse.gradeStatus`
- `ClassSectionResponse.gradeSubmittedAt`
- `ClassSectionResponse.gradeLockedAt`
- `GradeResponse.gradeStatus`
- `GradeResponse.canEdit`

Muc dich:

- FE biet khi nao disable form nhap diem.
- Student xem diem chi sau khi diem da duoc khoa/cong bo neu nghiep vu yeu cau.
- Admin biet lop nao da nop diem/chua nop diem.

## 6. Roster Response Cho Teacher

`StudentGradeResponse` hien moi du cho diem co ban. Roster teacher can them:

- `studentId`
- `email`
- `majorName`
- `cohort`
- `academicYear`
- `phone`
- `enrolledAt`
- `registrationSource`
- `enrollmentStatus`: `REGISTERED` / `DROPPED` / `ENROLLED` / `PASSED` / `FAILED`

API de xuat neu khong muon mo rong endpoint cu:

```http
GET /api/teacher/classes/{classSectionId}/roster
```

## 7. Naming Consistency

Can chuan hoa:

- Request: `midTermScore`
- Response 1: `midtermScore`
- Response 2: `midTermScore`

De xuat dung mot casing duy nhat:

- `midtermScore` cho JSON response/request, hoac
- `midTermScore` cho ca request va response.

## 8. Attendance / Day-To-Day Teaching

Workflow co "Teacher diem danh / day". API diem danh chua thay trong controller da doc.

API de xuat:

```http
GET /api/teacher/classes/{classSectionId}/attendance-sessions
POST /api/teacher/classes/{classSectionId}/attendance-sessions
PUT /api/teacher/attendance-sessions/{sessionId}/students/{studentId}
```

FE fallback/mock:

- `/teacher/attendance` da co UI demo.
- FE lay danh sach lop tu `GET /api/teacher/my-classes/semester/{semesterId}`.
- FE lay roster tu `GET /api/teacher/classes/{classSectionId}/students` neu co.
- Trang thai diem danh `PRESENT/ABSENT/LATE` dang luu local state, khong persist sau reload.

Request/response mong muon:

```json
{
  "classSectionId": 10,
  "sessionDate": "2026-05-21",
  "lessonNumber": 5,
  "note": "Buoi hoc thuc hanh"
}
```

```json
{
  "id": 9001,
  "classSectionId": 10,
  "sessionDate": "2026-05-21",
  "lessonNumber": 5,
  "records": [
    {
      "studentId": 1001,
      "studentCode": "SV001",
      "fullName": "Nguyen Van A",
      "status": "PRESENT",
      "note": null
    }
  ]
}
```

Business logic can co:

- Teacher chi diem danh lop minh duoc phan cong.
- Khong cho diem danh lop `CANCELLED`.
- Cho sua diem danh trong khoang thoi gian cau hinh, hoac theo quyen admin/teacher.
- Tong hop ty le vang/muon de bao cao lop hoc.

## 9. Teacher Notifications

API thieu:

```http
GET /api/teacher/notifications
POST /api/teacher/classes/{classSectionId}/notifications
PUT /api/teacher/notifications/{notificationId}/read
PUT /api/teacher/notifications/read-all
```

Request mong muon:

```json
{
  "type": "SCHEDULE_CHANGE",
  "title": "Doi phong hoc sang A301",
  "body": "Buoi hoc thu 5 tuan nay chuyen sang phong A301.",
  "sendToAllStudentsInClass": true
}
```

Response mong muon:

```json
{
  "id": 501,
  "classSectionId": 10,
  "classCode": "JAVA101-01",
  "type": "SCHEDULE_CHANGE",
  "title": "Doi phong hoc sang A301",
  "body": "Buoi hoc thu 5 tuan nay chuyen sang phong A301.",
  "targetCount": 58,
  "sentAt": "2026-05-21T08:30:00",
  "createdByTeacherId": 101
}
```

Field/business logic can bo sung:

- `type`: `GENERAL`, `SCHEDULE_CHANGE`, `ABSENCE`, `ASSIGNMENT`.
- Chi teacher cua lop moi duoc gui thong bao cho lop do.
- Nen dong bo notification nay sang trang student notification/chat neu co.
- Nen co read/unread per student.
- Optional: attachment/fileUrl neu sau nay co tai lieu hoc tap.

FE fallback/mock:

- `/teacher/notifications` da co UI tao thong bao bang react-hook-form + Zod.
- Chua goi API that vi endpoint chua co; thong bao moi chi luu local state va mat sau reload.

## 10. Teaching Materials / Class Reports Optional

API optional chua co:

```http
GET /api/teacher/classes/{classSectionId}/materials
POST /api/teacher/classes/{classSectionId}/materials
GET /api/teacher/classes/{classSectionId}/report
```

BE co the bo sung sau:

- Tai lieu hoc tap: title, fileUrl, type, visibleFrom, visibleTo.
- Bao cao lop: si so, ty le vang, diem trung binh, so sinh vien can canh bao.

## 11. FE Dang Noi API / Fallback O Dau

- `/teacher/dashboard`
  - Goi `GET /api/teacher/my-classes/semester/{semesterId}` de tong hop lop, sinh vien, bang diem can xu ly.
  - Chua co `GET /api/teacher/dashboard/summary`, nen so lieu `todaySchedule`, `pendingGradeCount`, `unreadMessages` van co phan mock/suy dien.
- `/teacher/timetable`
  - Hien dang dung `GET /api/teacher/my-classes/semester/{semesterId}` va tach `schedules[]` tu class section.
  - Neu API loi, FE fallback mock class-sections.
  - BE nen co `GET /api/teacher/timetable?semesterId=...` rieng de tra week range, room, period, lop bi huy/chuyen lich.
- `/teacher/classes`
  - Goi `GET /api/teacher/my-classes/semester/{semesterId}`.
  - Neu API loi, FE hien mock class sections va gan nhan `Mock`.
- `/teacher/classes/{classSectionId}/students`
  - Goi `GET /api/teacher/classes/{classSectionId}/students`.
  - Response hien tai thieu `email`, `cohort`, `majorName`, nen FE hien `Can BE`.
  - Neu API loi, FE hien roster demo.
- `/teacher/grades`
  - Goi `GET /api/teacher/grades/class/{classSectionId}`.
  - Goi `PUT /api/teacher/grades/{enrollmentId}` khi bam luu diem voi row API.
  - Row mock chi luu tren UI va hien toast demo.
  - Nut "Gui bang diem" hien la demo local do chua co endpoint submit.
- `/teacher/attendance`
  - Chua co API attendance. FE lay roster neu co, sau do set status diem danh local.
  - Can BE them attendance session/record API de persist.
- `/teacher/notifications`
  - Chua co API notification cho teacher. FE tao thong bao local demo.
  - Can BE them API gui thong bao theo lop hoc phan.

## 12. TeacherRequest Update Password

`TeacherRequest.password` dang `@NotBlank`, nhung schema comment ghi "chi bat buoc khi tao moi".

BE nen:

- Tach `CreateTeacherRequest` va `UpdateTeacherRequest`, hoac
- Cho update teacher khong can gui password.

## Flow Test Teacher Ngan

### 1. Teacher xem lop duoc phan cong

1. Login `gv101 / password123`.
2. Vao `/teacher/classes`.
3. Chon hoc ky.
4. FE goi `GET /api/teacher/my-classes/semester/{semesterId}`.
5. Ky vong thay danh sach lop, mon hoc, phong, lich, si so.

### 2. Teacher xem danh sach sinh vien trong lop

1. Tu `/teacher/classes`, bam "Xem SV".
2. FE goi `GET /api/teacher/classes/{classSectionId}/students`.
3. Ky vong thay danh sach sinh vien va diem hien co.
4. Neu API 403, kiem tra teacher co dung la giang vien cua lop khong.

### 3. Teacher nhap diem

1. Vao `/teacher/grades`.
2. Chon hoc ky va lop.
3. FE goi `GET /api/teacher/grades/class/{classSectionId}`.
4. Sua diem chuyen can/giua ky/cuoi ky.
5. FE goi `PUT /api/teacher/grades/{enrollmentId}`.
6. Ky vong response tra `totalScore`, `letterGrade`, `gpa4`.

### 4. Teacher gui diem

1. Sau khi nhap du diem, bam "Gui bang diem".
2. Hien tai API nay chua thay trong controller.
3. FE demo bang mock/local state neu chua co:
   - `gradeStatus = SUBMITTED`
   - disable sua diem neu policy yeu cau.

### 5. Admin khoa diem

1. Login admin.
2. Goi `POST /api/admin/academic-results/lock-semester-grades/{semesterId}`.
3. Sau khi khoa, teacher thu sua diem.
4. Ky vong BE chan sua diem va tra loi ro rang.
