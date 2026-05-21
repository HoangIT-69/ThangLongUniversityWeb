# Admin API Swagger Inventory

Generated from local Swagger/OpenAPI: `http://localhost:8080/v3/api-docs`

Purpose:

- Summarize all current `/api/admin/*` endpoints.
- Record request/response contracts from Swagger for frontend implementation.
- Track which Admin routes still use mock data and which API client functions are missing.

Last checked: 2026-05-20

## Frontend Status Summary

Current frontend API module:

- `src/lib/api/admin.ts`

Currently implemented in `adminApi`:

- `listMajors()`
- `deleteMajor(id)`
- `listRooms()`
- `deleteRoom(id)`
- `listPeriods()`
- `deletePeriod(id)`

Admin routes still using mock data:

- `src/routes/admin.dashboard.tsx`
- `src/routes/admin.users.tsx`
- `src/routes/admin.students.tsx`
- `src/routes/admin.teachers.tsx`
- `src/routes/admin.courses.tsx`
- `src/routes/admin.semesters.tsx`
- `src/routes/admin.class-sections.tsx`
- `src/routes/admin.enrollments.tsx`
- `src/routes/admin.academic-results.tsx`
- `src/routes/admin.majors.tsx` uses API with mock fallback
- `src/routes/admin.rooms.tsx` uses API with mock fallback
- `src/routes/admin.periods.tsx` uses API with mock fallback

## Endpoint Index

| Domain           | Method | Path                                                            | Request                                               | Response                     |
| ---------------- | -----: | --------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------- |
| Users            |    GET | `/api/admin/users`                                              | query: `page`, `size`, `role`, `keyword` if supported | object/page                  |
| Users            |   POST | `/api/admin/users/admin`                                        | query: `username`, `password`, `email`, `fullName`    | object                       |
| Users            |    PUT | `/api/admin/users/{id}/toggle-status`                           | path: `id`                                            | object                       |
| Users            | DELETE | `/api/admin/users/admin/{id}`                                   | path: `id`                                            | object                       |
| Students         |    GET | `/api/admin/students`                                           | none                                                  | object/list                  |
| Students         |   POST | `/api/admin/students`                                           | `StudentRequest`                                      | object                       |
| Students         |    PUT | `/api/admin/students/{id}`                                      | `StudentRequest`, path: `id`                          | object                       |
| Students         | DELETE | `/api/admin/students/{id}`                                      | path: `id`                                            | object                       |
| Teachers         |    GET | `/api/admin/teachers`                                           | none                                                  | object/list                  |
| Teachers         |   POST | `/api/admin/teachers`                                           | `TeacherRequest`                                      | object                       |
| Teachers         |    PUT | `/api/admin/teachers/{id}`                                      | `TeacherRequest`, path: `id`                          | object                       |
| Teachers         | DELETE | `/api/admin/teachers/{id}`                                      | path: `id`                                            | object                       |
| Courses          |    GET | `/api/admin/courses`                                            | none                                                  | `CourseResponse[]` or object |
| Courses          |   POST | `/api/admin/courses`                                            | `CourseRequest`                                       | `CourseResponse`             |
| Courses          |    PUT | `/api/admin/courses/{id}`                                       | `CourseRequest`, path: `id`                           | `CourseResponse`             |
| Courses          | DELETE | `/api/admin/courses/{id}`                                       | path: `id`                                            | string/object                |
| Majors           |    GET | `/api/admin/majors`                                             | none                                                  | object/list                  |
| Majors           |   POST | `/api/admin/majors`                                             | `MajorRequest`                                        | object                       |
| Majors           |    PUT | `/api/admin/majors/{id}`                                        | `MajorRequest`, path: `id`                            | object                       |
| Majors           | DELETE | `/api/admin/majors/{id}`                                        | path: `id`                                            | object/string                |
| Rooms            |    GET | `/api/admin/rooms`                                              | none                                                  | object/list                  |
| Rooms            |   POST | `/api/admin/rooms`                                              | `RoomRequest`                                         | object                       |
| Rooms            |    PUT | `/api/admin/rooms/{id}`                                         | `RoomRequest`, path: `id`                             | object                       |
| Rooms            | DELETE | `/api/admin/rooms/{id}`                                         | path: `id`                                            | object/string                |
| Periods          |    GET | `/api/admin/periods`                                            | none                                                  | object/list                  |
| Periods          |   POST | `/api/admin/periods`                                            | `PeriodRequest`                                       | object                       |
| Periods          |    PUT | `/api/admin/periods/{id}`                                       | `PeriodRequest`, path: `id`                           | object                       |
| Periods          | DELETE | `/api/admin/periods/{id}`                                       | path: `id`                                            | object/string                |
| Semesters        |    GET | `/api/admin/semesters`                                          | none                                                  | object/list                  |
| Semesters        |   POST | `/api/admin/semesters`                                          | `SemesterRequest`                                     | object                       |
| Semesters        |    PUT | `/api/admin/semesters/{id}`                                     | `SemesterRequest`, path: `id`                         | object                       |
| Semesters        | DELETE | `/api/admin/semesters/{id}`                                     | path: `id`                                            | object/string                |
| Class Sections   |    GET | `/api/admin/class-sections`                                     | none                                                  | object/list                  |
| Class Sections   |    GET | `/api/admin/class-sections/semester/{semesterId}`               | path: `semesterId`                                    | object/list                  |
| Class Sections   |   POST | `/api/admin/class-sections`                                     | `ClassSectionRequest`                                 | object                       |
| Class Sections   |    PUT | `/api/admin/class-sections/{id}`                                | `ClassSectionRequest`, path: `id`                     | object                       |
| Class Sections   | DELETE | `/api/admin/class-sections/{id}`                                | path: `id`                                            | object/string                |
| Enrollments      |    GET | `/api/admin/enrollments`                                        | query filters/pagination                              | object/page                  |
| Enrollments      |   POST | `/api/admin/enrollments/override`                               | `AdminOverrideEnrollmentRequest`                      | object                       |
| Academic Results |    GET | `/api/admin/academic-results/student/{studentId}`               | path: `studentId`                                     | object                       |
| Academic Results |   POST | `/api/admin/academic-results/calculate-semester-gpa`            | query/body depending backend implementation           | object                       |
| Academic Results |   POST | `/api/admin/academic-results/calculate-cumulative-gpa`          | query/body depending backend implementation           | object                       |
| Academic Results |   POST | `/api/admin/academic-results/lock-semester-grades/{semesterId}` | path: `semesterId`                                    | object                       |
| Settings         |    GET | `/api/admin/settings/retake-fee`                                | none                                                  | `{ [key: string]: number }`  |
| Settings         |    PUT | `/api/admin/settings/retake-fee`                                | `{ [key: string]: number }`                           | object                       |

