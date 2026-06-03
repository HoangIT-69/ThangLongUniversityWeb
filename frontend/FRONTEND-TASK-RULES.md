# FRONTEND-TASK-RULES.md

**Project:** ThangLongUniversityWeb  
**Stack:** TanStack Start + React 19 + TypeScript + TanStack Query + TanStack Router  
**Generated:** May 19, 2026  
**Audience:** AI Agents (Cursor, Windsurf, GitHub Copilot, Claude Code)

🚨 **BINDING DOCUMENT** - All code generation MUST comply.

---

## Quick Reference

| Rule           | ✅ Required                  | ❌ Forbidden                                      |
| -------------- | ---------------------------- | ------------------------------------------------- |
| **HTTP**       | `apiClient` only             | axios, fetch(), hardcoded URLs                    |
| **UI**         | shadcn/ui + Tailwind         | Custom CSS, Material-UI, styled-components        |
| **State**      | TanStack Query               | Redux, Context for server state, useState for API |
| **Forms**      | react-hook-form + Zod        | Manual state, no validation                       |
| **Routing**    | TanStack Router              | Manual routes, window.location                    |
| **TypeScript** | Strict, no any               | any type, non-null assertions                     |
| **Components** | <300 lines, 1 responsibility | Monolithic, mixed concerns                        |
| **Layouts**    | Reuse existing               | Custom layout systems                             |
| **Errors**     | Show all states              | Silent failures                                   |

---

## Pre-Generation Checklist

**Before writing ANY code - scan for 60 seconds:**

- [ ] Name 3+ similar existing components
- [ ] Identify existing hooks to reuse
- [ ] Confirm API module to extend
- [ ] State exact query key structure
- [ ] Confirm user role requirements
- [ ] Name exact TypeScript types

## **If you can't answer all → Ask user for clarification**

## File & Component Rules

### Component Size Limits

| Type         | Max Lines | Action                    |
| ------------ | --------- | ------------------------- |
| Route page   | 150       | Extract feature component |
| Feature      | 300       | Extract hooks + children  |
| UI component | 200       | Split into smaller        |
| Hook         | 150       | Extract utilities         |

### File Naming

```
Routes:      {role}.{feature}.tsx      → admin.users.tsx
Components:  PascalCase.tsx             → UsersList.tsx
Hooks:       useXXX.ts                  → useStudentGrades.ts
API:         {domain}.ts                → student.ts (no -api suffix)
```

### When to Create vs Extend

| Scenario                          | Action                    |
| --------------------------------- | ------------------------- |
| Similar component exists          | Extend existing           |
| New domain not yet covered        | Create new module         |
| Different DataTable structure     | Modify columns.tsx        |
| New endpoints for existing domain | Extend API module         |
| Helper logic used 2+ times        | Create hook in src/hooks/ |

### Component Structure

```typescript
// Page component (minimal)
export function StudentGradesPage() {
  return <MainLayout><GradesContent /></MainLayout>;
}

// Feature component (logic + queries)
export function GradesContent() {
  const { data, isLoading, error } = useQuery({...});
  return <GradesDisplay data={data} />;
}

// UI component (presentation only)
export function GradesDisplay({ data }: Props) {
  return <DataTable columns={columns} data={data} />;
}
```

---

## API & Query Rules

### Rule 1: HTTP Client - MANDATORY

```typescript
// ✅ REQUIRED
import { apiRequest } from "@/lib/api/client";
import * as studentApi from "@/lib/api/student";

const grades = await studentApi.getGrades();

// ❌ FORBIDDEN
const grades = await fetch("/api/student/grades").then((r) => r.json());
const grades = await axios.get("/api/student/grades");
```

### Rule 2: Query Keys (Hierarchical)

```typescript
// ✅ REQUIRED
["student", "grades"][("student", "grades", semesterId)][("admin", "users", page)]; // List // Filtered // Paginated

// Include ALL dependencies
const { data } = useQuery({
  queryKey: ["users", page, filter], // All here
  queryFn: () => api.list(page, filter),
});

// ❌ WRONG - Missing dependencies
queryKey: ["users"]; // Missing page, filter!
```

### Rule 3: useQuery Pattern

```typescript
// ✅ REQUIRED
const { data, isPending, error, isError } = useQuery({
  queryKey: ["resource"],
  queryFn: () => api.get(),
});

if (isPending) return <Skeleton />;
if (isError) return <ErrorMessage error={error} />;
if (!data?.length) return <EmptyState />;

return <Display data={data} />;

// ❌ WRONG - No state handling
const { data } = useQuery({ queryFn: api.get() });
return <Display data={data} />; // May crash
```

### Rule 4: useMutation Pattern

```typescript
// ✅ REQUIRED
const { mutate, isPending } = useMutation({
  mutationFn: (data) => api.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
    toast.success("Created!");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// ❌ WRONG - No cache invalidation
onSuccess: () => {
  toast.success("Created!"); // Forgot to invalidate!
};
```

---

## Form Rules

### Form Pattern - MANDATORY

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "STUDENT"]),
});
type FormData = z.infer<typeof schema>;

export function CreateUserForm() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: FormData) => mutate(data);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage /> {/* Shows Zod errors */}
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
      </form>
    </Form>
  );
}

// ❌ FORBIDDEN - Manual state
const [email, setEmail] = useState("");
const handleSubmit = async () => {
  await api.create({ email }); // No validation!
};
```

---

## Routing Rules

### File-Based Routes

```
✅ REQUIRED:
/admin                    → admin.tsx
/admin/users              → admin.users.tsx
/admin/users/:id/edit     → admin.users.edit.tsx
/student/grades/:id       → student.grades.$id.tsx

✅ REQUIRED - Protected routes
export const Route = createFileRoute("/admin")({
  component: () => <ProtectedOutlet role="ADMIN" />,
});

✅ REQUIRED - Role grouping
/admin/*    → ADMIN only
/student/*  → STUDENT only
/teacher/*  → TEACHER only

✅ REQUIRED - Navigation
<Link to="/admin/users">View Users</Link>
navigate({ to: "/admin/users" });

❌ FORBIDDEN
window.location.href = "/admin";
window.history.pushState(...);
```

---

## TypeScript Rules - STRICT

```typescript
// ✅ REQUIRED - Explicit types
interface UserProps {
  user: UserResponse;
  onEdit: (id: number) => void;
}

// ✅ REQUIRED - Null safety
const name = user?.fullName ?? "Unknown";
const email = user?.profile?.email;

// ✅ REQUIRED - z.infer for forms
const schema = z.object({ email: z.string() });
type FormData = z.infer<typeof schema>;

// ❌ FORBIDDEN
const user: any = response;
const name = user!.fullName; // Force non-null
const name = user.fullName; // Unsafe access
```

---

## Code Quality

### Must:

- Keep components < 300 lines
- Single responsibility
- Reuse shadcn/ui components
- Reuse existing layouts (MainLayout, ProtectedOutlet)
- Handle all loading/error/empty states
- Use pagination for lists
- Show error toasts
- Show loading buttons

### Never:

- Create monolithic components
- Duplicate code
- Use custom UI systems (use DataTable)
- Mix concerns (UI + business logic)
- Create custom buttons (use shadcn Button)
- Create custom forms (use react-hook-form + Zod)
- Create custom tables (use DataTable)

---

## Forbidden Patterns

### ❌ Pattern 1: Monolithic Components

```typescript
// WRONG - 500 lines, everything inline
export function StudentDashboard() {
  const [grades, setGrades] = useState();
  const [schedule, setSchedule] = useState();
  useEffect(() => { /* fetch */ }, []);
  // ... 400 more lines
  return <div>{/* everything inline */}</div>;
}

// RIGHT - Decomposed
export function StudentDashboard() {
  return <MainLayout><div>
    <GradesSummary />
    <ScheduleWidget />
  </div></MainLayout>;
}
```

### ❌ Pattern 2: Duplicated Code

```typescript
// WRONG - Same query in 2 places
function GradesPage() {
  const { data } = useQuery({
    queryKey: ["grades"],
    queryFn: () => api.getGrades(),
  });
}

