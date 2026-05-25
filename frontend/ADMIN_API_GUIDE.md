# ADMIN_API_GUIDE.md

## Swagger/OpenAPI

- File cấu hình: `backend/src/main/java/com/example/ThangLongUniversityWeb/config/OpenApiConfig.java`
- Dependency: `backend/build.gradle.kts` dùng `org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.3`
- Swagger UI path:
  - `/swagger-ui/index.html`
  - `/swagger-ui.html`
- OpenAPI JSON path:
  - `/v3/api-docs`
  - `/v3/api-docs/admin-management` cho group `admin-management`
- Group admin:
  - `GroupedOpenApi.adminApi()`
  - `group("admin-management")`
  - `pathsToMatch("/api/admin/**")`
- Auth:
  - Swagger khai báo `bearerAuth`, HTTP Bearer JWT trong header `Authorization: Bearer <accessToken>`.
  - `SecurityConfig` yêu cầu `/api/admin/**` có role `ADMIN`.
  - Refresh token cookie có cấu hình trong backend, nhưng các API admin dùng access token Bearer, không dùng cookie trực tiếp.

## API Admin

### GET /api/admin/users
Mục đích: Lấy toàn bộ tài khoản hệ thống.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `AdminUserResponse[]`
- `id`, `username`, `passwordHash`, `email`, `role`, `active`
Frontend dùng cho màn hình nào: `admin.users`, dashboard quản trị tài khoản.
Ghi chú: Backend trả entity `User`; `student` và `teacher` bị `@JsonIgnore`. FE không nên hiển thị `passwordHash`.

### POST /api/admin/users/admin
Mục đích: Tạo tài khoản admin mới.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: `username: string`, `password: string`, `email: string`.
Body: Không.
Response fields: `AdminUserResponse`
- `id`, `username`, `passwordHash`, `email`, `role`, `active`
Frontend dùng cho màn hình nào: `admin.users`.
Ghi chú: Backend dùng `@RequestParam`, không nhận JSON body.

### PUT /api/admin/users/{id}/toggle-status
Mục đích: Khóa hoặc mở khóa một tài khoản.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: Không.
Response fields: `AdminUserResponse`
- `id`, `username`, `passwordHash`, `email`, `role`, `active`
Frontend dùng cho màn hình nào: `admin.users`.
Ghi chú: Khi khóa tài khoản, backend revoke refresh token trong Redis.

### DELETE /api/admin/users/admin/{id}
Mục đích: Xóa tài khoản admin.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.users`.
Ghi chú: Chỉ xóa được user role `ADMIN`; muốn xóa sinh viên/giảng viên dùng endpoint tương ứng.

### GET /api/admin/students
Mục đích: Lấy danh sách tất cả sinh viên.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `AdminStudentResponse[]`
- `id`, `username`, `email`, `studentCode`, `fullName`, `dob`, `gender`, `phone`, `nationalId`, `placeOfBirth`, `hometown`, `permanentAddress`, `currentAddress`, `emergencyContact`, `address`, `academicYear`, `cohort`, `className`, `advisor`, `status`, `trainingType`, `majorId`, `majorName`, `majorCode`
Frontend dùng cho màn hình nào: `admin.students`.
Ghi chú: Backend map entity `Student` sang `StudentResponse` phẳng.

### POST /api/admin/students
Mục đích: Tạo sinh viên mới kèm tài khoản đăng nhập.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: `StudentRequest`.
Response fields: `AdminStudentResponse`
- Xem fields ở `GET /api/admin/students`.
Frontend dùng cho màn hình nào: `admin.students`.
Ghi chú: `password` bắt buộc theo DTO hiện tại.

### PUT /api/admin/students/{id}
Mục đích: Cập nhật thông tin sinh viên.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: `StudentRequest`.
Response fields: `AdminStudentResponse`
- Xem fields ở `GET /api/admin/students`.
Frontend dùng cho màn hình nào: `admin.students`.
Ghi chú: Service cập nhật email trong bảng `users`; DTO vẫn khai báo `password` required dù update service không dùng password.

### DELETE /api/admin/students/{id}
Mục đích: Xóa sinh viên và tài khoản user liên kết.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.students`.
Ghi chú: Trả `"Xóa sinh viên thành công!"`.

