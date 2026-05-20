# AGENTS-FRONTEND.md

**Project:** ThangLongUniversityWeb  
**Framework:** TanStack Start + React 19 + TypeScript  
**Generated:** May 19, 2026

This document guides AI agents (Cursor, Windsurf, GitHub Copilot, Claude Code) on frontend architecture, conventions, and practices for production-grade development.

---

## Table of Contents

1. [Stack Overview](#stack-overview)
2. [Project Structure](#project-structure)
3. [Routing System](#routing-system)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Layer & Data Fetching](#api-layer--data-fetching)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [Form Handling](#form-handling)
9. [UI & Styling](#ui--styling)
10. [TypeScript Standards](#typescript-standards)
11. [Query Patterns](#query-patterns)
12. [Error Handling](#error-handling)
13. [Feature Creation Workflow](#feature-creation-workflow)
14. [Code Generation Rules](#code-generation-rules)
15. [Common Patterns & Anti-Patterns](#common-patterns--anti-patterns)

---

## Stack Overview

### Core Dependencies
- **React:** 19 (latest features, strict mode enabled)
- **TanStack Router:** 1.168+ (file-based routing)
- **TanStack Start:** 1.167+ (SSR, server state)
- **TanStack Query:** 5.83+ (server state management)
- **TypeScript:** Strict mode (`tsconfig.json` enforced)
- **Vite:** 5+ (build tool)
- **TailwindCSS:** 4+ (utility-first CSS)
- **shadcn/ui:** (component library via Radix UI)
- **React Hook Form:** 7+ (form state)
- **Zod:** 3+ (schema validation)
- **Sonner:** (toast notifications)
- **Cloudflare Workers:** (edge deployment)

### No External Alternative Libraries
⛔ **NEVER use:**
- axios (use native fetch via apiClient)
- Redux (use TanStack Query + context)
- useContext for global state outside auth (use TanStack Query)
- Material-UI (use shadcn/ui + Radix UI)

---

## Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts          # HTTP client with auth/retry logic
│   │   │   ├── auth.ts            # Authentication endpoints
│   │   │   ├── admin.ts           # Admin API
│   │   │   ├── chat.ts            # Chat API
│   │   │   ├── student.ts         # Student API
│   │   │   └── types.ts           # TypeScript types for APIs
│   │   ├── auth.tsx               # AuthProvider, useAuth hook
│   │   └── utils.ts               # Shared utilities
│   ├── components/
│   │   ├── layout/
│   │   │   ├── ProtectedOutlet.tsx    # Role-based route wrapper
│   │   │   ├── Sidebar.tsx            # Navigation
│   │   │   ├── Header.tsx             # Top bar
│   │   │   └── MainLayout.tsx         # Main layout wrapper
│   │   ├── ui/
│   │   │   ├── button.tsx             # shadcn button
│   │   │   ├── dialog.tsx             # shadcn dialog
│   │   │   ├── form.tsx               # shadcn form wrapper
│   │   │   ├── table.tsx              # shadcn table
│   │   │   ├── card.tsx               # shadcn card
│   │   │   └── ... (other shadcn components)
│   │   ├── data-table/
│   │   │   ├── DataTable.tsx          # Reusable table component
│   │   │   └── columns.tsx            # Column definitions
│   │   ├── forms/
│   │   │   ├── EntityFormDialog.tsx   # Reusable form dialog
│   │   │   └── ... (domain-specific forms)
│   │   ├── marketing/
│   │   │   └── ... (marketing page components)
│   │   └── data/
│   │       └── mock.ts                # Mock data for development
│   ├── routes/
│   │   ├── __root.tsx                 # Root layout
│   │   ├── index.tsx                  # Landing page
│   │   ├── login.tsx                  # Login page
│   │   ├── admin.tsx                  # Admin layout
│   │   ├── admin.users.tsx            # User management page
│   │   ├── admin.dashboard.tsx        # Admin dashboard
│   │   ├── student.tsx                # Student layout
│   │   ├── student.dashboard.tsx      # Student dashboard
│   │   ├── student.grades.tsx         # Student grades
│   │   ├── teacher.tsx                # Teacher layout
│   │   ├── teacher.classes.tsx        # Teacher classes
│   │   └── ... (other routes follow pattern)
│   ├── features/
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx         # Chat UI component
│   │   │   ├── useChatRooms.ts        # Chat query hook
│   │   │   └── ChatService.ts         # Chat business logic
│   │   └── ... (other features)
│   ├── hooks/
│   │   ├── use-mobile.tsx             # Mobile detection
│   │   └── ... (other shared hooks)
│   ├── router.tsx                      # TanStack Router config
│   ├── server.ts                       # Server-side code for Start
│   ├── start.ts                        # Start entry point
│   ├── styles.css                      # Global styles + Tailwind
│   └── root.tsx                        # React root (if used)
├── public/
│   └── robots.txt
├── vite.config.ts                      # Vite configuration
├── tailwind.config.ts                  # Tailwind configuration
├── tsconfig.json                       # TypeScript strict mode
├── eslint.config.js                    # ESLint rules
├── package.json                        # Dependencies
└── wrangler.jsonc                      # Cloudflare Workers config
```

---

## Routing System

### Conventions: TanStack Router with File-Based Routing

**Route Naming Patterns:**

```
Pages grouped by role/feature:
- admin.* routes (admin role only)
- student.* routes (student role only)
- teacher.* routes (teacher role only)
- public routes (no role required)
```

**Examples:**
```
/admin → admin.tsx
/admin/users → admin.users.tsx
/admin/dashboard → admin.dashboard.tsx
/student → student.tsx
/student/dashboard → student.dashboard.tsx
/student/grades → student.grades.tsx
/teacher → teacher.tsx
/teacher/classes → teacher.classes.tsx
```

### TanStack Router File Structure

**Root Route (`src/routes/__root.tsx`):**
```typescript
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
});
```

**Protected Routes Using ProtectedOutlet:**
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { ProtectedOutlet } from "@/components/layout/ProtectedOutlet";

// /admin route
export const Route = createFileRoute("/admin")({
  component: () => <ProtectedOutlet role="ADMIN" />,
});

// /student route
export const Route = createFileRoute("/student")({
  component: () => <ProtectedOutlet role="STUDENT" />,
});
```

**Child Routes:**
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/routes/admin.dashboard";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});
```

**Route Parameters:**
```typescript
export const Route = createFileRoute("/admin/users/$userId")({
  component: ({ params }) => <UserDetail userId={params.userId} />,
});
```

### Navigation

Use TanStack Router's Link and useNavigate:

```typescript
import { Link, useNavigate } from "@tanstack/react-router";

// Link component
<Link to="/admin/users">Users</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate({ to: "/admin/dashboard" });
```

---

## Authentication & Authorization

### Authentication Provider

Located in `src/lib/auth.tsx`

**useAuth Hook:**
```typescript
import { useAuth } from "@/lib/auth";

function MyComponent() {
  const { role, profile, login, logout } = useAuth();
  
  if (!role) return <LoginPage />;
  
  return <div>Welcome {profile?.fullName}</div>;
}
```

**Roles:**
- `ADMIN` - System administrator
- `STUDENT` - Student user
- `TEACHER` - Instructor/Teacher

### Protected Routes

**ProtectedOutlet Component** (`src/components/layout/ProtectedOutlet.tsx`)

Wraps routes to enforce role-based access:

```typescript
<ProtectedOutlet role="ADMIN" /> // Only admins allowed
<ProtectedOutlet role="STUDENT" /> // Only students allowed
<ProtectedOutlet role="TEACHER" /> // Only teachers allowed
```

### Token Management

Handled automatically by `src/lib/api/client.ts`:

- **Storage:** LocalStorage key `tlu-auth`
- **Refresh:** Automatic 401 handling with `/api/auth/refresh`
- **Format:** `{ accessToken, refreshToken, role, name }`

**Never manually manage tokens.** The apiClient handles this transparently.

### Login Flow

```typescript
import { useAuth } from "@/lib/auth";

function LoginForm() {
  const { login } = useAuth();
  
  const handleLogin = async (username: string, password: string) => {
    const role = await login(username, password);
    // Redirects automatically via Router
  };
}
```

---

## API Layer & Data Fetching

### Centralized API Client

Location: `src/lib/api/client.ts`

**Core Function - `apiRequest<T>`:**

```typescript
import { apiRequest } from "@/lib/api/client";

// GET request (no body)
const users = await apiRequest<UserResponse[]>("/api/admin/users");

// POST request
const newUser = await apiRequest<UserResponse>("/api/admin/users", {
  method: "POST",
  body: JSON.stringify({ name: "John", email: "john@example.com" }),
});

// DELETE request
await apiRequest<void>(`/api/admin/users/${id}`, { method: "DELETE" });
```

### API Configuration

```typescript
// Environment variable
VITE_API_BASE_URL=http://localhost:8080

// Default
http://localhost:8080
```

### Authentication Headers

Automatically added by apiClient:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### API Modules

**Structure by domain:**

- `src/lib/api/auth.ts` - Login, logout, user profile
- `src/lib/api/admin.ts` - Admin operations
- `src/lib/api/chat.ts` - Chat operations
- `src/lib/api/student.ts` - Student operations
- `src/lib/api/types.ts` - All TypeScript types

**Example API Module:**

```typescript
// src/lib/api/admin.ts
import { apiRequest } from "./client";
import type { UserResponse } from "./types";

export const adminApi = {
  listUsers: () => apiRequest<UserResponse[]>("/api/admin/users"),
  
  getUser: (id: number) => apiRequest<UserResponse>(`/api/admin/users/${id}`),
  
  createUser: (data: CreateUserRequest) =>
    apiRequest<UserResponse>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  
  updateUser: (id: number, data: UpdateUserRequest) =>
    apiRequest<UserResponse>(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  
  deleteUser: (id: number) =>
    apiRequest<void>(`/api/admin/users/${id}`, { method: "DELETE" }),
};
```

---

## Component Architecture

### Component Hierarchy

```
Pages (Route components)
  ├── Feature Components (domain-specific, handles queries/mutations)
  │   ├── UI Components (pure presentation)
  │   └── Form Components (form-specific logic)
  └── Layout Components (ProtectedOutlet, MainLayout, etc.)
```

### Page Component Design

**Principle:** Pages should be small, composable, and focus on routing logic.

```typescript
// src/routes/admin.users.tsx
import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/routes/admin.users";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

// src/routes/admin.users.tsx (actual component)
export function UsersPage() {
  return (
    <MainLayout>
      <UsersList />
    </MainLayout>
  );
}
```

### Feature Components

**Location:** `src/features/` or domain-specific folders

Responsibilities:
- Query data using TanStack Query
- Handle mutations (create, update, delete)
- Manage feature-specific state
- Compose UI components

```typescript
// src/features/users/UsersList.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";

export function UsersList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminApi.listUsers(),
  });
  
  if (isLoading) return <UsersSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!users?.length) return <EmptyState />;
  
  return <DataTable columns={userColumns} data={users} />;
}
```

### UI Components

**Location:** `src/components/ui/` (shadcn/ui) or `src/components/`

Responsibilities:
- Pure presentation
- No business logic
- No API calls
- No TanStack Query

```typescript
// src/components/UserCard.tsx
interface UserCardProps {
  user: UserResponse;
  onEdit?: (user: UserResponse) => void;
  onDelete?: (userId: number) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.fullName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{user.email}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onEdit?.(user)}>Edit</Button>
        <Button onClick={() => onDelete?.(user.id)}>Delete</Button>
      </CardFooter>
    </Card>
  );
}
```

### Reusable Components (Always Use)

**DataTable Component:**
```typescript
import { DataTable } from "@/components/data-table/DataTable";
import { userColumns } from "@/components/data-table/columns";

<DataTable columns={userColumns} data={users} />
```

**EntityFormDialog:**
```typescript
import { EntityFormDialog } from "@/components/forms/EntityFormDialog";

<EntityFormDialog
  title="Create User"
  onSubmit={handleSubmit}
  fields={userFormFields}
/>
```

**Existing Layouts:**
```typescript
import { MainLayout } from "@/components/layout/MainLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

<MainLayout>
  <Content />
</MainLayout>
```

---

## State Management

### Server State (TanStack Query)

**For all remote data:**
- Fetching data from API
- Synchronizing server state
- Mutations (create, update, delete)
- Caching and invalidation

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Queries
const { data, isLoading, error } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});

// Mutations
const { mutate, isPending } = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

### Client State (React State + Context)

**For UI-only state:**
- UI visibility (modals, sidebars)
- Form input
- User preferences
- Theme selection

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [theme, setTheme] = useContext(ThemeContext);
```

**Never use Context for:**
- Remote data (use TanStack Query)
- Global state beyond auth (use TanStack Query)

### Auth State (AuthProvider)

```typescript
const { role, profile, login, logout } = useAuth();
```

**Single source of truth for:**
- Current user role
- Current user profile
- Login/logout functions

---

## Form Handling

### Required Pattern: React Hook Form + Zod

**All forms must:**
1. Use `react-hook-form` for state
2. Use `Zod` for validation
3. Use shadcn/ui form components
4. Display loading states
5. Display validation errors
6. Use Sonner for notifications

### Form Example

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// 1. Define Zod schema
const createUserSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

export function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  // 2. Setup react-hook-form with Zod
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
    },
  });

  // 3. Setup mutation
  const queryClient = useQueryClient();
  const { mutate: createUser, isPending } = useMutation({
    mutationFn: (data: CreateUserInput) =>
      adminApi.createUser(data),
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // 4. Submit handler
  const onSubmit = (data: CreateUserInput) => {
    createUser(data);
  };

  // 5. Render form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="John Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="john@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} placeholder="johndoe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
  );
}
```

### Form Validation

**Always use Zod:**
```typescript
const schema = z.object({
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18+"),
  role: z.enum(["ADMIN", "STUDENT", "TEACHER"]),
});