function GradesSummary() {
  const { data } = useQuery({
    queryKey: ["grades"],
    queryFn: () => api.getGrades(),
  });
}

// RIGHT - Reusable hook
const useStudentGrades = () =>
  useQuery({
    queryKey: ["grades"],
    queryFn: () => api.getGrades(),
  });
```

### ❌ Pattern 3: Direct fetch()

```typescript
// WRONG
const data = await fetch("/api/users").then((r) => r.json());
const data = await axios.get("/api/users");

// RIGHT
const { data } = useQuery({
  queryFn: () => userApi.listUsers(),
});
```

### ❌ Pattern 4: Business Logic in UI

```typescript
// WRONG - Logic in component
export function EnrollmentForm() {
  const handleSubmit = async (data) => {
    if (!data.studentId) {
      setError("Required");
      return;
    }
    const response = await fetch("/api/enroll", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };
}

// RIGHT - Logic in hook/service
export function EnrollmentForm() {
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => studentApi.enrollClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("Enrolled!");
    },
  });

  const onSubmit = (data) => mutate(data);
}
```

### ❌ Pattern 5: Global State Misuse

```typescript
// WRONG - Context for server state
const [users, setUsers] = useContext(UsersContext);
useEffect(() => {
  fetch("/api/users").then((r) => setUsers(r.json()));
}, []);

// RIGHT - TanStack Query for server state
const { data: users } = useQuery({
  queryFn: () => api.listUsers(),
});

// RIGHT - useState for UI state only
const [isModalOpen, setIsModalOpen] = useState(false);
```

### ❌ Pattern 6: UI Duplication

```typescript
// WRONG - Custom table instead of DataTable
export function UsersList({ users }: Props) {
  return (
    <table className="w-full border">
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.name}</td>
        </tr>
      ))}
    </table>
  );
}

// RIGHT - Use DataTable
import { DataTable } from "@/components/data-table/DataTable";
export function UsersList({ users }: Props) {
  return <DataTable columns={userColumns} data={users} />;
}
```

---

## Output Format

When generating code:

```
## Summary
[One sentence describing implementation]

## Files Created
- [path/file.tsx] - [One-line purpose]

## Files Extended
- [path/file.tsx] - Added [what]

## Reused
- [Component] from [path]
- [Hook] for [purpose]

## Decisions
1. [Decision] - Why: [reasoning]

## Integration
- API: [Module]
- Query: ["domain", "resource"]
- Route: /path
- Role: [ADMIN|STUDENT|TEACHER]

## Checklist
✅ No any types
✅ Strict TypeScript
✅ Error handling
✅ Loading states
✅ Components < 300 lines
```

---

**Version:** 2.0 | **Status:** Production | **Last Updated:** May 19, 2026

- Which API module should I extend?
- Do the endpoints already exist?
- What is the response DTO structure?

```

### Documentation During Scan

AI MUST document findings as:

```

## Scan Findings

### Similar Components

- [Component.tsx] - Similar for [reason] - Reuse: [yes/no]
- ...

### Existing Hooks

- useQuery hook in [module] - Query key: [key] - Reuse: [yes/no]
- ...

### Existing Layouts

- MainLayout - Reuse: yes
- ProtectedOutlet - Required role: [role]

### Query Patterns

- Query keys format: ["domain", "resource", id]
- Pagination pattern: Page<T>
- Cache invalidation: queryClient.invalidateQueries()

### API Integration Points

- Module to extend: [module]
- New endpoints needed: [endpoints]
- Response DTOs: [types]

```

---

## File Creation Rules

### Principle: Minimal File Creation

**ONLY create new files when:**
- No existing file serves the purpose
- Extension of existing file would create massive file (>500 lines)
- File serves a new, distinct domain

**NEVER create new files for:**
- Duplicate components
- Duplicate hooks
- Duplicate layouts
- Variation of existing system

### File Creation Matrix

| File Type | Location | When to Create | When to Extend |
|-----------|----------|---|---|
| API Module | `src/lib/api/` | New domain area | Add function to existing module |
| Hook | `src/hooks/` | Core reusable logic (>2 uses) | N/A - always new if truly reusable |
| Layout | `src/components/layout/` | New layout pattern | Modify existing |
| Page Component | `src/routes/` | New route | N/A - one per route |
| Feature Component | `src/features/[domain]/` | New feature area | Add to existing domain |
| UI Component | `src/components/ui/` | FORBIDDEN - only shadcn/ui | Modify shadcn/ui |
| Form Component | `src/components/forms/` | New complex form | Modify existing |
| Data Table | `src/components/data-table/` | Different column structure | Modify columns.tsx |

### File Naming Rules

**Routes:**
```

Pattern: {role}.{feature}.tsx OR {role}.{feature}.{subfeature}.tsx

Examples:
✅ admin.tsx
✅ admin.users.tsx
✅ admin.users.edit.tsx
✅ student.grades.tsx
✅ teacher.classes.tsx

❌ AdminPage.tsx
❌ UsersPage.tsx
❌ CreateUser.tsx

```

**Components:**
```

Pattern: PascalCase.tsx (use compound names, no "Page" suffix)

Examples:
✅ UsersList.tsx
✅ StudentGradesTable.tsx
✅ EnrollmentForm.tsx
✅ ClassScheduleCard.tsx

❌ UsersListPage.tsx
❌ StudentGradesTableComponent.tsx

```

**Hooks:**
```

Pattern: useXXX (React convention)

Examples:
✅ useStudentGrades.ts
✅ useEnrollments.ts
✅ useChatRooms.ts

❌ StudentGradesHook.ts
❌ fetchEnrollments.ts

```

**API Modules:**
```

Pattern: {domain}.ts (lowercase, single name)

Examples:
✅ admin.ts
✅ student.ts
✅ teacher.ts
✅ chat.ts

❌ AdminAPI.ts
❌ student-api.ts

````

### File Size Rules

**Maximum recommended file sizes:**

| File Type | Max Lines | Guidance |
|-----------|---|---|
| Component | 300 | Split if > 300, extract hooks |
| Hook | 200 | Extract utilities if > 200 |
| Service/API | 500 | Create submodules if > 500 |
| Page Route | 150 | Focus on composition only |
| Form | 250 | Extract validation schemas |

**If file exceeds max:**
1. Extract custom hooks
2. Extract child components
3. Extract utility functions
4. Move to separate files
5. Keep main file focused

---

## UI Component Rules

### Rule 1: ALWAYS Use shadcn/ui

**MANDATORY:**
```typescript
// ✅ REQUIRED
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

// ❌ FORBIDDEN
import styled from 'styled-components';
import MuiButton from '@mui/material/Button';
import { custom_button } from './custom_button.css';
````

**shadcn/ui Components to Use:**

- Buttons
- Dialogs/Modals
- Cards
- Tables
- Forms (+ react-hook-form)
- Inputs
- Selects
- Checkboxes
- Badges
- Alerts
- Dropdowns
- Tooltips
- Tabs
- Accordions
- Sliders
- Progress bars
- Skeletons
- Spinners

### Rule 2: ALWAYS Reuse Existing Layouts

**Mandatory Layout Reuse:**

```typescript
// ✅ REQUIRED - Reuse MainLayout
import { MainLayout } from "@/components/layout/MainLayout";

export function StudentGradesPage() {
  return (
    <MainLayout>
      <StudentGradesContent />
    </MainLayout>
  );
}

// ❌ FORBIDDEN - Creating new layout structure
export function StudentGradesPage() {
  return (
    <div className="flex">
      <CustomSidebar />
      <div className="flex-1">
        <CustomHeader />
        <StudentGradesContent />
      </div>
    </div>
  );
}
```

**Existing Layouts:**

- `MainLayout` - Standard page layout with sidebar + header
- `ProtectedOutlet` - Role-based route protection
- `Sidebar` - Navigation sidebar
- `Header` - Top navigation bar