### GET /api/admin/teachers
Mục đích: Lấy danh sách tất cả giảng viên.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `AdminTeacherResponse[]`
- `id`, `teacherCode`, `fullName`, `dob`, `gender`, `phone`, `nationalId`, `placeOfBirth`, `hometown`, `permanentAddress`, `currentAddress`, `emergencyContact`, `department`, `degree`, `address`
Frontend dùng cho màn hình nào: `admin.teachers`.
Ghi chú: Backend trả entity `Teacher`; field `user` bị `@JsonIgnore`, nên response không có `email`/`username`.

### POST /api/admin/teachers
Mục đích: Tạo giảng viên mới kèm tài khoản đăng nhập.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: `TeacherRequest`.
Response fields: `AdminTeacherResponse`
- Xem fields ở `GET /api/admin/teachers`.
Frontend dùng cho màn hình nào: `admin.teachers`.
Ghi chú: DTO có `email`, `username`, `password`, nhưng response entity `Teacher` không trả user/email.

### PUT /api/admin/teachers/{id}
Mục đích: Cập nhật thông tin giảng viên.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: `TeacherRequest`.
Response fields: `AdminTeacherResponse`
- Xem fields ở `GET /api/admin/teachers`.
Frontend dùng cho màn hình nào: `admin.teachers`.
Ghi chú: Service cập nhật `fullName`, `dob`, `department`, `degree`, `address`, và email trong user.

### DELETE /api/admin/teachers/{id}
Mục đích: Xóa giảng viên và tài khoản user liên kết.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.teachers`.
Ghi chú: Trả `"Xóa giảng viên thành công!"`.

### GET /api/admin/majors
Mục đích: Lấy danh sách ngành học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `MajorResponse[]`
- `id`, `majorCode`, `name`, `description`
Frontend dùng cho màn hình nào: `admin.majors`, form sinh viên, form môn học.
Ghi chú: Backend trả DTO `MajorResponse`.

### POST /api/admin/majors
Mục đích: Tạo ngành học mới.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: `MajorRequest`.
Response fields: `MajorResponse`
- `id`, `majorCode`, `name`, `description`
Frontend dùng cho màn hình nào: `admin.majors`.
Ghi chú: Backend validate trùng `majorCode` và `name`.

### PUT /api/admin/majors/{id}
Mục đích: Cập nhật ngành học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: `MajorRequest`.
Response fields: `MajorResponse`
- `id`, `majorCode`, `name`, `description`
Frontend dùng cho màn hình nào: `admin.majors`.
Ghi chú: Có thể update từng field nếu backend nhận field không rỗng.

### DELETE /api/admin/majors/{id}
Mục đích: Xóa ngành học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.majors`.
Ghi chú: Trả `"Xóa ngành học thành công!"`.

### GET /api/admin/courses
Mục đích: Lấy danh sách môn học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `CourseResponse[]`
- `id`, `code`, `name`, `credits`, `description`, `courseType`, `courseTypeLabel`, `majorName`, `prerequisiteNames`
Frontend dùng cho màn hình nào: `admin.courses`, form lớp học phần, curriculum.
Ghi chú: Backend DTO không trả `majorId` hoặc prerequisite ids.

### POST /api/admin/courses
Mục đích: Tạo môn học mới.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: `CourseRequest`.
Response fields: `CourseResponse`
- Xem fields ở `GET /api/admin/courses`.
Frontend dùng cho màn hình nào: `admin.courses`.
Ghi chú: `courseType` nhận `REQUIRED | ELECTIVE`; default backend là `REQUIRED`.

### PUT /api/admin/courses/{id}
Mục đích: Cập nhật môn học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: `CourseRequest`.
Response fields: `CourseResponse`
- Xem fields ở `GET /api/admin/courses`.
Frontend dùng cho màn hình nào: `admin.courses`.
Ghi chú: Backend trả 404 nếu không tìm thấy môn học.