type FormData = z.infer<typeof schema>;
```

### Error Display

```typescript
<FormMessage /> // Automatically shows validation errors
```

### Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("User created!");

// Error
toast.error("Failed to create user");

// Info
toast.info("Processing...");

// Custom
toast.custom((t) => <CustomToast id={t} />);
```

---

## UI & Styling

### Styling System

**Tools:**
- TailwindCSS v4 for utility classes
- shadcn/ui components built on Radix UI
- CSS variables for theming

### Utility Classes (TailwindCSS)

```typescript
// Spacing
<div className="p-4 m-2 space-y-4" />

// Colors
<div className="bg-white text-gray-900 border border-gray-200" />

// Responsive
<div className="w-full md:w-1/2 lg:w-1/3" />

// Flexbox
<div className="flex items-center justify-between gap-4" />

// Dark mode
<div className="dark:bg-gray-950 dark:text-white" />
```

### Component Library (shadcn/ui)

**Always use shadcn/ui components:**

```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
```

### Reusable UI Components

**Use existing patterns:**
- Existing cards with consistent styling
- Existing tables (DataTable)
- Existing dialogs (EntityFormDialog)
- Existing layouts (MainLayout, Sidebar)
- Existing loading states (skeletons)

**Never:**
- Create second design system
- Create duplicate components
- Use inconsistent spacing
- Mix shadcn/ui with custom UI

