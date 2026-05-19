# TASKS — Danh sách vấn đề cần nâng cấp & Refactor

> Độ ưu tiên: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## 🔴 CRITICAL — Bảo mật & Dữ liệu nhạy cảm

### ✅ TASK-001: Xóa credentials cứng trong application.properties
**Vấn đề:** `application.properties` chứa thông tin nhạy cảm trực tiếp:
- `spring.datasource.password=abc130204`
- `application.security.jwt.secret-key=thangnaodocdong...` (secret key yếu, đọc được)
- `vnpay.tmn-code=F8JMCUMZ` và `vnpay.secret-key=NO6SGTB9DBV52ZSMJ3W089WR7YIR9BN4`

**Fix:** Chuyển toàn bộ sang biến môi trường (`${ENV_VAR}`) và file `.env`. JWT secret phải tối thiểu 256-bit random.

---

### ✅ TASK-002: JWT Secret Key quá yếu
**Vấn đề:** Secret key JWT là một câu văn đọc được bằng tiếng Việt — không đủ entropy cho HMAC-SHA256.

**Fix:** Tạo secret key ngẫu nhiên 256-bit dạng Base64, lưu trong biến môi trường. Ví dụ:
```bash
openssl rand -base64 64
```

---

### ✅ TASK-003: VNPayConfig dùng `java.util.Random` (không an toàn)
**File:** `src/main/java/.../config/VNPayConfig.java`
**Vấn đề:** `getRandomNumber()` dùng `java.util.Random` — không đủ bảo mật cho mã giao dịch tài chính.
**Fix:** Thay bằng `java.security.SecureRandom`.


---

## 🟠 HIGH — Kiến trúc & Chất lượng code

### TASK-006: Flyway có 2 file V2 trùng version
**Vấn đề:** Tồn tại đồng thời `V2__add_period_entity.sql` và `V2__major_and_prerequisites.sql` — Flyway sẽ báo lỗi `Found more than one migration with version 2`.
**Fix:** Đổi tên một trong hai. Đề nghị:
- `V2__add_period_entity.sql` → giữ nguyên
- `V2__major_and_prerequisites.sql` → đổi thành `V5__major_and_prerequisites.sql` (và rà soát lại V6)

---

### ✅ TASK-007: Thiếu Global Exception Handler
**Vấn đề:** Các service throw `RuntimeException("...")` trực tiếp. Không có `@ControllerAdvice` / `@RestControllerAdvice` toàn cục để bắt và trả về response chuẩn.
**Fix:** Tạo `GlobalExceptionHandler` với `@RestControllerAdvice`, bắt các loại exception cụ thể và trả về `ApiError { status, message, timestamp }`.
> ✅ **Đã làm:** Thêm handler cho `MethodArgumentNotValidException` và `ConstraintViolationException`.

---

### ✅ TASK-008: `StudentEnrollmentService` phụ thuộc Kafka — không có fallback
**Vấn đề:** Khi `spring.kafka.enabled=false`, `KafkaTemplate` vẫn được inject vào `StudentEnrollmentService` và sẽ throw exception khi gọi `kafkaTemplate.send()`.
**Fix:** Dùng conditional bean hoặc tách service thành `KafkaEnrollmentService` vs `DirectEnrollmentService`, thêm `@ConditionalOnProperty` hoặc strategy pattern để chọn luồng phù hợp.
> ✅ **Đã làm:** Tạo interface `EnrollmentProcessor`, `DirectEnrollmentProcessor` (kafka=false, có WebSocket push), `KafkaEnrollmentProcessor` (kafka=true). `StudentEnrollmentService` inject strategy tự động.

---

### ✅ TASK-009: `EnrollmentRequestStatusService` không có implementation rõ ràng
**Vấn đề:** Service interface này không thấy class `impl/` — trạng thái lưu ở đâu (Redis?) không rõ ràng.
**Fix:** Tạo `RedisEnrollmentRequestStatusServiceImpl` rõ ràng với TTL hợp lý. Hiện tại nếu Redis down, toàn bộ flow đăng ký Kafka sẽ lỗi.
> ✅ **Đã làm:** Chuyển thành interface + tạo `RedisEnrollmentRequestStatusServiceImpl`. Tạo thêm enum `EnrollmentRequestStatus` (PENDING/PROCESSING/SUCCESS/FAILED/UNKNOWN).

