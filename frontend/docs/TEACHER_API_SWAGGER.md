# Teacher API Swagger Summary

Tai lieu nay danh cho FE doc de biet backend Teacher hien co API nao, request/response dang tra gi, va route FE nao nen noi API nao.

Nguon da doc:

- `backend/src/main/java/com/example/ThangLongUniversityWeb/controller/TeacherController.java`
- `backend/src/main/java/com/example/ThangLongUniversityWeb/controller/TeacherGradeController.java`
- `backend/src/main/java/com/example/ThangLongUniversityWeb/controller/TeacherManagementController.java`
- `backend/docs/GRADE_API_GUIDE.md`
- `backend/docs/TASKS.md`

Tai khoan test:

- Teacher: `gv101 / password123`

## Auth

Tat ca API `/api/teacher/**` can:

```http
Authorization: Bearer <teacher_token>
```

Role yeu cau:

- `/api/teacher/**`: `TEACHER`
- `/api/admin/teachers/**`: `ADMIN`

## Teacher Endpoints Hien Co

| Module | Method | Endpoint | Request | Response | Ghi chu |
| --- | --- | --- | --- | --- | --- |
| Teacher classes | GET | `/api/teacher/my-classes/semester/{semesterId}` | path: `semesterId` | `ClassSectionResponse[]` | Lay danh sach lop hoc phan teacher duoc phan cong trong hoc ky |
| Teacher class roster | GET | `/api/teacher/classes/{classSectionId}/students` | path: `classSectionId` | `StudentGradeResponse[]` | Lay danh sach sinh vien trong lop hoc phan teacher dang day |
| Teacher grade simple | PUT | `/api/teacher/enrollments/{enrollmentId}/grade` | path: `enrollmentId`, body: `GradeRequest` | `StudentGradeResponse` | Endpoint cu trong `TeacherController` |
| Teacher gradebook | GET | `/api/teacher/grades/class/{classSectionId}` | path: `classSectionId` | `GradeResponse[]` | Lay bang diem cua ca lop |
| Teacher update grade | PUT | `/api/teacher/grades/{enrollmentId}` | path: `enrollmentId`, body: `GradeRequest` | `GradeResponse` | Endpoint moi trong `TeacherGradeController`, co check teacher/closed class |

## Admin Teacher Management Endpoints

Day la API admin quan ly ho so giang vien, khong phai teacher role.

| Module | Method | Endpoint | Request | Response | Ghi chu |
| --- | --- | --- | --- | --- | --- |
| Admin teachers | GET | `/api/admin/teachers` | none | `Teacher[]` hien dang tra entity/list | Lay tat ca giang vien |
| Admin teachers | POST | `/api/admin/teachers` | `TeacherRequest` | object | Tao giang vien |
| Admin teachers | PUT | `/api/admin/teachers/{id}` | path: `id`, body: `TeacherRequest` | object | Cap nhat giang vien |
| Admin teachers | DELETE | `/api/admin/teachers/{id}` | path: `id` | string | Xoa giang vien |

## Common User/Profile Endpoint

| Module | Method | Endpoint | Request | Response | Ghi chu |
| --- | --- | --- | --- | --- | --- |
| Profile | GET | `/api/users/me` | none | user/profile object | FE co the dung cho `/teacher/profile` |
| Profile | GET | `/api/users/{identifier}` | path: `identifier` | user/profile object | Tim user theo identifier neu can |

## DTO: GradeRequest

Dung cho:

- `PUT /api/teacher/enrollments/{enrollmentId}/grade`
- `PUT /api/teacher/grades/{enrollmentId}`

```ts
interface GradeRequest {
  enrollmentId: number;
  participationScore?: number;
  midTermScore?: number;
  finalScore?: number;
  retestScore?: number;
}
```

Validation backend hien co:

- `enrollmentId` bat buoc theo DTO, du path endpoint da co `enrollmentId`.
- `participationScore`, `midTermScore`, `finalScore`, `retestScore`: 0-10.

