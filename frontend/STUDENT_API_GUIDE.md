# Student API Guide

Generated from live local OpenAPI `http://localhost:8080/v3/api-docs/student-operations`, backend Swagger/OpenAPI configuration, and student-related controllers/DTOs.

## Swagger/OpenAPI Configuration

- Config file: `backend/src/main/java/com/example/ThangLongUniversityWeb/config/OpenApiConfig.java`
- Dependency: `org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.3` in `backend/build.gradle.kts`
- Swagger UI path: `http://localhost:8080/swagger-ui.html` or `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON path: `http://localhost:8080/v3/api-docs`
- Student OpenAPI group JSON path: `http://localhost:8080/v3/api-docs/student-operations`
- Student group config: `GroupedOpenApi` with `group("student-operations")`, `displayName("Student Operations")`, `pathsToMatch("/api/student/**")`
- Auth scheme in Swagger: `bearerAuth`, HTTP bearer JWT in `Authorization: Bearer <accessToken>`
- Cookie usage: refresh token is configured as cookie `refresh_token`, but student APIs use Bearer JWT access token. `SecurityConfig` is stateless and disables form login/basic auth.
- Public exception: `GET /api/student/tuition/vnpay-return` is `permitAll`; all other `/api/student/**` endpoints require role `STUDENT`.

## Student API Inventory

### GET /api/student/profile

Mục đích: Lấy hồ sơ sinh viên đang đăng nhập.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: Không có.

Body: Không có.

Response fields: `UserProfileResponse` gồm `username`, `email`, `role`, `fullName`, `code`, `majorOrDegree`, `avatarUrl`, `gender`, `dateOfBirth`, `age`, `nationalId`, `placeOfBirth`, `hometown`, `permanentAddress`, `currentAddress`, `phone`, `emergencyContact`, `cohort`, `className`, `academicYear`, `advisor`, `status`, `trainingType`, `department`.

Frontend dùng cho màn hình nào: `/student/profile`, `/student/dashboard`.

Ghi chú: Backend trả `studentService.getProfileByUsername(authentication.getName())`.

### GET /api/student/dashboard

Mục đích: Lấy dữ liệu tổng hợp cho dashboard sinh viên.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: `semesterId?: number`.

Body: Không có.

Response fields: `StudentDashboardResponse` gồm `profile`, `currentSemester`, `learningResults`, `grades`, `tuition`, `schedule`, `todaySchedule`, `exams`, `upcomingExams`, `semesterGpa`, `cumulativeGpa`, `registeredCredits`, `earnedCredits`, `gradedCourseCount`, `activeCourseCount`, `upcomingExamCount`, `tuitionRemaining`, `tuitionStatus`, `registrationStatus`.

Frontend dùng cho màn hình nào: `/student/dashboard`.

Ghi chú: Nếu không truyền `semesterId`, backend tự chọn học kỳ hiện tại, học kỳ đang mở đăng ký, hoặc học kỳ gần nhất.

### GET /api/student/semesters

Mục đích: Lấy danh sách học kỳ cho sinh viên.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: Không có.

Body: Không có.

Response fields: `StudentSemesterResponse[]` gồm `id`, `name`, `startDate`, `endDate`, `registrationOpen`, `locked`.

Frontend dùng cho màn hình nào: Bộ lọc học kỳ ở `/student/dashboard`, `/student/course-registration`, `/student/schedule`, `/student/exams`, `/student/grades`, `/student/academic-results`, `/student/tuition`, `/student/retake-registration`.

Ghi chú: Backend sort theo `startDate` tăng dần.

### GET /api/student/classes/semester/{semesterId}

Mục đích: Xem danh sách lớp học phần trong một học kỳ.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: `semesterId: number`.

Query: Không có.

Body: Không có.

Response fields: `ClassSectionResponse[]` gồm `id`, `classCode`, `courseId`, `courseCode`, `courseName`, `courseType`, `courseTypeLabel`, `credits`, `semesterId`, `semesterName`, `teacherId`, `teacherName`, `room`, `roomId`, `roomCapacity`, `schedules`, `maxSlots`, `currentSlots`, `closed`/`isClosed`, `gradeLocked`.

