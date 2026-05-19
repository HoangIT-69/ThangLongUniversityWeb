# Thang Long University Web — Tài liệu Dự án

## 1. Tổng quan

**ThangLongUniversityWeb** là hệ thống quản lý trường đại học RESTful backend xây dựng bằng **Spring Boot 4.0.2 / Java 21**. Hệ thống phục vụ 3 nhóm người dùng: **Admin**, **Giảng viên (Teacher)** và **Sinh viên (Student)**, hỗ trợ đầy đủ các nghiệp vụ giáo dục từ quản lý ngành học, đăng ký môn học, quản lý điểm, học phí đến hệ thống chat real-time.

---

## 2. Tech Stack

| Layer | Công nghệ |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 4.0.2 |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Message Broker | Apache Kafka (Confluent 7.4) |
| Real-time | WebSocket (STOMP + SockJS) |
| Security | Spring Security + JWT (JJWT 0.11.5) |
| API Docs | SpringDoc OpenAPI (Swagger UI 2.5.0) |
| Rate Limiting | Bucket4j 8.10.1 |
| DB Migration | Flyway |
| Build Tool | Gradle (Kotlin DSL) |
| Containerization | Docker Compose |
| Payment | VNPay (sandbox) |
| AOP / Audit | Spring AOP + AspectJ |

---

## 3. Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────────┐
│                   CLIENT (Frontend)                   │
│          (React/Vite — localhost:5173)                │
└───────────────────────┬──────────────────────────────┘
                        │ HTTP/HTTPS + WebSocket (STOMP)
┌───────────────────────▼──────────────────────────────┐
│               Spring Boot Application                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Security   │  │  Controllers │  │  WebSocket  │ │
│  │  (JWT/Rate) │  │  (REST API)  │  │  (STOMP)    │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                │                  │        │
│  ┌──────▼──────────────────────────────────▼──────┐  │
│  │                  Service Layer                  │  │
│  └──────────────────────┬───────────────────────┘  │
│                         │                           │
│  ┌──────────────────────▼───────────────────────┐  │
│  │              Repository (JPA)                 │  │
│  └──────────────────────┬───────────────────────┘  │
└─────────────────────────┼────────────────────────── ┘
                          │
         ┌────────────────┼──────────────────┐
         ▼                ▼                  ▼
   ┌──────────┐    ┌──────────┐       ┌──────────┐
   │PostgreSQL│    │  Redis   │       │  Kafka   │
   │   :5432  │    │  :6379   │       │  :9092   │
   └──────────┘    └──────────┘       └──────────┘
```

---

## 4. Database Schema

### 4.1 Danh sách bảng

| Bảng | Mô tả |
|---|---|
| `users` | Tài khoản hệ thống (role: ADMIN/STUDENT/TEACHER) |
| `students` | Thông tin sinh viên, liên kết 1-1 với users |
| `teachers` | Thông tin giảng viên, liên kết 1-1 với users |
| `majors` | Ngành học |
| `courses` | Môn học, thuộc ngành, có điều kiện tiên quyết |
| `course_prerequisites` | Bảng quan hệ n-n điều kiện tiên quyết của môn học |
| `semesters` | Học kỳ (có cờ mở đăng ký, khóa học kỳ) |
| `rooms` | Phòng học (tên, sức chứa) |
| `periods` | Tiết học (số tiết, giờ bắt đầu, giờ kết thúc) |
| `class_sections` | Lớp học phần (lớp cụ thể của một môn trong một học kỳ) |
| `class_section_schedules` | Lịch học của lớp học phần (hỗ trợ nhiều ngày) |
| `enrollments` | Đăng ký môn học của sinh viên |
| `grades` | Điểm thành phần và điểm tổng kết |
| `academic_results` | GPA học kỳ và CPA tích lũy |
| `tuition_bills` | Hóa đơn học phí |
| `audit_logs` | Nhật ký thao tác hệ thống |
| `chat_rooms` | Phòng chat (PRIVATE / GROUP / CLASS_GROUP) |
| `chat_room_members` | Thành viên phòng chat |
| `conversations` | Cuộc trò chuyện |
| `messages` | Tin nhắn |
| `participants` | Thành viên cuộc trò chuyện |

### 4.2 Sơ đồ quan hệ chính

```
users (1) ──── (1) students ──── (N) enrollments ──── (1) class_sections
                          └───── (N) tuition_bills            │
                          └───── (N) academic_results    (N) class_section_schedules
                                                               │
users (1) ──── (1) teachers ─── (N) class_sections      periods / rooms

majors (1) ──── (N) courses ──── (N-N) course_prerequisites
       └────── (N) students

semesters (1) ── (N) class_sections
          └───── (N) academic_results
          └───── (N) tuition_bills

