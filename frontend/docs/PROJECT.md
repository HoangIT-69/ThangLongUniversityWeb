# Frontend Architecture — ThangLongUniversityWeb

**Generated:** May 19, 2026  
**Stack:** TanStack Start + React 19 + TypeScript + TanStack Query + TanStack Router  
**Backend:** Spring Boot 4.0.2 / Java 21 (localhost:8080)  
**API:** OpenAPI/Swagger at `/v3/api-docs`

---

## 1. Tech Stack Overview

| Layer                | Technology                       | Purpose                                       |
| -------------------- | -------------------------------- | --------------------------------------------- |
| **Framework**        | TanStack Start                   | Server-side rendering capable React framework |
| **UI Library**       | shadcn/ui + TailwindCSS          | Pre-built, accessible components              |
| **State Management** | TanStack Query v5.83             | Server state & caching ONLY                   |
| **Routing**          | TanStack Router v1.168           | File-based, type-safe routing                 |
| **Forms**            | react-hook-form + Zod            | Form validation & state                       |
| **HTTP**             | Fetch API                        | Centralized via `apiClient` wrapper           |
| **Auth**             | JWT (accessToken + refreshToken) | Role-based access control                     |
| **Styling**          | TailwindCSS v4                   | Utility-first CSS                             |
| **Icons**            | lucide-react                     | Consistent icon library                       |
| **Notifications**    | sonner                           | Toast notifications                           |
| **Date**             | Intl API                         | Vietnamese date/number formatting             |

---

## 2. Project Structure

```
frontend/
├── src/
│   ├── routes/                    # TanStack Router file-based routes
│   │   ├── __root.tsx            # Root layout
│   │   ├── index.tsx             # Public landing
│   │   ├── login.tsx             # Auth page
│   │   ├── admin.tsx             # Admin layout (ProtectedOutlet)
│   │   ├── admin.dashboard.tsx   # Admin dashboard
│   │   ├── admin.students.tsx    # Admin: Student management
│   │   ├── admin.users.tsx       # Admin: User management
│   │   ├── admin.majors.tsx      # Admin: Major management
│   │   ├── admin.courses.tsx     # Admin: Course management
│   │   ├── admin.semesters.tsx   # Admin: Semester management
│   │   ├── admin.periods.tsx     # Admin: Period management
│   │   ├── admin.rooms.tsx       # Admin: Room management
│   │   ├── admin.class-sections.tsx # Admin: Class sections
│   │   ├── admin.enrollments.tsx # Admin: Enrollment tracking
│   │   ├── admin.academic-results.tsx # Admin: Results
│   │   ├── admin.chat.tsx        # Admin chat
│   │   ├── admin.profile.tsx     # Admin profile
│   │   ├── student.tsx           # Student layout
│   │   ├── student.dashboard.tsx # Student dashboard
│   │   ├── student.grades.tsx    # Student view grades
│   │   ├── student.schedule.tsx  # Student schedule
│   │   ├── student.exams.tsx     # Student exam schedule
│   │   ├── student.academic-results.tsx # Student results
│   │   ├── student.curriculum.tsx  # Student curriculum
│   │   ├── student.course-registration.tsx # Student course registration
│   │   ├── student.retake-registration.tsx # Student retake registration
│   │   ├── student.tuition.tsx   # Student tuition & payment
│   │   ├── student.notifications.tsx # Student notifications
│   │   ├── student.chat.tsx      # Student chat
│   │   ├── student.profile.tsx   # Student profile
│   │   ├── teacher.tsx           # Teacher layout
│   │   ├── teacher.dashboard.tsx # Teacher dashboard
│   │   ├── teacher.grades.tsx    # Teacher grade management
│   │   ├── teacher.classes.tsx   # Teacher class list
│   │   ├── teacher.classes.$classSectionId.students.tsx # Student roster
│   │   └── teacher.chat.tsx      # Teacher chat
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx     # Main layout with sidebar + header
│   │   │   └── ProtectedOutlet.tsx # Role-based access control
│   │   ├── ui/
│   │   │   ├── page-header.tsx   # Page title + stats
│   │   │   ├── status-badge.tsx  # Status indicators
│   │   │   ├── confirm-dialog.tsx # Confirmation dialogs
│   │   │   └── [44+ shadcn/ui components]
│   │   ├── data-table/
│   │   │   └── DataTable.tsx     # Reusable paginated table
│   │   └── forms/
│   │       └── EntityFormDialog.tsx # Generic form dialog
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts         # Fetch wrapper + JWT handling
│   │   │   ├── types.ts          # TypeScript DTO interfaces
│   │   │   ├── auth.ts           # Login, logout, getMe
│   │   │   ├── student.ts        # Student endpoints
│   │   │   ├── admin.ts          # Admin endpoints
│   │   │   └── chat.ts           # Chat endpoints
│   │   ├── auth.tsx              # AuthContext + useAuth hook
│   │   └── utils.ts              # cn(), date formatters
│   ├── hooks/
│   │   └── use-mobile.tsx        # Responsive breakpoint hook
│   ├── data/
│   │   └── mock.ts               # Mock data (students, majors, etc)
│   ├── router.tsx                # Router instantiation
│   ├── routeTree.gen.ts          # Auto-generated by TanStack Router
│   ├── start.ts                  # Server entry point
│   ├── server.ts                 # Server handlers
│   ├── styles.css                # Tailwind directives
│   └── __root.tsx                # Root component
├── docs/
│   ├── PROJECT.md                # This file
│   ├── FRONTEND_RULES.md         # Coding rules
│   ├── COMPONENT_MAP.md          # Component inventory
│   ├── API_GUIDE.md              # API client guide
│   └── TASKS.md                  # Feature status
├── package.json                  # Dependencies
├── vite.config.ts                # Vite + TanStack Start config
├── tsconfig.json                 # TypeScript strict mode
└── README.md
```