**DO NOT:**

- Create alternative layout systems
- Duplicate layout logic
- Mix layout patterns on same page

### Rule 3: Preserve Visual Consistency

**Spacing Convention:**

```typescript
// ✅ Use existing spacing scale
<div className="space-y-4">           {/* Between sections */}
  <div className="mb-2">Title</div>
  <div className="gap-2">Items</div>
</div>

// ✅ Margin patterns
<div className="m-4">                 {/* All sides */}
<div className="mx-4">                {/* Horizontal */}
<div className="mb-4">                {/* Bottom margin */}

// ❌ Random spacing
<div style={{ marginTop: '15px' }}></div>
<div className="my-7"></div>
<div style={{ gap: '11px' }}></div>
```

**Color Convention:**

```typescript
// ✅ Use Tailwind palette
<div className="bg-white text-gray-900 border border-gray-200">
<div className="bg-blue-50 text-blue-900">
<div className="dark:bg-gray-950 dark:text-white">

// ❌ Custom colors
<div style={{ backgroundColor: '#f5f5f5', color: '#333' }}></div>
<div className="bg-[#f5f5f5]">
```

**Responsive Convention:**

```typescript
// ✅ Mobile-first with Tailwind
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">

// ✅ Existing responsive patterns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// ❌ Hardcoded sizes
<div style={{ width: '1200px' }}>
<div className="max-w-7xl">
```

### Rule 4: Preserve Component Type Hierarchy

**Component Type Rules:**

```typescript
// Level 1: Pages (minimal logic, composition only)
export function StudentGradesPage() {
  return <MainLayout><GradesContent /></MainLayout>;
}

// Level 2: Features (business logic, queries, hooks)
export function GradesContent() {
  const { data } = useQuery(...);
  return <GradesDisplay data={data} />;
}

// Level 3: UI Components (pure presentation, no queries)
interface GradesDisplayProps {
  data: GradeData[];
  onEdit: (id: number) => void;
}
export function GradesDisplay({ data, onEdit }: GradesDisplayProps) {
  return <DataTable columns={columns} data={data} />;
}

// ❌ DO NOT MIX
export function StudentGradesPage() {
  // ❌ Wrong: useQuery in page component
  const { data } = useQuery(...);
  // ❌ Wrong: direct JSX instead of composition
  return (
    <div>
      <MainLayout>
        <div>Complex logic here</div>
      </MainLayout>
    </div>
  );
}
```

### Rule 5: DataTable Reuse

**MUST Reuse DataTable:**

```typescript
import { DataTable } from "@/components/data-table/DataTable";
import { userColumns } from "@/components/data-table/columns";

// ✅ REQUIRED
export function UsersList({ users }: { users: UserResponse[] }) {
  return <DataTable columns={userColumns} data={users} />;
}

// ❌ FORBIDDEN - Creating alternative table
export function UsersList({ users }: { users: UserResponse[] }) {
  return (
    <table className="w-full">
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.name}</td>
        </tr>
      ))}
    </table>
  );
}
```

### Rule 6: Loading States

**REQUIRED Loading State Pattern:**

```typescript
// ✅ REQUIRED
export function UsersList() {
  const { data, isLoading, error } = useQuery(...);

  if (isLoading) return <UsersSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.length) return <EmptyState />;

  return <DataTable columns={columns} data={data} />;
}

// ❌ MISSING loading state
export function UsersList() {
  const { data } = useQuery(...);
  return <DataTable columns={columns} data={data} />;
}
```

---

## API Integration Rules

### Rule 1: ONLY Use apiClient

**MANDATORY API Integration:**

```typescript
// ✅ REQUIRED - Use centralized apiClient
import { apiRequest } from "@/lib/api/client";
import * as studentApi from "@/lib/api/student";

// In useQuery
const { data } = useQuery({
  queryKey: ["student", "grades"],
  queryFn: () => studentApi.getGrades(),
});

// ❌ FORBIDDEN - Direct fetch
const { data } = useQuery({
  queryFn: async () => {
    const response = await fetch("http://localhost:8080/api/student/grades");
    return response.json();
  },
});

// ❌ FORBIDDEN - axios
import axios from "axios";
const { data } = useQuery({
  queryFn: () => axios.get("/api/student/grades"),
});
```

### Rule 2: NEVER Hardcode URLs

**MANDATORY URL Pattern:**

```typescript
// ✅ REQUIRED - Use API module
import { studentApi } from "@/lib/api/student";

const grade = await studentApi.getGrades(semesterId);

// ✅ REQUIRED - URL comes from apiClient only
// In apiClient, URL is constructed from:
// - BASE_URL from environment (VITE_API_BASE_URL)
// - endpoint path from module

// ❌ FORBIDDEN - Hardcoded URL
const grade = await apiRequest("http://localhost:8080/api/student/grades");
const grade = await apiRequest("/api/student/grades"); // URL embedded in component

// ❌ FORBIDDEN - String concatenation
const url = `/api/student/${studentId}/grades`;
const grade = await apiRequest(url);
```

### Rule 3: Always Use Typed APIs

**MANDATORY Type Safety:**

```typescript
// ✅ REQUIRED - Typed responses
import type { StudentGradesSummaryResponse } from "@/lib/api/types";

const { data } = useQuery<StudentGradesSummaryResponse>({
  queryKey: ["student", "grades"],
  queryFn: () => studentApi.getGrades(),
});

// ✅ REQUIRED - Typed request bodies
import type { CreateEnrollmentRequestDTO } from "@/lib/api/types";

const createEnrollment = (dto: CreateEnrollmentRequestDTO) =>
  apiRequest<EnrollmentResponseDTO>("/api/student/enroll", {
    method: "POST",
    body: JSON.stringify(dto),
  });

// ❌ FORBIDDEN - No types
const { data } = useQuery({
  queryFn: () => studentApi.getGrades(),
});

// ❌ FORBIDDEN - Using any
const { data }: { data: any } = useQuery(...);
```

### Rule 4: API Module Extension

**When to Extend vs Create:**

```typescript
// IF endpoint exists in module, use it
import { studentApi } from "@/lib/api/student";
const grades = await studentApi.getGrades();

// IF endpoint does NOT exist, extend module:
// File: src/lib/api/student.ts

export const studentApi = {
  // ... existing functions

  // ✅ ADD new function to module
  getStudentWithDetails: (studentId: number) =>
    apiRequest<StudentDetailResponse>(`/api/student/${studentId}/details`),
};

// ❌ DO NOT create inline API calls
const grades = await apiRequest<GradeData[]>("/api/student/grades");
```

### Rule 5: Response Type Mapping

**MANDATORY Type Mapping from API:**

```typescript
// ✅ REQUIRED - Map API response to DTO
interface StudentResponse {
  id: number;
  fullName: string;
  email: string;
}

const { data: student } = useQuery<StudentResponse>({
  queryFn: () => studentApi.getStudent(id),
});

// Always import types from src/lib/api/types.ts
import type { StudentResponseDTO, CourseResponseDTO } from "@/lib/api/types";

// ❌ FORBIDDEN - Interface defined in component
interface Student {
  id: number;
  fullName: string;
}
```

---

## Form Implementation Rules

### Rule 1: MUST Use react-hook-form + Zod

**MANDATORY Form Pattern:**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ✅ REQUIRED
const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8+ characters"),
  role: z.enum(["ADMIN", "STUDENT", "TEACHER"]),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

export function CreateUserForm() {
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => adminApi.createUser(data),
  });

  return <Form {...form}>/* form fields */</Form>;
}

// ❌ FORBIDDEN - useState for form state
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [errors, setErrors] = useState({});

