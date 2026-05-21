# Component Reusability Map — ThangLongUniversityWeb

**Purpose:** Inventory of existing reusable components to avoid duplication  
**Generated from:** Actual codebase analysis  
**Last Updated:** May 19, 2026

---

## Quick Reference

| Category | Components | Usage Pattern |
|----------|-----------|---------------|
| **Layouts** | AppLayout, ProtectedOutlet | Every page requires these |
| **Tables** | DataTable | Any list with search/pagination |
| **Forms** | EntityFormDialog | CRUD modals |
| **Page UI** | PageHeader, StatCard | Page titles, stats displays |
| **Status** | StatusBadge | Status indicators |
| **Dialogs** | ConfirmDialog | Destructive confirmations |
| **Navigation** | Sidebar, Header | Built into AppLayout |
| **UI Primitives** | 44+ shadcn/ui | Buttons, inputs, selects, etc |

---

## 1. Layout Components

### AppLayout (src/components/layout/AppLayout.tsx)

**Purpose:** Main page layout with sidebar navigation + top header  
**When to use:** Wrap every authenticated page route  
**Reusability:** 100% (used in all role-based routes)

**Features:**
- Role-based sidebar navigation (different menus for ADMIN/STUDENT/TEACHER)
- Sticky header with breadcrumbs + user profile menu
- Mobile hamburger navigation
- Collapsible sidebar toggle
- Notification badge (STUDENT only)

**Example Usage:**

```typescript
// routes/admin.dashboard.tsx
export function AdminDashboardPage() {
  return (
    <AppLayout>
      <PageHeader title="Dashboard" />
      {/* content */}
    </AppLayout>
  )
}
```

**Props:** (None - accesses auth via useAuth())

**Children:** Any page content

**Note:** Automatically fetches user profile via `useAuth()` on mount

---

### ProtectedOutlet (src/components/layout/ProtectedOutlet.tsx)

**Purpose:** Role-based access control wrapper  
**When to use:** As the component for every `/admin`, `/student`, `/teacher` route  
**Reusability:** 100% (used in all role-based route groups)

**Features:**
- Checks authentication (redirects to `/login` if not logged in)
- Validates user role
- Redirects to user's dashboard if wrong role
- Wraps AppLayout with children

**Example Usage:**

```typescript
// routes/admin.tsx
export const Route = createFileRoute('/admin')({
  component: () => <ProtectedOutlet role="ADMIN" />
})

// routes/student.tsx
export const Route = createFileRoute('/student')({
  component: () => <ProtectedOutlet role="STUDENT" />
})
```

**Props:**
```typescript
{ role: "ADMIN" | "STUDENT" | "TEACHER" }
```

---

## 2. Data Display Components

### DataTable (src/components/data-table/DataTable.tsx)

**Purpose:** Reusable paginated table with search and sorting  
**When to use:** ANY list of items (users, students, courses, etc)  
**Reusability:** 95% (highly parameterized, rarely needs changes)

**Features:**
- Search bar with real-time filtering
- Pagination (default 8 items per page)
- Sortable columns (via render functions)
- Custom row actions (click handlers, edit, delete buttons)
- Responsive on mobile
- Empty state message
- Row count display

**Example Usage:**

```typescript
<DataTable
  data={students}
  columns={[
    { key: 'code', header: 'Mã SV', render: (s) => <span className="font-mono">{s.code}</span> },
    { key: 'fullName', header: 'Họ tên', render: (s) => <span className="font-medium">{s.fullName}</span> },
    { key: 'email', header: 'Email', searchable: true },
    {
      key: 'actions',
      header: '',
      searchable: false,
      render: (s) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => edit(s)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => delete(s)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]}
  rowKey={(s) => s.id}
  pageSize={10}
  searchPlaceholder="Search students…"
  emptyMessage="No students found"
  onRowClick={(s) => navigate({ to: `/admin/students/${s.id}` })}
/>
```