Frontend dùng cho màn hình nào: `/student/course-registration`.

Ghi chú: `schedules[].dayOfWeek` dùng convention backend `2-8` tương ứng Thứ 2 đến Chủ nhật.

### POST /api/student/enroll/{classSectionId}

Mục đích: Đăng ký vào một lớp học phần.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: `classSectionId: number`.

Query: Không có.

Body: Không có.

Response fields: `EnrollmentRequestResponse` gồm `requestId`, `message`.

Frontend dùng cho màn hình nào: `/student/course-registration`.

Ghi chú: Endpoint trả request id để FE poll trạng thái ở `/api/student/enrollments/status/{requestId}`.

### DELETE /api/student/enroll/{classSectionId}

Mục đích: Hủy đăng ký lớp học phần.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: `classSectionId: number`.

Query: Không có.

Body: Không có.

Response fields: `string`.

Frontend dùng cho màn hình nào: `/student/course-registration`, có thể dùng trong lịch học nếu cho hủy nhanh.

Ghi chú: Chỉ nên invalidate query `["student", "enrollments", semesterId]`, `["student", "classes", semesterId]`, `["student", "schedule", semesterId]`.

### GET /api/student/enrollments/selected

Mục đích: Lấy danh sách học phần đang chọn trong một học kỳ.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: `semesterId: number`.

Body: Không có.

Response fields: `EnrollmentResponse[]` gồm `enrollmentId`, `classSectionId`, `courseCode`, `classCode`, `courseName`, `credits`, `room`, `schedules`, `dayOfWeek`, `startPeriod`, `endPeriod`, `teacherName`, `teacherCode`, `teacherEmail`, `midTermScore`, `finalScore`, `totalScore`, `status`.

Frontend dùng cho màn hình nào: `/student/course-registration`.

Ghi chú: Query key phải chứa `semesterId`.

### GET /api/student/enrollments/status/{requestId}

Mục đích: Kiểm tra trạng thái xử lý đăng ký học phần.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: `requestId: string`.

Query: Không có.

Body: Không có.

Response fields: `EnrollmentRequestStatusResponse` gồm `requestId`, `status`, `message`.

Frontend dùng cho màn hình nào: `/student/course-registration`.

Ghi chú: `status` theo Swagger gồm `PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`.

### GET /api/student/my-schedule/{semesterId}

Mục đích: Xem thời khóa biểu cá nhân trong một học kỳ.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: `semesterId: number`.

Query: Không có.

Body: Không có.

Response fields: `EnrollmentResponse[]`.

Frontend dùng cho màn hình nào: `/student/schedule`, `/student/dashboard`.

Ghi chú: Lịch chi tiết nằm trong `schedules`; các field `dayOfWeek`, `startPeriod`, `endPeriod`, `room` là field phẳng để tương thích UI.

### GET /api/student/grades

Mục đích: Xem điểm tổng hợp.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: `semesterId?: number`.

Body: Không có.

Response fields: `StudentGradesSummaryResponse` gồm `semesterId`, `semesterGpa`, `cumulativeGpa`, `items`; `items[]` gồm `enrollmentId`, `semesterId`, `semesterName`, `classCode`, `courseName`, `credits`, `totalScore`, `gradePoint`.

Frontend dùng cho màn hình nào: `/student/grades`, `/student/dashboard`.

Ghi chú: Đây là endpoint FE nên ưu tiên cho bảng điểm summary hiện tại.

### GET /api/student/grades/semester/{semesterId}

Mục đích: Lấy bảng điểm theo học kỳ.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: `semesterId: number`.

Query: Không có.

Body: Không có.

Response fields: `GradeResponse[]` gồm `id`, `enrollmentId`, `studentId`, `studentCode`, `studentName`, `courseId`, `courseCode`, `classCode`, `courseName`, `credits`, `semesterId`, `semesterName`, `participationScore`, `midtermScore`, `finalScore`, `retestScore`, `attemptNumber`, `enrollmentType`, `totalScore`, `letterGrade`, `gpa4`, `gradePoint`, `createdAt`, `updatedAt`, `courseStatus`, `absenceCount`.