// ❌ FORBIDDEN - No validation
const handleSubmit = () => {
  api.createUser({ email, password });
};
```

### Rule 2: Form Structure

**REQUIRED Form Component Structure:**

```typescript
export function CreateEnrollmentForm({ onSuccess }: { onSuccess: () => void }) {
  // 1. Define Zod schema
  const schema = z.object({
    studentId: z.number().min(1),
    classSectionId: z.number().min(1),
  });

  type FormData = z.infer<typeof schema>;

  // 2. Setup react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // 3. Setup mutation
  const queryClient = useQueryClient();
  const { mutate: createEnrollment, isPending } = useMutation({
    mutationFn: (data: FormData) => studentApi.enrollClass(data),
    onSuccess: () => {
      toast.success("Enrolled successfully!");
      queryClient.invalidateQueries({ queryKey: ["student", "enrollments"] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // 4. Submit handler
  const onSubmit = (data: FormData) => {
    createEnrollment(data);
  };

  // 5. Render form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage /> {/* Validation error */}
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Enrolling..." : "Enroll"}
        </Button>
      </form>
    </Form>
  );
}
```

### Rule 3: Form Validation

**REQUIRED Validation Pattern:**

```typescript
// ✅ REQUIRED - Multi-level validation
const schema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .refine(
      async (email) => {
        // Custom validation
        const exists = await checkEmailExists(email);
        return !exists;
      },
      { message: "Email already exists" },
    ),

  credits: z.number().min(1, "Credits must be at least 1").max(4, "Credits cannot exceed 4"),

  role: z
    .enum(["ADMIN", "STUDENT", "TEACHER"])
    .refine((role) => role !== "FORBIDDEN", { message: "Role not allowed" }),
});

// ❌ FORBIDDEN - Validation in component
const handleSubmit = () => {
  if (!email.includes("@")) {
    setError("Invalid email");
    return;
  }
};
```

### Rule 4: Form Loading & Errors

**REQUIRED Loading State:**

```typescript
// ✅ REQUIRED
<Button type="submit" disabled={isPending}>
  {isPending ? "Creating..." : "Create"}
</Button>

// ✅ REQUIRED - Show validation errors
<FormMessage /> {/* Automatically shows Zod errors */}

// ✅ REQUIRED - Toast for success/error
onSuccess: () => {
  toast.success("Created successfully!");
},
onError: (error) => {
  toast.error(error.message);
},

// ❌ FORBIDDEN - No loading state
<Button type="submit">Create</Button>

// ❌ FORBIDDEN - Manual error display with wrong UI
{errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
```

### Rule 5: Form Submission

**REQUIRED Submission Pattern:**

```typescript
// ✅ REQUIRED - Use mutation
const { mutate, isPending, error } = useMutation({
  mutationFn: (data) => api.createItem(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
    toast.success("Created!");
    onSuccess?.();
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

const onSubmit = (data: FormData) => {
  mutate(data);
};

// ❌ FORBIDDEN - Direct API call in submit
const onSubmit = async (data: FormData) => {
  try {
    const response = await fetch("/api/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // manual error handling...
  } catch (error) {
    // manual error handling...
  }
};
```

---

## TypeScript Rules

### Rule 1: Strict Mode Enforced

**All code MUST pass TypeScript strict mode:**

```typescript
// ✅ REQUIRED - Explicit types
interface UserProps {
  user: UserResponse;
  onEdit: (user: UserResponse) => void;
  onDelete: (userId: number) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserProps) {
  return <div>{user.fullName}</div>;
}

// ❌ FORBIDDEN - any type
function UserCard(props: any) { }
const data: any = useQuery(...);
const handleClick = (e: any) => { };

// ❌ FORBIDDEN - Implicit any
function processUser(user) { } // Implicit any parameter

// ❌ FORBIDDEN - Non-null assertion without reason
const user = users.find(u => u.id === 1)!;
```

### Rule 2: Null Safety

**MANDATORY Null Safety:**

```typescript
// ✅ REQUIRED - Optional chaining
const name = user?.fullName ?? "Unknown";
const email = user?.profile?.email;

// ✅ REQUIRED - Nullish coalescing
const credits = course?.credits ?? 0;

// ✅ REQUIRED - Check before use
if (!user) return <ErrorState />;
if (user === null) return <NotFound />;

// ❌ FORBIDDEN - Unsafe access
const name = user.fullName; // May be undefined
const email = user.profile.email; // Nested, unsafe

// ❌ FORBIDDEN - Force non-null
const name = user!.fullName;
```

### Rule 3: Type Inference

**REQUIRED Type Inference Pattern:**

```typescript
// ✅ REQUIRED - Let TS infer where clear
const [count, setCount] = useState(0); // Type: number inferred

const handleClick = (id: number) => {
  // Return type inferred from function body
  return enrollmentService.enroll(id);
};

// ✅ REQUIRED - Explicit where unclear
const [user, setUser] = useState<UserResponse | null>(null);
const getGrades = async (): Promise<GradeData[]> => {};

// ✅ REQUIRED - Use z.infer for forms
const schema = z.object({ email: z.string() });
type FormData = z.infer<typeof schema>;

// ❌ FORBIDDEN - Unnecessary explicit types
const count: number = 0;
const name: string = "John";
```

### Rule 4: Interface Naming

**REQUIRED Naming Convention:**

```typescript
// ✅ REQUIRED - Clear naming
interface UserResponse {} // API response
interface CreateUserRequest {} // API request
interface UserProps {} // Component props
interface UserCardProps {} // Specific component props

// ❌ FORBIDDEN - Ambiguous naming
interface User {} // Could be entity, DTO, or props
interface IUser {} // Old Java-style prefixing
interface UserType {} // Redundant "Type"
interface IUserCardProps {} // Redundant "I" prefix
```

### Rule 5: Generic Types

**REQUIRED Generic Pattern:**

```typescript
// ✅ REQUIRED - Reusable with generics
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

// ✅ REQUIRED - Component generics
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

// ✅ REQUIRED - Query generics
const { data } = useQuery<UserResponse>({
  queryFn: () => getUserById(id),
});

// ❌ FORBIDDEN - Unnecessary use of any
interface PaginatedResponse {
  content: any[];
}
```

---

## Query Management Rules

### Rule 1: Query Key Hierarchy

**MANDATORY Query Key Pattern:**

```typescript
// ✅ REQUIRED - Hierarchical structure
["users"][("users", "list")][("users", userId)][("users", userId, "profile")][("admin", "users")][ // List all // Explicit list // Specific user // Nested data
  ("admin", "users", userId)
][("student", "grades", semesterId)]; // Role-specific // Role-specific resource // Contextual data

// ✅ REQUIRED - Include dependencies in key
const { data } = useQuery({
  queryKey: ["users", page, pageSize, filter], // All deps included
  queryFn: () => listUsers(page, pageSize, filter),
});

// ❌ FORBIDDEN - Non-hierarchical keys
["getUsers"]["userList"]["fetch_users"];

// ❌ FORBIDDEN - Missing dependencies
const { data } = useQuery({
  queryKey: ["users"], // Missing page, pageSize, filter!
  queryFn: () => listUsers(page, pageSize, filter),
});
```

### Rule 2: useQuery Pattern

**REQUIRED Query Pattern:**

```typescript
// ✅ REQUIRED
const { data, isLoading, error, isError, isPending } = useQuery({
  queryKey: ["student", "grades", semesterId],
  queryFn: () => studentApi.getGrades(semesterId),
  staleTime: 5 * 60 * 1000,  // Optional: cache for 5 minutes
  retry: 2,                   // Optional: retry on failure
});

// ✅ REQUIRED - Handle all states
if (isPending) return <Skeleton />;
if (isError) return <ErrorMessage error={error} />;
if (!data?.length) return <EmptyState />;

return <GradesList grades={data} />;

// ❌ FORBIDDEN - Incomplete state handling
const { data } = useQuery({ ... });
return <GradesList grades={data} />; // May be undefined!

// ❌ FORBIDDEN - Wrong state names
const { loading } = useQuery(...); // Should be isPending
const { success } = useQuery(...);  // Not a valid property
```

### Rule 3: useMutation Pattern

**REQUIRED Mutation Pattern:**

```typescript
// ✅ REQUIRED
const { mutate, isPending, error } = useMutation({
  mutationFn: async (data: CreateGradeInput) => studentApi.submitGrade(data),

  onMutate: async (newData) => {
    // Optimistic update (optional but recommended)
    await queryClient.cancelQueries({ queryKey: ["student", "grades"] });
    const previousData = queryClient.getQueryData(["student", "grades"]);

    queryClient.setQueryData(["student", "grades"], (old: any) => [...old, newData]);

    return { previousData };
  },

  onSuccess: (result, variables, context) => {
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ["student", "grades"] });
    toast.success("Grade submitted!");
    onSuccess?.();
  },

  onError: (error, variables, context) => {
    // Rollback optimistic update
    if (context?.previousData) {
      queryClient.setQueryData(["student", "grades"], context.previousData);
    }
    toast.error(error.message);
  },
});

const handleSubmit = (data: CreateGradeInput) => {
  mutate(data);
};

// ❌ FORBIDDEN - Missing error handling
const { mutate } = useMutation({
  mutationFn: (data) => api.submit(data),
  onSuccess: () => {
    toast.success("Done!");
  },
  // Missing onError handler!
});

// ❌ FORBIDDEN - No cache invalidation
const { mutate } = useMutation({
  mutationFn: (data) => api.create(data),
  onSuccess: () => {
    // Forgot to invalidate queries!
    toast.success("Created!");
  },
});
```

### Rule 4: Cache Invalidation

**MANDATORY Cache Invalidation Pattern:**

```typescript
// ✅ REQUIRED - Specific invalidation
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ["admin", "users"], // Exact key
    type: "active",                // Only refetch active queries
  });
}

// ✅ REQUIRED - Partial key invalidation
queryClient.invalidateQueries({
  queryKey: ["student"], // Invalidates all student queries
});

// ✅ REQUIRED - Predicate invalidation
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === "admin",
});