### DELETE /api/admin/courses/{id}
Mục đích: Xóa môn học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.courses`.
Ghi chú: Có thể lỗi nếu môn học đang được sử dụng.

### GET /api/admin/class-sections
Mục đích: Lấy toàn bộ lớp học phần với dữ liệu đã làm phẳng.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `ClassSectionResponse[]`
- `id`, `classCode`, `courseId`, `courseCode`, `courseName`, `courseType`, `courseTypeLabel`, `credits`, `semesterId`, `semesterName`, `teacherId`, `teacherName`, `room`, `roomId`, `roomCapacity`, `schedules`, `maxSlots`, `currentSlots`, `closed`, `gradeLocked`
Frontend dùng cho màn hình nào: `admin.class-sections`.
Ghi chú: Response có cache header `max-age=60 minutes`.

### GET /api/admin/class-sections/semester/{semesterId}
Mục đích: Lấy lớp học phần theo học kỳ.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `semesterId: number`.
Query: Không.
Body: Không.
Response fields: `ClassSectionResponse[]`
- Xem fields ở `GET /api/admin/class-sections`.
Frontend dùng cho màn hình nào: `admin.class-sections`, `admin.enrollments`.
Ghi chú: Dùng cho bộ lọc học kỳ.

### POST /api/admin/class-sections
Mục đích: Mở lớp học phần mới, xếp lịch, phòng và giảng viên.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: `ClassSectionRequest`.
Response fields: `ClassSectionResponse`
- Xem fields ở `GET /api/admin/class-sections`.
Frontend dùng cho màn hình nào: `admin.class-sections`.
Ghi chú: Backend kiểm tra trùng lịch phòng và lịch giảng viên.

### PUT /api/admin/class-sections/{id}
Mục đích: Cập nhật lớp học phần.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: `ClassSectionRequest`.
Response fields: `ClassSectionResponse`
- Xem fields ở `GET /api/admin/class-sections`.
Frontend dùng cho màn hình nào: `admin.class-sections`.
Ghi chú: Service hiện chủ yếu đổi giảng viên, sĩ số và schedules; không đổi `classCode`, `courseId`, `semesterId`.

### DELETE /api/admin/class-sections/{id}
Mục đích: Xóa lớp học phần.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.class-sections`.
Ghi chú: Trả `"Xóa lớp học phần thành công!"`.

### GET /api/admin/semesters
Mục đích: Lấy danh sách học kỳ.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `SemesterResponse[]`
- `id`, `name`, `startDate`, `endDate`, `registrationOpen`, `locked`
Frontend dùng cho màn hình nào: `admin.semesters`, bộ lọc lớp học phần, enrollment, academic results.
Ghi chú: Backend trả entity `Semester`; Java field `isRegistrationOpen` serialize thành `registrationOpen`.

### POST /api/admin/semesters
Mục đích: Tạo học kỳ mới.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: `SemesterRequest`.
Response fields: `SemesterResponse`
- `id`, `name`, `startDate`, `endDate`, `registrationOpen`, `locked`
Frontend dùng cho màn hình nào: `admin.semesters`.
Ghi chú: Backend kiểm tra trùng tên học kỳ.

### PUT /api/admin/semesters/{id}
Mục đích: Cập nhật học kỳ và trạng thái mở đăng ký tín chỉ.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: `SemesterRequest`.
Response fields: `SemesterResponse`
- `id`, `name`, `startDate`, `endDate`, `registrationOpen`, `locked`
Frontend dùng cho màn hình nào: `admin.semesters`.
Ghi chú: Request không có field `locked`; khóa học kỳ thực hiện qua endpoint enrollment lock.

### DELETE /api/admin/semesters/{id}
Mục đích: Xóa học kỳ.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.semesters`.
Ghi chú: Trả `"Xóa học kỳ thành công!"`.

### GET /api/admin/rooms
Mục đích: Lấy danh sách phòng học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `RoomResponse[]`
- `id`, `name`, `capacity`
Frontend dùng cho màn hình nào: `admin.rooms`, form lớp học phần.
Ghi chú: Backend trả DTO `RoomResponse`.

### POST /api/admin/rooms
Mục đích: Tạo phòng học mới.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: `RoomRequest`.
Response fields: `RoomResponse`
- `id`, `name`, `capacity`
Frontend dùng cho màn hình nào: `admin.rooms`.
Ghi chú: Backend kiểm tra trùng tên phòng.

### PUT /api/admin/rooms/{id}
Mục đích: Cập nhật phòng học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: `RoomRequest`.
Response fields: `RoomResponse`
- `id`, `name`, `capacity`
Frontend dùng cho màn hình nào: `admin.rooms`.
Ghi chú: `capacity` phải lớn hơn 0.

### DELETE /api/admin/rooms/{id}
Mục đích: Xóa phòng học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.rooms`.
Ghi chú: Trả `"Xóa phòng học thành công!"`.