---

## 3. Authentication & Authorization

### Flow

```
1. User logs in → /login
   ↓
2. POST /api/auth/login(username, password)
   Response: { accessToken, refreshToken, role }
   ↓
3. Stored in localStorage as "tlu-auth"
   ↓
4. useAuth() hook initializes AuthContext
   ↓
5. Protected routes check role via ProtectedOutlet
   - ADMIN → /admin/*
   - STUDENT → /student/*
   - TEACHER → /teacher/*
```

### Token Handling

- **AccessToken:** JWT, sent in `Authorization: Bearer {token}` header
- **RefreshToken:** Stored alongside accessToken
- **Refresh Logic:** On 401 response, automatically refresh via POST `/api/auth/refresh`
- **Storage:** localStorage (key: `tlu-auth`)
- **Logout:** Clear storage + POST `/api/auth/logout`

### Role System

```typescript
type Role = "ADMIN" | "STUDENT" | "TEACHER"

// useAuth() provides:
{
  role: Role | null,
  name: string | null,
  profile: UserProfile | null,
  login: (username, password) => Promise<Role>,
  logout: () => Promise<void>,
  setRole: (role) => void
}
```

---

## 4. Routing Structure

### File-Based Routes (TanStack Router)

```
{role}.{feature}.tsx

Examples:
/admin                     → admin.tsx
/admin/dashboard           → admin.dashboard.tsx
/admin/students            → admin.students.tsx
/student                   → student.tsx
/student/dashboard         → student.dashboard.tsx
/student/grades            → student.grades.tsx
/teacher/classes           → teacher.classes.tsx
/teacher/classes/:id/students → teacher.classes.$classSectionId.students.tsx
```

### Navigation

```typescript
// Link-based
<Link to="/admin/users">View Users</Link>

// Programmatic
navigate({ to: "/admin/dashboard" })
```

### Route Protection

All role-specific routes use `ProtectedOutlet`:

```typescript
// admin.tsx
export const Route = createFileRoute("/admin")({
  component: () => <ProtectedOutlet role="ADMIN" />
})
```

If user is not authenticated → redirect to `/login`  
If user has wrong role → redirect to their dashboard

---

## 5. State Management Strategy

### TanStack Query ONLY for Server State

```typescript
// ✅ REQUIRED: API data via useQuery
const { data, isPending, isError, error } = useQuery({
  queryKey: ["student", "grades", semesterId],
  queryFn: () => studentApi.getGrades(semesterId),
  enabled: semesterId != null,
});

// ✅ REQUIRED: Mutations with cache invalidation
const { mutate, isPending } = useMutation({
  mutationFn: (data) => api.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
    toast.success("Created!");
  },
});
```

### Query Key Hierarchy

```typescript
// Hierarchical format: [domain, feature, ...params]
["student", "grades"][("student", "grades", semesterId)][("admin", "users", page, 10)][ // List all // Filtered // Paginated
  ("teacher", "classes", classId)
]; // Specific resource
```

