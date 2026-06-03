# Frontend Coding Rules — Inferred from Codebase

**Project:** ThangLongUniversityWeb  
**Framework:** TanStack Start + React 19 + TypeScript  
**Rules Generated:** From actual code patterns in the codebase  
**Audience:** AI agents & developers

---

## Quick Reference

| Rule        | ✅ Required                                  | ❌ Forbidden                                           |
| ----------- | -------------------------------------------- | ------------------------------------------------------ |
| **HTTP**    | `apiClient` (fetch wrapper)                  | `fetch()`, `axios`, hardcoded URLs                     |
| **State**   | TanStack Query + useQuery/useMutation        | Redux, Context for API data, useState for server state |
| **Forms**   | react-hook-form + Zod + react-hook-form/form | Manual state, no validation                            |
| **UI**      | shadcn/ui + TailwindCSS                      | Material-UI, styled-components, custom CSS             |
| **Routing** | TanStack Router file-based                   | Manual routes, window.location                         |
| **Auth**    | useAuth() context                            | Direct localStorage access outside client.ts           |
| **Errors**  | Show all states (pending/error/empty)        | Silent failures, no error messages                     |
| **Types**   | TypeScript strict, no `any`                  | `any` type, non-null assertions                        |

---

## 1. Naming Conventions

### Routes (File-based)

```
Pattern: {role}.{feature}.tsx
Pattern: {role}.{feature}.$paramId.tsx

Examples:
✅ admin.tsx
✅ admin.dashboard.tsx
✅ admin.students.tsx
✅ admin.users.edit.tsx
✅ student.dashboard.tsx
✅ student.grades.tsx
✅ teacher.classes.$classSectionId.students.tsx
```

### Components

```
Pattern: PascalCase.tsx (functional components)

Examples:
✅ DataTable.tsx
✅ EntityFormDialog.tsx
✅ StudentDashboard.tsx
✅ PageHeader.tsx
✅ ProtectedOutlet.tsx

❌ data-table.tsx (use PascalCase)
❌ entity_form_dialog.tsx (use PascalCase)
```

### Hooks

```
Pattern: useXXX.ts (React Hooks Convention)

Examples:
✅ useAuth.ts
✅ useMobile.tsx
✅ useStudentGrades.ts

❌ studentGrades.ts
❌ auth-hook.ts
```

### API Modules

```
Pattern: {domain}.ts (no -api suffix)

Examples:
✅ src/lib/api/auth.ts
✅ src/lib/api/student.ts
✅ src/lib/api/admin.ts
✅ src/lib/api/chat.ts
✅ src/lib/api/teacher.ts (if needed)

❌ auth-api.ts
❌ student-api.ts
```

### API Functions

```
Pattern: camelCase for functions, hierarchical for objects

Examples:
✅ async function login(username, password) { ... }
✅ export const studentApi = { listSemesters, getGrades, ... }
✅ async function getStudentGrades(semesterId) { ... }

❌ export function getStudentGradesData() (too verbose)
```

### Query Keys

```
Pattern: Hierarchical array with all dependencies

Examples:
✅ ['student', 'grades']
✅ ['student', 'grades', semesterId]
✅ ['admin', 'users']
✅ ['admin', 'users', page, 20]
✅ ['teacher', 'classes', classId]

❌ ['grades'] (missing context)
❌ ['student-grades'] (should be array)
❌ ['student', 'grades'] + semesterId NOT included (missing dependency!)
```

---

## 2. File Organization & Structure

### Component File Size Limits

| Type                  | Max Lines | Action if Exceeded               |
| --------------------- | --------- | -------------------------------- |
| Route page (Page.tsx) | 150       | Extract to feature component     |
| Feature component     | 300       | Extract hooks + smaller children |
| UI component          | 200       | Split into smaller components    |
| Hook                  | 150       | Extract utilities                |
| Utility function      | 100       | Already too complex              |

### When to Create vs Extend