Frontend dùng cho màn hình nào: `/student/grades` nếu cần bảng điểm chi tiết hơn summary.

Ghi chú: Endpoint nằm trong `StudentGradeController`, trùng namespace với `GET /api/student/grades` nhưng khác path con.

### GET /api/student/grades/my-grades

Mục đích: Lấy bảng điểm tất cả học kỳ.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: Không có.

Body: Không có.

Response fields: `GradeResponse[]`.

Frontend dùng cho màn hình nào: `/student/grades`, `/student/academic-results`.

Ghi chú: Dùng khi cần raw grade history thay vì summary GPA.

### GET /api/student/exams

Mục đích: Xem lịch thi theo học kỳ.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: `semesterId: number`.

Body: Không có.

Response fields: `StudentExamResponse[]` gồm `classCode`, `courseName`, `credits`, `examAt`, `examRoom`.

Frontend dùng cho màn hình nào: `/student/exams`, `/student/dashboard`.

Ghi chú: `examAt` format `yyyy-MM-dd'T'HH:mm:ss`.

### GET /api/student/tuition/{semesterId}

Mục đích: Xem hóa đơn học phí.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: `semesterId: number`.

Query: Không có.

Body: Không có.

Response fields: `TuitionResponse` gồm `semesterName`, `totalCredits`, `totalAmount`, `pricePerCredit`, `paid`, `items`; `items[]` gồm `feeType`, `courseCode`, `courseName`, `credits`, `pricePerCredit`, `subtotal`.

Frontend dùng cho màn hình nào: `/student/tuition`, `/student/dashboard`.

Ghi chú: Java field là `isPaid`; JSON property theo JavaBean/Jackson thường là `paid`.

### POST /api/student/tuition/{semesterId}/vnpay-url

Mục đích: Tạo link thanh toán VNPAY.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: `semesterId: number`.

Query: Không có.

Body: Không có.

Response fields: `string` là URL thanh toán VNPAY.

Frontend dùng cho màn hình nào: `/student/tuition`.

Ghi chú: FE redirect user sang URL trả về. Không dùng `window.location` trong route navigation nội bộ, nhưng redirect ra payment gateway là external navigation hợp lệ.

### GET /api/student/tuition/vnpay-return

Mục đích: Nhận kết quả trả về từ VNPAY.

Auth/Role: Public theo `SecurityConfig.permitAll()`.

Params: Không có.

Query: Các query params do VNPAY gửi về, backend đọc từ `HttpServletRequest`.

Body: Không có.

Response fields: `string` là kết quả xử lý thanh toán.

Frontend dùng cho màn hình nào: Không nhất thiết gọi bằng SPA; đây là return URL backend.

Ghi chú: `vnpay.return-url=http://localhost:8080/api/student/tuition/vnpay-return` trong `application.properties`.

### GET /api/student/curriculum

Mục đích: Chương trình đào tạo - tất cả môn học trong trường.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: Không có.

Body: Không có.

Response fields: `CourseResponse[]` gồm `id`, `code`, `name`, `credits`, `description`, `courseType`, `courseTypeLabel`, `majorName`, `prerequisiteNames`.

Frontend dùng cho màn hình nào: `/student/curriculum`.

Ghi chú: Nếu màn hình chỉ cần ngành của sinh viên, ưu tiên `/api/student/curriculum/my-major`.

### GET /api/student/curriculum/my-major

Mục đích: Chương trình đào tạo - môn học theo ngành của sinh viên đang đăng nhập.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: Không có.

Body: Không có.

Response fields: `CourseResponse[]`.

Frontend dùng cho màn hình nào: `/student/curriculum`.

Ghi chú: Backend resolve ngành từ username trong JWT.

### GET /api/student/learning-results

Mục đích: Kết quả học tập tổng hợp gồm bảng điểm và GPA/CPA, có thể lọc theo học kỳ.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: `semesterId?: number`.