### NO Context/Redux for Server State

✗ Context for API data  
✗ Redux for server state  
✗ useState for async data

---

## 6. Data Fetching

### HTTP Client

Centralized fetch wrapper at `src/lib/api/client.ts`:

```typescript
// Internal: automatically adds JWT headers + refresh logic
async function apiRequest<T>(path: string, init?: RequestInit): Promise<T>;

// Usage (internal):
import { apiRequest } from "@/lib/api/client";
const data = await apiRequest<UserList>("/api/admin/users");
```

### API Modules

Organized by domain, never called directly:

```
src/lib/api/
├── auth.ts      → login, getMe, logout
├── student.ts   → grades, schedule, enroll, retakes, tuition
├── admin.ts     → majors, rooms, periods
└── chat.ts      → messages, rooms
```

### Usage Pattern

```typescript
// ✅ REQUIRED: Import from API module
import { studentApi } from "@/lib/api/student";
const grades = await studentApi.getGrades(semesterId);

// Wrapped in useQuery
const { data } = useQuery({
  queryKey: ["student", "grades", semesterId],
  queryFn: () => studentApi.getGrades(semesterId),
});
```

### Base URL

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
```

Environment variable: `VITE_API_BASE_URL=http://localhost:8080`

---

## 7. Form Handling

### Pattern: react-hook-form + Zod

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

const schema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'STUDENT', 'TEACHER'])
})
type FormData = z.infer<typeof schema>

export function CreateUserForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'STUDENT' }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User created!')
      form.reset()
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create'}
        </Button>
      </form>
    </Form>
  )
}
```

### For Quick/Prototype Forms

Use `EntityFormDialog` for CRUD modals:

```typescript
<EntityFormDialog
  open={open}
  onOpenChange={setOpen}
  title="Add Student"
  onSubmit={() => {
    // Call API
    toast.success('Added!')
  }}
>
  <div className="space-y-3">
    <div className="space-y-1.5">
      <Label>Name</Label>
      <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
    </div>
  </div>
</EntityFormDialog>
```

---

## 8. UI Components

### shadcn/ui Library

All UI components from shadcn/ui + TailwindCSS:

```
Button, Input, Label, Select, Checkbox, Radio, Toggle, Switch,
Textarea, DatePicker, Dialog, AlertDialog, Drawer, Sheet,
Form, Tabs, Accordion, Card, Badge, Avatar, Tooltip,
DropdownMenu, ContextMenu, NavigationMenu, Breadcrumb,
Table, Pagination, Progress, Skeleton, Separator, Spinner
```

### Styling

- **Utility-first:** TailwindCSS classes only
- **No inline styles:** Use Tailwind
- **No custom CSS:** Use shadcn/ui
- **Spacing:** `space-y-4`, `mb-2`, `gap-2` (standard Tailwind)
- **Colors:** Tailwind palette + `bg-card`, `text-foreground`, etc.
- **Responsive:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Layout Components

#### AppLayout

Full-page layout with sidebar + header:

- Sticky sidebar (64px width)
- Top navigation bar
- Role-based navigation menu
- Breadcrumbs, user profile menu, notifications
- Collapsible on mobile (hamburger)

#### ProtectedOutlet

Role-based access control wrapper:

- Checks authentication
- Validates user role
- Redirects to login or correct dashboard
- Renders AppLayout with children

#### PageHeader

Page title + stats:

```typescript
<PageHeader
  title="Students"
  description="120 students"
  actions={<Button>Add</Button>}
/>
```

#### DataTable

Reusable paginated table with search:

```typescript
<DataTable
  data={items}
  columns={[
    { key: 'name', header: 'Name', render: (item) => item.name },
    { key: 'email', header: 'Email', searchable: true }
  ]}
  rowKey={(item) => item.id}
  onRowClick={(item) => navigate({ to: `/admin/users/${item.id}` })}