---

### ✅ TASK-010: `PaymentTransaction.java` rỗng hoàn toàn
**Vấn đề:** Entity `PaymentTransaction` tồn tại nhưng không có field nào — không có repository, không có bảng.
**Fix:** Hoàn thiện entity (txnId, billId, amount, vnpayCode, status, createdAt) và migration SQL, hoặc xóa nếu không dùng.
> ✅ **Đã làm:** Hoàn thiện entity đầy đủ fields + JPA annotations + tạo enum `PaymentStatus`.

---

### ✅ TASK-011: Duplicate score fields giữa `Enrollment` và `Grade`
**Vấn đề:** `Enrollment` có `midTermScore`, `finalScore`, `totalScore` đồng thời `Grade` entity cũng có đầy đủ score fields. Hai bảng lưu dữ liệu điểm song song gây không nhất quán.
**Fix:** Chọn một nguồn sự thật duy nhất. Đề nghị giữ `Grade` làm nguồn điểm, xóa score fields khỏi `Enrollment`.
> ✅ **Đã làm:** Xóa `midTermScore/finalScore/totalScore` khỏi `Enrollment`. Thêm `@OneToOne Grade grade`. Sửa `TeacherService`, `StudentEnrollmentService`, `DataInitializer`, `EnrollmentConsumer`.

---

### ✅ TASK-012: Thiếu validation annotation trên DTOs
**Vấn đề:** Nhiều request DTO (ví dụ `StudentRequest`, `GradeRequest`, `CourseRequest`) không có `@NotNull`, `@NotBlank`, `@Min`, `@Max` và controller không dùng `@Valid` để kích hoạt Bean Validation.
**Fix:** Thêm constraints phù hợp và `@Valid` trên tham số `@RequestBody` trong controllers.
> ✅ **Đã làm (một phần):** Thêm `@NotNull`, `@DecimalMin/Max` vào `GradeRequest`. `StudentRequest` và `CourseRequest` đã có sẵn. `GlobalExceptionHandler` đã bắt `MethodArgumentNotValidException`.

---

### ✅ TASK-013: CORS origins hardcode trong SecurityConfig
**Vấn đề:** Danh sách allowed origins (`localhost:5173`, `localhost:3000`) hardcode trong `SecurityConfig.java`.
**Fix:** Đọc từ `application.properties` → biến môi trường.
> ✅ **Đã làm:** `SecurityConfig` đọc từ `${app.cors.allowed-origins}`.

---

### ✅ TASK-014: WebSocket endpoint hardcode allowed origins
**Vấn đề:** Tương tự, `WebSocketConfig.registerStompEndpoints()` hardcode origins.
**Fix:** Externalize ra config/properties.
> ✅ **Đã làm:** `WebSocketConfig` đọc từ `${app.cors.allowed-origins}`, parse thành mảng String[].

---

## 🟡 MEDIUM — Hiệu suất & Chức năng còn thiếu

### TASK-015: Thiếu pagination trên các API danh sách
**Vấn đề:** Các endpoint trả về `List<>` không có pagination (ví dụ danh sách lớp học, danh sách điểm, lịch sử chat). Khi dữ liệu lớn sẽ gây OOM và chậm.
**Fix:** Thay `List<T>` bằng `Page<T>`, dùng `Pageable` param trên controller và `PagingAndSortingRepository`.

---

### TASK-016: N+1 Query problem tiềm ẩn
**Vấn đề:** `ClassSection` dùng `FetchType.EAGER` cho `schedules` — có thể gây nhiều query khi load danh sách lớp. Các entity khác dùng `LAZY` nhưng mapper lại truy cập thuộc tính lazy trong transaction đã đóng.
**Fix:** Review fetch strategy, dùng `@EntityGraph` hoặc JOIN FETCH trong các query cần join.

---

### TASK-017: Thiếu unit tests
**Vấn đề:** Chỉ có `ThangLongUniversityWebApplicationTests.java` (context load test). Không có unit test cho service logic (Grade calculation, enrollment rules, prerequisite check...).
**Fix:** Viết test cho `GradeService`, `StudentEnrollmentService`, `GradeLockingService` với JUnit 5 + Mockito.