Body: Không có.

Response fields: `LearningResultsResponse` gồm `semesterId`, `semesterName`, `semesterGpa`, `cumulativeGpa`, `semesterCredits`, `cumulativeCredits`, `grades`, `semesterSummaries`; `grades[]` là `GradeResponse`; `semesterSummaries[]` gồm `semesterId`, `semesterName`, `semesterGpa`, `cumulativeGpa`, `totalCredits`, `cumulativeCredits`.

Frontend dùng cho màn hình nào: `/student/academic-results`, `/student/dashboard`.

Ghi chú: Đây là endpoint tốt nhất cho màn hình kết quả học tập vì có cả lịch sử GPA/CPA.

### GET /api/student/academic-results/my-results

Mục đích: Sinh viên xem kết quả học tập của mình từ entity `AcademicResult`.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: Không có.

Body: Không có.

Response fields: `AcademicResultResponse[]` gồm `id`, `student`, `semester`, `semesterGpa`, `cumulativeGpa`, `totalCredits`, `cumulativeCredits`, `calculatedAt`.

Frontend dùng cho màn hình nào: `/student/academic-results` nếu cần raw academic result entity.

Ghi chú: Endpoint trả JPA entity thay vì DTO; FE nên ưu tiên `/api/student/learning-results` để tránh contract phức tạp/lazy relation.

### GET /api/student/retakes/eligible-courses

Mục đích: Lấy danh sách môn đủ điều kiện thi lại hoặc thi nâng điểm.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: `semesterId?: number`.

Body: Không có.

Response fields: `RetakeEligibleCourseResponse[]` gồm `gradeId`, `enrollmentId`, `courseId`, `courseCode`, `courseName`, `credits`, `previousTotalScore`, `previousAttemptNumber`, `registrationType`, `retakeFee`.

Frontend dùng cho màn hình nào: `/student/retake-registration`.

Ghi chú: `registrationType` hiện là string, backend comment dùng `RETAKE` hoặc `IMPROVE`.

### POST /api/student/retakes/register

Mục đích: Đăng ký thi lại hoặc thi nâng điểm.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: Không có.

Body: `RetakeRegistrationRequest` gồm `semesterId`, `courseIds`.

Response fields: `RetakeRegistrationResponse` gồm `registeredCourses`, `totalFee`, `registeredCount`; `registeredCourses[]` gồm `courseId`, `courseCode`, `courseName`, `credits`, `registrationType`, `attemptNumber`, `feeCharged`, `examAt`, `examRoom`.

Frontend dùng cho màn hình nào: `/student/retake-registration`.

Ghi chú: Sau success invalidate `["student", "retakes"]`, `["student", "tuition", semesterId]`, `["student", "exams", semesterId]` nếu các màn hình phụ thuộc.

### DELETE /api/student/retakes/{examRegistrationId}

Mục đích: Bỏ chọn đăng ký thi lại/nâng điểm đang `PENDING`.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: `examRegistrationId: number`.

Query: Không có.

Body: Không có.

Response fields: `string`.

Frontend dùng cho màn hình nào: `/student/retake-registration`.

Ghi chú: Chỉ hủy các đăng ký còn hợp lệ theo logic backend.

### GET /api/student/retakes/my-requests

Mục đích: Lấy danh sách đăng ký thi lại hoặc nâng điểm của sinh viên.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: `semesterId?: number`.

Body: Không có.

Response fields: `RetakeRequestResponse[]` gồm `enrollmentId`, `classSectionId`, `classCode`, `courseId`, `courseCode`, `courseName`, `semesterId`, `semesterName`, `status`, `enrollmentType`, `attemptNumber`, `totalScore`.

Frontend dùng cho màn hình nào: `/student/retake-registration`.

Ghi chú: Query key phải chứa `semesterId` khi có filter.

### GET /api/student/notifications

Mục đích: Lấy danh sách thông báo của sinh viên.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: Không có.

Body: Không có.

Response fields: `NotificationResponse[]` gồm `id`, `type`, `title`, `body`, `link`, `read`, `createdAt`.