## Request Schemas

### StudentRequest

Used by:

- `POST /api/admin/students`
- `PUT /api/admin/students/{id}`

Required:

- `username`
- `password`
- `email`
- `studentCode`
- `fullName`
- `dob`
- `majorId`
- `academicYear`

Fields:

```ts
interface StudentRequest {
  username: string;
  password: string;
  email: string;
  studentCode: string;
  fullName: string;
  dob: string; // date, example: 2000-01-15
  majorId: number;
  academicYear: number;
  address?: string;
}
```

UI gap suggestion:

- Backend has `address`, but Admin/Student profile UI may also need `phone`, `gender`, `nationalId`, `hometown`, `currentAddress`, `className`, `status`.

### TeacherRequest

Used by:

- `POST /api/admin/teachers`
- `PUT /api/admin/teachers/{id}`

Required:

- `username`
- `password`
- `email`
- `teacherCode`
- `fullName`

Fields:

```ts
interface TeacherRequest {
  username: string;
  password: string;
  email: string;
  teacherCode: string;
  fullName: string;
  dob?: string; // date
  department?: string;
  degree?: string;
  address?: string;
  phone?: string;
}
```

### CourseRequest

Used by:

- `POST /api/admin/courses`
- `PUT /api/admin/courses/{id}`

Required:

- `code`
- `name`
- `credits`
- `majorId`

Fields:

```ts
interface CourseRequest {
  code: string;
  name: string;
  credits: number;
  description?: string;
  courseType?: "REQUIRED" | "ELECTIVE";
  majorId: number;
  prerequisiteCourseIds?: number[];
}
```

### MajorRequest

Used by:

- `POST /api/admin/majors`
- `PUT /api/admin/majors/{id}`

Required:

- `majorCode`
- `name`

Fields:

```ts
interface MajorRequest {
  majorCode: string;
  name: string;
  description?: string;
}
```

### RoomRequest

Used by:

- `POST /api/admin/rooms`
- `PUT /api/admin/rooms/{id}`

Required:

- `name`
- `capacity`

Fields:

```ts
interface RoomRequest {
  name: string;
  capacity: number;
}
```

### PeriodRequest

Used by:

- `POST /api/admin/periods`
- `PUT /api/admin/periods/{id}`

Required:

- `periodNumber`
- `startTime`
- `endTime`

Fields:

```ts
interface PeriodRequest {
  periodNumber: number; // 1-12
  startTime: string; // example: 07:00
  endTime: string; // example: 08:00
}
```

### SemesterRequest

Used by:

- `POST /api/admin/semesters`
- `PUT /api/admin/semesters/{id}`

Required:

- `name`
- `startDate`
- `endDate`

Fields:

```ts
interface SemesterRequest {
  name: string;
  startDate: string; // date
  endDate: string; // date
  registrationOpen?: boolean;
}
```

### ClassSectionRequest

Used by:

- `POST /api/admin/class-sections`
- `PUT /api/admin/class-sections/{id}`

Required:

