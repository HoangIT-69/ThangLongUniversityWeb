# TEACHER_API_GUIDE.md

## Swagger/OpenAPI

- File cấu hình: `backend/src/main/java/com/example/ThangLongUniversityWeb/config/OpenApiConfig.java`
- Dependency: `backend/build.gradle.kts` dùng `org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.3`
- Swagger UI path:
  - `/swagger-ui/index.html`
  - `/swagger-ui.html`
- OpenAPI JSON path:
  - `/v3/api-docs`
  - `/v3/api-docs/teacher-operations` cho group `teacher-operations`
- Group teacher:
  - `GroupedOpenApi.teacherApi()`
  - `group("teacher-operations")`
  - `pathsToMatch("/api/teacher/**")`
- Auth:
  - Swagger khai báo `bearerAuth`, HTTP Bearer JWT trong header `Authorization: Bearer <accessToken>`.
  - `SecurityConfig` yêu cầu `/api/teacher/**` có role `TEACHER`.
  - Refresh token cookie được cấu hình trong `application.properties`, nhưng các API teacher dùng access token Bearer, không dùng cookie trực tiếp.

## API Teacher

### GET /api/teacher/semesters
Mục đích: Lấy danh sách học kỳ để giảng viên lọc lớp, lịch dạy, điểm danh, bảng điểm.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `StudentSemesterResponse[]`
- `id`, `name`, `startDate`, `endDate`, `registrationOpen`, `locked`
Frontend dùng cho màn hình nào: `teacher.dashboard`, `teacher.classes`, `teacher.grades`, `teacher.attendance`, `teacher.timetable`.
Ghi chú: Backend sort theo `startDate` tăng dần.

### GET /api/teacher/my-classes/semester/{semesterId}
Mục đích: Lấy các lớp học phần được phân công cho giảng viên trong một học kỳ.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: `semesterId: number`.
Query: Không.
Body: Không.
Response fields: `ClassSectionResponse[]`
- `id`, `classCode`, `courseId`, `courseCode`, `courseName`, `courseType`, `courseTypeLabel`, `credits`
- `semesterId`, `semesterName`, `teacherId`, `teacherName`
- `room`, `roomId`, `roomCapacity`, `schedules`
- `maxSlots`, `currentSlots`, `closed`, `gradeLocked`
Frontend dùng cho màn hình nào: dashboard giảng viên, danh sách lớp, lịch dạy, quản lý điểm, điểm danh.
Ghi chú: `schedules` là danh sách lịch theo ngày/tiết; boolean Java field `isClosed` thường serialize thành `closed`.

### GET /api/teacher/classes/{classSectionId}/students
Mục đích: Lấy danh sách sinh viên trong lớp học phần của giảng viên, kèm điểm tóm tắt.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: `classSectionId: number`.
Query: Không.
Body: Không.
Response fields: `TeacherStudentGradeResponse[]`
- `enrollmentId`, `studentCode`, `fullName`
- `phone`, `email`, `className`, `advisorName`, `majorName`, `facultyName`
- `midTermScore`, `finalScore`, `totalScore`
- `status`, `courseStatus`, `absenceCount`
Frontend dùng cho màn hình nào: chi tiết lớp, điểm danh.
Ghi chú: Backend chặn nếu lớp không thuộc giảng viên hiện tại; loại bỏ enrollment `PENDING`.

### PUT /api/teacher/enrollments/{enrollmentId}/grade
Mục đích: Endpoint cũ để nhập/cập nhật điểm giữa kỳ, cuối kỳ, thi lại cho một enrollment.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: `enrollmentId: number`.
Query: Không.
Body: `GradeRequest`
- `enrollmentId`, `participationScore`, `midTermScore`, `finalScore`, `retestScore`
Response fields: `TeacherStudentGradeResponse`
- `enrollmentId`, `studentCode`, `fullName`, `phone`, `email`, `className`, `advisorName`, `majorName`, `facultyName`
- `midTermScore`, `finalScore`, `totalScore`, `status`, `courseStatus`, `absenceCount`
Frontend dùng cho màn hình nào: có thể dùng cho bảng điểm đơn giản theo roster.
Ghi chú: Service chỉ set `midTermScore`, `finalScore`, `retestScore`; không set `participationScore`. Nên ưu tiên endpoint mới `/api/teacher/grades/{enrollmentId}` cho quản lý điểm đầy đủ.