---

## TypeScript Standards

### Strict Mode Enabled

All code must pass TypeScript strict mode checks:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true
  }
}
```

### Rules

**Never:**
- Use `any` type
- Bypass type checking with `@ts-ignore`
- Use implicit `any`
- Ignore null/undefined safety

**Always:**
- Define interfaces for all data shapes
- Use `z.infer` for form types
- Type component props
- Type API responses
- Handle null/undefined explicitly

### Type Examples

```typescript
// API Response Type
interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: "ADMIN" | "STUDENT" | "TEACHER";
}

// Component Props
interface UserListProps {
  users: UserResponse[];
  onEdit: (user: UserResponse) => void;
  isLoading?: boolean;
}

// Zod Schema (generates type automatically)
const userSchema = z.object({
  email: z.string().email(),
  fullName: z.string(),
  role: z.enum(["ADMIN", "STUDENT", "TEACHER"]),
});

type CreateUserInput = z.infer<typeof userSchema>;

// Hook Return Type
function useUsers(): {
  users: UserResponse[] | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  // ...
}
```

### Null Safety

```typescript
// ✅ Correct
const user = users?.find(u => u.id === id);
const name = user?.fullName ?? "Unknown";

// ❌ Wrong
const user = users.find(u => u.id === id)!; // Non-null assertion without reason
const name = user.fullName; // May be undefined
```

---

## Query Patterns

### Query Key Strategy

Query keys organize data hierarchy:

```typescript
// Format: [domain, resource, ...identifiers]
["users"]
["users", "list"]
["users", id]
["users", id, "profile"]
["admin", "users"]
["admin", "users", "list"]
["student", "grades", semesterId]
["chat", "rooms"]
["chat", roomId, "messages"]
```

### Common Query Pattern

```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error, isError, isPending } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    const response = await apiRequest<UserResponse[]>("/api/admin/users");
    return response;
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 2,
});

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data?.length) return <EmptyState />;