| Scenario                          | Action                                |
| --------------------------------- | ------------------------------------- |
| Similar component exists          | Extend with new props                 |
| New domain not covered            | Create new API module                 |
| Different DataTable columns       | Don't copy—use dynamic `columns` prop |
| New endpoints for existing domain | Extend API module                     |
| Helper logic used 2+ places       | Create hook in `src/hooks/`           |
| Form pattern repeated             | Create reusable form component        |

### Folder Structure Rules

```
src/
├── routes/
│   └── {role}.{feature}.tsx (ONLY route files here)
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   └── ProtectedOutlet.tsx
│   ├── ui/
│   │   └── [shadcn/ui + custom UI]
│   ├── data-table/
│   │   └── DataTable.tsx
│   └── forms/
│       └── [Form components]
├── lib/
│   ├── api/
│   │   ├── client.ts (fetch wrapper)
│   │   ├── types.ts (DTOs)
│   │   ├── auth.ts
│   │   ├── student.ts
│   │   ├── admin.ts
│   │   └── chat.ts
│   ├── auth.tsx (AuthContext)
│   └── utils.ts
├── hooks/
│   └── [Custom hooks]
└── data/
    └── mock.ts (Development mock data)
```

---

## 3. Component Patterns

### Structure: Minimal Route → Feature → UI

```typescript
// ✅ REQUIRED PATTERN

// routes/student.grades.tsx (minimal, 30-50 lines)
export function StudentGradesPage() {
  return <MainLayout><GradesContent /></MainLayout>
}

// components/GradesContent.tsx (logic + queries, 100-150 lines)
export function GradesContent() {
  const { data, isPending, error } = useQuery({
    queryKey: ['student', 'grades'],
    queryFn: studentApi.getGrades
  })

  if (isPending) return <Skeleton />
  if (error) return <ErrorAlert error={error} />

  return <GradesDisplay data={data} />
}

// components/GradesDisplay.tsx (presentation only, 50-100 lines)
export function GradesDisplay({ data }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
    />
  )
}
```

### Component Size Check

If component is **>300 lines**, extract:

```
Too Large:
export function StudentDashboard() {
  // 500 lines of logic + UI
}

✅ Refactored:
export function StudentDashboard() {
  return (
    <div>
      <StatsSection />
      <ScheduleSection />
      <TuitionSection />
    </div>
  )
}
```

### Avoid Prop Drilling

Use composition instead:

```typescript
// ❌ WRONG: prop drilling
function Parent({ data, onAction }) {
  return <Child data={data} onAction={onAction} />
}
function Child({ data, onAction }) {
  return <GrandChild data={data} onAction={onAction} />
}

// ✅ REQUIRED: composition
function Parent() {
  const { data } = useQuery(...)
  return <div><GrandChild /></div>
}
function GrandChild() {
  const { data } = useQuery(...) // Refetch from same query
  return <div>{data}</div>
}
```

---

## 4. Hook Usage Patterns

### useQuery Pattern (REQUIRED)

```typescript
// ✅ REQUIRED
const { data, isPending, isError, error } = useQuery({
  queryKey: ['resource'],
  queryFn: () => api.get(),
  staleTime: 5 * 60 * 1000 // 5 minutes
})

// ✅ REQUIRED: Handle all states
if (isPending) return <Skeleton />
if (isError) return <ErrorMessage error={error} />
if (!data) return <EmptyState />

return <Display data={data} />

// ❌ WRONG: No state handling
const { data } = useQuery({ queryFn: api.get() })
return <Display data={data} /> // May crash!

// ❌ WRONG: No enabled guard
useQuery({
  queryKey: ['items', id],
  queryFn: () => api.get(id)
  // Missing: enabled: id != null
})

// ✅ REQUIRED: Enable/disable queries conditionally
const { data } = useQuery({
  queryKey: ['grades', semesterId],
  queryFn: () => api.grades(semesterId),
  enabled: semesterId != null // Guard undefined params
})
```

### useMutation Pattern (REQUIRED)