### GET /api/teacher/grades/class/{classSectionId}
Mục đích: Lấy bảng điểm của cả lớp học phần.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: `classSectionId: number`.
Query: Không.
Body: Không.
Response fields: `GradeResponse[]`
- `id`, `enrollmentId`, `studentId`, `studentCode`, `studentName`
- `courseId`, `courseCode`, `classCode`, `courseName`, `credits`
- `semesterId`, `semesterName`
- `participationScore`, `midtermScore`, `finalScore`, `retestScore`
- `attemptNumber`, `enrollmentType`, `totalScore`, `letterGrade`, `gpa4`, `gradePoint`
- `createdAt`, `updatedAt`, `courseStatus`, `absenceCount`
Frontend dùng cho màn hình nào: `teacher.grades`.
Ghi chú: Bao gồm cả sinh viên học chính thức và sinh viên thi lại/cải thiện đã `REGISTERED` vào lớp này.

### PUT /api/teacher/grades/{enrollmentId}
Mục đích: Nhập/cập nhật điểm cho sinh viên.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: `enrollmentId: number`.
Query: Không.
Body: `GradeRequest`
- `enrollmentId`, `participationScore`, `midTermScore`, `finalScore`, `retestScore`
Response fields: `GradeResponse`
- Xem `GradeResponse` ở endpoint GET bảng điểm.
Frontend dùng cho màn hình nào: `teacher.grades`.
Ghi chú: Backend tự set `request.enrollmentId = enrollmentId`; FE vẫn nên gửi `enrollmentId` để khớp DTO. Chỉ giảng viên dạy lớp gốc hoặc lớp thi lại hợp lệ được nhập điểm. Lớp đã đóng không được sửa điểm.

### POST /api/teacher/grades/class/{classSectionId}/lock
Mục đích: Khóa điểm toàn bộ lớp học phần.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: `classSectionId: number`.
Query: Không.
Body: Không.
Response fields: `string`
- Ví dụ: `"Đã khóa điểm lớp 1"`
Frontend dùng cho màn hình nào: `teacher.grades`.
Ghi chú: Backend set `gradeLocked = true` trên class section. Chỉ giảng viên dạy lớp được khóa.

### GET /api/teacher/classes/{classSectionId}/attendance-sessions
Mục đích: Lấy danh sách buổi điểm danh của một lớp.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: `classSectionId: number`.
Query: Không.
Body: Không.
Response fields: `AttendanceSessionResponse[]`
- `id`, `classSectionId`, `sessionNumber`, `weekNumber`, `meetingIndex`, `sessionDate`, `locked`, `records`
Frontend dùng cho màn hình nào: `teacher.attendance`.
Ghi chú: Không tự tạo buổi mới; chỉ trả các session đã tồn tại.

### GET /api/teacher/classes/{classSectionId}/attendance-sessions/{sessionNumber}
Mục đích: Lấy hoặc tạo buổi điểm danh theo số thứ tự.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: `classSectionId: number`, `sessionNumber: number`.
Query: Không.
Body: Không.
Response fields: `AttendanceSessionResponse`
- `id`, `classSectionId`, `sessionNumber`, `weekNumber`, `meetingIndex`, `sessionDate`, `locked`, `records`
Frontend dùng cho màn hình nào: `teacher.attendance`.
Ghi chú: Nếu session chưa tồn tại, backend tạo session rỗng.

### PUT /api/teacher/classes/{classSectionId}/attendance-sessions/{sessionNumber}/records
Mục đích: Lưu hàng loạt bản ghi điểm danh cho một buổi.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: `classSectionId: number`, `sessionNumber: number`.
Query: Không.
Body: `AttendanceRecordRequest[]`
- `enrollmentId`, `status`, `note`
Response fields: `AttendanceSessionResponse`
- `id`, `classSectionId`, `sessionNumber`, `weekNumber`, `meetingIndex`, `sessionDate`, `locked`, `records`
Frontend dùng cho màn hình nào: `teacher.attendance`.
Ghi chú: `status` nhận `PRESENT | LATE | ABSENT`. Nếu session đã khóa, backend trả lỗi.

### POST /api/teacher/classes/{classSectionId}/attendance-sessions/{sessionNumber}/lock
Mục đích: Khóa một buổi điểm danh, không cho sửa thêm.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: `classSectionId: number`, `sessionNumber: number`.
Query: Không.
Body: Không.
Response fields: `AttendanceSessionResponse`
- `id`, `classSectionId`, `sessionNumber`, `weekNumber`, `meetingIndex`, `sessionDate`, `locked`, `records`
Frontend dùng cho màn hình nào: `teacher.attendance`.
Ghi chú: Nếu session chưa tồn tại, backend tạo session rồi khóa.