enrollments (1) ──── (1) grades
```

### 4.3 Chi tiết bảng quan trọng

#### `grades` — Bảng điểm
| Cột | Kiểu | Mô tả |
|---|---|---|
| `participation_score` | FLOAT | Điểm chuyên cần (0-10), trọng số 10% |
| `midterm_score` | FLOAT | Điểm giữa kỳ (0-10), trọng số 30% |
| `final_score` | FLOAT | Điểm cuối kỳ (0-10), trọng số 60% |
| `retest_score` | DOUBLE | Điểm thi lại/cải thiện (thay thế final_score) |
| `total_score` | FLOAT | Điểm tổng tự tính: `0.1*cd + 0.3*gk + 0.6*ck` |
| `letter_grade` | VARCHAR | A / B / C / D / F |
| `gpa4` | FLOAT | Điểm hệ 4 |
| `attempt_number` | INT | Lượt học (1, 2, 3...) |
| `enrollment_type` | ENUM | ORDINARY / RETAKE / IMPROVE |

#### `class_sections` — Lớp học phần
- Hỗ trợ lịch học nhiều ngày qua bảng `class_section_schedules`
- Cờ `grade_locked`: khoá điểm sau khi nhập xong
- Hỗ trợ phòng thi (`exam_at`, `exam_room`)
- Kiểm soát sĩ số: `current_slots` / `max_slots`

---

## 5. Luồng nghiệp vụ chính

### 5.1 Luồng Xác thực (Authentication)

```
Client
  │── POST /api/auth/login ──► AuthController ──► AuthService
  │                                                   │── BCrypt verify password
  │                                                   │── Generate Access Token (JWT, 15 phút)
  │                                                   │── Generate Refresh Token → lưu Redis (7 ngày)
  │◄── { accessToken, refreshToken (cookie HttpOnly) }
  │
  │── [Mọi request sau] Bearer <accessToken>
  │   RateLimitFilter (Bucket4j) ──► JwtAuthenticationFilter (validate JWT)
  │   SecurityContextHolder ──► Controller ──► Service
  │
  │── POST /api/auth/refresh ──► Redis lấy refresh token ──► cấp Access Token mới
  │── POST /api/auth/logout  ──► Xóa refresh token khỏi Redis
```

### 5.2 Luồng Đăng ký môn học (Enrollment)

```
Student
  │── POST /api/student/enrollment/register/{classSectionId}
  │       ├── Kiểm tra học kỳ mở đăng ký
  │       ├── Kiểm tra lớp còn slot
  │       ├── Kiểm tra trùng môn cùng học kỳ
  │       ├── Kiểm tra môn tiên quyết (prerequisites)
  │       ├── Kiểm tra xung đột lịch (schedule overlap)
  │       └── Tạo EnrollmentMessage (UUID requestId) → gửi Kafka topic "class-registration"
  │◄── { requestId: "uuid" } (trả về ngay, không chờ)
  │
  │── GET /api/student/enrollment/status/{requestId}
  │◄── { status: PENDING / PROCESSING / SUCCESS / FAILED, message }
  │
  [Kafka Consumer - xử lý bất đồng bộ]
  EnrollmentConsumer
      ├── Pessimistic Lock class_section (chống race condition)
      ├── Idempotency check (requestId trong Redis)
      ├── Kiểm tra lại slot (slot có thể bị giành trong lúc chờ)
      ├── Lưu Enrollment vào DB
      ├── Tạo Grade record rỗng
      ├── Tăng current_slots
      └── Cập nhật trạng thái requestId → SUCCESS/FAILED
```

### 5.3 Luồng Nhập điểm (Grading)

```
Teacher
  │── GET /api/teacher/grades/class/{classSectionId}    ← xem danh sách sinh viên
  │── PUT /api/teacher/grades/update                    ← nhập/sửa điểm
  │       ├── Kiểm tra grade_locked (lớp đã khóa điểm → từ chối)
  │       ├── Kiểm tra is_locked semester (học kỳ đã khóa → từ chối)
  │       ├── Lưu điểm (participation, midterm, final / retest)
  │       └── @PreUpdate tự động tính total_score, letter_grade, gpa4
  │── POST /api/teacher/grades/lock/{classSectionId}    ← khóa điểm lớp

Admin
  │── PUT /api/admin/grades/override                    ← ghi đè điểm sau khi khóa
  │── POST /api/admin/academic-results/calculate/{studentId}/{semesterId} ← tính GPA
```

### 5.4 Luồng Học phí (Tuition)

```
Student
  │── GET /api/student/tuition/my-bills                 ← xem hóa đơn
  │── POST /api/student/tuition/pay/{billId}             ← tạo link VNPay
  │       └── VNPayConfig.hmacSHA512 ký tham số
  │◄── { paymentUrl } → redirect tới VNPay sandbox
  │
  [VNPay callback]
  GET /api/student/tuition/vnpay-return
      ├── Xác minh chữ ký HMAC-SHA512
      ├── Cập nhật paidAmount
      └── Đánh dấu isCompleted = true nếu đủ