```typescript
// ✅ REQUIRED
const queryClient = useQueryClient();

const { mutate, isPending } = useMutation({
  mutationFn: (data) => api.create(data),
  onSuccess: () => {
    // REQUIRED: Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ["items"] });
    toast.success("Created!");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// ❌ WRONG: No cache invalidation
onSuccess: () => {
  toast.success("Created!");
  // Forgot to invalidate! Stale data displayed
};

// ❌ WRONG: No error handling
const { mutate } = useMutation({ mutationFn: api.create });
// Silent failures!
```

### useAuth Pattern (REQUIRED)

```typescript
// ✅ REQUIRED: Use hook, not direct context access
import { useAuth } from '@/lib/auth'

export function MyComponent() {
  const { role, name, profile, login, logout } = useAuth()

  return <div>Hello {name}</div>
}

// ❌ WRONG: Direct localStorage access
const token = localStorage.getItem('tlu-auth')

// ❌ WRONG: useContext directly
const auth = useContext(AuthContext)
```

### Custom Hooks Location

```
src/hooks/
├── use-mobile.tsx          (Existing)
├── useStudentGrades.ts     (Domain-specific if needed)
└── useFormSubmit.ts        (Reusable form logic)
```

---

## 5. Query Patterns

### Query Key Structure (REQUIRED)

```typescript
// REQUIRED: Hierarchical, all dependencies included

// Simple list
queryKey: ["student", "grades"];

// Filtered/specific
queryKey: ["student", "grades", semesterId];

// Paginated
queryKey: ["admin", "users", page, pageSize];

// Specific resource
queryKey: ["admin", "users", userId];

// ❌ WRONG: Missing dependencies
queryKey: ["grades"]; // Missing 'student' context
queryKey: ["items"]; // Missing page, filter dependencies

// ❌ WRONG: String instead of array
queryKey: "student-grades"; // Should be array

// ❌ WRONG: Dependencies not in key
queryKey: ["grades"]; // semesterId used in queryFn but not in key!
```

### Stale Time Strategy

```typescript
// Dashboard/frequently viewed
staleTime: 60 * 1000; // 1 minute

// User data
staleTime: 5 * 60 * 1000; // 5 minutes

// Static reference data (majors, rooms, periods)
staleTime: 60 * 60 * 1000; // 1 hour

// Grade data
staleTime: 5 * 60 * 1000; // 5 minutes

// Default (if not specified)
staleTime: 0; // Immediately stale
```

### Enabled Guard Pattern

```typescript
// ✅ REQUIRED: Guard against undefined parameters
const semesterId = semesters?.[0]?.id;

const { data } = useQuery({
  queryKey: ["grades", semesterId],
  queryFn: () => api.getGrades(semesterId),
  enabled: semesterId != null, // Don't query if undefined
});

// ❌ WRONG: Will error if semesterId is undefined
const { data } = useQuery({
  queryKey: ["grades", semesterId],
  queryFn: () => api.getGrades(semesterId),
  // Missing enabled guard!
});
```

---

## 6. Form Handling Patterns

### Pattern: react-hook-form + Zod (REQUIRED)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ✅ REQUIRED: Define schema
const schema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['ADMIN', 'STUDENT', 'TEACHER']),
  fullName: z.string().min(1, 'Required')
})
type FormData = z.infer<typeof schema>