return <UserList users={data} />;
```

### Mutation Pattern

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const { mutate, isPending, error } = useMutation({
  mutationFn: async (newUser: CreateUserInput) => {
    return await apiRequest<UserResponse>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(newUser),
    });
  },
  onSuccess: (newUser) => {
    // Update cache optimistically
    queryClient.setQueryData(["users"], (old: UserResponse[]) => [
      ...old,
      newUser,
    ]);
    // Or invalidate to refetch
    queryClient.invalidateQueries({ queryKey: ["users"] });
    toast.success("User created!");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

const handleCreate = (data: CreateUserInput) => {
  mutate(data);
};
```

### Pagination Pattern

```typescript
const [page, setPage] = useState(1);

const { data } = useQuery({
  queryKey: ["users", page],
  queryFn: () => adminApi.listUsers({ page, limit: 10 }),
});

return (
  <>
    <DataTable data={data?.items} />
    <Pagination
      currentPage={page}
      totalPages={data?.totalPages}
      onPageChange={setPage}
    />
  </>
);
```

### Filtering Pattern

```typescript
const [filter, setFilter] = useState<FilterInput>({
  status: "ACTIVE",
  role: undefined,
});

const { data } = useQuery({
  queryKey: ["users", filter],
  queryFn: () => adminApi.listUsers(filter),
});

return (
  <>
    <FilterBar onFilterChange={setFilter} />
    <DataTable data={data} />
  </>
);
```