// ❌ FORBIDDEN - Invalidating everything
queryClient.clear(); // Too broad!
queryClient.invalidateQueries(); // No args = invalidate all

// ❌ FORBIDDEN - Missing invalidation
onSuccess: () => {
  toast.success("User created!"); // Forgot to invalidate!
},
```

### Rule 5: Pagination Pattern

**REQUIRED Pagination Pattern:**

```typescript
// ✅ REQUIRED - Include pagination in query key
const [page, setPage] = useState(0);

const { data, isPending } = useQuery({
  queryKey: ["users", page], // Page included in key
  queryFn: () => adminApi.listUsers({
    page,
    size: 20,
  }),
});

const totalPages = data?.totalPages ?? 0;

return (
  <>
    <DataTable columns={columns} data={data?.content || []} />
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  </>
);

// ❌ FORBIDDEN - Pagination not in query key
const { data } = useQuery({
  queryKey: ["users"], // Page not in key = wrong cache!
  queryFn: () => adminApi.listUsers({ page }), // Page parameter ignored
});
```

### Rule 6: Filtering Pattern

**REQUIRED Filtering Pattern:**

```typescript
// ✅ REQUIRED - Filter in query key
const [filter, setFilter] = useState<UserFilter>({
  role: undefined,
  status: "ACTIVE",
});

const { data } = useQuery({
  queryKey: ["users", filter], // Filter included
  queryFn: () => adminApi.listUsers(filter),
});

const handleFilterChange = (newFilter: UserFilter) => {
  setFilter(newFilter); // Updates query key, refetches
};

// ❌ FORBIDDEN - Filter not in query key
const { data } = useQuery({
  queryKey: ["users"], // Filter not included!
  queryFn: () => adminApi.listUsers(filter), // Filter lost on cache
});
```

---

## Routing Rules

### Rule 1: File-Based Route Naming

**MANDATORY Route Naming Convention:**

```
Pattern: {role}.{feature}.tsx or {role}.{feature}.{subfeature}.tsx

Examples:
✅ admin.tsx               → /admin
✅ admin.users.tsx         → /admin/users
✅ admin.users.edit.tsx    → /admin/users/:id/edit
✅ student.tsx             → /student
✅ student.grades.tsx      → /student/grades
✅ teacher.classes.tsx     → /teacher/classes
✅ login.tsx               → /login
✅ index.tsx               → /

❌ AdminPage.tsx
❌ AdminUsersPage.tsx
❌ AdminEditUserPage.tsx
❌ UserManagementPage.tsx
```

### Rule 2: ProtectedOutlet Usage

**MANDATORY Role-Based Protection:**

```typescript
// ✅ REQUIRED - Protect admin routes
// File: src/routes/admin.tsx
export const Route = createFileRoute("/admin")({
  component: () => <ProtectedOutlet role="ADMIN" />,
});

// ✅ REQUIRED - Protect student routes
// File: src/routes/student.tsx
export const Route = createFileRoute("/student")({
  component: () => <ProtectedOutlet role="STUDENT" />,
});

// ✅ REQUIRED - Protect teacher routes
// File: src/routes/teacher.tsx
export const Route = createFileRoute("/teacher")({
  component: () => <ProtectedOutlet role="TEACHER" />,
});

// ❌ FORBIDDEN - No protection
export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

// ❌ FORBIDDEN - Manual role checking
export const Route = createFileRoute("/admin")({
  component: () => {
    const { role } = useAuth();
    if (role !== "ADMIN") return <Unauthorized />;
    return <AdminPage />;
  },
});
```

### Rule 3: Route Parameters

**REQUIRED Route Parameter Pattern:**

```typescript
// ✅ REQUIRED - Dynamic routes with parameters
export const Route = createFileRoute("/admin/users/$userId")({
  component: ({ params }) => <UserDetail userId={params.userId} />,
});

// ✅ REQUIRED - Access via params
function UserDetail({ userId }: { userId: string }) {
  const { data: user } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => adminApi.getUser(Number(userId)),
  });

  return <UserProfile user={user} />;
}

// ❌ FORBIDDEN - Props not extracted properly
export const Route = createFileRoute("/admin/users/$userId")({
  component: (props: any) => <UserDetail {...props} />,
});

// ❌ FORBIDDEN - Using useParams from router
const { userId } = useParams(); // Wrong - use route params
```

### Rule 4: Navigation

**REQUIRED Navigation Pattern:**

```typescript
import { Link } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";

// ✅ REQUIRED - Link component
<Link to="/admin/users">View Users</Link>

// ✅ REQUIRED - Programmatic navigation
const navigate = useNavigate();
const handleSuccess = () => {
  navigate({ to: "/admin/users" });
};

// ❌ FORBIDDEN - Manual navigation
window.location.href = "/admin/users";
window.history.pushState(...);
```

### Rule 5: Authentication Routes

**Routes without role protection:**

```typescript
// ✅ REQUIRED - Public routes
export const Route = createFileRoute("/")({
  component: LandingPage,
});

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

// ✅ REQUIRED - Authenticated routes (all users)
export const Route = createFileRoute("/me")({
  component: MyProfilePage, // Requires auth via AuthProvider
});

// ❌ FORBIDDEN - Unprotected admin routes
export const Route = createFileRoute("/admin/sensitive")({
  component: SensitiveData, // No ProtectedOutlet!
});
```

---

## Code Quality Rules

### Rule 1: Component Modularity

**REQUIRED Component Structure:**

```typescript
// ✅ REQUIRED - Small, focused components
export function UsersList() {
  const { data } = useQuery(...);
  return <UserListDisplay users={data} />;
}

export function UserListDisplay({ users }: { users: User[] }) {
  return <DataTable columns={columns} data={users} />;
}

// ✅ REQUIRED - Extract complex logic to hooks
const useUserFilters = () => {
  const [filters, setFilters] = useState();
  return { filters, setFilters };
};