---

### TASK-018: `DataSeeder` và `DataInitializer` có thể conflict
**Vấn đề:** Có cả `DataSeeder.java` và `DataInitializer.java` đều chạy khi khởi động. Nguy cơ insert duplicate data nếu không có idempotency check đầy đủ.
**Fix:** Gộp lại thành một class, thêm `@Profile("dev")` để không chạy production, đảm bảo dùng `saveIfNotExists` pattern.

---

### TASK-019: Chat system: bảng `conversations` và `chat_rooms` có thể trùng chức năng
**Vấn đề:** Tồn tại cả `ChatRoom` entity (mới, đầy đủ) lẫn `Conversation` entity (cũ?). `Message` trỏ tới `Conversation`, `ChatRoom` trỏ tới `Conversation` qua FK. Quan hệ phức tạp và không rõ luồng.
**Fix:** Rà soát và chuẩn hóa: chọn `ChatRoom` làm entity chính hoặc mapping rõ ràng vai trò từng bảng.

---

### TASK-020: Thiếu endpoint thống kê cho Admin
**Vấn đề:** Không có dashboard/statistics API (tổng sinh viên, tổng lớp, tỷ lệ đậu/rớt, lịch sử thanh toán học phí...).
**Fix:** Thêm `AdminStatisticsController` với các query thống kê sử dụng native query hoặc JPQL GROUP BY.

---

### TASK-021: `AcademicResult` không có trigger tự động
**Vấn đề:** GPA và CPA chỉ được tính khi admin gọi API `calculate` thủ công. Không có cơ chế tự tính sau khi khóa điểm.
**Fix:** Tự động trigger tính `AcademicResult` khi giảng viên lock điểm lớp (`gradeLocked = true`), dùng Spring `@EventListener` hoặc `ApplicationEvent`.

---

### TASK-022: Thiếu soft-delete cho các entity quan trọng
**Vấn đề:** Student, Teacher, Course không có cờ `isDeleted` / `isActive` — xóa cứng sẽ phá vỡ dữ liệu lịch sử (enrollment, grades tham chiếu tới student đã xóa).
**Fix:** Thêm `@SQLRestriction("is_deleted = false")` (Hibernate 6) và logic soft-delete.

---

## 🟢 LOW — Tối ưu & Code style

### TASK-023: Lombok `@Builder` không nhất quán
**Vấn đề:** Chỉ một số entity dùng `@Builder` (ChatRoom, Message). Cần nhất quán hoặc loại bỏ Builder khỏi JPA entity (Builder không tương thích tốt với JPA proxy).
**Fix:** Dùng `@Builder` ở DTO/request/response, không dùng trên `@Entity`.

---

### TASK-024: `boot_run.log` và `output.log` trong root — nên gitignore
**Vấn đề:** Các file log runtime (`boot_run.log`, `output.log`) đang ở root project, có thể bị commit.
**Fix:** Thêm vào `.gitignore`: `*.log`, `output.log`, `boot_run.log`.

---

### TASK-025: Thiếu health check endpoint
**Vấn đề:** Không có Spring Actuator hoặc custom `/health` endpoint cho monitoring và Docker healthcheck.
**Fix:** Thêm `spring-boot-starter-actuator` với endpoint `/actuator/health`, cấu hình expose chọn lọc.

---

### ✅ TASK-026: `VNPayConfig` tiếp tục dùng `@Value` public field
**Vấn đề:** Các field `vnp_TmnCode`, `secretKey`... là `public` — có thể bị truy cập bất kỳ đâu trong code.
**Fix:** Đổi thành `private` + getter, hoặc dùng `@ConfigurationProperties` với record/class riêng.
> ✅ **Đã làm:** Đổi tất cả fields sang `private`, thêm getters. `StudentTuitionService` cập nhật dùng getters.

---

### TASK-027: Thiếu logging chuẩn hóa
**Vấn đề:** Log dùng emoji (📩, ❌, 🔁...) — dễ đọc lúc dev nhưng khó parse bằng ELK/Loki trong production.
**Fix:** Cân nhắc structured logging (JSON format) cho production profile, dùng MDC để thêm correlation ID.