```

### 5.5 Luồng Chat Real-time (WebSocket)

```
Client (SockJS/STOMP)
  │── CONNECT ws://localhost:8080/ws/chat
  │   WebSocketHandshakeInterceptor: validate JWT từ query param ?token=
  │   WebSocketChannelInterceptor: validate JWT trên mỗi message
  │
  │── SUBSCRIBE /topic/chatroom/{chatRoomId}    ← nhận tin nhắn nhóm
  │── SUBSCRIBE /user/queue/messages            ← nhận tin nhắn riêng
  │
  │── SEND /app/chat/send { chatRoomId, content }
  │   ChatWebSocketController
  │       ├── Lưu Message vào DB
  │       ├── Cập nhật lastMessage của ChatRoom
  │       ├── [nếu Kafka enabled] ChatKafkaProducer.sendChatMessage()
  │       └── messagingTemplate.convertAndSend("/topic/chatroom/{id}", response)
```

---

## 6. Phân quyền API

| Prefix | Role | Mô tả |
|---|---|---|
| `/api/auth/**` | PUBLIC | Đăng nhập, đăng ký, refresh token |
| `/api/admin/**` | ADMIN | Quản lý toàn hệ thống |
| `/api/student/**` | STUDENT | Nghiệp vụ sinh viên |
| `/api/teacher/**` | TEACHER | Nghiệp vụ giảng viên |
| `/api/chat/**` | STUDENT/TEACHER/ADMIN | Hệ thống chat |
| `/ws/**` | PUBLIC (JWT via query param) | WebSocket endpoint |
| `/swagger-ui/**` | PUBLIC | API documentation |

---

## 7. Tính năng bảo mật

- **JWT Stateless**: Access Token (15 phút), Refresh Token (7 ngày, lưu Redis)
- **BCrypt**: Mã hóa mật khẩu
- **Rate Limiting**: Bucket4j giới hạn request/IP chống brute force
- **CSRF**: Disabled (JWT-based stateless API)
- **HttpOnly Cookie**: Refresh token trong cookie để tránh XSS
- **AOP Audit Log**: `@Audit` annotation ghi log mọi thao tác quan trọng
- **Idempotency**: Kafka enrollment dùng UUID requestId chống duplicate
- **Pessimistic Lock**: Khoá DB khi cập nhật slot để chống race condition
- **HMAC-SHA512**: Ký xác minh callback VNPay

---

## 8. Docker Infrastructure

```yaml
Services:
  postgres    :5432   # PostgreSQL 15-alpine
  redis       :6379   # Redis 7-alpine
  zookeeper   :2181   # Confluent Zookeeper 7.4
  kafka       :9092   # Confluent Kafka 7.4
  kafka-ui    :8090   # Kafka UI quản lý topic
  pgadmin     :5050   # PgAdmin quản lý DB
```

---

## 9. Cấu trúc Package

```
com.example.ThangLongUniversityWeb/
├── audit/          # AOP Audit logging (@Audit annotation, AuditAspect)
├── common/enums/   # Enum dùng chung
├── CompositeKey/   # Composite primary keys
├── config/         # Cấu hình (Security, Redis, Kafka, VNPay, WebSocket, Swagger)
├── controller/     # REST Controllers (20 controller)
├── dto/
│   ├── request/    # Request DTOs (18 class)
│   └── response/   # Response DTOs (21 class)
├── entity/         # JPA Entities (20 entity)
├── enums/          # Domain enums (Role, EnrollmentStatus, MessageType, ...)
├── exception/      # Exception handlers
├── kafka/          # Kafka Producer/Consumer
├── repository/     # Spring Data JPA Repositories (19 repo)
├── security/       # JWT Filter, Rate Limit Filter, WebSocket Interceptors
├── service/        # Business Logic (21 service)
└── utils/          # Tiện ích (ScheduleUtils, ...)
```

---

## 10. Flyway Migration Versions

| Version | File | Nội dung |
|---|---|---|
| V1 | `V1__security_integrity_audit.sql` | Unique constraint enrollment, is_locked semester, exam fields, audit_logs |
| V2 | `V2__add_period_entity.sql` | Bảng periods, quan hệ với class_sections |
| V2 | `V2__major_and_prerequisites.sql` | Bảng majors, course_prerequisites |
| V3 | `V3__multi_day_schedule.sql` | Bảng class_section_schedules (lịch nhiều ngày) |
| V4 | `V4__add_schedule_room_id.sql` | Thêm room_id cho từng dòng lịch |
| V6 | `V6__optimize_schema.sql` | (Dự phòng) |