Frontend dùng cho màn hình nào: `/student/notifications`, header notification menu nếu có.

Ghi chú: `type` hiện gồm `SCHOOL`, `CHAT`.

### POST /api/student/notifications/{notificationId}/read

Mục đích: Đánh dấu một thông báo đã đọc.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: `notificationId: string`.

Query: Không có.

Body: Không có.

Response fields: `void` (`204 No Content`).

Frontend dùng cho màn hình nào: `/student/notifications`, header notification menu nếu có.

Ghi chú: Sau success invalidate `["student", "notifications"]`.

### POST /api/student/notifications/read-all

Mục đích: Đánh dấu tất cả thông báo đã đọc.

Auth/Role: Bearer JWT, role `STUDENT`.

Params: Không có.

Query: Không có.

Body: Không có.

Response fields: `void` (`204 No Content`).

Frontend dùng cho màn hình nào: `/student/notifications`, header notification menu nếu có.

Ghi chú: Sau success invalidate `["student", "notifications"]`.

## TypeScript Interfaces

```ts
export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type CourseType = "REQUIRED" | "ELECTIVE";
export type EnrollmentStatus = "PENDING" | "REGISTERED" | "CANCELED" | "PASSED" | "FAILED";
export type EnrollmentType = "ORDINARY" | "RETAKE" | "IMPROVE";
export type RetakeRegistrationType = "RETAKE" | "IMPROVE";
export type EnrollmentRequestStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
export type NotificationType = "SCHOOL" | "CHAT";
export type CourseStudyStatus =
  | "IN_PROGRESS"
  | "PASSED"
  | "BANNED_FROM_EXAM"
  | "REPEAT_COURSE"
  | "RETAKE_EXAM";

export interface UserProfileResponse {
  username: string;
  email: string;
  role: Role;
  fullName: string;
  code?: string | null;
  majorOrDegree?: string | null;
  avatarUrl?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  age?: number | null;
  nationalId?: string | null;
  placeOfBirth?: string | null;
  hometown?: string | null;
  permanentAddress?: string | null;
  currentAddress?: string | null;
  phone?: string | null;
  emergencyContact?: string | null;
  cohort?: string | null;
  className?: string | null;
  academicYear?: string | null;
  advisor?: string | null;
  status?: string | null;
  trainingType?: string | null;
  department?: string | null;
}

export interface StudentSemesterResponse {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  registrationOpen: boolean;
  locked: boolean;
}

export interface ClassSectionScheduleResponse {
  id: number;
  dayOfWeek: number;
  startPeriodId: number;
  startPeriod: number;
  endPeriodId: number;
  endPeriod: number;
  lessonCount?: number | null;
  periodRange?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  roomId?: number | null;
  roomName?: string | null;
}

export interface ClassSectionResponse {
  id: number;
  classCode: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  courseType?: CourseType | null;
  courseTypeLabel?: string | null;
  credits: number;
  semesterId: number;
  semesterName: string;
  teacherId?: number | null;
  teacherName?: string | null;
  room?: string | null;
  roomId?: number | null;
  roomCapacity?: number | null;
  schedules: ClassSectionScheduleResponse[];
  maxSlots?: number | null;
  currentSlots?: number | null;
  closed?: boolean;
  isClosed?: boolean;
  gradeLocked?: boolean;
}

export interface EnrollmentRequestResponse {
  requestId?: string | null;
  message: string;
}

export interface EnrollmentRequestStatusResponse {
  requestId: string;
  status: EnrollmentRequestStatus | string;
  message?: string | null;
}

export interface EnrollmentResponse {
  enrollmentId: number;
  classSectionId?: number | null;
  courseCode?: string | null;
  classCode: string;
  courseName: string;
  credits: number;
  room?: string | null;
  schedules?: ClassSectionScheduleResponse[] | null;
  dayOfWeek?: number | null;
  startPeriod?: number | null;
  endPeriod?: number | null;
  teacherName?: string | null;
  teacherCode?: string | null;
  teacherEmail?: string | null;
  midTermScore?: number | null;
  finalScore?: number | null;
  totalScore?: number | null;
  status?: EnrollmentStatus | string | null;
}

export interface StudentGradeItemResponse {
  enrollmentId: number;
  semesterId: number;
  semesterName: string;
  classCode: string;
  courseName: string;
  credits: number;
  totalScore?: number | null;
  gradePoint?: number | null;
}

export interface StudentGradesSummaryResponse {
  semesterId?: number | null;
  semesterGpa: number;
  cumulativeGpa: number;
  items: StudentGradeItemResponse[];
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
  participationScore?: number | null;
  midtermScore?: number | null;
  finalScore?: number | null;
  retestScore?: number | null;
  attemptNumber?: number | null;
  enrollmentType?: EnrollmentType | string | null;
  totalScore?: number | null;
  letterGrade?: string | null;
  gpa4?: number | null;
  gradePoint?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  courseStatus?: CourseStudyStatus | string | null;
  absenceCount?: number | null;
}

export interface SemesterGpaSummary {
  semesterId: number;
  semesterName: string;
  semesterGpa?: number | null;
  cumulativeGpa?: number | null;
  totalCredits?: number | null;
  cumulativeCredits?: number | null;
}

export interface LearningResultsResponse {
  semesterId?: number | null;
  semesterName?: string | null;
  semesterGpa?: number | null;
  cumulativeGpa?: number | null;
  semesterCredits?: number | null;
  cumulativeCredits?: number | null;
  grades: GradeResponse[];
  semesterSummaries: SemesterGpaSummary[];
}

export interface StudentExamResponse {
  classCode: string;
  courseName: string;
  credits: number;
  examAt?: string | null;
  examRoom?: string | null;
}

export interface TuitionItemResponse {
  feeType?: "COURSE" | "RETAKE" | string | null;
  courseCode: string;
  courseName: string;
  credits: number;
  pricePerCredit: number;
  subtotal: number;
}

export interface TuitionResponse {
  semesterName: string;
  totalCredits: number;
  totalAmount: number;
  pricePerCredit: number;
  paid: boolean;
  items: TuitionItemResponse[];
}

export interface CourseResponse {
  id: number;
  code: string;
  name: string;
  credits: number;
  description?: string | null;
  courseType?: CourseType | null;
  courseTypeLabel?: string | null;
  majorName?: string | null;
  prerequisiteNames?: string[];
}

export interface StudentDashboardResponse {
  profile: UserProfileResponse;
  currentSemester?: StudentSemesterResponse | null;
  learningResults?: LearningResultsResponse | null;
  grades?: StudentGradesSummaryResponse | null;
  tuition?: TuitionResponse | null;
  schedule?: EnrollmentResponse[];
  todaySchedule?: EnrollmentResponse[];
  exams?: StudentExamResponse[];
  upcomingExams?: StudentExamResponse[];
  semesterGpa: number;
  cumulativeGpa: number;
  registeredCredits: number;
  earnedCredits: number;
  gradedCourseCount: number;
  activeCourseCount: number;
  upcomingExamCount: number;
  tuitionRemaining: number;
  tuitionStatus: string;
  registrationStatus: string;
}

export interface AcademicResultStudentRef {
  id: number;
  studentCode: string;
  fullName: string;
  dob?: string | null;
  gender?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  placeOfBirth?: string | null;
  hometown?: string | null;
  permanentAddress?: string | null;
  currentAddress?: string | null;
  emergencyContact?: string | null;
  address?: string | null;
  cohort?: string | null;
  className?: string | null;
  advisor?: string | null;
  status?: string | null;
  trainingType?: string | null;
  academicYear?: number | null;
}

export interface AcademicResultSemesterRef {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  registrationOpen?: boolean;
  locked?: boolean;
}

export interface AcademicResultResponse {
  id: number;
  student?: AcademicResultStudentRef | null;
  semester?: AcademicResultSemesterRef | null;
  semesterGpa?: number | null;
  cumulativeGpa?: number | null;
  totalCredits?: number | null;
  cumulativeCredits?: number | null;
  calculatedAt?: string | null;
}

export interface RetakeEligibleCourseResponse {
  gradeId: number;
  enrollmentId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  previousTotalScore: number;
  previousAttemptNumber?: number | null;
  registrationType: RetakeRegistrationType | string;
  retakeFee: number;
}

export interface RetakeRegistrationRequest {
  semesterId?: number | null;
  courseIds: number[];
}

export interface RetakeRegisteredItemResponse {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  registrationType: RetakeRegistrationType | string;
  attemptNumber: number;
  feeCharged: number;
  examAt?: string | null;
  examRoom?: string | null;
}

export interface RetakeRegistrationResponse {
  registeredCourses: RetakeRegisteredItemResponse[];
  totalFee: number;
  registeredCount: number;
}

export interface RetakeRequestResponse {
  enrollmentId: number;
  classSectionId: number;
  classCode: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  semesterId: number;
  semesterName: string;
  status?: EnrollmentStatus | string | null;
  enrollmentType?: EnrollmentType | string | null;
  attemptNumber?: number | null;
  totalScore?: number | null;
}

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}
```