## DTO: StudentGradeResponse

Dung cho:

- `GET /api/teacher/classes/{classSectionId}/students`
- `PUT /api/teacher/enrollments/{enrollmentId}/grade`

```ts
interface StudentGradeResponse {
  enrollmentId: number;
  studentCode: string;
  fullName: string;
  midTermScore?: number;
  finalScore?: number;
  totalScore?: number;
  status: "REGISTERED" | "PASSED" | "FAILED" | "CANCELED" | string;
}
```

## DTO: GradeResponse

Dung cho:

- `GET /api/teacher/grades/class/{classSectionId}`
- `PUT /api/teacher/grades/{enrollmentId}`

```ts
interface GradeResponse {
  id: number;
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  courseId: number;
  courseCode: string;
  classCode: string;
  courseName: string;
  credits: number;
  semesterId: number;
  semesterName: string;
  participationScore?: number;
  midtermScore?: number;
  finalScore?: number;
  retestScore?: number;
  attemptNumber?: number;
  enrollmentType?: string;
  totalScore?: number;
  letterGrade?: string;
  gpa4?: number;
  gradePoint?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

## DTO: ClassSectionResponse

Dung cho:

- `GET /api/teacher/my-classes/semester/{semesterId}`

```ts
interface ClassSectionResponse {
  id: number;
  classCode: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  courseType?: "REQUIRED" | "ELECTIVE" | string;
  courseTypeLabel?: string;
  credits: number;
  semesterId: number;
  semesterName: string;
  teacherId: number;
  teacherName: string;
  room?: string;
  roomId?: number;
  roomCapacity?: number;
  schedules: ClassSectionScheduleResponse[];
  maxSlots: number;
  currentSlots: number;
  closed: boolean;
}
```

Luu y:

- Java field la `private boolean isClosed;`, JSON thuong serialize thanh `closed`.
- FE nen support ca `closed` va `isClosed` trong giai do backend chua chuan hoa.

## DTO: TeacherRequest

Dung cho:

- `POST /api/admin/teachers`
- `PUT /api/admin/teachers/{id}`

```ts
interface TeacherRequest {
  username: string;
  password: string;
  email: string;
  teacherCode: string;
  fullName: string;
  dob?: string;
  department?: string;
  degree?: string;
  address?: string;
  phone?: string;
}
```

## Mapping Voi Trang FE Teacher

| FE route | API nen dung | Query key de xuat | Fallback |
| --- | --- | --- | --- |
| `/teacher/dashboard` | Chua co API summary rieng | `["teacher", "dashboard", semesterId]` | Mock summary |
| `/teacher/profile` | `GET /api/users/me` hoac profile rieng neu BE them | `["teacher", "profile"]` | Profile chung |
| `/teacher/classes` | `GET /api/teacher/my-classes/semester/{semesterId}` | `["teacher", "classes", semesterId]` | Mock classes neu API loi/thieu semester |
| `/teacher/classes/$classSectionId/students` | `GET /api/teacher/classes/{classSectionId}/students` | `["teacher", "classes", classSectionId, "students"]` | Mock roster neu API loi |
| `/teacher/grades` | `GET /api/teacher/grades/class/{classSectionId}` + `PUT /api/teacher/grades/{enrollmentId}` | `["teacher", "grades", classSectionId]` | Mock gradebook neu API loi |
| `/teacher/chat` | Chat API rieng | `["chat", ...]` | Chat demo |

## FE Implementation Notes

Khi bat dau noi Teacher FE:

- Tao `frontend/src/lib/api/teacher.ts`.
- Dung `apiRequest`, khong dung `fetch` truc tiep.
- Query keys:
  - `["teacher", "dashboard", semesterId]`
  - `["teacher", "classes", semesterId]`
  - `["teacher", "classes", classSectionId, "students"]`
  - `["teacher", "grades", classSectionId]`
- Mutation update grade phai invalidate:
  - `["teacher", "grades", classSectionId]`
  - `["teacher", "classes", classSectionId, "students"]`