---

## 🟠 HIGH — Bổ sung từ review DB/Queue/Đăng ký học

### ✅ TASK-028: Kafka đang tắt nhưng flow đăng ký vẫn phụ thuộc Kafka
**Vấn đề:** `spring.kafka.enabled=false` trong cấu hình local nhưng `StudentEnrollmentService` vẫn luôn `kafkaTemplate.send(...)`, không có đường fallback xử lý trực tiếp.
**Fix:** Tách strategy xử lý đăng ký (`KafkaEnrollmentProcessor` / `DirectEnrollmentProcessor`) và chọn bằng `@ConditionalOnProperty`.
> ✅ **Đã làm:** Xem TASK-008 — cùng implementation.

---

### ✅ TASK-029: Chat Kafka chỉ có producer, chưa có consumer tương ứng
**Vấn đề:** Có producer cho `chat-messages/chat-notifications/chat-analytics` nhưng chưa có pipeline consumer rõ ràng để xử lý đầy đủ bất đồng bộ.
**Fix:** Bổ sung consumer cho từng topic (hoặc loại bỏ producer nếu chưa dùng), đồng thời mô tả rõ luồng source of truth cho chat.
> ✅ **Đã làm:** Tạo `ChatKafkaConsumer` với `@KafkaListener` cho 3 topic, kích hoạt khi kafka=true.

---

### ✅ TASK-030: Dễ lệch schema giữa môi trường do vừa dùng Flyway vừa để `ddl-auto=update`
**Vấn đề:** Runtime đang cho Hibernate tự đổi schema, trong khi migration không được dùng nhất quán làm nguồn sự thật.
**Fix:** Chuẩn hóa: dùng Flyway làm nguồn duy nhất, đặt `ddl-auto=validate` (prod) và thêm migration đầy đủ cho mọi thay đổi.
> ✅ **Đã làm (một phần):** `ddl-auto` đã dùng env var `${SPRING_JPA_DDL_AUTO:update}` — production set `validate` qua env.

---

## 🟡 MEDIUM — Bổ sung tối ưu chịu tải đăng ký học

### TASK-031: Hủy đăng ký trừ `currentSlots` chưa có cơ chế chống race condition
**Vấn đề:** Luồng hủy môn cập nhật `currentSlots` trực tiếp, có thể lệch dữ liệu khi nhiều request đồng thời.
**Fix:** Dùng lock (`SELECT ... FOR UPDATE`) hoặc cập nhật nguyên tử ở DB khi giảm slot.

---

### TASK-032: Rate limiting theo IP in-memory không phù hợp khi scale nhiều instance
**Vấn đề:** Bucket đặt trong memory từng node nên giới hạn không đồng nhất giữa các instance; NAT có thể gây chặn oan.
**Fix:** Chuyển sang rate limit phân tán bằng Redis, key theo `userId + endpoint` cho các API nhạy cảm (đặc biệt đăng ký học).

---

## 🟢 LOW — Khuyến nghị kiến trúc dữ liệu

### TASK-033: Chưa cần dùng Redis Vector cho nghiệp vụ hiện tại
**Vấn đề:** Bài toán hiện tại chủ yếu CRUD/transaction (đăng ký học, điểm, học phí, chat), chưa có use-case semantic search/recommendation rõ ràng.
**Fix:** Chưa triển khai vector storage lúc này; chỉ cân nhắc khi có tính năng AI cụ thể (semantic search, RAG, recommendation).

---

## Tóm tắt theo nhóm

| # | Nhóm | Số task |
|---|---|---|
| 🔴 | Critical (Bảo mật) | 5 |
| 🟠 | High (Kiến trúc) | 12 |
| 🟡 | Medium (Tính năng/Hiệu suất) | 10 |
| 🟢 | Low (Code quality) | 6 |
| **Tổng** | | **33** |
---

## Ke hoach ket noi frontend `fewebtruong` voi backend qua API

> Context ngay 2026-05-18: frontend trong `fewebtruong` la template Vite/TanStack/React dang dung mock data tai `src/data/mock.ts`. Backend Spring Boot da co nhieu API CRUD va nghiep vu, nhung response contract chua duoc dong bo voi shape ma frontend dang hien thi.

