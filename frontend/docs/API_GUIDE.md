# API Client Guide — ThangLongUniversityWeb

**Purpose:** How to call backend APIs from the frontend  
**Backend:** Spring Boot at http://localhost:8080  
**API Docs:** OpenAPI/Swagger at `/v3/api-docs` + UI at `/swagger-ui/index.html`

---

## Quick Start

### 1. Use API Modules (NEVER direct fetch)

```typescript
// ✅ REQUIRED
import { studentApi } from "@/lib/api/student";

const grades = await studentApi.getGrades(semesterId);
const semesters = await studentApi.listSemesters();

// ❌ FORBIDDEN
const grades = await fetch("/api/student/grades").then((r) => r.json());
```

### 2. Wrap in useQuery (Server State)

```typescript
// ✅ REQUIRED
const { data, isPending, isError, error } = useQuery({
  queryKey: ['student', 'grades', semesterId],
  queryFn: () => studentApi.getGrades(semesterId),
  enabled: semesterId != null
})

// Show all states
if (isPending) return <Skeleton />
if (isError) return <ErrorAlert error={error} />
return <Display data={data} />
```

### 3. Mutations with Cache Invalidation

```typescript
// ✅ REQUIRED
const { mutate } = useMutation({
  mutationFn: (data) => studentApi.enrollClass(data.classId),
  onSuccess: () => {
    // REQUIRED: Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ["student", "enrollments"] });
    toast.success("Enrolled!");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

mutate({ classId: 123 });
```

---

## API Architecture

### 1. Fetch Wrapper (src/lib/api/client.ts)

**Internal use only - DO NOT import in components**

Handles:

- ✅ Automatic `Authorization: Bearer {token}` header
- ✅ Automatic token refresh on 401
- ✅ JWT token storage/retrieval from localStorage
- ✅ Environment-based base URL (VITE_API_BASE_URL)
- ✅ Error parsing
- ✅ Response typing

```typescript
// Internal implementation (don't use directly)
async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  // Adds Authorization header
  // Handles 401 → refresh token
  // Parses JSON response
}
```

---

### 2. Type Definitions (src/lib/api/types.ts)

All API response types centralized here.

```typescript
// Example types
export interface StudentGradeItemResponse {
  enrollmentId: number;
  semesterId: number;
  classCode: string;
  courseName: string;
  credits: number;
  midtermScore?: number | null;
  finalScore?: number | null;
  totalScore?: number | null;
  gradePoint?: number | null;
}

export interface StudentGradesSummaryResponse {
  semesterId?: number | null;
  semesterGpa: number;
  cumulativeGpa: number;
  items: StudentGradeItemResponse[];
}
```

**When to use:** Import for typing components and forms

```typescript
import type { StudentGradeItemResponse } from "@/lib/api/types";

function GradesDisplay({ grades }: { grades: StudentGradeItemResponse[] }) {
  // ...
}
```

---

### 3. API Modules (Domain-Organized)

#### src/lib/api/auth.ts

Handles login, authentication, logout.

```typescript
export function login(username: string, password: string): Promise<AuthResponse>;
export function getMe(): Promise<UserProfile>;
export function logout(): Promise<string>;
```

**Usage:**

```typescript
// ✅ Via auth context (recommended)
const { login, logout } = useAuth();
await login(username, password);

// Direct call (rare)
import { authApi } from "@/lib/api/auth";
```

**Response:**

```typescript
interface AuthResponse {
  accessToken: string; // JWT token
  refreshToken: string; // For refresh endpoint
  role: "ADMIN" | "STUDENT" | "TEACHER";
}
```

---

#### src/lib/api/student.ts

Student-specific operations.

```typescript
export const studentApi = {
  // Semesters
  listSemesters: () => Promise<StudentSemesterResponse[]>

  // Classes & Enrollment
  listAvailableClasses: (semesterId: number) => Promise<ClassSectionResponse[]>
  enrollClass: (classSectionId: number) => Promise<EnrollmentRequestResponse>
  cancelClass: (classSectionId: number) => Promise<string>
  getEnrollmentStatus: (requestId: string) => Promise<EnrollmentRequestStatusResponse>

  // Grades & Learning
  getGrades: (semesterId?: number) => Promise<StudentGradesSummaryResponse>
  getLearningResults: (semesterId?: number) => Promise<LearningResultsResponse>
  getSchedule: (semesterId: number) => Promise<EnrollmentResponse[]>
  getExams: (semesterId: number) => Promise<StudentExamResponse[]>

  // Curriculum
  getCurriculum: () => Promise<CourseResponse[]>

  // Tuition
  getTuition: (semesterId: number) => Promise<TuitionResponse>
  createVNPayUrl: (semesterId: number) => Promise<string>

  // Retakes
  listRetakeEligibleCourses: (semesterId?: number) => Promise<RetakeEligibleCourseResponse[]>
  registerRetakes: (courseIds: number[]) => Promise<RetakeRegistrationResponse>
  listRetakeRequests: (semesterId?: number) => Promise<RetakeRequestResponse[]>
}
```