### Optimistic Updates

```typescript
const { mutate } = useMutation({
  mutationFn: (updatedUser) => updateUser(updatedUser),
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ["users"] });
    
    // Snapshot previous state
    const prevData = queryClient.getQueryData(["users"]);
    
    // Update cache optimistically
    queryClient.setQueryData(["users"], (old) =>
      old.map(u => u.id === newData.id ? newData : u)
    );
    
    return { prevData };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(["users"], context?.prevData);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

---

## Error Handling

### API Error Handling

```typescript
try {
  const user = await apiRequest<UserResponse>("/api/users/123");
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error("Failed to fetch user:", message);
  toast.error(message);
}
```

### Query Error Handling

```typescript
const { error, isError } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});

if (isError && error) {
  return <ErrorMessage error={error} />;
}
```

### Form Error Handling

```typescript
const { formState: { errors } } = form;

<FormField
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* Shows error from Zod validation */}
    </FormItem>
  )}
/>
```

### Error Boundary (if needed)

Create a wrapper component for critical sections:

```typescript
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <CriticalComponent />
</ErrorBoundary>
```

---

## Feature Creation Workflow

### Before Generating Code: Analysis Phase

1. **Find similar existing modules**
   - Look in `src/features/`
   - Check `src/routes/` for similar pages
   - Review `src/components/` for reusable components

2. **Identify reusable patterns**
   - Which query hooks already exist?
   - Which UI components can be reused?
   - Which layouts apply?

3. **Review existing types**
   - Check `src/lib/api/types.ts`
   - Check backend API documentation
   - Determine new types needed

### Code Generation Phase

#### Step 1: Define API Module

If new API endpoints needed, create/update in `src/lib/api/{domain}.ts`:

```typescript
import { apiRequest } from "./client";
import type { MyResource } from "./types";

export const myApi = {
  list: () => apiRequest<MyResource[]>("/api/my-resource"),
  get: (id: number) => apiRequest<MyResource>(`/api/my-resource/${id}`),
  create: (data: CreateInput) =>
    apiRequest<MyResource>("/api/my-resource", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateInput) =>
    apiRequest<MyResource>(`/api/my-resource/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/api/my-resource/${id}`, { method: "DELETE" }),
};
```

#### Step 2: Add Types

Update `src/lib/api/types.ts`:

```typescript
export interface MyResource {
  id: number;
  name: string;
  // ... other fields
}

export interface CreateMyResourceInput {
  name: string;
  // ... other fields
}

