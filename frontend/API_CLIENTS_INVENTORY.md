# API Clients Inventory - Thang Long University Web

## Frontend API Clients

### Core API Client Files Location: `frontend/src/lib/api/`

#### 1. **client.ts** - Main API Client Core
- **Path:** `frontend/src/lib/api/client.ts`
- **Purpose:** Base HTTP client with token management, authentication, refresh token flow
- **Key Functions:**
  - `apiRequest<T>()` - Main API request handler with retry logic
  - `getStoredAuth()` - Retrieve stored authentication from localStorage
  - `setStoredAuth()` - Store authentication tokens
  - `refreshAccessToken()` - Handle token refresh with 401 errors
  - `jsonBody()` - Serialize JSON request body
- **Features:**
  - Bearer token authentication
  - Automatic token refresh
  - Error handling and parsing
  - FormData support
  - CORS-enabled requests to backend

#### 2. **auth.ts** - Authentication API
- **Path:** `frontend/src/lib/api/auth.ts`
- **Purpose:** User authentication and session management
- **Key Functions:**
  - `login(username, password)` - User login endpoint
  - `getMe()` - Get current user profile
  - `logout()` - User logout with token revocation
- **Endpoints:**
  - POST `/api/auth/login`
  - GET `/api/users/me`
  - POST `/api/auth/logout`

#### 3. **admin.ts** - Admin API
- **Path:** `frontend/src/lib/api/admin.ts`
- **Purpose:** Admin management operations
- **Key Functions:**
  - `listMajors()` - Get all majors
  - `deleteMajor(id)` - Delete major by ID
  - `listRooms()` - Get all classroom rooms
  - `deleteRoom(id)` - Delete room by ID
  - `listPeriods()` - Get all class periods
  - `deletePeriod(id)` - Delete period by ID
- **Endpoints:**
  - GET `/api/admin/majors`
  - DELETE `/api/admin/majors/{id}`
  - GET `/api/admin/rooms`
  - DELETE `/api/admin/rooms/{id}`
  - GET `/api/admin/periods`
  - DELETE `/api/admin/periods/{id}`

#### 4. **chat.ts** - Chat API
- **Path:** `frontend/src/lib/api/chat.ts`
- **Purpose:** Real-time messaging and chat room management
- **Key Functions:**
  - `listRooms()` - Get all chat rooms
  - `searchUsers(q)` - Search users by query
  - `createPrivateRoom(otherUserId)` - Create 1-on-1 chat
  - `createGroupRoom(name, memberIds)` - Create group chat
  - `leaveRoom(roomId)` - Leave chat room
  - `listMessages(roomId)` - Get messages from room
  - `sendMessage(roomId, content)` - Send text message
  - `markRoomRead(roomId)` - Mark room as read
  - `listFiles(roomId)` - Get files in room
  - `listLinks(roomId)` - Get links in room
  - `uploadFile(roomId, file)` - Upload file to chat
- **Types Defined:**
  - `ChatRoomType` - PRIVATE, GROUP, CLASS_GROUP
  - `MessageType` - TEXT, IMAGE, FILE
  - `ChatRoom`, `ChatMessage`, `ChatUser`, `ChatMember`
- **Endpoints:**
  - GET `/api/chat/rooms`
  - GET `/api/chat/users/search`
  - POST `/api/chat/rooms/private`
  - POST `/api/chat/rooms`
  - DELETE `/api/chat/rooms/{id}/members/me`
  - GET `/api/chat/rooms/{id}/messages`
  - POST `/api/chat/rooms/{id}/messages`
  - POST `/api/chat/rooms/{id}/read`
  - GET `/api/chat/rooms/{id}/files`
  - GET `/api/chat/rooms/{id}/links`
  - POST `/api/chat/rooms/{id}/files`

#### 5. **student.ts** - Student API
- **Path:** `frontend/src/lib/api/student.ts`
- **Purpose:** Student academic operations and course management
- **Key Functions:**
  - `listSemesters()` - Get all available semesters
  - `listAvailableClasses(semesterId)` - Get classes for semester
  - `enrollClass(classSectionId)` - Enroll in class
  - `cancelClass(classSectionId)` - Cancel class enrollment
  - `getEnrollmentStatus(requestId)` - Check enrollment status
  - `getSchedule(semesterId)` - Get student schedule
  - `getGrades(semesterId?)` - Get student grades
  - `getLearningResults(semesterId?)` - Get learning results
  - `getCurriculum()` - Get curriculum/major requirements
  - `getExams(semesterId)` - Get exam schedule
  - `getTuition(semesterId)` - Get tuition information
  - `createVNPayUrl(semesterId)` - Generate payment link
  - `listRetakeEligibleCourses(semesterId?)` - Get retake eligible courses
  - `registerRetakes(courseIds)` - Register for retakes
  - `listRetakeRequests(semesterId?)` - Get retake requests