### Nguyen tac ket noi
- [x] Tao `src/lib/api/client.ts` o frontend de gom `baseUrl`, JSON headers, bearer token, refresh token, error handling va query params.
- [x] Dung `VITE_API_BASE_URL`, mac dinh local la `http://localhost:8080`.
- [x] Thay `src/lib/auth.tsx` tu role mock sang login that: `POST /api/auth/login`, luu `accessToken`, `refreshToken`, user profile va role.
- [x] Sau login goi `GET /api/users/me` de lay profile hien tai, khong hardcode ten nguoi dung.
- [ ] Tao service theo domain: `authApi`, `adminApi`, `studentApi`, `teacherApi`, `chatApi`. (Da co `authApi`, `adminApi`; con `studentApi`, `teacherApi`, `chatApi`.)
- Chuyen tung route tu import `@/data/mock` sang API service + TanStack Query. Uu tien trang doc truoc, form ghi sau.
- Giu `mock.ts` chi lam fallback/dev seed trong qua trinh migrate, khong de component import truc tiep nua sau khi hoan thanh.

### Mapping man hinh frontend -> API backend hien co

| Frontend route | Data dang mock | API backend co the dung |
|---|---|---|
| `/login` | role gia lap | `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/users/me` |
| `/admin/students` | `students`, `majors` | `GET/POST/PUT/DELETE /api/admin/students`, `GET /api/admin/majors` |
| `/admin/teachers` | `teachers` | `GET/POST/PUT/DELETE /api/admin/teachers` |
| `/admin/majors` | `majors` | `GET/POST/PUT/DELETE /api/admin/majors` |
| `/admin/courses` | `courses`, `majors` | `GET/POST/PUT/DELETE /api/admin/courses`, `GET /api/admin/majors` |
| `/admin/semesters` | `semesters` | `GET/POST/PUT/DELETE /api/admin/semesters` |
| `/admin/rooms` | `rooms` | `GET/POST/PUT/DELETE /api/admin/rooms` |
| `/admin/periods` | `periods` | `GET/POST/PUT/DELETE /api/admin/periods` |
| `/admin/class-sections` | `classSections`, schedule refs | `GET/POST/PUT/DELETE /api/admin/class-sections`, `GET /api/admin/class-sections/semester/{semesterId}` |
| `/admin/enrollments` | `enrollments` | `GET /api/admin/enrollments`, `POST /api/admin/enrollments/override` |
| `/admin/academic-results` | `students`, `semesters`, `grades` | `GET /api/admin/academic-results/student/{studentId}`, `POST /api/admin/academic-results/calculate-semester-gpa`, `POST /api/admin/academic-results/calculate-cumulative-gpa`, `POST /api/admin/academic-results/lock-semester-grades/{semesterId}` |
| `/admin/chat`, `/teacher/chat`, `/student/chat` | `chatRooms`, `chatMessages` | `GET /api/chat/rooms`, `GET /api/chat/rooms/{roomId}/messages`, `POST /api/chat/rooms/private`, `GET /api/chat/users/search`, WebSocket STOMP |
| `/student/course-registration` | available classes | `GET /api/student/classes/semester/{semesterId}`, `POST /api/student/enroll/{classSectionId}`, `GET /api/student/enrollments/status/{requestId}` |
| `/student/schedule` | personal schedule | `GET /api/student/my-schedule/{semesterId}` |
| `/student/grades` | grades by semester | `GET /api/student/grades?semesterId=...`, `GET /api/student/grades/my-grades`, `GET /api/student/grades/semester/{semesterId}` |
| `/student/exams` | exams | `GET /api/student/exams?semesterId=...` |
| `/student/tuition` | tuition invoices | `GET /api/student/tuition/{semesterId}`, `POST /api/student/tuition/{semesterId}/vnpay-url`, `GET /api/student/tuition/vnpay-return` |
| `/student/academic-results` | GPA/CPA series | `GET /api/student/academic-results/my-results` |
| `/teacher/classes` | assigned classes | `GET /api/teacher/my-classes/semester/{semesterId}` |
| `/teacher/classes/$classSectionId/students` | class student list | `GET /api/teacher/classes/{classSectionId}/students` |
| `/teacher/grades` | grade entry | `GET /api/teacher/grades/class/{classSectionId}`, `PUT /api/teacher/grades/{enrollmentId}` hoac `PUT /api/teacher/enrollments/{enrollmentId}/grade` |