### GET /api/teacher/notifications
Mục đích: Lấy danh sách thông báo của giảng viên.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `NotificationResponse[]`
- `id`, `type`, `title`, `body`, `link`, `read`, `createdAt`
Frontend dùng cho màn hình nào: notification dropdown trong layout, trang thông báo giảng viên nếu có.
Ghi chú: `type` nhận `SCHOOL | CHAT`.

### POST /api/teacher/notifications/{notificationId}/read
Mục đích: Đánh dấu một thông báo đã đọc.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: `notificationId: string`.
Query: Không.
Body: Không.
Response fields: `void` (`204 No Content`).
Frontend dùng cho màn hình nào: notification dropdown, trang thông báo giảng viên nếu có.
Ghi chú: Invalidate query `["teacher", "notifications"]` sau khi thành công.

### POST /api/teacher/notifications/read-all
Mục đích: Đánh dấu tất cả thông báo của giảng viên đã đọc.
Auth/Role: Bearer JWT, role `TEACHER`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `void` (`204 No Content`).
Frontend dùng cho màn hình nào: trang thông báo giảng viên nếu có.
Ghi chú: Invalidate query `["teacher", "notifications"]` sau khi thành công.

## API liên quan cần dùng cho hồ sơ giảng viên

Backend hiện không có endpoint `/api/teacher/profile`. Màn hình hồ sơ giảng viên nên dùng API dùng chung sau:

### GET /api/users/me
Mục đích: Lấy hồ sơ người dùng hiện tại; với role `TEACHER` trả thông tin giảng viên.
Auth/Role: Bearer JWT, mọi role đã đăng nhập.
Params: Không.
Query: Không.
Body: Không.
Response fields: `UserProfileResponse`
- Chung: `username`, `email`, `role`, `fullName`, `code`, `majorOrDegree`, `avatarUrl`
- Cá nhân: `gender`, `dateOfBirth`, `age`, `nationalId`, `placeOfBirth`, `hometown`, `permanentAddress`, `currentAddress`, `phone`, `emergencyContact`
- Teacher: `department`
Frontend dùng cho màn hình nào: `teacher.profile`.
Ghi chú: `majorOrDegree` là học vị của giảng viên; `code` là mã giảng viên.

## TypeScript interfaces

```ts
export type Role = "STUDENT" | "TEACHER" | "ADMIN";
export type CourseType = "REQUIRED" | "ELECTIVE";
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT";
export type NotificationType = "SCHOOL" | "CHAT";
export type CourseStudyStatus =
  | "IN_PROGRESS"
  | "PASSED"
  | "BANNED_FROM_EXAM"
  | "REPEAT_COURSE"
  | "RETAKE_EXAM"
  | string;

export interface StudentSemesterResponse {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  registrationOpen: boolean;
  locked: boolean;
}

export interface ClassSectionScheduleResponse {
  id: number;
  dayOfWeek: number;
  startPeriodId: number | null;
  startPeriod: number;
  endPeriodId: number | null;
  endPeriod: number;
  lessonCount: number | null;
  periodRange: string | null;
  startTime: string | null;
  endTime: string | null;
  roomId: number | null;
  roomName: string | null;
}

export interface ClassSectionResponse {
  id: number;
  classCode: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  courseType: CourseType | null;
  courseTypeLabel: string | null;
  credits: number;
  semesterId: number;
  semesterName: string;
  teacherId: number | null;
  teacherName: string | null;
  room: string | null;
  roomId: number | null;
  roomCapacity: number | null;
  schedules: ClassSectionScheduleResponse[];
  maxSlots: number | null;
  currentSlots: number | null;
  closed: boolean;
  gradeLocked: boolean;
}

export interface GradeRequest {
  enrollmentId: number;
  participationScore?: number | null;
  midTermScore?: number | null;
  finalScore?: number | null;
  retestScore?: number | null;
}

export interface TeacherStudentGradeResponse {
  enrollmentId: number;
  studentCode: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  className: string | null;
  advisorName: string | null;
  majorName: string | null;
  facultyName: string | null;
  midTermScore: number | null;
  finalScore: number | null;
  totalScore: number | null;
  status: "REGISTERED" | "PASSED" | "FAILED" | "CANCELED" | string;
  courseStatus: CourseStudyStatus | null;
  absenceCount: number | null;
}

export interface GradeResponse {
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
  participationScore: number | null;
  midtermScore: number | null;
  finalScore: number | null;
  retestScore: number | null;
  attemptNumber: number | null;
  enrollmentType: string | null;
  totalScore: number | null;
  letterGrade: string | null;
  gpa4: number | null;
  gradePoint: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  courseStatus: CourseStudyStatus | null;
  absenceCount: number | null;
}

export interface AttendanceRecordRequest {
  enrollmentId: number;
  status: AttendanceStatus;
  note?: string | null;
}

export interface AttendanceRecordResponse {
  id: number;
  enrollmentId: number;
  studentCode: string;
  studentName: string;
  status: AttendanceStatus | null;
  note: string | null;
}

export interface AttendanceSessionResponse {
  id: number;
  classSectionId: number;
  sessionNumber: number;
  weekNumber: number | null;
  meetingIndex: number | null;
  sessionDate: string | null;
  locked: boolean;
  records: AttendanceRecordResponse[];
}

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface UserProfileResponse {
  username: string;
  email: string | null;
  role: Role | string;
  fullName: string | null;
  code: string | null;
  majorOrDegree: string | null;
  avatarUrl: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  age: number | null;
  nationalId: string | null;
  placeOfBirth: string | null;
  hometown: string | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  phone: string | null;
  emergencyContact: string | null;
  cohort: string | null;
  className: string | null;
  academicYear: string | null;
  advisor: string | null;
  status: string | null;
  trainingType: string | null;
  department: string | null;
}
```