- `classCode`
- `courseId`
- `semesterId`
- `schedules`
- `maxSlots`

Fields:

```ts
interface ClassSectionRequest {
  classCode: string;
  courseId: number;
  semesterId: number;
  teacherId?: number | null;
  schedules: ClassSectionScheduleRequest[];
  maxSlots: number;
}

interface ClassSectionScheduleRequest {
  dayOfWeek: number; // Swagger says 2-8, while some FE student endpoints use 1-7. Verify mapping.
  startPeriodId: number;
  endPeriodId: number;
  roomId: number;
}
```

### AdminOverrideEnrollmentRequest

Used by:

- `POST /api/admin/enrollments/override`

Required:

- `studentId`
- `classSectionId`

Fields:

```ts
interface AdminOverrideEnrollmentRequest {
  studentId: number;
  classSectionId: number;
  note?: string;
}
```

### Retake Fee Settings Request

Used by:

- `PUT /api/admin/settings/retake-fee`

Swagger shows a generic number map.

Recommended FE shape until backend confirms exact key:

```ts
interface RetakeFeeSettingsRequest {
  retakeFee: number;
}
```

## Response Schemas

Swagger response schemas for several Admin endpoints are currently broad `object` responses. FE should verify live payloads before finalizing DTOs in `src/lib/api/types.ts`.

Known typed response from Swagger:

```ts
interface CourseResponse {
  id: number;
  code: string;
  name: string;
  credits: number;
  description?: string | null;
  courseType?: "REQUIRED" | "ELECTIVE" | null;
  courseTypeLabel?: string | null;
  majorName?: string | null;
  prerequisiteNames?: string[];
}
```

Recommended Admin DTOs to add after checking live payloads:

```ts
interface AdminUserResponse {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  fullName?: string | null;
  code?: string | null;
  active?: boolean;
}

interface AdminStudentResponse {
  id: number;
  username?: string;
  email: string;
  studentCode: string;
  fullName: string;
  dob?: string | null;
  majorId?: number | null;
  majorName?: string | null;
  academicYear?: number | null;
  address?: string | null;
}

interface AdminTeacherResponse {
  id: number;
  username?: string;
  email: string;
  teacherCode: string;
  fullName: string;
  dob?: string | null;
  department?: string | null;
  degree?: string | null;
  address?: string | null;
  phone?: string | null;
}

interface AdminClassSectionResponse {
  id: number;
  classCode: string;
  courseId: number;
  courseCode?: string;
  courseName?: string;
  semesterId: number;
  semesterName?: string;
  teacherId?: number | null;
  teacherName?: string | null;
  schedules?: Array<{
    id?: number;
    dayOfWeek: number;
    startPeriodId?: number;
    startPeriod?: number;
    endPeriodId?: number;
    endPeriod?: number;
    roomId?: number | null;
    roomName?: string | null;
  }>;
  maxSlots: number;
  currentSlots?: number;
  closed?: boolean;
}
```

## Implementation Checklist For FE

Add or extend `src/lib/api/admin.ts` with:

- `listUsers()`
- `createAdmin()`
- `toggleUserStatus(id)`
- `deleteAdminUser(id)`
- `listStudents()`
- `createStudent(input)`
- `updateStudent(id, input)`
- `deleteStudent(id)`
- `listTeachers()`
- `createTeacher(input)`
- `updateTeacher(id, input)`
- `deleteTeacher(id)`
- `listCourses()`
- `createCourse(input)`
- `updateCourse(id, input)`
- `deleteCourse(id)`
- `createMajor(input)`
- `updateMajor(id, input)`
- `createRoom(input)`
- `updateRoom(id, input)`
- `createPeriod(input)`
- `updatePeriod(id, input)`
- `listSemesters()`
- `createSemester(input)`
- `updateSemester(id, input)`
- `deleteSemester(id)`
- `listClassSections()`
- `listClassSectionsBySemester(semesterId)`
- `createClassSection(input)`
- `updateClassSection(id, input)`
- `deleteClassSection(id)`
- `listEnrollments(params)`
- `overrideEnrollment(input)`
- `getStudentAcademicResults(studentId)`
- `calculateSemesterGpa(...)`
- `calculateCumulativeGpa(...)`
- `lockSemesterGrades(semesterId)`
- `getRetakeFee()`
- `updateRetakeFee(input)`

## Notes / Risks

- Several Swagger summaries are mojibake in the raw JSON due to encoding display, but paths and schemas are usable.
- Some responses are documented as `object`; use test account `admin/password123` to capture live JSON before final DTO finalization.
- `ClassSectionScheduleRequest.dayOfWeek` says `2-8` in Swagger, while current student schedule UI maps `1-7`. Confirm backend convention before wiring create/edit forms.
- `frontend/API_CLIENTS_INVENTORY.md` existed in Git history but is currently deleted in the worktree. It was a broad client inventory, not this Admin Swagger contract.