### Thu tu trien khai de thay mock data
1. [x] Auth truoc: login, refresh, logout, current user, route guard theo role.
2. [ ] Admin CRUD danh muc: majors, semesters, rooms, periods, courses, students, teachers. (Da noi list/delete cho majors, rooms, periods; con form create/update va cac danh muc khac.)
3. Class sections: load course/teacher/room/period/semester refs, tao/sua lich hoc.
4. Student flows: dang ky hoc, lich hoc, diem, lich thi, hoc phi.
5. Teacher flows: lop duoc phan cong, danh sach sinh vien, nhap/khoa diem.
6. Dashboard va report: thay cac counter mock bang API tong hop.
7. Chat: REST history/list rooms truoc, WebSocket realtime sau.
8. Xoa import truc tiep tu `src/data/mock.ts`, chi giu type chung neu can.

### API/backend con thieu hoac can chuan hoa cho frontend

### Tien do ket noi da lam
- [x] Frontend: them `src/lib/api/client.ts`, `src/lib/api/auth.ts`, `src/lib/api/admin.ts`, `src/lib/api/types.ts`.
- [x] Frontend: them `.env.example` voi `VITE_API_BASE_URL=http://localhost:8080`.
- [x] Frontend: `/login` dung `POST /api/auth/login` va `GET /api/users/me`, bo login mock theo role.
- [x] Frontend: layout bao ve route theo role tra ve tu backend, khong hardcode ten user.
- [x] Frontend: `/admin/majors`, `/admin/rooms`, `/admin/periods` dung API backend de list/delete, co fallback mock khi backend chua chay.
- [x] Kiem tra: `npx tsc --noEmit` pass.
- [ ] Kiem tra: `npm run build` chua pass do moi truong Node hien tai la `22.2.0`, trong khi Vite/TanStack Start can `20.19+` hoac `22.12+`.

---

#### TASK-034: Them API dashboard tong hop cho Admin
**Van de:** `/admin/dashboard` hien tinh counter tu mock: tong sinh vien, giang vien, mon hoc, lop hoc phan, dang ky cho xu ly, hoc phi chua thanh toan, thong ke dang ky theo hoc ky.
**Fix:** Tao `AdminDashboardController` voi `GET /api/admin/dashboard/summary`. Response goi y: `{ students, teachers, courses, classSections, openClassSections, pendingEnrollments, unpaidTuitionBills, currentSemester, enrollmentBySemester, recentEnrollments }`.

---

#### TASK-035: Them API dashboard cho Student
**Van de:** `/student/dashboard` dang lay profile, hoa don gan nhat, lich hoc hom nay tu mock.
**Fix:** Tao `GET /api/student/dashboard/summary`. Response goi y: `{ profile, currentSemester, todaySchedule, latestTuition, gpa, cpa, credits, unreadMessages }`.

---

#### TASK-036: Them API dashboard cho Teacher
**Van de:** `/teacher/dashboard` dang lay so lop, so sinh vien, lich day hom nay, tin nhan moi tu mock.
**Fix:** Tao `GET /api/teacher/dashboard/summary`. Response goi y: `{ assignedClassCount, studentCount, todaySchedule, pendingGradeCount, unreadMessages }`.

---

#### TASK-037: Chuan hoa response list co pagination/filter/search
**Van de:** frontend can filter/search/table pagination; nhieu API backend hien tra `List<>` truc tiep.
**Fix:** Chuan hoa list endpoint voi query params `page`, `size`, `sort`, `q`, `status`, `semesterId`, `majorId` va response Spring `Page<T>` hoac wrapper `{ content, page, size, totalElements, totalPages }`. Ap dung truoc cho students, teachers, courses, class-sections, enrollments, chat messages.

---