// ❌ FORBIDDEN - Monolithic component
export function UsersPage() {
  const { data } = useQuery(...);
  const [filters, setFilters] = useState();
  const [sort, setSort] = useState();
  const [page, setPage] = useState();
  // ... 200 lines of complex logic
  return <div>{/* everything inline */}</div>;
}
```

### Rule 2: Single Responsibility

**Each component should:**

- Do ONE thing only
- Have clear responsibility
- Be testable in isolation
- Be under 300 lines

```typescript
// ✅ REQUIRED - Single responsibility
export function GradesList() {
  // Responsibility: Fetch and display grades
  const { data } = useQuery(...);
  return <GradesDisplay grades={data} />;
}

export function GradesDisplay({ grades }: Props) {
  // Responsibility: Present grades in table
  return <DataTable data={grades} />;
}

// ❌ FORBIDDEN - Multiple responsibilities
export function GradesPage() {
  // Fetching
  const { data } = useQuery(...);
  // Filtering
  const [filter, setFilter] = useState();
  // Pagination
  const [page, setPage] = useState();
  // Sorting
  const [sort, setSort] = useState();
  // Display
  return <div>/* everything */</div>;
}
```

### Rule 3: Code Reusability

**REQUIRED Reusability Pattern:**

```typescript
// ✅ REQUIRED - Extract reusable logic
const useStudentGrades = (semesterId?: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["student", "grades", semesterId],
    queryFn: () => studentApi.getGrades(semesterId),
  });
  return { data, isLoading, error };
};

// Use in multiple components
export function GradesSummary() {
  const { data } = useStudentGrades();
  return <>{data?.cumulativeGpa}</>;
}

export function GradesDetail() {
  const { data } = useStudentGrades();
  return <DataTable data={data?.items} />;
}

// ❌ FORBIDDEN - Duplicated logic
export function GradesSummary() {
  const { data: grades } = useQuery({
    queryKey: ["student", "grades"],
    queryFn: () => studentApi.getGrades(),
  });
  return <>{grades?.cumulativeGpa}</>;
}

export function GradesDetail() {
  const { data: grades } = useQuery({
    queryKey: ["student", "grades"],
    queryFn: () => studentApi.getGrades(),
  });
  return <DataTable data={grades?.items} />;
}
```

### Rule 4: Naming Convention

**REQUIRED Naming Pattern:**

```typescript
// ✅ REQUIRED - Clear, descriptive names
const isUserActive = user.status === "ACTIVE";
const handleEnrollButtonClick = () => {};
const getStudentGradeAverage = (grades: Grade[]) => {};
const StudentGradesContainer = () => {};

// ✅ REQUIRED - Boolean prefixes
const isLoading = true;
const hasError = false;
const canEdit = true;
const shouldShowModal = false;

// ❌ FORBIDDEN - Ambiguous names
const data = user.status === "ACTIVE";
const handle = () => {};
const get = (grades: Grade[]) => {};
const GradesPage = () => {};

// ❌ FORBIDDEN - Wrong prefixes for booleans
const loadingState = true; // Should be isLoading
const errorExists = false; // Should be hasError
const editPermission = true; // Should be canEdit
```

### Rule 5: Code Formatting

**REQUIRED Formatting:**

```typescript
// Use Prettier for consistent formatting
// Run: npm run format

// ✅ REQUIRED - Consistent indentation (2 spaces)
function Component() {
  return (
    <div>
      <p>Content</p>
    </div>
  );
}

// ✅ REQUIRED - Line length reasonable
// Break long lines for readability
const { data: users } = useQuery({
  queryKey: ["admin", "users", page, filter],
  queryFn: () => adminApi.listUsers({ page, filter }),
});

// ✅ REQUIRED - Consistent spacing
const items = [1, 2, 3];
const config = { name: "test", value: 123 };

// ❌ FORBIDDEN - Inconsistent formatting
function Component(){
return (
<div>
<p>Content</p>
</div>
);
}
```

---

## Performance Rules

### Rule 1: Pagination for Large Lists

**MANDATORY Pagination:**

```typescript
// ✅ REQUIRED - Paginate by default
const { data } = useQuery({
  queryKey: ["users", page],
  queryFn: () => adminApi.listUsers({ page, limit: 20 }),
});

// ✅ REQUIRED - Default limit of 20-50 items
queryFn: () => api.list({ page: 0, limit: 20 });

// ❌ FORBIDDEN - No pagination
const { data: allUsers } = useQuery({
  queryFn: () => adminApi.getAllUsers(), // Could be 100,000+ users!
});

// ❌ FORBIDDEN - Loading entire dataset at once
const users = await api.getEveryUser(); // Don't do this
```

### Rule 2: Memoization

**Use React.memo() Sparingly:**

```typescript
// ✅ REQUIRED - Memoize if:
// 1. Receives same props every render
// 2. Component is expensive to render

const UserCard = React.memo(function UserCard(props: UserProps) {
  // Component body
});

// ✅ REQUIRED - useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return calculateComplexValue(data);
}, [data]);

// ❌ FORBIDDEN - Overuse of memoization
const SimpleButton = React.memo(function SimpleButton() {
  return <button>Click me</button>;
});

// ❌ FORBIDDEN - useMemo for simple values
const doubled = useMemo(() => count * 2, [count]); // Unnecessary
```

### Rule 3: Lazy Loading Routes

**RECOMMENDED Route Lazy Loading:**

```typescript
// Routes are lazy-loaded automatically by TanStack Router
// No manual lazy loading needed

// ✅ Router handles code splitting
export const Route = createFileRoute("/admin/users")({
  component: UserListPage,
});

// Component is automatically lazy-loaded by Router
```

### Rule 4: Query Caching

**REQUIRED Caching Strategy:**

```typescript
// ✅ REQUIRED - Set appropriate staleTime
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// ✅ REQUIRED - Use gcTime for garbage collection
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  gcTime: 10 * 60 * 1000, // 10 minutes
});

// ❌ FORBIDDEN - No caching strategy
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  // Defaults to staleTime: 0 = always stale
});
```

---

## Accessibility Rules

### Rule 1: Semantic HTML

**REQUIRED Semantic Markup:**

```typescript
// ✅ REQUIRED - Use semantic elements
<button onClick={handleClick}>Submit</button>
<a href="/users">Users</a>
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ❌ FORBIDDEN - Non-semantic markup
<div onClick={handleClick} className="button">Submit</div>
<div onClick={navigate} className="link">Users</div>
<div className="label">Email</div>
<div contentEditable>Type here</div>
```

### Rule 2: ARIA Labels

**REQUIRED ARIA for Complex Components:**

```typescript
// ✅ REQUIRED - ARIA labels for clarity
<button aria-label="Close dialog">✕</button>
<div role="status" aria-live="polite">Loading...</div>
<div role="alert">Error occurred</div>

// ✅ REQUIRED - Form labels linked
<label htmlFor="username">Username</label>
<input id="username" type="text" />

// ❌ FORBIDDEN - Missing ARIA
<button>✕</button> {/* What does X do? */}
<div>Saving...</div> {/* What's this? */}
```

### Rule 3: Focus Management

**REQUIRED Focus Handling:**

```typescript
// ✅ REQUIRED - Manage focus in dialogs
<Dialog>
  <DialogContent>
    {/* First focusable element gets focus */}
    <input autoFocus />
  </DialogContent>
</Dialog>

// ✅ REQUIRED - Keyboard navigation
<button onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
}} />

// ❌ FORBIDDEN - Focus traps
export function Modal() {
  // User can't escape modal with Tab
  return <div>{/* content */}</div>;
}
```

### Rule 4: Color Contrast

**REQUIRED Color Contrast:**

```typescript
// ✅ REQUIRED - Sufficient contrast
<button className="bg-blue-600 text-white">Click</button>
<p className="text-gray-900 bg-white">Text</p>