export interface UpdateMyResourceInput {
  name?: string;
  // ... other optional fields
}
```

#### Step 3: Create Feature Component

Location: `src/features/{domain}/{Component}.tsx`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { myApi } from "@/lib/api/my-resource";
import { DataTable } from "@/components/data-table/DataTable";

export function MyResourceList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-resource"],
    queryFn: () => myApi.list(),
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.length) return <EmptyState />;

  return <DataTable columns={columns} data={data} />;
}
```

#### Step 4: Create/Update Route

Location: `src/routes/{role}.{feature}.tsx`

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { MyResourcePage } from "@/routes/admin.my-resource";

export const Route = createFileRoute("/admin/my-resource")({
  component: MyResourcePage,
});

export function MyResourcePage() {
  return (
    <MainLayout>
      <MyResourceList />
    </MainLayout>
  );
}
```

#### Step 5: Create Form Component (if needed)

Location: `src/components/forms/{Resource}Form.tsx`

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createResourceSchema } from "@/lib/api/types";

export function MyResourceForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm({
    resolver: zodResolver(createResourceSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => myApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-resource"] });
      onSuccess();
    },
  });

  return <Form {...form}>/* form fields */</Form>;
}
```

---

## Code Generation Rules

### General Principles

**When generating code:**

1. **Explain your work**
   - List files being created
   - Explain which systems are reused
   - Explain integration points

2. **Reuse everything**
   - Use existing hooks
   - Use existing components
   - Use existing patterns
   - Use existing types

3. **Follow conventions**
   - Match file naming patterns
   - Match component structure
   - Match query key hierarchy
   - Match form validation patterns

4. **Generate scalable code**
   - Modular components
   - Reusable hooks
   - Proper separation of concerns
   - Clear responsibility boundaries

5. **Ensure TypeScript compliance**
   - No `any` types
   - Full null safety
   - Proper type inference
   - No type assertions unless necessary

### What to Do

✅ **DO:**
- Analyze existing similar modules first
- Reuse existing API clients
- Reuse existing components
- Use existing query patterns
- Follow established file structure
- Use established type definitions
- Leverage existing hooks
- Extend existing features

### What NOT to Do

❌ **DON'T:**
- Create new design systems
- Use axios or raw fetch
- Create duplicate components
- Create new query patterns
- Ignore type safety
- Use `any` types
- Create monolithic page components
- Skip error handling
- Hardcode API URLs
- Create custom toast systems

---

## Common Patterns & Anti-Patterns

### ✅ Pattern: Composition-Based Features

```typescript
// Good: Small, focused components
export function UsersPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <UserFilters />
        <UsersList />
      </div>
    </MainLayout>
  );
}

export function UsersList() {
  const { data } = useQuery({ queryKey: ["users"], queryFn: listUsers });
  return <DataTable data={data} />;
}

export function UserFilters() {
  const [filter, setFilter] = useState();
  return <FilterUI onChange={setFilter} />;
}
```

### ❌ Anti-Pattern: Monolithic Page

```typescript
// Bad: Everything in one component
export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState();
  const [isOpen, setIsOpen] = useState(false);
  // ... 500 lines of logic
  return <div>/* entire page */</div>;
}
```

### ✅ Pattern: Query with Proper Cache Keys

```typescript
const { data } = useQuery({
  queryKey: ["admin", "users", filter], // Hierarchical, includes deps
  queryFn: () => adminApi.listUsers(filter),
});
```

### ❌ Anti-Pattern: Non-hierarchical Keys

```typescript
const { data } = useQuery({
  queryKey: ["users"], // Misses filter dependency
  queryFn: () => adminApi.listUsers(filter), // Filter not in key!
});
```

### ✅ Pattern: Proper Error Boundaries

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  retry: 2,
});

if (isLoading) return <UsersSkeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data?.length) return <EmptyUserState />;

return <UserList users={data} />;
```

### ❌ Anti-Pattern: Missing Error Handling

```typescript
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});

// Assumes data always exists!
return <UserList users={data} />;
```

### ✅ Pattern: Type-Safe Forms

```typescript
const schema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "STUDENT"]),
});

type FormData = z.infer<typeof schema>;

const form = useForm<FormData>({ resolver: zodResolver(schema) });
```

### ❌ Anti-Pattern: Unvalidated Forms

```typescript
const [formData, setFormData] = useState({
  email: "",
  role: "",
});