- **Endpoints:**
  - GET `/api/student/semesters`
  - GET `/api/student/classes/semester/{id}`
  - POST `/api/student/enroll/{id}`
  - DELETE `/api/student/enroll/{id}`
  - GET `/api/student/enrollments/status/{id}`
  - GET `/api/student/my-schedule/{id}`
  - GET `/api/student/grades`
  - GET `/api/student/learning-results`
  - GET `/api/student/curriculum`
  - GET `/api/student/exams`
  - GET `/api/student/tuition/{id}`
  - POST `/api/student/tuition/{id}/vnpay-url`
  - GET `/api/student/retakes/eligible-courses`
  - POST `/api/student/retakes/register`
  - GET `/api/student/retakes/my-requests`

#### 6. **types.ts** - TypeScript Type Definitions
- **Path:** `frontend/src/lib/api/types.ts`
- **Purpose:** Shared TypeScript interfaces and types for API responses
- **Key Type Groups:**
  - Authentication: `AuthResponse`, `UserProfile`
  - Admin: `MajorResponse`, `RoomResponse`, `PeriodResponse`
  - Class/Schedule: `ClassSectionResponse`, `ClassSectionScheduleResponse`, `StudentSemesterResponse`
  - Enrollment: `EnrollmentResponse`, `EnrollmentRequestResponse`, `EnrollmentRequestStatusResponse`
  - Grades: `StudentGradeItemResponse`, `StudentGradesSummaryResponse`, `LearningResultsResponse`
  - Tuition: `TuitionResponse`, `TuitionItemResponse`
  - Exams: `StudentExamResponse`
  - Retakes: `RetakeEligibleCourseResponse`, `RetakeRegistrationResponse`, `RetakeRequestResponse`
  - Courses: `CourseResponse`

---

## Backend API Services & Controllers

### Location: `backend/src/main/java/com/tlu/`

#### Controllers (28 files)
- **AuthController** - Handles user authentication (login, logout, refresh)
- **StudentController** - Student-related endpoints
- **TeacherController** - Teacher-related endpoints
- **AdminAcademicResultController** - Admin academic result management
- **And 24+ other REST controllers** - Various domain-specific endpoints

#### Services (28 files)
- **AuthService** - Authentication business logic
- **ChatMessageService** - Chat message handling
- **EnrollmentProcessor** - Course enrollment logic
- **StudentService** - Student operations
- **TeacherService** - Teacher operations
- **UserService** - User management
- **CourseService** - Course management
- **And 21+ other business services** - Various domain services

#### Kafka Components
- **ChatKafkaProducer** - Produce chat messages to Kafka
- **EnrollmentConsumer** - Consume enrollment events
- **ChatKafkaConsumer** - Consume chat events

#### Configuration & Security
- **OpenApiConfig** - Swagger/OpenAPI documentation
- **SecurityConfig** - Spring Security configuration
- **WebSocketConfig** - WebSocket connection handling
- **JwtAuthenticationFilter** - JWT token validation
- **RateLimitFilter** - Rate limiting
- **WebSocketChannelInterceptor** - WebSocket message interception
- **RedisConfig** - Redis cache configuration
- **DataInitializer** - Database initialization

#### DTOs (Data Transfer Objects)
- **ChatMessageRequest/Response** - Chat message DTO
- **ChatRoomRequest** - Chat room creation DTO
- And other request/response DTOs

---

## Summary Statistics

### Frontend
- **Total API Client Files:** 6
- **Main Endpoints Categories:** 5
  1. Authentication (1 endpoint group)
  2. Admin Management (3 endpoint groups)
  3. Chat & Messaging (9 endpoint groups)
  4. Student Academic (15 endpoint groups)
- **Total TypeScript Types:** 30+

### Backend
- **Total Controllers:** 28+
- **Total Services:** 28+
- **Total Kafka Components:** 3
- **Total Configuration Classes:** 6+
- **Total DTO Classes:** Multiple

---

## API Base Configuration

### Environment Variable
- **Variable:** `VITE_API_BASE_URL`
- **Default:** `http://localhost:8080`
- **Used in:** Frontend API client for all requests

### Authentication Method
- **Type:** Bearer Token (JWT)
- **Header:** `Authorization: Bearer {accessToken}`
- **Refresh:** Automatic via `/api/auth/refresh` endpoint

### Error Handling
- Automatic 401 token refresh
- Custom error messages from backend
- Local storage for auth persistence

---

## Frontend API Client Architecture

```
client.ts (Core HTTP Client)
    ├── apiRequest<T>() - Main method
    ├── Auth Token Management
    │   ├── getStoredAuth()
    │   ├── setStoredAuth()
    │   └── refreshAccessToken()
    └── Response Parsing

├─ auth.ts (Uses client.ts)
│   ├── login()
│   ├── getMe()
│   └── logout()

├─ admin.ts (Uses client.ts)
│   ├── listMajors/deleteMajor
│   ├── listRooms/deleteRoom
│   └── listPeriods/deletePeriod

├─ chat.ts (Uses client.ts)
│   ├── Room Management
│   ├── Message Management
│   ├── File Operations
│   └── User Search

├─ student.ts (Uses client.ts)
│   ├── Semester Management
│   ├── Class Enrollment
│   ├── Grades & Results
│   ├── Exam Schedule
│   ├── Tuition
│   └── Retake Registration

└─ types.ts (Shared Type Definitions)
```

---

**Generated:** May 19, 2026
**Project:** Thang Long University Web System