// ❌ FORBIDDEN - Poor contrast
<button className="bg-gray-100 text-gray-200">Click</button>
<p className="text-gray-400 bg-white">Barely visible</p>
```

---

## Forbidden Anti-Patterns

### ❌ FORBIDDEN Pattern 1: Monolithic Components

```typescript
// ❌ FORBIDDEN
export function StudentDashboard() {
  const [grades, setGrades] = useState();
  const [schedule, setSchedule] = useState();
  const [tuition, setTuition] = useState();
  const [filter, setFilter] = useState();
  const [sort, setSort] = useState();
  const [page, setPage] = useState();

  useEffect(() => { /* fetch grades */ }, []);
  useEffect(() => { /* fetch schedule */ }, []);
  useEffect(() => { /* fetch tuition */ }, []);

  // ... 500 lines of JSX
  return <div>{/* everything inline */}</div>;
}

// ✅ REQUIRED
export function StudentDashboard() {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GradesSummary />
        <ScheduleWidget />
        <TuitionWidget />
      </div>
    </MainLayout>
  );
}

const GradesSummary = () => {
  const { data } = useQuery({
    queryKey: ["student", "grades"],
    queryFn: () => studentApi.getGrades(),
  });
  return <GradesTotalCard data={data} />;
};
```

### ❌ FORBIDDEN Pattern 2: Duplicated Code

```typescript
// ❌ FORBIDDEN - Same query logic duplicated
export function GradesPage() {
  const { data: grades } = useQuery({
    queryKey: ["student", "grades"],
    queryFn: () => studentApi.getGrades(),
  });
  return <>{grades?.cumulativeGpa}</>;
}

export function GradesSummary() {
  const { data: grades } = useQuery({
    queryKey: ["student", "grades"],
    queryFn: () => studentApi.getGrades(),
  });
  return <>{grades?.cumulativeGpa}</>;
}

// ✅ REQUIRED - Extract to hook
const useStudentGrades = () => useQuery({
  queryKey: ["student", "grades"],
  queryFn: () => studentApi.getGrades(),
});

export function GradesPage() {
  const { data } = useStudentGrades();
  return <>{data?.cumulativeGpa}</>;
}

export function GradesSummary() {
  const { data } = useStudentGrades();
  return <>{data?.cumulativeGpa}</>;
}
```

### ❌ FORBIDDEN Pattern 3: Business Logic in UI

```typescript
// ❌ FORBIDDEN
export function EnrollmentForm() {
  const handleSubmit = async (formData) => {
    // ❌ Business logic in component
    if (!formData.studentId || !formData.classId) {
      setError("Invalid input");
      return;
    }

    // ❌ Direct API call
    const response = await fetch("/api/enroll", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      setError("Enrollment failed");
      return;
    }

    // ❌ Manual cache management
    setStudents([]);
    alert("Enrolled!");
  };
}

// ✅ REQUIRED
export function EnrollmentForm() {
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => studentApi.enrollClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student", "enrollments"],
      });
      toast.success("Enrolled!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: EnrollmentInput) => {
    mutate(data);
  };
}
```

### ❌ FORBIDDEN Pattern 4: Direct fetch() calls

```typescript
// ❌ FORBIDDEN
const grades = await fetch("/api/student/grades").then((r) => r.json());

const { data } = useQuery({
  queryFn: async () => {
    return fetch("/api/student/grades").then((r) => r.json());
  },
});

import axios from "axios";
const { data } = useQuery({
  queryFn: () => axios.get("/api/student/grades"),
});

// ✅ REQUIRED
import { studentApi } from "@/lib/api/student";

const { data } = useQuery({
  queryKey: ["student", "grades"],
  queryFn: () => studentApi.getGrades(),
});
```

### ❌ FORBIDDEN Pattern 5: Global State Misuse

```typescript
// ❌ FORBIDDEN - Using Context for server state
const [users, setUsers] = useContext(UsersContext);

useEffect(() => {
  fetch("/api/users").then((r) => setUsers(r.json()));
}, []);

// ❌ FORBIDDEN - Redux for UI state
dispatch(setModalOpen(true));

// ✅ REQUIRED - TanStack Query for server state
const { data: users } = useQuery({
  queryFn: () => adminApi.listUsers(),
});

// ✅ REQUIRED - React state for UI state
const [isModalOpen, setIsModalOpen] = useState(false);
```

### ❌ FORBIDDEN Pattern 6: Duplicated UI Systems

```typescript
// ❌ FORBIDDEN - Creating custom table instead of DataTable
export function UsersList({ users }: Props) {
  return (
    <table className="w-full border">
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>{user.email}</td>
        </tr>
      ))}
    </table>
  );
}

// ❌ FORBIDDEN - Creating custom button instead of shadcn
export function SubmitButton() {
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded"
      style={{ cursor: 'pointer' }}
    >
      Submit
    </button>
  );
}

// ✅ REQUIRED - Use DataTable
import { DataTable } from "@/components/data-table/DataTable";
export function UsersList({ users }: Props) {
  return <DataTable columns={userColumns} data={users} />;
}

// ✅ REQUIRED - Use shadcn Button
import { Button } from "@/components/ui/button";
export function SubmitButton() {
  return <Button type="submit">Submit</Button>;
}
```

### ❌ FORBIDDEN Pattern 7: Giant Components with inline everything

```typescript
// ❌ FORBIDDEN - Everything inline
export function UserListPage() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["users", page, filter],
    queryFn: () => adminApi.listUsers({ page, filter }),
  });

  return (
    <div className="p-4">
      <h1>Users</h1>
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search..."
        />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : !data?.length ? (
        <div>No users found</div>
      ) : (
        <table>
          {/* 100 lines of table markup */}
        </table>
      )}
      <div className="mt-4">
        {/* Pagination controls inline */}
      </div>
    </div>
  );
}

// ✅ REQUIRED - Properly decomposed
export function UserListPage() {
  return (
    <MainLayout>
      <UsersList />
    </MainLayout>
  );
}

const UsersList = () => {
  const [page, setPage] = useState(0);
  const { data } = useQuery({
    queryKey: ["users", page],
    queryFn: () => adminApi.listUsers({ page }),
  });

  return (
    <div>
      <UserFilters />
      <UserTable users={data?.items} />
      <UserPagination page={page} onPageChange={setPage} />
    </div>
  );
};

const UserFilters = () => {
  const [filter, setFilter] = useState("");
  return <input onChange={(e) => setFilter(e.target.value)} />;
};

const UserTable = ({ users }: { users: User[] }) => {
  return <DataTable columns={columns} data={users} />;
};
```

### ❌ FORBIDDEN Pattern 8: Type Bypass with any

```typescript
// ❌ FORBIDDEN
const data: any = response;
const handleClick = (e: any) => {};
interface Props {
  data: any;
}
const result = data as any;

// ✅ REQUIRED
const data: UserResponse = response;
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
interface Props {
  data: UserResponse[];
}
const result = data as UserResponse[];
```

---

## AI Output Format

### Required Output Structure

When AI generates code, it MUST follow this output format:

```
## Summary

[One sentence describing what was implemented]

## Files Created

- [src/path/file1.tsx] - [One-line description]
- [src/path/file2.tsx] - [One-line description]

## Files Extended

- [src/path/existing.tsx] - Added [what was added]

## Components Reused

- [Component name] from [path] - For [purpose]
- [Component name] from [path] - For [purpose]

## Hooks Reused

- [Hook name] from [path] - For [purpose]

## Architectural Decisions

1. [Decision 1] - Reasoning: [why]
2. [Decision 2] - Reasoning: [why]
3. [Decision 3] - Reasoning: [why]

## Integration Points

- API: [Module] extends [location]
- Queries: Uses query key ["domain", "resource"]
- Routes: Accessible at [/path]
- Role: [ADMIN|STUDENT|TEACHER|public]

## TypeScript Compliance

✅ Strict mode compliant
✅ No any types
✅ Full null safety
✅ Proper interfaces defined

## Code Quality Checklist

✅ Components under 300 lines
✅ Single responsibility principle
✅ No code duplication
✅ Proper error handling
✅ Loading states implemented
✅ Pagination implemented (if list)
✅ Validation implemented (if form)

## Performance Optimizations