### GET /api/admin/periods
Mục đích: Lấy danh sách tiết học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `PeriodResponse[]`
- `id`, `periodNumber`, `startTime`, `endTime`
Frontend dùng cho màn hình nào: `admin.periods`, form lớp học phần.
Ghi chú: `startTime`/`endTime` là chuỗi time từ `LocalTime`.

### POST /api/admin/periods
Mục đích: Tạo tiết học mới.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: `PeriodRequest`.
Response fields: `PeriodResponse`
- `id`, `periodNumber`, `startTime`, `endTime`
Frontend dùng cho màn hình nào: `admin.periods`.
Ghi chú: `periodNumber` trong khoảng 1-12.

### PUT /api/admin/periods/{id}
Mục đích: Cập nhật tiết học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: `PeriodRequest`.
Response fields: `PeriodResponse`
- `id`, `periodNumber`, `startTime`, `endTime`
Frontend dùng cho màn hình nào: `admin.periods`.
Ghi chú: Backend kiểm tra trùng `periodNumber`.

### DELETE /api/admin/periods/{id}
Mục đích: Xóa tiết học.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `id: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.periods`.
Ghi chú: Trả `"Xóa tiết học thành công!"`.

### GET /api/admin/enrollments
Mục đích: Tìm kiếm danh sách ghi danh với pagination và filter.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: `semesterId?: number`, `classSectionId?: number`, `status?: EnrollmentStatus`, các query của Spring `Pageable` như `page`, `size`, `sort`.
Body: Không.
Response fields: `SpringPage<AdminEnrollmentResponse>`
- Page: `content`, `totalElements`, `totalPages`, `size`, `number`, `first`, `last`, `numberOfElements`, `empty`, `sort`, `pageable`
- Item: `enrollmentId`, `studentId`, `studentCode`, `studentName`, `classSectionId`, `classCode`, `semesterId`, `courseName`, `status`
Frontend dùng cho màn hình nào: `admin.enrollments`.
Ghi chú: `status` nhận `PENDING | REGISTERED | CANCELED | PASSED | FAILED`.

### POST /api/admin/enrollments/override
Mục đích: Admin ghi danh sinh viên vào lớp, bỏ qua sĩ số/trùng lịch.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: `AdminOverrideEnrollmentRequest`.
Response fields: `AdminEnrollmentResponse`
- `enrollmentId`, `studentId`, `studentCode`, `studentName`, `classSectionId`, `classCode`, `semesterId`, `courseName`, `status`
Frontend dùng cho màn hình nào: `admin.enrollments`.
Ghi chú: Backend vẫn tăng `currentSlots` kể cả vượt `maxSlots`.

### POST /api/admin/enrollments/lock-semester/{semesterId}
Mục đích: Chốt danh sách đăng ký học phần `PENDING` trong học kỳ.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `semesterId: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.enrollments`, `admin.semesters`.
Ghi chú: Backend chuyển `PENDING` sang `REGISTERED`, tạo `Grade` attempt 1 nếu chưa có, đóng đăng ký và khóa semester.

### POST /api/admin/enrollments/lock-retakes/{semesterId}
Mục đích: Chốt danh sách đăng ký thi lại/nâng điểm `PENDING` trong học kỳ.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `semesterId: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.enrollments`, `admin.semesters`.
Ghi chú: Backend chuyển exam registration `PENDING` sang `REGISTERED`, đóng đăng ký và khóa semester.

### POST /api/admin/academic-results/calculate-semester-gpa
Mục đích: Tính GPA học kỳ cho một sinh viên.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: `studentId: number`, `semesterId: number`.
Body: Không.
Response fields: `AcademicResultResponse`
- `id`, `student`, `semester`, `semesterGpa`, `cumulativeGpa`, `totalCredits`, `cumulativeCredits`, `calculatedAt`
Frontend dùng cho màn hình nào: `admin.academic-results`.
Ghi chú: Controller kiểm tra role admin thêm lần nữa bằng `SecurityContextHolder`.

