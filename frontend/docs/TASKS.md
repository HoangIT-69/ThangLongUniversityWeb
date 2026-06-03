# Feature Status & Task Inventory — ThangLongUniversityWeb Frontend

**Generated:** May 19, 2026  
**Framework:** TanStack Start + React 19 + TypeScript  
**Status:** Partial implementation - Many features placeholder/mock data

---

## Module Status Overview

| Module                          | Status         | Completion | Notes                                       |
| ------------------------------- | -------------- | ---------- | ------------------------------------------- |
| **Authentication**              | ✅ Implemented | 95%        | Login, logout, JWT, role-based access       |
| **Admin Dashboard**             | 🟡 Partial     | 40%        | Stats displayed, no real API integration    |
| **Admin Users**                 | 🟡 Partial     | 30%        | UI complete, uses mock data                 |
| **Admin Students**              | 🟡 Partial     | 30%        | UI complete, uses mock data                 |
| **Admin Courses**               | ⏳ Stub        | 5%         | Route exists, no implementation             |
| **Admin Majors**                | ⏳ Stub        | 20%        | API calls exist, UI minimal                 |
| **Admin Rooms**                 | ⏳ Stub        | 20%        | API calls exist, UI minimal                 |
| **Admin Periods**               | ⏳ Stub        | 20%        | API calls exist, UI minimal                 |
| **Admin Semesters**             | ⏳ Stub        | 10%        | Route only                                  |
| **Admin Class Sections**        | ⏳ Stub        | 10%        | Route only                                  |
| **Admin Enrollments**           | ⏳ Stub        | 10%        | Route only                                  |
| **Admin Academic Results**      | ⏳ Stub        | 10%        | Route only                                  |
| **Admin Chat**                  | ⏳ Stub        | 10%        | Route only                                  |
| **Admin Profile**               | ⏳ Stub        | 10%        | Route only                                  |
| **Student Dashboard**           | ✅ Implemented | 85%        | Real API calls, GPA + schedule display      |
| **Student Grades**              | ⏳ Stub        | 10%        | Route only                                  |
| **Student Schedule**            | ⏳ Stub        | 10%        | Route only                                  |
| **Student Exams**               | ⏳ Stub        | 10%        | Route only                                  |
| **Student Course Registration** | ⏳ Stub        | 10%        | Route only                                  |
| **Student Retake Registration** | ⏳ Stub        | 10%        | Route only                                  |
| **Student Tuition**             | ⏳ Stub        | 10%        | Route only                                  |
| **Student Academic Results**    | ⏳ Stub        | 10%        | Route only                                  |
| **Student Curriculum**          | ⏳ Stub        | 10%        | Route only                                  |
| **Student Notifications**       | ⏳ Stub        | 10%        | Route only                                  |
| **Student Chat**                | ⏳ Stub        | 10%        | Route only                                  |
| **Student Profile**             | ⏳ Stub        | 10%        | Route only                                  |
| **Teacher Dashboard**           | ⏳ Stub        | 10%        | Route only                                  |
| **Teacher Classes**             | ⏳ Stub        | 10%        | Route only                                  |
| **Teacher Class Students**      | ⏳ Stub        | 10%        | Route only                                  |
| **Teacher Grades**              | ⏳ Stub        | 10%        | Route only                                  |
| **Teacher Chat**                | ⏳ Stub        | 10%        | Route only                                  |
| **Teacher Profile**             | ⏳ Stub        | 10%        | Route only                                  |
| **Landing Page**                | ⏳ Stub        | 30%        | Basic layout, mock content                  |
| **Login Page**                  | ✅ Implemented | 90%        | Functional, needs error display improvement |

---

## Legend

- ✅ **Implemented** (80%+) - Feature is complete and functional
- 🟡 **Partial** (30-79%) - Feature partially implemented, uses mock data or incomplete
- ⏳ **Stub** (5-29%) - Route exists, minimal/no implementation
- ⛔ **Not Started** (0%) - No implementation

---

## 1. Authentication System

### ✅ Status: Implemented

**Files:**

- `src/lib/auth.tsx` - AuthContext + useAuth hook
- `src/lib/api/auth.ts` - Login, getMe, logout
- `src/lib/api/client.ts` - JWT token handling + refresh logic
- `src/routes/login.tsx` - Login page
- `src/components/layout/ProtectedOutlet.tsx` - Role protection

**Features:**