#### TASK-038: Them endpoint `GET by id` cho cac CRUD admin
**Van de:** frontend form edit/detail can load lai ban ghi rieng, nhung controller hien chu yeu co list/create/update/delete.
**Fix:** Them `GET /api/admin/students/{id}`, `GET /api/admin/teachers/{id}`, `GET /api/admin/courses/{id}`, `GET /api/admin/semesters/{id}`, `GET /api/admin/rooms/{id}`, `GET /api/admin/periods/{id}`, `GET /api/admin/majors/{id}`, `GET /api/admin/class-sections/{id}`.

---

#### TASK-039: Chuan hoa profile API theo role
**Van de:** frontend can hien profile cho admin/teacher/student, hien tai co `GET /api/users/me` nhung can response du field theo role.
**Fix:** Mo rong `UserProfileResponse` hoac tao `GET /api/student/profile`, `GET /api/teacher/profile`. Dam bao co `id`, `username`, `email`, `fullName`, `role`, `code`, `avatarUrl`, `majorOrDepartment`, `status`.

---

#### TASK-040: Bo sung API retake registration
**Van de:** `/student/retake-registration` dang mock danh sach mon du dieu kien hoc lai/thi lai; backend chua thay endpoint rieng.
**Fix:** Tao `GET /api/student/retakes/eligible-courses?semesterId=...`, `POST /api/student/retakes/register`, `GET /api/student/retakes/my-requests?semesterId=...`. Can validate diem rot, hoc ky mo dang ky, trung lich va hoc phi.

---

#### TASK-041: Chuan hoa lich thi thanh DTO rieng
**Van de:** frontend can `course`, `date`, `time`, `room`, `format`; backend co `GET /api/student/exams` nhung can dam bao contract ro rang.
**Fix:** Tao/kiem tra `StudentExamResponse` gom `id`, `courseCode`, `courseName`, `examDate`, `startTime`, `endTime`, `roomName`, `format`, `semesterId`.

---

#### TASK-042: Chat user search can tra ve `userId` that
**Van de:** `ChatController` hien encode `userId` vao field `code` cua `UserProfileResponse`, kho dung va de loi o frontend.
**Fix:** Tao DTO rieng `ChatUserSearchResponse { id, username, fullName, email, role, avatarUrl }` cho `GET /api/chat/users/search`.

---

#### TASK-043: Chat can endpoint mark read/unread count
**Van de:** frontend co unread badge trong mock, backend REST hien co rooms/messages/search nhung chua co endpoint danh dau da doc ro rang.
**Fix:** Them `POST /api/chat/rooms/{roomId}/read`, unread count trong `ChatRoomResponse`, optional `GET /api/chat/unread-count`.

---

#### TASK-044: Chuan hoa payment return cho frontend SPA
**Van de:** `GET /api/student/tuition/vnpay-return` hien tra text; frontend SPA can trang thai co cau truc de hien toast/result page.
**Fix:** Response JSON `{ success, transactionId, semesterId, amount, message, paidAt }`; neu VNPAY redirect ve frontend thi backend can co callback/return URL ro rang.

---

#### TASK-045: Dong bo enum/status giua FE va BE
**Van de:** mock frontend dung `ACTIVE/SUSPENDED/GRADUATED`, `OPEN/CLOSED/UPCOMING`, `UNPAID/PARTIAL/PAID/OVERDUE`, backend co nhieu enum rieng.
**Fix:** Tao tai lieu contract enum hoac endpoint `GET /api/metadata/enums`, hoac export TypeScript types tu OpenAPI.

---

#### TASK-046: Tao OpenAPI contract de frontend generate types
**Van de:** frontend TypeScript hien tu dinh nghia type trong `mock.ts`; de lech voi DTO backend.
**Fix:** Dam bao Swagger/OpenAPI day du, sau do frontend dung `openapi-typescript` tao `src/lib/api/schema.ts`. Moi API service dung type generate thay vi type mock.

---

#### TASK-047: Them CORS/env config cho frontend local
**Van de:** frontend se chay Vite o `http://localhost:5173`, backend can allow origin linh hoat theo env thay vi hardcode.
**Fix:** Hoan thanh TASK-013/TASK-014, them `app.cors.allowed-origins=http://localhost:5173,http://localhost:3000` va dung chung cho REST + WebSocket.