- [Optimization 1]
- [Optimization 2]

## Accessibility

- [Accessibility feature 1]
- [Accessibility feature 2]

## Next Steps (if needed)

- [What to do next]
```

### Example Output

```
## Summary

Implemented student enrollment management with form, validation, and real-time table updates.

## Files Created

- [src/features/enrollment/EnrollmentForm.tsx] - React Hook Form + Zod form for enrollment
- [src/hooks/useEnrollments.ts] - Custom hook for enrollment queries
- [src/routes/student.course-registration.tsx] - Student course registration page

## Files Extended

- [src/lib/api/student.ts] - Added enrollClass() and cancelClass() endpoints

## Components Reused

- MainLayout from [src/components/layout] - Page structure
- DataTable from [src/components/data-table] - Available classes list
- EntityFormDialog from [src/components/forms] - Alternative to inline form
- Button, Input, Dialog from shadcn/ui - Form controls

## Hooks Reused

- useQuery (TanStack Query) - For fetching available classes
- useMutation (TanStack Query) - For enrollment submission

## Architectural Decisions

1. Extracted useEnrollments hook - Allows reuse across multiple pages
2. Form validation with Zod - Ensures type safety and validation consistency
3. Optimistic updates - Provides instant UI feedback while API processes
4. Pagination by default - Prevents loading thousands of courses at once

## Integration Points

- API: Extends [src/lib/api/student.ts] with enrollClass, cancelClass functions
- Queries: Uses key ["student", "enrollments", semesterId]
- Routes: Accessible at /student/course-registration
- Role: STUDENT only (protected by ProtectedOutlet)

## TypeScript Compliance

✅ Strict mode compliant
✅ No any types used
✅ Full null safety implemented
✅ Proper response DTO types

## Code Quality Checklist

✅ EnrollmentForm component: 120 lines (under 300)
✅ Single responsibility: Each component has one purpose
✅ No code duplication: Common logic in useEnrollments hook
✅ Error handling: try-catch + toast notifications
✅ Loading states: isLoading spinner + disabled buttons
✅ Pagination: 20 items per page with Pagination component
✅ Validation: Zod schema + FormMessage components

## Performance Optimizations

- Query caching with 5-minute staleTime
- Pagination prevents loading all courses
- Lazy loading of route component via TanStack Router
- Memoized DataTable for large class lists

## Accessibility

- Form labels properly linked with htmlFor
- ARIA labels on action buttons
- Keyboard navigation support (Tab through form)
- Focus management in dialog

## Next Steps

- Add toast notification on enrollment success
- Implement retry logic for failed enrollments
- Add course prerequisites validation
```

---

## Decision Trees

### Decision Tree 1: Should I Create a New Component?

```
START: Need new component?
  │
  ├─ Does similar component already exist?
  │  ├─ YES → Can I extend/reuse it?
  │  │  ├─ YES → Use existing component
  │  │  └─ NO → Create new component
  │  └─ NO → Create new component
  │
  ├─ Is component under 300 lines?
  │  ├─ NO → Split into smaller components
  │  └─ YES → OK to create
  │
  └─ Single responsibility?
     ├─ NO → Extract separate components
     └─ YES → Create component
```

### Decision Tree 2: Should I Create a New Hook?

```
START: Need new logic?
  │
  ├─ Will this logic be reused in 2+ components?
  │  ├─ NO → Keep logic in component (useState)
  │  └─ YES → Extract to hook
  │
  ├─ Is it business logic or UI state?
  │  ├─ Business logic (API calls, calculations) → useQuery hook
  │  └─ UI state (modal open, filter) → useState in component
  │
  └─ Should it be in src/hooks/ or src/features/?
     ├─ General purpose → src/hooks/
     └─ Domain-specific → src/features/[domain]/
```

### Decision Tree 3: Where Should I Fetch Data?

```
START: Need to fetch data?
  │
  ├─ Should data be cached globally?
  │  ├─ YES → TanStack Query (useQuery)
  │  └─ NO → Component state (useState)
  │
  ├─ Should multiple components access this?
  │  ├─ YES → TanStack Query with shared queryKey
  │  └─ NO → Component-local fetch
  │
  └─ API module exists?
     ├─ YES → Use apiModule.function()
     └─ NO → Extend API module, then use
```

### Decision Tree 4: Form Submission Approach

```
START: Need to submit form?
  │
  ├─ Use react-hook-form?
  │  └─ YES - Always (required)
  │
  ├─ Use Zod validation?
  │  └─ YES - Always (required)
  │
  ├─ Use TanStack Query mutation?
  │  └─ YES - Always (required)
  │
  ├─ Show loading state?
  │  ├─ YES → Disable button during isPending
  │  └─ YES - Required
  │
  ├─ Show errors?
  │  ├─ YES → toast.error() + FormMessage
  │  └─ YES - Required
  │
  └─ Invalidate queries on success?
     ├─ YES → queryClient.invalidateQueries()
     └─ YES - Required
```

### Decision Tree 5: Use Cache or Fresh Data?

```
START: Should I cache this query?
  │
  ├─ User-specific data? → Cache (staleTime: 5min)
  │
  ├─ Frequently changed? → Low cache (staleTime: 1min)
  │
  ├─ Static reference data? → High cache (staleTime: 1hour)
  │
  ├─ Real-time data? → No cache (staleTime: 0)
  │
  └─ Set appropriate staleTime
```

---

## Testing the Implementation

### Pre-Submission Checklist

Before submitting generated code, verify:

**File Structure:**

- [ ] New files follow naming conventions
- [ ] Files in correct directories
- [ ] No unnecessary files created

**Code Quality:**

- [ ] No files exceed max line count
- [ ] TypeScript strict mode compliant
- [ ] No `any` types
- [ ] No direct fetch() or axios calls
- [ ] No global state misuse

**API Integration:**

- [ ] Uses apiClient only
- [ ] All endpoints typed
- [ ] Uses existing API modules
- [ ] Query keys hierarchical

**Components:**

- [ ] Uses shadcn/ui components
- [ ] Reuses existing layouts
- [ ] Single responsibility
- [ ] Proper props typing

**Forms (if applicable):**

- [ ] Uses react-hook-form
- [ ] Uses Zod validation
- [ ] Shows loading states
- [ ] Handles errors with toast

**Queries (if applicable):**

- [ ] Proper query keys
- [ ] Cache invalidation
- [ ] Loading state rendered
- [ ] Error state rendered
- [ ] Empty state rendered

**Routes (if applicable):**

- [ ] Proper file naming
- [ ] Role-based protection with ProtectedOutlet
- [ ] Uses TanStack Router

**Performance:**

- [ ] Pagination implemented (for lists)
- [ ] Caching strategy appropriate
- [ ] No N+1 queries
- [ ] Memoization used sparingly

**Accessibility:**

- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast adequate

---

## Common Mistakes to Avoid

1. **Using any type** - Always use proper types from src/lib/api/types.ts
2. **Mixing fetch and apiClient** - Always use apiClient
3. **Business logic in UI** - Extract to hooks and services
4. **Monolithic components** - Keep components under 300 lines
5. **Missing error handling** - Always show error UI
6. **Missing loading states** - Always show loading UI
7. **No cache invalidation** - Always invalidate after mutations
8. **Duplicating code** - Extract to reusable hooks
9. **Wrong query keys** - Include all dependencies in query key
10. **Creating design systems** - Use shadcn/ui + Tailwind always

---

## Emergency Contact

If an AI encounters:

- **Ambiguous requirements** → Ask user for clarification
- **Conflicting rules** → This document takes precedence
- **Missing context** → Stop and ask for more information
- **Unable to analyze existing code** → Ask user to share relevant files
- **Technical limitation** → Explain limitation and ask for alternatives

---

**Document Version:** 1.0  
**Last Updated:** May 19, 2026  
**Status:** Production Grade - Enforced Rules  
**Audience:** AI Coding Agents (Cursor, Windsurf, Copilot, Claude Code)