**Usage Examples:**

```typescript
// Get semesters
const { data: semesters } = useQuery({
  queryKey: ["student", "semesters"],
  queryFn: studentApi.listSemesters,
});

// Get grades for specific semester
const { data: grades } = useQuery({
  queryKey: ["student", "grades", semesterId],
  queryFn: () => studentApi.getGrades(semesterId),
  enabled: semesterId != null,
});

// Enroll in class (mutation)
const { mutate: enrollClass } = useMutation({
  mutationFn: (classId) => studentApi.enrollClass(classId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["student", "enrollments"] });
    toast.success("Enrolled!");
  },
});
```

---

#### src/lib/api/admin.ts

Admin management operations.

```typescript
export const adminApi = {
  // Reference data
  listMajors: () => Promise<MajorResponse[]>
  deleteMajor: (id: number) => Promise<string>

  listRooms: () => Promise<RoomResponse[]>
  deleteRoom: (id: number) => Promise<string>

  listPeriods: () => Promise<PeriodResponse[]>
  deletePeriod: (id: number) => Promise<string>

  // TODO: More endpoints for users, students, teachers, courses, etc
}
```

**Usage:**

```typescript
const { data: majors } = useQuery({
  queryKey: ["admin", "majors"],
  queryFn: adminApi.listMajors,
});

const { mutate: deleteMajor } = useMutation({
  mutationFn: (id) => adminApi.deleteMajor(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "majors"] });
    toast.success("Deleted");
  },
});
```

---

#### src/lib/api/chat.ts

Chat system operations (WebSocket + REST).

```typescript
export const chatApi = {
  // To be implemented based on backend endpoints
};
```

---

## JWT Authentication Flow

### 1. Login → Get Tokens

```typescript
// User submits credentials
POST /api/auth/login
{
  "username": "student001",
  "password": "password123"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "role": "STUDENT"
}

// Tokens stored in localStorage
localStorage.setItem('tlu-auth', JSON.stringify({
  accessToken: "...",
  refreshToken: "...",
  role: "STUDENT",
  name: "Student Name"
}))
```

### 2. Every API Call → Attach Token

```typescript
// apiRequest wrapper automatically adds header
GET /api/student/grades
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
  "Content-Type": "application/json"
}
```

### 3. Token Expires → Auto Refresh

```typescript
// If response is 401 (token expired)
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Get new accessToken
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "role": "STUDENT"
}

// Update localStorage and retry original request
```

### 4. Logout → Clear Tokens

```typescript
const { logout } = useAuth();
await logout();

// Calls POST /api/auth/logout
// Clears localStorage
// Redirects to /login
```

---

## Error Handling

### Error Structure

```typescript
// Backend returns errors in this format
{
  "timestamp": "2024-05-19T10:30:00Z",
  "message": "Student not found",
  "status": 404,
  "path": "/api/admin/students/999"
}

// Parsed by apiRequest into Error object
```

### Handling in Components

```typescript
// ✅ REQUIRED: Show error
const { data, isError, error } = useQuery({...})

if (isError) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.message || 'Something went wrong'}
      </AlertDescription>
    </Alert>
  )
}

// Toast for mutations
const { mutate } = useMutation({
  mutationFn: ...,
  onError: (error) => {
    toast.error(error.message || 'Operation failed')
  }
})
```

---

## Backend Endpoints Reference

### Authentication

```
POST /api/auth/login
  Request: { username, password }
  Response: { accessToken, refreshToken, role }

POST /api/auth/logout
  Request: { refreshToken }
  Response: "Logout successful"

POST /api/auth/refresh
  Request: { refreshToken }
  Response: { accessToken, refreshToken, role }

GET /api/users/me
  Response: { username, email, role, fullName, code, etc }
```

### Student Endpoints

```
GET /api/student/semesters
  Response: StudentSemesterResponse[]

GET /api/student/classes/semester/:semesterId
  Response: ClassSectionResponse[]

POST /api/student/enroll/:classId
  Response: { requestId, message }

GET /api/student/enrollments/status/:requestId
  Response: { requestId, status, message }

GET /api/student/my-schedule/:semesterId
  Response: EnrollmentResponse[]

GET /api/student/grades?semesterId=:id
  Response: StudentGradesSummaryResponse

GET /api/student/learning-results?semesterId=:id
  Response: LearningResultsResponse

GET /api/student/curriculum
  Response: CourseResponse[]

GET /api/student/exams?semesterId=:id
  Response: StudentExamResponse[]

GET /api/student/tuition/:semesterId
  Response: TuitionResponse

POST /api/student/tuition/:semesterId/vnpay-url
  Response: "https://..."

GET /api/student/retakes/eligible-courses?semesterId=:id
  Response: RetakeEligibleCourseResponse[]

POST /api/student/retakes/register
  Request: { courseIds: number[] }
  Response: RetakeRegistrationResponse

GET /api/student/retakes/my-requests?semesterId=:id
  Response: RetakeRequestResponse[]
```