**Props:**
```typescript
interface Props<T> {
  data: T[]                           // Array of items
  columns: Column<T>[]                // Column definitions
  pageSize?: number                   // Items per page (default 8)
  searchPlaceholder?: string          // Search field placeholder
  emptyMessage?: string               // Empty state message
  toolbar?: ReactNode                 // Optional toolbar with buttons
  rowKey: (row: T) => string         // Extract unique key
  onRowClick?: (row: T) => void      // Row click handler
}

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode                // Custom rendering
  className?: string                            // TailwindCSS classes
  searchable?: boolean                          // Include in search
  accessor?: (row: T) => string | number       // Search value extractor
}
```

**When NOT to use:**
- If you need sorting by column (DataTable doesn't support this)
- If you need custom column headers (use render instead)
- If you need virtual scrolling for 10k+ rows

---

### PageHeader (src/components/ui/page-header.tsx)

**Purpose:** Consistent page title + subtitle + stats + actions  
**When to use:** Top of every page  
**Reusability:** 100% (standardized across all pages)

**Example Usage:**

```typescript
<PageHeader
  title="Students"
  description="120 active students"
  actions={
    <Button onClick={() => setOpen(true)}>
      <Plus className="h-4 w-4" />
      Add Student
    </Button>
  }
/>
```

**Props:**
```typescript
{
  title: string
  description?: string
  actions?: ReactNode  // Buttons, filters, etc
}
```

---

### StatCard (src/components/ui/page-header.tsx)

**Purpose:** Display single metric with icon + label + value  
**When to use:** Dashboard overview sections  
**Reusability:** 100% (dashboard standard)

**Example Usage:**

```typescript
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard label="Total Students" value={120} icon={Users} tone="primary" />
  <StatCard label="Pending Enrollments" value={8} icon={ClipboardList} tone="warning" />
  <StatCard label="Courses" value={45} icon={BookOpen} tone="success" />
  <StatCard label="Active Semesters" value={1} icon={Calendar} tone="info" />
</div>
```

**Props:**
```typescript
{
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  tone?: 'primary' | 'info' | 'success' | 'warning' | 'destructive'
  hint?: string  // Optional subtitle
}
```

---

### StatusBadge (src/components/ui/status-badge.tsx)

**Purpose:** Visual status indicator  
**When to use:** Any status column (ACTIVE, INACTIVE, PENDING, etc)  
**Reusability:** 100%

**Example Usage:**

```typescript
// In DataTable render
{ key: 'status', header: 'Status', render: (item) => <StatusBadge value={item.status} /> }
```

**Props:**
```typescript
{ value: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | string }
```

**Note:** Automatically colors based on status type

---

## 3. Form Components

### EntityFormDialog (src/components/forms/EntityFormDialog.tsx)

**Purpose:** Reusable form modal for CRUD operations  
**When to use:** Add/Edit dialogs for any entity  
**Reusability:** 100% (highly flexible)

**Features:**
- Dialog with title + description
- Form handling with submit button
- Loading state with spinner
- Cancel button
- Auto-closes on success

**Example Usage:**

```typescript
const [open, setOpen] = useState(false)
const [form, setForm] = useState({ name: '', code: '' })

<EntityFormDialog
  open={open}
  onOpenChange={setOpen}
  title="Add Major"
  description="Create a new academic major"
  onSubmit={async () => {
    await adminApi.createMajor(form)
    toast.success('Major created!')
    setForm({ name: '', code: '' })
  }}
  submitText="Create"
>
  <div className="grid gap-3">
    <div className="space-y-1.5">
      <Label>Major Name</Label>
      <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
    </div>
    <div className="space-y-1.5">
      <Label>Major Code</Label>
      <Input value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} />
    </div>
  </div>
</EntityFormDialog>
```

**Props:**
```typescript
{
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode  // Form fields
  onSubmit: () => void | Promise<void>
  submitText?: string  // Default: "Lưu"
}
```

**Note:** Handles loading state automatically. Auto-closes on success.

---

### ConfirmDialog (src/components/ui/confirm-dialog.tsx)

**Purpose:** Destructive action confirmation  
**When to use:** Before delete, cancel enrollment, etc  
**Reusability:** 100%

**Example Usage:**

```typescript
const [toDelete, setToDelete] = useState<Student | null>(null)

<ConfirmDialog
  open={!!toDelete}
  onOpenChange={(v) => !v && setToDelete(null)}
  title="Delete Student?"
  description={`${toDelete?.fullName} will be permanently deleted.`}
  destructive
  confirmText="Delete"
  onConfirm={() => {
    adminApi.deleteStudent(toDelete!.id)
    toast.success('Student deleted')
    setToDelete(null)
  }}
/>
```

**Props:**
```typescript
{
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText: string
  cancelText?: string
  destructive?: boolean  // Red styling
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}
```

---

## 4. Navigation Components

### Sidebar Navigation

**Part of:** AppLayout  
**Role-based:** Different menus for ADMIN/STUDENT/TEACHER  
**Reusability:** 100% (no extraction needed - built into AppLayout)

**Features:**
- Hierarchical menu structure with groups
- Collapsible on mobile
- Collapsible on desktop (toggle button)
- Active route highlighting
- Icons + labels

**Example Menu Structure:**

```typescript
// Admin menu
const adminNavGroups: NavGroup[] = [
  {
    heading: "Overview",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/landing", label: "Landing", icon: Globe }
    ]
  },
  {
    heading: "Users",
    items: [
      { to: "/admin/users", label: "Accounts", icon: Users },
      { to: "/admin/students", label: "Students", icon: GraduationCap }
    ]
  }
]
```

---

### Header with User Menu

**Part of:** AppLayout  
**Reusability:** 100% (no extraction needed)

**Features:**
- Breadcrumbs
- Chat button
- Notifications (STUDENT only with badge)
- User profile dropdown menu with role display and logout

---

## 5. shadcn/ui Components

**Available (44+ components):**

```
UI Primitives:
  Button, Input, Label, Textarea, Select, Checkbox, Radio, Switch, Toggle
  Badge, Avatar, Skeleton, Card, Separator, Progress

Dialogs & Modals:
  Dialog, AlertDialog, Drawer, Sheet, Popover, Tooltip, HoverCard

Forms:
  Form (react-hook-form integration), FormField, FormItem, FormLabel, FormControl, FormMessage

Tables & Lists:
  Table, Pagination, Breadcrumb, Menubar, NavigationMenu, ContextMenu, DropdownMenu

Advanced:
  Accordion, Tabs, Collapsible, Carousel, Command, DatePicker, Slider, Scroll-Area
  Input-OTP, Toggle-Group
```

**Import Pattern:**

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
```

**Never:**
- ❌ Create custom button component (use Button)
- ❌ Use Material-UI (use shadcn/ui)
- ❌ Use styled-components (use Tailwind)

---

## 6. Best Practices for Reuse

### When to Extend vs Duplicate

| Scenario | Action | Example |
|----------|--------|---------|
| Same component, different columns | Extend via props | DataTable with different Column[] |
| Same form layout, different fields | Extend via children | EntityFormDialog with child fields |
| Same logic, different API | Create hook | `useStudentGrades()` vs `useTeacherGrades()` |
| Same visual, different data | Compose | Use `StatCard` multiple times |
| Slight styling difference | Use className prop | DataTable with custom className |

### How to Avoid Duplication

1. **Search first:** Check if similar component exists
2. **Props over copies:** Add props to existing component
3. **Compose:** Use smaller components to build larger ones
4. **Extract hooks:** If logic repeats, create custom hook
5. **Parameterize:** Use render functions instead of hardcoding

---

## 7. Component Status

| Component | Exists | Complete | Used In |
|-----------|--------|----------|---------|
| AppLayout | ✅ | ✅ | All authenticated pages |
| ProtectedOutlet | ✅ | ✅ | Admin, Student, Teacher routes |
| DataTable | ✅ | ✅ | Students, Users, Courses, etc |
| PageHeader | ✅ | ✅ | Dashboard, list pages |
| StatCard | ✅ | ✅ | Dashboards |
| StatusBadge | ✅ | ✅ | Status columns |
| EntityFormDialog | ✅ | ✅ | Add/Edit modals |
| ConfirmDialog | ✅ | ✅ | Delete confirmations |
| Sidebar | ✅ | ✅ | Part of AppLayout |
| Header | ✅ | ✅ | Part of AppLayout |

---

## 8. Missing / To Be Built

| Component | Needed For | Priority |
|-----------|-----------|----------|
| DataTable with sorting | Admin lists | Medium |
| Advanced filters | Admin dashboards | Low |
| Inline editing | Student grades | Low |
| Bulk actions | Admin users | Low |
| PDF export | Reports | Low |
| Charts | Analytics | Low |

---

## 9. Component Dependency Tree

```
AppLayout
├── Sidebar (nav groups, role-based)
├── Header
│   ├── Breadcrumbs
│   ├── Chat button (Link)
│   ├── Notifications dropdown (STUDENT only)
│   └── User dropdown menu (role, logout)
└── Page content
    ├── PageHeader (title + actions)
    │   └── StatCard (multiple)
    ├── DataTable
    │   ├── Search input
    │   ├── Table (shadcn/ui)
    │   └── Pagination
    ├── EntityFormDialog
    │   ├── Form fields (shadcn/ui)
    │   └── Button
    └── ConfirmDialog
        └── Button

shadcn/ui (foundation)
├── Radix UI primitives
├── TailwindCSS
└── lucide-react (icons)
```

---

## 10. Copy-Paste Templates

### New List Page

```typescript
// routes/admin.{entity}.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { EntityFormDialog } from '@/components/forms/EntityFormDialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { adminApi } from '@/lib/api/admin'
import type { EntityResponse } from '@/lib/api/types'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/{entity}')({
  component: EntityListPage
})