- ✅ Login with username/password
- ✅ JWT token refresh on 401
- ✅ localStorage persistence
- ✅ Role-based access control (ADMIN/STUDENT/TEACHER)
- ✅ Automatic logout on token expiration
- ✅ Auto-fetch user profile on startup

**TODO:**

- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] Social login (if needed)

---

## 2. Admin Module

### Admin Dashboard

**Status:** 🟡 Partial (40%)

**File:** `src/routes/admin.dashboard.tsx`

**Implemented:**

- ✅ Page header with semester info
- ✅ StatCard grid showing:
  - Total students
  - Total teachers
  - Total courses
  - Total class sections
  - Pending enrollments
  - Unpaid tuition invoices
- ✅ Recent enrollments activity feed
- ✅ Semester distribution chart

**Uses Mock Data:**

- `students.length`, `teachers.length`, `courses.length` from mock
- Recent enrollments from mock
- No real API calls

**TODO:**

- [ ] Replace mock data with real API
- [ ] Add search/filter functionality
- [ ] Add export to PDF
- [ ] Add real-time updates

---

### Admin Users Management

**Status:** 🟡 Partial (30%)

**File:** `src/routes/admin.users.tsx`

**Implemented:**

- ✅ DataTable with search
- ✅ Add user button
- ✅ Edit/Delete buttons with dialogs
- ✅ User columns: username, email, role, status

**Uses Mock Data:**

- All user data from mock

**TODO:**

- [ ] Replace mock with real API endpoints
- [ ] Implement create user form
- [ ] Implement edit user form
- [ ] Add password reset
- [ ] Add bulk actions
- [ ] Add export

---

### Admin Students Management

**Status:** 🟡 Partial (30%)

**File:** `src/routes/admin.students.tsx`

**Implemented:**

- ✅ DataTable with search
- ✅ Add/Edit/Delete dialogs
- ✅ Form with: code, fullName, email, majorId, cohort
- ✅ Status badge
- ✅ Toast notifications

**Uses Mock Data:**

- All student data from mock

**TODO:**

- [ ] Create real API endpoints
- [ ] Implement bulk import (CSV)
- [ ] Add GPA/CPA display
- [ ] Add enrollment history
- [ ] Add suspension/activation

---

### Admin Majors, Rooms, Periods

**Status:** ⏳ Stub (20%)

**Files:**

- `src/routes/admin.majors.tsx`
- `src/routes/admin.rooms.tsx`
- `src/routes/admin.periods.tsx`

**Implemented:**

- ✅ Route pages (stubs)
- ✅ API calls in `src/lib/api/admin.ts`

**TODO:**

- [ ] Create proper list pages with DataTable
- [ ] Implement add/edit/delete dialogs
- [ ] Form validation
- [ ] Real API integration

---

### Admin Courses, Semesters, Class Sections, Enrollments, Academic Results, Chat, Profile

**Status:** ⏳ Stub (10%)

**Files:** Routes exist but no implementation

**TODO:**

- [ ] Create list/detail pages
- [ ] Implement CRUD operations
- [ ] Add proper forms
- [ ] Integrate with real API

---

## 3. Student Module

### Student Dashboard

**Status:** ✅ Implemented (85%)

**File:** `src/routes/student.dashboard.tsx`

**Implemented:**

- ✅ Fetches real data from API:
  - Semesters list
  - Current semester selection
  - GPA (semester + cumulative)
  - Schedule for today (filtered by day of week)
  - Tuition status
  - Total credits
- ✅ StatCard display for metrics
- ✅ Today's schedule section
- ✅ Semester overview section
- ✅ Proper error/loading states

**Uses Real API:**

- `studentApi.listSemesters()`
- `studentApi.getGrades(semesterId)`
- `studentApi.getSchedule(semesterId)`
- `studentApi.getTuition(semesterId)`

**Quality:**

- ✅ Proper TypeScript typing
- ✅ Query dependency management
- ✅ Responsive layout
- ✅ Vietnamese formatting (number format, day names)

**TODO:**

- [ ] Add past semesters selector
- [ ] Add semester comparison chart
- [ ] Add grade distribution pie chart
- [ ] Add announcements section

---

### Student Grades

**Status:** ⏳ Stub (10%)

**File:** `src/routes/student.grades.tsx`

**Implemented:**

- Route exists

**TODO:**

- [ ] Display grades by semester
- [ ] Filter by semester dropdown
- [ ] Show course details: name, code, credits, scores
- [ ] Calculate GPA
- [ ] Add semester comparison
- [ ] Add transcript view

---

### Student Schedule