### POST /api/admin/academic-results/calculate-cumulative-gpa
Mục đích: Tính CPA tích lũy cho một sinh viên.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: `studentId: number`.
Body: Không.
Response fields: `AcademicResultResponse`
- `id`, `student`, `semester`, `semesterGpa`, `cumulativeGpa`, `totalCredits`, `cumulativeCredits`, `calculatedAt`
Frontend dùng cho màn hình nào: `admin.academic-results`.
Ghi chú: `semester` có thể null nếu là CPA tích lũy.

### POST /api/admin/academic-results/lock-semester-grades/{semesterId}
Mục đích: Khóa điểm toàn bộ học kỳ và kích hoạt tính GPA/CPA.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `semesterId: number`.
Query: Không.
Body: Không.
Response fields: `string`
Frontend dùng cho màn hình nào: `admin.academic-results`, `admin.semesters`.
Ghi chú: Trả `"Đã khóa điểm toàn bộ học kỳ và bắt đầu tính GPA/CPA!"`.

### GET /api/admin/academic-results/student/{studentId}
Mục đích: Xem kết quả học tập đã tính của sinh viên.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: `studentId: number`.
Query: Không.
Body: Không.
Response fields: `AcademicResultResponse[]`
- `id`, `student`, `semester`, `semesterGpa`, `cumulativeGpa`, `totalCredits`, `cumulativeCredits`, `calculatedAt`
Frontend dùng cho màn hình nào: `admin.academic-results`, `admin.students` chi tiết.
Ghi chú: Backend trả entity `AcademicResult`; relation `student` và `semester` có thể là object nested.

### GET /api/admin/settings/retake-fee
Mục đích: Lấy phí thi lại hiện tại.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: Không.
Response fields: `RetakeFeeResponse`
- `feePerCourse`
Frontend dùng cho màn hình nào: `admin.settings` nếu có, `admin.retakes` nếu tách màn hình cấu hình.
Ghi chú: Nếu chưa có setting, backend dùng default từ `StudentRetakeService.DEFAULT_RETAKE_FEE`.

### PUT /api/admin/settings/retake-fee
Mục đích: Cập nhật phí thi lại.
Auth/Role: Bearer JWT, role `ADMIN`.
Params: Không.
Query: Không.
Body: `RetakeFeeRequest`.
Response fields: `UpdateRetakeFeeResponse`
- `feePerCourse`, `message`
Frontend dùng cho màn hình nào: `admin.settings` nếu có.
Ghi chú: Nếu `feePerCourse` null hoặc âm, backend trả 400 với `{ error: string }`.

## TypeScript interfaces