// ✅ REQUIRED: Form component
export function UserForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'STUDENT', fullName: '' }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created!')
      form.reset()
    },
    onError: (error) => {
      toast.error(error.message)
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
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage /> {/* Zod errors appear here */}
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

// ❌ WRONG: Manual state
function BadForm() {
  const [email, setEmail] = useState('')
  const submit = async () => {
    // No validation! Missing error handling!
    await api.createUser({ email })
  }
}

// ❌ WRONG: No Zod schema
const form = useForm({
  defaultValues: { email: '' }
  // No validation!
})
```

### Quick/Prototype Forms

Use `EntityFormDialog` for CRUD modals:

```typescript
const [open, setOpen] = useState(false)
const [form, setForm] = useState({ name: '', code: '' })

<EntityFormDialog
  open={open}
  onOpenChange={setOpen}
  title="Add Student"
  onSubmit={async () => {
    await api.create(form)
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

## 7. TypeScript Rules

### Strict Mode (REQUIRED)

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type DTO Interfaces (REQUIRED)

```typescript
// ✅ REQUIRED: Type all API responses
export interface StudentGradeResponse {
  enrollmentId: number;
  classCode: string;
  courseName: string;
  credits: number;
  finalScore?: number | null;
  gradePoint?: number | null;
}

// ✅ REQUIRED: Type component props
interface GradesTableProps {
  grades: StudentGradeResponse[];
  onRowClick: (grade: StudentGradeResponse) => void;
}

// ❌ WRONG: No types
const grades = await api.get(); // any type!
function GradesTable({ grades, onRowClick }: any) {} // any type!

// ❌ WRONG: Non-null assertion
const score = (data as StudentGradeResponse).score!;
```

### Union & Discriminated Types

```typescript
// ✅ Use discriminated unions for status/role
type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED";
type Role = "ADMIN" | "STUDENT" | "TEACHER";

// ✅ Use optional chaining
const name = user?.profile?.fullName ?? "Unknown";

// ✅ Use ?? (nullish coalescing) over ||
const page = params.page ?? 1; // Correct: 0 is valid
const page = params.page || 1; // Wrong: 0 treated as falsy
```

---

## 8. UI Conventions

### shadcn/ui Components (REQUIRED)

All UI from shadcn/ui + TailwindCSS:

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { DataTable } from '@/components/data-table/DataTable'

// ❌ FORBIDDEN: Custom components
<CustomButton /> // Use Button from shadcn/ui
<MyModal /> // Use Dialog from shadcn/ui
<Table /> // Use DataTable or shadcn/ui Table
```

### TailwindCSS Utilities (REQUIRED)

```typescript
// ✅ REQUIRED: Utility classes
<div className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">Label</span>
      <span className="text-muted-foreground">Value</span>
    </div>
  </div>
</div>

// ✅ REQUIRED: Responsive classes
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// ❌ WRONG: Inline styles
<div style={{ padding: '20px', borderRadius: '8px' }} />

// ❌ WRONG: Arbitrary values (generally)
className="p-[20px]" // Use standard: p-5, p-6
```

### Color & Semantic Tokens

```typescript
// ✅ REQUIRED: Use semantic colors
<div className="bg-card text-foreground" />
<div className="text-muted-foreground" />
<div className="text-destructive" />
<Badge className="bg-primary text-primary-foreground" />

// Based on theme:
// bg-card, bg-background, bg-muted, bg-accent
// text-foreground, text-muted-foreground, text-destructive
```

### Spacing Convention

```typescript
// ✅ REQUIRED: Standard spacing only
className = "space-y-4"; // gap between children
className = "mb-2"; // margin-bottom
className = "gap-3"; // gap in flex/grid
className = "p-5"; // padding
className = "px-4 py-3"; // horizontal padding, vertical padding

// ❌ WRONG: Arbitrary values
className = "space-y-7"; // Not in standard scale
className = "my-[15px]"; // Use standard values
```

---

## 9. Loading & Error State Patterns

### REQUIRED: Show All States

```typescript
const { data, isPending, isError, error } = useQuery({...})

// ✅ REQUIRED: Three separate renders
if (isPending) {
  return <div className="space-y-4"><Skeleton /><Skeleton /></div>
}

if (isError) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  )
}

if (!data || data.length === 0) {
  return (
    <div className="py-16 text-center">
      <p className="text-muted-foreground">No data found</p>
    </div>
  )
}

return <DataTable data={data} />

// ❌ WRONG: Skipping states
return <DataTable data={data || []} /> // Will crash if error

// ❌ WRONG: Silent failure
const { data } = useQuery({...})
return <Display data={data} /> // What if error?
```

### Toast Notifications

```typescript
import { toast } from "sonner";

// ✅ REQUIRED: Feedback on actions
mutation.mutate(data, {
  onSuccess: () => {
    toast.success("Saved successfully!");
  },
  onError: (error) => {
    toast.error(error.message || "Something went wrong");
  },
});

// Show different toast types
toast.success("Success message");
toast.error("Error message");
toast.info("Info message");
toast.warning("Warning message");
```

---

## 10. HTTP & API Conventions

### Use apiClient Wrapper (REQUIRED)

```typescript
// ✅ REQUIRED: Through apiRequest
import { apiRequest } from "@/lib/api/client";

const data = await apiRequest<UserList>("/api/admin/users");

// ✅ REQUIRED: Via API module
import { studentApi } from "@/lib/api/student";

const grades = await studentApi.getGrades(semesterId);

// ❌ WRONG: Direct fetch
const data = await fetch("/api/admin/users").then((r) => r.json());

// ❌ WRONG: Direct axios
const data = await axios.get("/api/admin/users");

// ❌ WRONG: Hardcoded URLs
const url = "http://localhost:8080/api/admin/users";
```

### API Module Structure

```typescript
// ✅ REQUIRED: Organized exports
export const studentApi = {
  listSemesters: () => apiRequest<Semester[]>("/api/student/semesters"),
  getGrades: (semesterId) =>
    apiRequest<GradesSummary>(`/api/student/grades?semesterId=${semesterId}`),
  enrollClass: (classId) =>
    apiRequest<EnrollmentResponse>(`/api/student/enroll/${classId}`, { method: "POST" }),
};

// ✅ REQUIRED: Type responses
async function getGrades(semesterId: number): Promise<GradesSummary> {
  return apiRequest(`/api/student/grades?semesterId=${semesterId}`);
}

// ❌ WRONG: Untyped
export const getGrades = (semesterId) => fetch(`...`);
```

### JWT Handling (Built-in)

Client automatically handles:

```
1. Authorization header: Bearer {accessToken}
2. Token refresh on 401
3. localStorage storage of tokens
4. Logout → clear localStorage
```

No manual JWT handling needed in components!

---

## 11. Routing Rules

### File-Based Routes (REQUIRED)

```typescript
// ✅ REQUIRED: TanStack Router file-based
// File: routes/student.grades.tsx
export const Route = createFileRoute('/student/grades')({
  component: StudentGradesPage
})

function StudentGradesPage() {
  return <div>...</div>
}

// ✅ REQUIRED: Protected routes
// File: routes/admin.tsx
export const Route = createFileRoute('/admin')({
  component: () => <ProtectedOutlet role="ADMIN" />
})

// ✅ REQUIRED: Dynamic routes
// File: routes/teacher.classes.$classSectionId.students.tsx
export const Route = createFileRoute('/teacher/classes/$classSectionId/students')({
  component: ClassStudentsPage
})

// ❌ WRONG: Manual route setup
const routes = [
  { path: '/admin', component: AdminPage }
]

// ❌ WRONG: window.location
window.location.href = '/admin/dashboard'
```

### Navigation (REQUIRED)

```typescript
import { Link, useNavigate } from '@tanstack/react-router'

// ✅ REQUIRED: Use Link for navigation
<Link to="/admin/users">View Users</Link>

// ✅ REQUIRED: useNavigate hook
const navigate = useNavigate()
navigate({ to: '/admin/users' })

// ❌ WRONG: window.location
window.location.href = '/admin/users'

// ❌ WRONG: <a> tag
<a href="/admin/users">Wrong</a>
```

### Role-Based Protection (REQUIRED)

```typescript
// ✅ REQUIRED: Use ProtectedOutlet
<ProtectedOutlet role="ADMIN">
  {/* Only renders if user is ADMIN */}
</ProtectedOutlet>

// ✅ REQUIRED: Redirect logic inside ProtectedOutlet
// If not logged in → redirect to /login
// If wrong role → redirect to their dashboard

// ❌ WRONG: Manual role checks
if (role !== 'ADMIN') return <div>Not authorized</div>

// ❌ WRONG: No protection
<div>{adminContent}</div> // Accessible to all!
```

---

## 12. Performance Rules

### Code Splitting

TanStack Router automatically code-splits routes. No additional configuration needed.

### Memoization Guidelines

```typescript
// ✅ Use React.memo for expensive components
export const GradesDisplay = React.memo(function GradesDisplay({ grades }: Props) {
  return <DataTable data={grades} />
})

// ✅ Use useMemo for expensive calculations
const totalCredits = useMemo(
  () => grades.reduce((sum, g) => sum + g.credits, 0),
  [grades]
)

// ❌ AVOID: Premature memoization
export const Button = React.memo(function Button({ label }: Props) {
  // Unnecessary for simple component
})
```

### Query Caching

Properly configured in each query:

```typescript
useQuery({
  queryKey: [...],
  queryFn: ...,
  staleTime: 5 * 60 * 1000,  // Prevents unnecessary refetches
  gcTime: 10 * 60 * 1000      // Cache for 10 minutes
})
```

---

## 13. Code Quality

### ESLint Rules

```
- no-console (except in development)
- no-unused-variables
- no-implicit-any
- exhaustive-deps (for useEffect)
```

### Import Organization

```typescript
// ✅ REQUIRED: Organize imports
// 1. External libraries
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internal absolute imports
import { studentApi } from "@/lib/api/student";
import { DataTable } from "@/components/data-table/DataTable";

// 3. Types
import type { StudentGradeResponse } from "@/lib/api/types";
```

### Comments

```typescript
// ✅ REQUIRED: Explain WHY, not WHAT
// Fetch after semester is selected to prevent undefined parameter errors
const { data } = useQuery({
  queryKey: ['grades', semesterId],
  queryFn: () => api.getGrades(semesterId),
  enabled: semesterId != null
})

// ❌ WRONG: Obvious comments
// Get grades data
const { data } = useQuery(...)
```

---

## 14. What NOT to Do

| ❌                           | Reason                                    |
| ---------------------------- | ----------------------------------------- |
| `any` type                   | Defeats TypeScript                        |
| `useState` for API data      | Use TanStack Query                        |
| Direct `fetch()`             | Use `apiClient`                           |
| Redux                        | Use TanStack Query                        |
| Custom CSS                   | Use shadcn/ui + Tailwind                  |
| Manual localStorage          | Use `getStoredAuth()` / `setStoredAuth()` |
| Context for server state     | Use TanStack Query                        |
| `localStorage` in components | Only in `src/lib/api/client.ts`           |
| Non-null assertion `!`       | Use proper typing                         |
| `window.location` navigation | Use TanStack Router Link/navigate         |
| Silent failures              | Show error states                         |

---

## 15. Example: Complete Component

```typescript
// routes/admin.users.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { EntityFormDialog } from '@/components/forms/EntityFormDialog'
import { adminApi } from '@/lib/api/admin'
import type { UserResponse } from '@/lib/api/types'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage
})