function EntityListPage() {
  const { data, isPending } = useQuery({
    queryKey: ['admin', 'entities'],
    queryFn: adminApi.listEntities
  })

  if (isPending) return <Skeleton />
  return <EntityList data={data} />
}

function EntityList({ data }: { data: EntityResponse[] }) {
  const [open, setOpen] = useState(false)
  const [toDelete, setToDelete] = useState<EntityResponse | null>(null)
  const queryClient = useQueryClient()

  const { mutate: deleteEntity } = useMutation({
    mutationFn: (id: number) => adminApi.deleteEntity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'entities'] })
      toast.success('Deleted')
    }
  })

  return (
    <div>
      <PageHeader
        title="Entities"
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add</Button>}
      />
      <DataTable
        data={data}
        columns={[
          { key: 'name', header: 'Name', searchable: true },
          {
            key: 'actions',
            header: '',
            render: (item) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setToDelete(item)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            )
          }
        ]}
        rowKey={(item) => item.id}
      />
      <EntityFormDialog open={open} onOpenChange={setOpen} title="Add Entity" onSubmit={() => {}} >
        {/* form fields */}
      </EntityFormDialog>
      <ConfirmDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} title="Delete?" description={`Delete ${toDelete?.name}?`} onConfirm={() => deleteEntity(toDelete!.id)} />
    </div>
  )
}
```

### New Dashboard Page

```typescript
// routes/{role}.dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { PageHeader, StatCard } from '@/components/ui/page-header'
import { Users, BookOpen } from 'lucide-react'
import { studentApi } from '@/lib/api/student'

export const Route = createFileRoute('/student/dashboard')({
  component: StudentDashboardPage
})

function StudentDashboardPage() {
  const { data: semesters } = useQuery({
    queryKey: ['student', 'semesters'],
    queryFn: studentApi.listSemesters
  })

  const semesterId = semesters?.[0]?.id

  const { data: stats, isPending } = useQuery({
    queryKey: ['student', 'stats', semesterId],
    queryFn: () => studentApi.getStats(semesterId),
    enabled: semesterId != null
  })

  return (
    <div>
      <PageHeader title="Dashboard" description={semesters?.[0]?.name} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats?.total} icon={Users} />
        <StatCard label="Courses" value={stats?.courses} icon={BookOpen} />
      </div>
    </div>
  )
}
```

---

## Summary

**Key Reusables:**
- ✅ **AppLayout** - Use in every page
- ✅ **DataTable** - Use for any list
- ✅ **PageHeader + StatCard** - Dashboard standard
- ✅ **EntityFormDialog** - CRUD modals
- ✅ **StatusBadge** - Status columns
- ✅ **ConfirmDialog** - Delete confirmations
- ✅ **44+ shadcn/ui** - All UI primitives

**Before building:** Always check if component exists here!