## Đề xuất `teacherApi` cho FE

```ts
import { apiRequest, jsonBody } from "@/lib/api/client";
import type {
  AttendanceRecordRequest,
  AttendanceSessionResponse,
  ClassSectionResponse,
  GradeRequest,
  GradeResponse,
  NotificationResponse,
  StudentSemesterResponse,
  TeacherStudentGradeResponse,
  UserProfileResponse,
} from "@/lib/api/types";

export const teacherApi = {
  getProfile: () => apiRequest<UserProfileResponse>("/api/users/me"),

  listSemesters: () =>
    apiRequest<StudentSemesterResponse[]>("/api/teacher/semesters"),

  listMyClasses: (semesterId: number) =>
    apiRequest<ClassSectionResponse[]>(
      `/api/teacher/my-classes/semester/${semesterId}`,
    ),

  listClassStudents: (classSectionId: number) =>
    apiRequest<TeacherStudentGradeResponse[]>(
      `/api/teacher/classes/${classSectionId}/students`,
    ),

  updateStudentGradeLegacy: (enrollmentId: number, request: GradeRequest) =>
    apiRequest<TeacherStudentGradeResponse>(
      `/api/teacher/enrollments/${enrollmentId}/grade`,
      { method: "PUT", body: jsonBody(request) },
    ),

  getClassGrades: (classSectionId: number) =>
    apiRequest<GradeResponse[]>(`/api/teacher/grades/class/${classSectionId}`),

  updateGrade: (enrollmentId: number, request: GradeRequest) =>
    apiRequest<GradeResponse>(`/api/teacher/grades/${enrollmentId}`, {
      method: "PUT",
      body: jsonBody(request),
    }),

  lockClassGrades: (classSectionId: number) =>
    apiRequest<string>(`/api/teacher/grades/class/${classSectionId}/lock`, {
      method: "POST",
    }),

  getAttendanceSessions: (classSectionId: number) =>
    apiRequest<AttendanceSessionResponse[]>(
      `/api/teacher/classes/${classSectionId}/attendance-sessions`,
    ),

  getAttendanceSession: (classSectionId: number, sessionNumber: number) =>
    apiRequest<AttendanceSessionResponse>(
      `/api/teacher/classes/${classSectionId}/attendance-sessions/${sessionNumber}`,
    ),

  saveAttendanceRecords: (
    classSectionId: number,
    sessionNumber: number,
    records: AttendanceRecordRequest[],
  ) =>
    apiRequest<AttendanceSessionResponse>(
      `/api/teacher/classes/${classSectionId}/attendance-sessions/${sessionNumber}/records`,
      { method: "PUT", body: jsonBody(records) },
    ),

  lockAttendanceSession: (classSectionId: number, sessionNumber: number) =>
    apiRequest<AttendanceSessionResponse>(
      `/api/teacher/classes/${classSectionId}/attendance-sessions/${sessionNumber}/lock`,
      { method: "POST" },
    ),

  listNotifications: () =>
    apiRequest<NotificationResponse[]>("/api/teacher/notifications"),

  markNotificationAsRead: (notificationId: string) =>
    apiRequest<void>(`/api/teacher/notifications/${notificationId}/read`, {
      method: "POST",
    }),

  markAllNotificationsAsRead: () =>
    apiRequest<void>("/api/teacher/notifications/read-all", {
      method: "POST",
    }),
};
```