/>
```

---

## 9. Type Safety

### TypeScript Strict Mode

```json
{
  "strict": true,
  "noImplicitAny": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true
}
```

### DTO Types

All API responses typed in `src/lib/api/types.ts`:

```typescript
export interface StudentGradeItemResponse {
  enrollmentId: number;
  semesterId: number;
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
```

### Component Props

Always typed:

```typescript
interface StudentDashboardProps {
  semester: SemesterResponse;
  onGradeClick: (gradeId: number) => void;
}

export function StudentDashboard({ semester, onGradeClick }: StudentDashboardProps) {
  // ...
}
```

---

## 10. Error Handling & Loading States

### Pattern: Show All States

```typescript
const { data, isPending, isError, error } = useQuery({...})

if (isPending) return <Skeleton />
if (isError) return <ErrorMessage error={error} />
if (!data?.length) return <EmptyState />

return <Display data={data} />
```

### Error Display

```typescript
// Use Sonner toast for user feedback
if (isError) {
  toast.error(error.message)
}

// Or inline error message
{isError && <Alert variant="destructive">{error.message}</Alert>}
```

### Loading States

- **Skeleton:** For first load
- **isPending button state:** `disabled={isPending}`
- **Spinner:** Optional for active loading
- **No data fallback:** Empty state component

---

## 11. Caching Strategy

### Default Stale Times

- **User data:** 5 minutes (`staleTime: 5 * 60 * 1000`)
- **Dashboard data:** 1 minute (`staleTime: 60 * 1000`)
- **Static data (majors, rooms):** 1 hour (`staleTime: 60 * 60 * 1000`)
- **Grade data:** 5 minutes (frequently viewed)

### Cache Invalidation on Mutations

```typescript
useMutation({
  mutationFn: (data) => api.create(data),
  onSuccess: () => {
    // Invalidate list queries
    queryClient.invalidateQueries({ queryKey: ["items"] });
    // Specific invalidation
    queryClient.invalidateQueries({ queryKey: ["items", page] });
  },
});
```

---

## 12. Mock Data for Development

Located in `src/data/mock.ts`:

```typescript
export const students: Student[] = [...]
export const majors: Major[] = [...]
export const courses: Course[] = [...]
export const notifications: Notification[] = [...]

// Helper functions
export function getStudent(id: string): Student { ... }
export function getMajor(id: string): Major { ... }
```

Used for prototyping pages without backend API calls.

---

## 13. Development Workflow

### Start Development

```bash
npm run dev
# Starts on http://localhost:5173
# Backend must run on http://localhost:8080
```

### Build

```bash
npm run build    # Production build
npm run build:dev # Development build
```

### Type Check

```bash
npm run lint     # ESLint + TypeScript
```

### Format

```bash
npm run format   # Prettier
```

---

## 14. Key Files Reference

| File                                        | Purpose                     |
| ------------------------------------------- | --------------------------- |
| `src/lib/auth.tsx`                          | AuthContext, useAuth()      |
| `src/lib/api/client.ts`                     | Fetch wrapper, JWT refresh  |
| `src/lib/api/types.ts`                      | All DTO interfaces          |
| `src/components/layout/AppLayout.tsx`       | Main layout with navigation |
| `src/components/layout/ProtectedOutlet.tsx` | Role-based access control   |
| `src/components/data-table/DataTable.tsx`   | Reusable paginated table    |
| `src/router.tsx`                            | QueryClient + Router setup  |
| `src/routes/__root.tsx`                     | Root layout component       |

---

## 15. Common Patterns

### Dashboard Page

```typescript
export function StudentDashboardPage() {
  const { data: semesters } = useQuery({
    queryKey: ['student', 'semesters'],
    queryFn: studentApi.listSemesters
  })

  const semesterId = semesters?.[0]?.id

  const { data: grades } = useQuery({
    queryKey: ['student', 'grades', semesterId],
    queryFn: () => studentApi.getGrades(semesterId),
    enabled: semesterId != null
  })

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="GPA" value={grades?.gpa?.toFixed(2)} icon={Award} />
        {/* ... */}
      </div>
    </div>
  )
}
```

### CRUD List Page

```typescript
export function AdminStudentsPage() {
  const { data: students } = useQuery({
    queryKey: ['admin', 'students'],
    queryFn: adminApi.listStudents
  })

  return (
    <div>
      <PageHeader title="Students" actions={<Button>Add</Button>} />
      <DataTable
        data={students}
        columns={[ /* ... */ ]}
        rowKey={(s) => s.id}
        onRowClick={(s) => navigate({ to: `/admin/students/${s.id}` })}
      />
    </div>
  )
}
```

---

## 16. Performance Notes

- **Code splitting:** TanStack Router auto-splits routes
- **Image optimization:** Use responsive images
- **Bundle size:** shadcn/ui components tree-shake well
- **Query caching:** Prevents redundant API calls
- **Lazy loading:** Routes are lazy by default