**Status:** ⏳ Stub (10%)

**File:** `src/routes/student.schedule.tsx`

**TODO:**

- [ ] Display schedule grid (week view or list)
- [ ] Show: course name, class code, room, time, instructor
- [ ] Add calendar view
- [ ] Add export to calendar (iCal)
- [ ] Add conflict detection

---

### Student Exams

**Status:** ⏳ Stub (10%)

**File:** `src/routes/student.exams.tsx`

**TODO:**

- [ ] Display exam schedule
- [ ] Show: course, exam date/time, room, seat
- [ ] Add filter by semester
- [ ] Add export

---

### Student Course Registration

**Status:** ⏳ Stub (10%)

**File:** `src/routes/student.course-registration.tsx`

**TODO:**

- [ ] List available courses by semester
- [ ] Show: code, name, credits, instructor, schedule, capacity
- [ ] Implement enrollment button with confirmation
- [ ] Show prerequisites and validation
- [ ] Show credit limits per semester
- [ ] Show registration status (APPROVED/PENDING/REJECTED)

---

### Student Retake Registration

**Status:** ⏳ Stub (10%)

**File:** `src/routes/student.retake-registration.tsx`

**TODO:**

- [ ] List retake-eligible courses
- [ ] Implement registration form
- [ ] Show course codes and grades needing retake
- [ ] Implement submission
- [ ] Show status after submission

---

### Student Tuition

**Status:** ⏳ Stub (10%)

**File:** `src/routes/student.tuition.tsx`

**TODO:**

- [ ] Display tuition bill details
- [ ] Show: courses, credits, price per credit, total
- [ ] Implement VNPay payment integration
- [ ] Show payment history
- [ ] Add payment reminder

---

### Student Academic Results

**Status:** ⏳ Stub (10%)

**File:** `src/routes/student.academic-results.tsx`

**TODO:**

- [ ] Display learning results page
- [ ] Show cumulative GPA
- [ ] Show semester-by-semester breakdown
- [ ] Add transcript generation

---

### Student Curriculum, Notifications, Chat, Profile

**Status:** ⏳ Stub (10%)

**Files:** Routes exist but no implementation

**TODO:**

- [ ] Implement curriculum view
- [ ] Implement notification center
- [ ] Implement chat interface
- [ ] Implement profile edit

---

## 4. Teacher Module

### All Teacher Pages

**Status:** ⏳ Stub (10%)

**Files:**

- `src/routes/teacher.tsx` (layout)
- `src/routes/teacher.dashboard.tsx`
- `src/routes/teacher.classes.tsx`
- `src/routes/teacher.classes.$classSectionId.students.tsx`
- `src/routes/teacher.grades.tsx`
- `src/routes/teacher.chat.tsx`
- `src/routes/teacher.profile.tsx`

**TODO:**

- [ ] Implement teacher dashboard (class overview)
- [ ] Implement class list with student count
- [ ] Implement student roster with grades entry
- [ ] Implement grade input form
- [ ] Implement attendance tracking

---

## 5. Public Pages

### Landing Page

**Status:** ⏳ Stub (30%)

**File:** `src/routes/index.tsx`

**Implemented:**

- ✅ Basic layout structure
- ✅ Navigation links

**TODO:**

- [ ] Hero section with call-to-action
- [ ] Features showcase
- [ ] Statistics about university
- [ ] News/announcements section
- [ ] Footer with contact info

---

### Other Public Pages

**Files:**

- `src/routes/about.tsx` - About page (stub)
- `src/routes/programs.tsx` - Programs/majors list (stub)
- `src/routes/news.tsx` - News/announcements (stub)
- `src/routes/admissions.tsx` - Admissions info (stub)
- `src/routes/contact.tsx` - Contact form (stub)

**Status:** ⏳ Stub (10-30%)

**TODO:**

- [ ] Implement with proper content
- [ ] Add forms where needed
- [ ] Add SEO optimization

---

## 6. Infrastructure & Cross-Cutting

### ✅ Implemented

**Components:**

- ✅ AppLayout with sidebar + header
- ✅ DataTable with search + pagination
- ✅ EntityFormDialog for CRUD modals
- ✅ ConfirmDialog for destructive actions
- ✅ PageHeader for consistent title display
- ✅ StatusBadge for status indicators
- ✅ Error handling + loading states

**API:**

- ✅ Centralized fetch wrapper
- ✅ JWT token management
- ✅ Token refresh on 401
- ✅ API modules by domain
- ✅ Type-safe responses