```ts
export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type CourseType = "REQUIRED" | "ELECTIVE";
export type EnrollmentStatus = "PENDING" | "REGISTERED" | "CANCELED" | "PASSED" | "FAILED";

export interface AdminUserResponse {
  id: number;
  username: string;
  passwordHash: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface CreateAdminRequest {
  username: string;
  password: string;
  email: string;
}

export interface StudentRequest {
  username: string;
  password: string;
  email: string;
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
  majorId: number;
  academicYear?: number | null;
  cohort?: string | null;
  className?: string | null;
  advisor?: string | null;
  status?: string | null;
  trainingType?: string | null;
  address?: string | null;
}

export interface AdminStudentResponse {
  id: number;
  username: string | null;
  email: string | null;
  studentCode: string;
  fullName: string | null;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  nationalId: string | null;
  placeOfBirth: string | null;
  hometown: string | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  emergencyContact: string | null;
  address: string | null;
  academicYear: number | null;
  cohort: string | null;
  className: string | null;
  advisor: string | null;
  status: string | null;
  trainingType: string | null;
  majorId: number | null;
  majorName: string | null;
  majorCode: string | null;
}

export interface TeacherRequest {
  username: string;
  password: string;
  email: string;
  teacherCode: string;
  fullName: string;
  dob?: string | null;
  department?: string | null;
  degree?: string | null;
  address?: string | null;
  phone?: string | null;
}

export interface AdminTeacherResponse {
  id: number;
  teacherCode: string;
  fullName: string | null;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  nationalId: string | null;
  placeOfBirth: string | null;
  hometown: string | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  emergencyContact: string | null;
  department: string | null;
  degree: string | null;
  address: string | null;
}

export interface MajorRequest {
  majorCode: string;
  name: string;
  description?: string | null;
}

export interface MajorResponse {
  id: number;
  majorCode: string;
  name: string;
  description: string | null;
}

export interface CourseRequest {
  code: string;
  name: string;
  credits: number;
  description?: string | null;
  courseType?: CourseType;
  majorId: number;
  prerequisiteCourseIds?: number[] | null;
}

export interface CourseResponse {
  id: number;
  code: string;
  name: string;
  credits: number;
  description: string | null;
  courseType: CourseType | null;
  courseTypeLabel: string | null;
  majorName: string | null;
  prerequisiteNames: string[];
}

export interface ClassSectionScheduleRequest {
  dayOfWeek: number;
  startPeriodId: number;
  endPeriodId: number;
  roomId: number;
}

export interface ClassSectionRequest {
  classCode: string;
  courseId: number;
  semesterId: number;
  teacherId?: number | null;
  schedules: ClassSectionScheduleRequest[];
  maxSlots: number;
}

export interface ClassSectionScheduleResponse {
  id: number;
  dayOfWeek: number;
  startPeriodId: number | null;
  startPeriod: number | null;
  endPeriodId: number | null;
  endPeriod: number | null;
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

export interface SemesterRequest {
  name: string;
  startDate: string;
  endDate: string;
  registrationOpen: boolean;
}

export interface SemesterResponse {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  registrationOpen: boolean;
  locked: boolean;
}

export interface RoomRequest {
  name: string;
  capacity: number;
}

export interface RoomResponse {
  id: number;
  name: string;
  capacity: number;
}

export interface PeriodRequest {
  periodNumber: number;
  startTime: string;
  endTime: string;
}

export interface PeriodResponse {
  id: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

export interface AdminEnrollmentSearchQuery {
  semesterId?: number;
  classSectionId?: number;
  status?: EnrollmentStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminOverrideEnrollmentRequest {
  studentId: number;
  classSectionId: number;
  note?: string | null;
}

export interface AdminEnrollmentResponse {
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  classSectionId: number;
  classCode: string;
  semesterId: number;
  courseName: string;
  status: EnrollmentStatus | string | null;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  sort?: unknown;
  pageable?: unknown;
}

export interface AcademicResultStudentRef {
  id: number;
  studentCode: string;
  fullName: string | null;
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
  academicYear?: number | null;
  cohort?: string | null;
  className?: string | null;
  advisor?: string | null;
  status?: string | null;
  trainingType?: string | null;
}

export interface AcademicResultSemesterRef {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  registrationOpen: boolean;
  locked: boolean;
}

export interface AcademicResultResponse {
  id: number;
  student: AcademicResultStudentRef | null;
  semester: AcademicResultSemesterRef | null;
  semesterGpa: number | null;
  cumulativeGpa: number | null;
  totalCredits: number | null;
  cumulativeCredits: number | null;
  calculatedAt: string | null;
}

export interface RetakeFeeRequest {
  feePerCourse: number;
}

export interface RetakeFeeResponse {
  feePerCourse: number;
}

export interface UpdateRetakeFeeResponse {
  feePerCourse: number;
  message: string;
}
```

## Đề xuất `adminApi` cho FE