// No validation!
const handleSubmit = () => {
  api.create(formData); // May send invalid data
};
```

### ✅ Pattern: Proper Loading States

```typescript
export function UsersList() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  return (
    <>
      {isLoading ? <UsersSkeleton /> : <DataTable data={data} />}
    </>
  );
}
```

### ❌ Anti-Pattern: Missing Loading UI

```typescript
export function UsersList() {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  // No loading state! UI will appear broken while loading
  return <DataTable data={data} />;
}
```

### ✅ Pattern: Cache Invalidation

```typescript
const { mutate } = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    // Refetch after mutation succeeds
    queryClient.invalidateQueries({
      queryKey: ["admin", "users"],
    });
    toast.success("User created!");
  },
});
```

### ❌ Anti-Pattern: Missing Invalidation

```typescript
const { mutate } = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    // User created but list not updated!
    toast.success("User created!");
  },
});
```

---

## Performance Considerations

### Query Caching

```typescript
// Leverage cache staleTime
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: listUsers,
  staleTime: 5 * 60 * 1000, // Don't refetch within 5 min
});
```

### Lazy Loading Routes

```typescript
// Route lazy loading (automatic in TanStack Router)
export const Route = createFileRoute("/admin/users")({
  lazy: () => import("./admin.users").then(m => ({
    component: m.UsersPage,
  })),
  component: UsersPage,
});
```

### Pagination for Large Datasets

```typescript
// Load 20 items at a time, not 10,000
const { data } = useQuery({
  queryKey: ["users", page],
  queryFn: () => adminApi.listUsers({ page, limit: 20 }),
});
```

### Memoization (Use Sparingly)

```typescript
// Only if component rerenders frequently with same props
const UserCard = React.memo(({ user }: { user: UserResponse }) => {
  return <Card>{user.name}</Card>;
});
```

---

## Deployment

### Environment Variables

**Required:**
```
VITE_API_BASE_URL=http://localhost:8080
```

**Production:**
```
VITE_API_BASE_URL=https://api.thang-long-university.edu
```

### Build

```bash
npm run build
```

### Cloudflare Workers

Configured via `wrangler.jsonc` for edge deployment.

---

## Debugging Tips

### React DevTools
- Install React DevTools browser extension
- Inspect component props, state, hooks

### TanStack Query DevTools

```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Network Debugging
- Check browser Network tab
- Verify API requests headers (Authorization)
- Check response status and body

---

## Summary: AI Agent Checklist

Before generating any frontend code:

- [ ] Analyzed similar existing modules
- [ ] Identified reusable components
- [ ] Identified reusable hooks
- [ ] Checked existing types in `src/lib/api/types.ts`
- [ ] Confirmed routing pattern
- [ ] Verified API endpoints in backend
- [ ] Plan which systems will be reused
- [ ] Identified new code needed

When generating code:

- [ ] Used apiClient, not fetch/axios
- [ ] Used TanStack Query, not Context for server state
- [ ] Used react-hook-form + Zod for forms
- [ ] Used shadcn/ui components
- [ ] Followed naming conventions
- [ ] No `any` types
- [ ] Handled loading states
- [ ] Handled error states
- [ ] Handled empty states
- [ ] Proper cache invalidation
- [ ] Proper TypeScript typing
- [ ] Explained what was created
- [ ] Explained what was reused
- [ ] Ensured production-grade quality

---

## Questions & Support

**For questions about:**
- Architecture → See Component Architecture
- Routing → See Routing System
- APIs → See API Layer & Data Fetching
- Forms → See Form Handling
- Styling → See UI & Styling
- State → See State Management
- Performance → See Performance Considerations
- Patterns → See Common Patterns & Anti-Patterns

**Key Files to Reference:**
- `frontend/src/lib/api/client.ts` - API client implementation
- `frontend/src/lib/auth.tsx` - Authentication provider
- `frontend/src/components/data-table/DataTable.tsx` - DataTable component
- `frontend/src/components/layout/ProtectedOutlet.tsx` - Role protection
- `frontend/src/routes/__root.tsx` - Root route structure

---

**Document Version:** 1.0  
**Last Updated:** May 19, 2026  
**Maintained by:** Frontend Development Team