**Routing:**

- ✅ TanStack Router setup
- ✅ File-based routes
- ✅ Protected routes by role
- ✅ Breadcrumbs

**Forms:**

- ✅ react-hook-form integration
- ✅ Zod validation
- ✅ Form error display

**Styling:**

- ✅ shadcn/ui components
- ✅ TailwindCSS utilities
- ✅ Responsive design
- ✅ Dark mode ready (theme system)

---

## 7. TODO: High-Priority Items

| Task                        | Priority | Complexity | Estimated Time |
| --------------------------- | -------- | ---------- | -------------- |
| Student Grades page         | HIGH     | Medium     | 4 hours        |
| Student Schedule page       | HIGH     | Medium     | 4 hours        |
| Course Registration flow    | HIGH     | High       | 8 hours        |
| Admin: Real API integration | HIGH     | Medium     | 6 hours        |
| Teacher Dashboard           | MEDIUM   | Medium     | 6 hours        |
| Tuition payment (VNPay)     | MEDIUM   | High       | 8 hours        |
| Chat system (WebSocket)     | MEDIUM   | High       | 12 hours       |
| Notifications system        | MEDIUM   | Medium     | 6 hours        |
| Retake registration         | LOW      | Medium     | 4 hours        |
| Bulk import (CSV)           | LOW      | Medium     | 6 hours        |
| Export to PDF               | LOW      | Medium     | 4 hours        |

---

## 8. Known Issues & Limitations

### UI Issues

- [ ] Mobile layout needs refinement on some pages
- [ ] Long table data overflows on small screens
- [ ] Modals need scroll on mobile

### Data Issues

- [ ] Some mock data incomplete (test data)
- [ ] No real-time updates (WebSocket needed)
- [ ] No offline support

### API Issues

- [ ] Some backend endpoints not implemented yet
- [ ] Error messages from backend not consistent
- [ ] No pagination support on some endpoints

### Performance

- [ ] Large tables (1000+ rows) not optimized
- [ ] No virtual scrolling
- [ ] No lazy loading of images

---

## 9. Testing Status

### Unit Tests

- ⛔ None implemented

**TODO:**

- [ ] Add Jest + React Testing Library
- [ ] Test components in isolation
- [ ] Test API client
- [ ] Test hooks

### E2E Tests

- ⛔ None implemented

**TODO:**

- [ ] Add Playwright E2E tests
- [ ] Test user flows (login → view grades → logout)
- [ ] Test error scenarios

### Manual Testing

- ✅ Basic flows tested
- [ ] Need comprehensive test checklist

---

## 10. Deployment Status

### Development

- ✅ Dev server runs locally (npm run dev)
- ✅ TypeScript type checking works
- ✅ ESLint passes

### Production Build

- ✅ Build succeeds (npm run build)
- [ ] Need deployment configuration
- [ ] Need CI/CD pipeline

### Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] IE11 not supported (TanStack Start uses modern JS)

---

## 11. Checklist for New Feature

When implementing a new feature, follow this checklist:

- [ ] Route file created at `src/routes/{role}.{feature}.tsx`
- [ ] API calls added to `src/lib/api/{domain}.ts`
- [ ] Types added to `src/lib/api/types.ts`
- [ ] Components use `useQuery` for data fetching
- [ ] All loading/error states handled
- [ ] Form uses react-hook-form + Zod
- [ ] Tables use DataTable component
- [ ] UI uses shadcn/ui components
- [ ] TailwindCSS utility classes only
- [ ] TypeScript: no `any` types
- [ ] Responsive design (mobile-first)
- [ ] Tested in browser (at least once)
- [ ] No console errors
- [ ] Component < 300 lines (refactor if needed)

---

## 12. Next Steps (Priority Order)

1. **Complete Student pages** (highest impact)
   - Student Grades
   - Student Schedule
   - Student Course Registration

2. **Admin page polish** (stability)
   - Replace mock data with real API
   - Proper forms for all CRUD

3. **Teacher pages** (feature parity)
   - Dashboard
   - Grade entry

4. **Chat & Notifications** (nice-to-have)
   - Real-time messaging
   - Push notifications

5. **Testing & Deployment** (quality gate)
   - E2E tests
   - CI/CD pipeline
   - Production deployment

---

## Status Update Guide

**When updating this file:**

- Update status based on actual implementation
- Move items from TODO to Done when completed
- Update completion percentage honestly
- Add new discovered issues/TODO items
- Link to related files/commits