## Suggested `studentApi`

```ts
import { apiRequest, jsonBody } from "@/lib/api/client";
import type {
  AcademicResultResponse,
  ClassSectionResponse,
  CourseResponse,
  EnrollmentRequestResponse,
  EnrollmentRequestStatusResponse,
  EnrollmentResponse,
  GradeResponse,
  LearningResultsResponse,
  NotificationResponse,
  RetakeEligibleCourseResponse,
  RetakeRegistrationRequest,
  RetakeRegistrationResponse,
  RetakeRequestResponse,
  StudentDashboardResponse,
  StudentExamResponse,
  StudentGradesSummaryResponse,
  StudentSemesterResponse,
  TuitionResponse,
  UserProfileResponse,
} from "@/lib/api/types";

const optionalSemesterQuery = (semesterId?: number | string | null) =>
  semesterId == null || semesterId === ""
    ? ""
    : `?semesterId=${encodeURIComponent(String(semesterId))}`;

export const studentApi = {
  getProfile: () => apiRequest<UserProfileResponse>("/api/student/profile"),

  getDashboard: (semesterId?: number | string | null) =>
    apiRequest<StudentDashboardResponse>(`/api/student/dashboard${optionalSemesterQuery(semesterId)}`),

  listSemesters: () => apiRequest<StudentSemesterResponse[]>("/api/student/semesters"),

  listAvailableClasses: (semesterId: number | string) =>
    apiRequest<ClassSectionResponse[]>(`/api/student/classes/semester/${semesterId}`),

  enrollClass: (classSectionId: number | string) =>
    apiRequest<EnrollmentRequestResponse>(`/api/student/enroll/${classSectionId}`, {
      method: "POST",
    }),

  cancelClass: (classSectionId: number | string) =>
    apiRequest<string>(`/api/student/enroll/${classSectionId}`, {
      method: "DELETE",
    }),

  listSelectedEnrollments: (semesterId: number | string) =>
    apiRequest<EnrollmentResponse[]>(
      `/api/student/enrollments/selected?semesterId=${encodeURIComponent(String(semesterId))}`,
    ),

  getEnrollmentStatus: (requestId: string) =>
    apiRequest<EnrollmentRequestStatusResponse>(
      `/api/student/enrollments/status/${encodeURIComponent(requestId)}`,
    ),

  getSchedule: (semesterId: number | string) =>
    apiRequest<EnrollmentResponse[]>(`/api/student/my-schedule/${semesterId}`),

  getGrades: (semesterId?: number | string | null) =>
    apiRequest<StudentGradesSummaryResponse>(`/api/student/grades${optionalSemesterQuery(semesterId)}`),

  listGradesBySemester: (semesterId: number | string) =>
    apiRequest<GradeResponse[]>(`/api/student/grades/semester/${semesterId}`),

  listAllGrades: () => apiRequest<GradeResponse[]>("/api/student/grades/my-grades"),

  getExams: (semesterId: number | string) =>
    apiRequest<StudentExamResponse[]>(
      `/api/student/exams?semesterId=${encodeURIComponent(String(semesterId))}`,
    ),

  getTuition: (semesterId: number | string) =>
    apiRequest<TuitionResponse>(`/api/student/tuition/${semesterId}`),

  createVNPayUrl: (semesterId: number | string) =>
    apiRequest<string>(`/api/student/tuition/${semesterId}/vnpay-url`, {
      method: "POST",
    }),

  getCurriculum: () => apiRequest<CourseResponse[]>("/api/student/curriculum"),

  getMyMajorCurriculum: () =>
    apiRequest<CourseResponse[]>("/api/student/curriculum/my-major"),

  getLearningResults: (semesterId?: number | string | null) =>
    apiRequest<LearningResultsResponse>(
      `/api/student/learning-results${optionalSemesterQuery(semesterId)}`,
    ),

  listAcademicResults: () =>
    apiRequest<AcademicResultResponse[]>("/api/student/academic-results/my-results"),

  listRetakeEligibleCourses: (semesterId?: number | string | null) =>
    apiRequest<RetakeEligibleCourseResponse[]>(
      `/api/student/retakes/eligible-courses${optionalSemesterQuery(semesterId)}`,
    ),

  registerRetakes: (request: RetakeRegistrationRequest) =>
    apiRequest<RetakeRegistrationResponse>("/api/student/retakes/register", {
      method: "POST",
      body: jsonBody(request),
    }),

  cancelRetake: (examRegistrationId: number | string) =>
    apiRequest<string>(`/api/student/retakes/${examRegistrationId}`, {
      method: "DELETE",
    }),

  listRetakeRequests: (semesterId?: number | string | null) =>
    apiRequest<RetakeRequestResponse[]>(
      `/api/student/retakes/my-requests${optionalSemesterQuery(semesterId)}`,
    ),

  listNotifications: () =>
    apiRequest<NotificationResponse[]>("/api/student/notifications"),

  markNotificationAsRead: (notificationId: string) =>
    apiRequest<void>(`/api/student/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: "POST",
    }),

  markAllNotificationsAsRead: () =>
    apiRequest<void>("/api/student/notifications/read-all", {
      method: "POST",
    }),
};
```

## Frontend Query Key Suggestions

- Profile: `["student", "profile"]`
- Dashboard: `["student", "dashboard", semesterId]`
- Semesters: `["student", "semesters"]`
- Available classes: `["student", "classes", semesterId]`
- Selected enrollments: `["student", "enrollments", "selected", semesterId]`
- Enrollment request status: `["student", "enrollments", "status", requestId]`
- Schedule: `["student", "schedule", semesterId]`
- Grades summary: `["student", "grades", semesterId]`
- Raw grades by semester: `["student", "grades", "semester", semesterId]`
- All raw grades: `["student", "grades", "all"]`
- Exams: `["student", "exams", semesterId]`
- Tuition: `["student", "tuition", semesterId]`
- Curriculum all: `["student", "curriculum"]`
- Curriculum by major: `["student", "curriculum", "my-major"]`
- Learning results: `["student", "learning-results", semesterId]`
- Retake eligible courses: `["student", "retakes", "eligible", semesterId]`
- Retake requests: `["student", "retakes", "requests", semesterId]`
- Notifications: `["student", "notifications"]`

## Notes

- `GET /api/student/academic-results/my-results` returns entity data, not a dedicated DTO. Prefer `GET /api/student/learning-results` for new FE work.
- `GET /api/student/grades` and `GET /api/student/grades/semester/{semesterId}` are different contracts. The former returns a summary DTO; the latter returns raw `GradeResponse[]`.
- `CourseResponse` in backend does not expose `majorId` or `prerequisiteIds`; current FE `types.ts` has those optional fields for admin compatibility.
- `StudentGradeItemResponse` backend currently contains no `participationScore`, `midtermScore`, or `finalScore`; use `GradeResponse` endpoints if those fields are required.