// ✅ Page component: minimal
function AdminUsersPage() {
  return <UsersContent />
}

// ✅ Feature component: queries + logic
function UsersContent() {
  const { data: users, isPending, isError, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.listUsers
  })

  if (isPending) return <Skeleton />
  if (isError) return <ErrorAlert error={error} />
  if (!users?.length) return <EmptyState />

  return <UsersDisplay users={users} />
}

// ✅ UI component: presentation only
function UsersDisplay({ users }: { users: UserResponse[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UserResponse | null>(null)
  const queryClient = useQueryClient()

  const { mutate: deleteUser } = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User deleted')
    }
  })

  const columns = [
    { key: 'username', header: 'Username', searchable: true },
    { key: 'email', header: 'Email', searchable: true },
    {
      key: 'role',
      header: 'Role',
      render: (user: UserResponse) => <Badge>{user.role}</Badge>
    },
    {
      key: 'actions',
      header: '',
      render: (user: UserResponse) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(user)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteUser(user.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Users"
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add</Button>}
      />
      <DataTable
        data={users}
        columns={columns}
        rowKey={(u) => u.id}
      />
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Edit User' : 'Add User'}
        onSubmit={() => { /* submit logic */ }}
      >
        {/* form fields */}
      </EntityFormDialog>
    </div>
  )
}
```

---

## Summary

**These rules keep the code:**

- ✅ Type-safe
- ✅ Reusable
- ✅ Maintainable
- ✅ Consistent
- ✅ AI-friendly

**Follow them on every task.**