### Admin Endpoints

```
GET /api/admin/majors
  Response: MajorResponse[]

DELETE /api/admin/majors/:id
  Response: "Deleted"

GET /api/admin/rooms
  Response: RoomResponse[]

DELETE /api/admin/rooms/:id
  Response: "Deleted"

GET /api/admin/periods
  Response: PeriodResponse[]

DELETE /api/admin/periods/:id
  Response: "Deleted"

// TODO: More endpoints for users, students, teachers, courses, semesters,
//       class-sections, enrollments, academic-results
```

---

## Adding New Endpoints

### Step 1: Add Type to types.ts

```typescript
// src/lib/api/types.ts
export interface NewEntityResponse {
  id: number;
  name: string;
  // ... other fields
}
```

### Step 2: Add to API Module

```typescript
// src/lib/api/student.ts (or admin.ts, etc)
export const studentApi = {
  // Existing endpoints...

  // New endpoint
  getNewEntity: (id: number) => apiRequest<NewEntityResponse>(`/api/student/new-entity/${id}`),
};
```

### Step 3: Use in Component

```typescript
const { data } = useQuery({
  queryKey: ["student", "newEntity", id],
  queryFn: () => studentApi.getNewEntity(id),
  enabled: id != null,
});
```

---

## Environment Configuration

### Development

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8080
```

### Production

```bash
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Usage

```typescript
// Automatically used in src/lib/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
```

---

## Testing API Calls

### Using Swagger UI

1. **Start backend:** `./gradlew bootRun`
2. **Open Swagger:** http://localhost:8080/swagger-ui/index.html
3. **Authorize:** Click "Authorize" button, paste JWT token
4. **Test endpoints:** Use "Try it out" button

### Using cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student001","password":"password123"}'

# Get semesters (with token)
curl -X GET http://localhost:8080/api/student/semesters \
  -H "Authorization: Bearer eyJhbGci..."
```

### Using Postman

1. Import Swagger: http://localhost:8080/v3/api-docs
2. Set up "Bearer Token" authorization
3. Test endpoints

---

## Common Patterns

### Load Multiple Related Queries

```typescript
// Dashboard: Load related data
const { data: semesters } = useQuery({
  queryKey: ["student", "semesters"],
  queryFn: studentApi.listSemesters,
});

const semesterId = semesters?.[0]?.id;

const { data: grades } = useQuery({
  queryKey: ["student", "grades", semesterId],
  queryFn: () => studentApi.getGrades(semesterId),
  enabled: semesterId != null,
});

const { data: schedule } = useQuery({
  queryKey: ["student", "schedule", semesterId],
  queryFn: () => studentApi.getSchedule(semesterId),
  enabled: semesterId != null,
});
```

### Pagination

```typescript
const [page, setPage] = useState(1);

const { data } = useQuery({
  queryKey: ["items", page],
  queryFn: () => api.listItems(page, 10),
});

// Query key includes page → auto-refetch on page change
```

### Search & Filter

```typescript
const [searchTerm, setSearchTerm] = useState("");

const { data } = useQuery({
  queryKey: ["items", searchTerm],
  queryFn: () => api.searchItems(searchTerm),
});

// Client-side filtering (if data is small)
const filtered = data?.filter((item) => item.name.includes(searchTerm));
```

### Polling

```typescript
const { data } = useQuery({
  queryKey: ["enrollments", "status", requestId],
  queryFn: () => studentApi.getEnrollmentStatus(requestId),
  refetchInterval: 2000, // Poll every 2 seconds
});
```

---

## Troubleshooting

| Issue                | Solution                                                                        |
| -------------------- | ------------------------------------------------------------------------------- |
| **401 Unauthorized** | Token expired or invalid. Refresh token via `POST /api/auth/refresh`            |
| **CORS error**       | Backend must have CORS enabled. Check Spring Security config                    |
| **Network error**    | Backend not running. Start with `./gradlew bootRun`                             |
| **Type mismatch**    | Response structure doesn't match type. Check `types.ts` and Swagger             |
| **Stale data**       | Add to cache invalidation: `queryClient.invalidateQueries({ queryKey: [...] })` |
| **Query not firing** | Check `enabled` guard - ensure dependencies are not undefined                   |

---

## API Documentation

**OpenAPI/Swagger:**

- **JSON:** http://localhost:8080/v3/api-docs
- **UI:** http://localhost:8080/swagger-ui/index.html

**Backend readme:** [backend/docs/SWAGGER_SETUP_GUIDE.md](../backend/docs/SWAGGER_SETUP_GUIDE.md)