```ts
import { apiRequest, jsonBody } from "@/lib/api/client";
import type {
  AcademicResultResponse,
  AdminEnrollmentResponse,
  AdminEnrollmentSearchQuery,
  AdminOverrideEnrollmentRequest,
  AdminStudentResponse,
  AdminTeacherResponse,
  AdminUserResponse,
  ClassSectionRequest,
  ClassSectionResponse,
  CourseRequest,
  CourseResponse,
  CreateAdminRequest,
  MajorRequest,
  MajorResponse,
  PeriodRequest,
  PeriodResponse,
  RetakeFeeRequest,
  RetakeFeeResponse,
  RoomRequest,
  RoomResponse,
  SemesterRequest,
  SemesterResponse,
  SpringPage,
  StudentRequest,
  TeacherRequest,
  UpdateRetakeFeeResponse,
} from "@/lib/api/types";

const queryString = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : "";
};

export const adminApi = {
  listUsers: () => apiRequest<AdminUserResponse[]>("/api/admin/users"),
  createAdmin: (request: CreateAdminRequest) =>
    apiRequest<AdminUserResponse>(
      `/api/admin/users/admin${queryString(request)}`,
      { method: "POST" },
    ),
  toggleUserStatus: (id: number | string) =>
    apiRequest<AdminUserResponse>(`/api/admin/users/${id}/toggle-status`, {
      method: "PUT",
    }),
  deleteAdminUser: (id: number | string) =>
    apiRequest<string>(`/api/admin/users/admin/${id}`, { method: "DELETE" }),

  listStudents: () => apiRequest<AdminStudentResponse[]>("/api/admin/students"),
  createStudent: (request: StudentRequest) =>
    apiRequest<AdminStudentResponse>("/api/admin/students", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateStudent: (id: number | string, request: StudentRequest) =>
    apiRequest<AdminStudentResponse>(`/api/admin/students/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteStudent: (id: number | string) =>
    apiRequest<string>(`/api/admin/students/${id}`, { method: "DELETE" }),

  listTeachers: () => apiRequest<AdminTeacherResponse[]>("/api/admin/teachers"),
  createTeacher: (request: TeacherRequest) =>
    apiRequest<AdminTeacherResponse>("/api/admin/teachers", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateTeacher: (id: number | string, request: TeacherRequest) =>
    apiRequest<AdminTeacherResponse>(`/api/admin/teachers/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteTeacher: (id: number | string) =>
    apiRequest<string>(`/api/admin/teachers/${id}`, { method: "DELETE" }),

  listMajors: () => apiRequest<MajorResponse[]>("/api/admin/majors"),
  createMajor: (request: MajorRequest) =>
    apiRequest<MajorResponse>("/api/admin/majors", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateMajor: (id: number | string, request: MajorRequest) =>
    apiRequest<MajorResponse>(`/api/admin/majors/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteMajor: (id: number | string) =>
    apiRequest<string>(`/api/admin/majors/${id}`, { method: "DELETE" }),

  listCourses: () => apiRequest<CourseResponse[]>("/api/admin/courses"),
  createCourse: (request: CourseRequest) =>
    apiRequest<CourseResponse>("/api/admin/courses", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateCourse: (id: number | string, request: CourseRequest) =>
    apiRequest<CourseResponse>(`/api/admin/courses/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteCourse: (id: number | string) =>
    apiRequest<string>(`/api/admin/courses/${id}`, { method: "DELETE" }),

  listClassSections: () =>
    apiRequest<ClassSectionResponse[]>("/api/admin/class-sections"),
  listClassSectionsBySemester: (semesterId: number | string) =>
    apiRequest<ClassSectionResponse[]>(
      `/api/admin/class-sections/semester/${semesterId}`,
    ),
  createClassSection: (request: ClassSectionRequest) =>
    apiRequest<ClassSectionResponse>("/api/admin/class-sections", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateClassSection: (id: number | string, request: ClassSectionRequest) =>
    apiRequest<ClassSectionResponse>(`/api/admin/class-sections/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteClassSection: (id: number | string) =>
    apiRequest<string>(`/api/admin/class-sections/${id}`, { method: "DELETE" }),

  listSemesters: () => apiRequest<SemesterResponse[]>("/api/admin/semesters"),
  createSemester: (request: SemesterRequest) =>
    apiRequest<SemesterResponse>("/api/admin/semesters", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateSemester: (id: number | string, request: SemesterRequest) =>
    apiRequest<SemesterResponse>(`/api/admin/semesters/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteSemester: (id: number | string) =>
    apiRequest<string>(`/api/admin/semesters/${id}`, { method: "DELETE" }),

  listRooms: () => apiRequest<RoomResponse[]>("/api/admin/rooms"),
  createRoom: (request: RoomRequest) =>
    apiRequest<RoomResponse>("/api/admin/rooms", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateRoom: (id: number | string, request: RoomRequest) =>
    apiRequest<RoomResponse>(`/api/admin/rooms/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteRoom: (id: number | string) =>
    apiRequest<string>(`/api/admin/rooms/${id}`, { method: "DELETE" }),

  listPeriods: () => apiRequest<PeriodResponse[]>("/api/admin/periods"),
  createPeriod: (request: PeriodRequest) =>
    apiRequest<PeriodResponse>("/api/admin/periods", {
      method: "POST",
      body: jsonBody(request),
    }),
  updatePeriod: (id: number | string, request: PeriodRequest) =>
    apiRequest<PeriodResponse>(`/api/admin/periods/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deletePeriod: (id: number | string) =>
    apiRequest<string>(`/api/admin/periods/${id}`, { method: "DELETE" }),

  searchEnrollments: (query: AdminEnrollmentSearchQuery = {}) =>
    apiRequest<SpringPage<AdminEnrollmentResponse>>(
      `/api/admin/enrollments${queryString(query)}`,
    ),
  overrideEnrollment: (request: AdminOverrideEnrollmentRequest) =>
    apiRequest<AdminEnrollmentResponse>("/api/admin/enrollments/override", {
      method: "POST",
      body: jsonBody(request),
    }),
  lockEnrollmentSemester: (semesterId: number | string) =>
    apiRequest<string>(`/api/admin/enrollments/lock-semester/${semesterId}`, {
      method: "POST",
    }),
  lockRetakeSemester: (semesterId: number | string) =>
    apiRequest<string>(`/api/admin/enrollments/lock-retakes/${semesterId}`, {
      method: "POST",
    }),

  calculateSemesterGpa: (studentId: number | string, semesterId: number | string) =>
    apiRequest<AcademicResultResponse>(
      `/api/admin/academic-results/calculate-semester-gpa${queryString({
        studentId,
        semesterId,
      })}`,
      { method: "POST" },
    ),
  calculateCumulativeGpa: (studentId: number | string) =>
    apiRequest<AcademicResultResponse>(
      `/api/admin/academic-results/calculate-cumulative-gpa${queryString({
        studentId,
      })}`,
      { method: "POST" },
    ),
  lockSemesterGrades: (semesterId: number | string) =>
    apiRequest<string>(
      `/api/admin/academic-results/lock-semester-grades/${semesterId}`,
      { method: "POST" },
    ),
  listStudentAcademicResults: (studentId: number | string) =>
    apiRequest<AcademicResultResponse[]>(
      `/api/admin/academic-results/student/${studentId}`,
    ),

  getRetakeFee: () =>
    apiRequest<RetakeFeeResponse>("/api/admin/settings/retake-fee"),
  updateRetakeFee: (request: RetakeFeeRequest) =>
    apiRequest<UpdateRetakeFeeResponse>("/api/admin/settings/retake-fee", {
      method: "PUT",
      body: jsonBody(request),
    }),
};
```

## Query key gợi ý

- Users: `["admin", "users"]`
- Students: `["admin", "students"]`
- Teachers: `["admin", "teachers"]`
- Majors: `["admin", "majors"]`
- Courses: `["admin", "courses"]`
- Class sections: `["admin", "class-sections"]`, `["admin", "class-sections", "semester", semesterId]`
- Semesters: `["admin", "semesters"]`
- Rooms: `["admin", "rooms"]`
- Periods: `["admin", "periods"]`
- Enrollments: `["admin", "enrollments", query]`
- Academic results: `["admin", "academic-results", studentId]`
- Settings retake fee: `["admin", "settings", "retake-fee"]`

## Ghi chú tích hợp

- `frontend/src/lib/api/admin.ts` hiện đã có một phần API, nhưng còn thiếu các hàm create/update cho students, teachers, majors, courses, rooms, và một số API academic results/settings.
- `GET /api/admin/teachers` trả entity `Teacher`, không trả user/email do `@JsonIgnore`; không được tự bịa email ở FE.
- `GET /api/admin/courses` không trả `majorId` hoặc `prerequisiteCourseIds`; form edit nếu cần các id này phải cần backend bổ sung field hoặc endpoint detail.
- `POST /api/admin/users/admin` nhận query params, không nhận JSON body.
- `GET /api/admin/enrollments` trả Spring `Page`, không phải array.
