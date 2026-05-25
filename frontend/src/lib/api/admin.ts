import { apiRequest, jsonBody } from "./client";
import type {
  AcademicResultResponse,
  AdminClassSectionStudentResponse,
  AdminEnrollmentResponse,
  AdminEnrollmentSearchQuery,
  AdminOverrideEnrollmentRequest,
  AdminStudentResponse,
  AdminTeacherResponse,
  AdminUserResponse,
  ClassSectionRequest,
  ClassSectionResponse,
  CourseRequest,
  CourseResponse,
  CreateAdminRequest,
  MajorRequest,
  MajorResponse,
  PeriodRequest,
  PeriodResponse,
  RetakeFeeRequest,
  RetakeFeeResponse,
  RoomRequest,
  RoomResponse,
  SemesterRequest,
  SemesterResponse,
  SpringPage,
  StudentRequest,
  TeacherRequest,
  UpdateRetakeFeeResponse,
} from "./types";

function queryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }
  const value = query.toString();
  return value ? `?${value}` : "";
}

export const adminApi = {
  // ─── Users ─────────────────────────────────────────────────────────────────
  listUsers: () => apiRequest<AdminUserResponse[]>("/api/admin/users"),
  createAdmin: (request: CreateAdminRequest) =>
    apiRequest<AdminUserResponse>(
      `/api/admin/users/admin${queryString(request as unknown as Record<string, string | number | undefined>)}`,
      { method: "POST" },
    ),
  toggleUserStatus: (id: number | string) =>
    apiRequest<AdminUserResponse>(`/api/admin/users/${id}/toggle-status`, {
      method: "PUT",
    }),
  deleteAdminUser: (id: number | string) =>
    apiRequest<string>(`/api/admin/users/admin/${id}`, { method: "DELETE" }),

  // ─── Students ──────────────────────────────────────────────────────────────
  listStudents: () => apiRequest<AdminStudentResponse[]>("/api/admin/students"),
  createStudent: (request: StudentRequest) =>
    apiRequest<AdminStudentResponse>("/api/admin/students", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateStudent: (id: number | string, request: StudentRequest) =>
    apiRequest<AdminStudentResponse>(`/api/admin/students/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteStudent: (id: number | string) =>
    apiRequest<string>(`/api/admin/students/${id}`, { method: "DELETE" }),

  // ─── Teachers ──────────────────────────────────────────────────────────────
  listTeachers: () => apiRequest<AdminTeacherResponse[]>("/api/admin/teachers"),
  createTeacher: (request: TeacherRequest) =>
    apiRequest<AdminTeacherResponse>("/api/admin/teachers", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateTeacher: (id: number | string, request: TeacherRequest) =>
    apiRequest<AdminTeacherResponse>(`/api/admin/teachers/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteTeacher: (id: number | string) =>
    apiRequest<string>(`/api/admin/teachers/${id}`, { method: "DELETE" }),

  // ─── Majors ────────────────────────────────────────────────────────────────
  listMajors: () => apiRequest<MajorResponse[]>("/api/admin/majors"),
  createMajor: (request: MajorRequest) =>
    apiRequest<MajorResponse>("/api/admin/majors", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateMajor: (id: number | string, request: MajorRequest) =>
    apiRequest<MajorResponse>(`/api/admin/majors/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteMajor: (id: number | string) =>
    apiRequest<string>(`/api/admin/majors/${id}`, { method: "DELETE" }),

  // ─── Courses ───────────────────────────────────────────────────────────────
  listCourses: () => apiRequest<CourseResponse[]>("/api/admin/courses"),
  createCourse: (request: CourseRequest) =>
    apiRequest<CourseResponse>("/api/admin/courses", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateCourse: (id: number | string, request: CourseRequest) =>
    apiRequest<CourseResponse>(`/api/admin/courses/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteCourse: (id: number | string) =>
    apiRequest<string>(`/api/admin/courses/${id}`, { method: "DELETE" }),

  // ─── Class Sections ────────────────────────────────────────────────────────
  listClassSections: () =>
    apiRequest<ClassSectionResponse[]>("/api/admin/class-sections"),
  listClassSectionsBySemester: (semesterId: number | string) =>
    apiRequest<ClassSectionResponse[]>(
      `/api/admin/class-sections/semester/${semesterId}`,
    ),
  createClassSection: (request: ClassSectionRequest) =>
    apiRequest<ClassSectionResponse>("/api/admin/class-sections", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateClassSection: (id: number | string, request: ClassSectionRequest) =>
    apiRequest<ClassSectionResponse>(`/api/admin/class-sections/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteClassSection: (id: number | string) =>
    apiRequest<string>(`/api/admin/class-sections/${id}`, { method: "DELETE" }),
  listClassSectionStudents: (id: number | string) =>
    apiRequest<AdminClassSectionStudentResponse[]>(
      `/api/admin/class-sections/${id}/students`,
    ),

  // ─── Semesters ─────────────────────────────────────────────────────────────
  listSemesters: () => apiRequest<SemesterResponse[]>("/api/admin/semesters"),
  createSemester: (request: SemesterRequest) =>
    apiRequest<SemesterResponse>("/api/admin/semesters", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateSemester: (id: number | string, request: SemesterRequest) =>
    apiRequest<SemesterResponse>(`/api/admin/semesters/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteSemester: (id: number | string) =>
    apiRequest<string>(`/api/admin/semesters/${id}`, { method: "DELETE" }),

  // ─── Rooms ─────────────────────────────────────────────────────────────────
  listRooms: () => apiRequest<RoomResponse[]>("/api/admin/rooms"),
  createRoom: (request: RoomRequest) =>
    apiRequest<RoomResponse>("/api/admin/rooms", {
      method: "POST",
      body: jsonBody(request),
    }),
  updateRoom: (id: number | string, request: RoomRequest) =>
    apiRequest<RoomResponse>(`/api/admin/rooms/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deleteRoom: (id: number | string) =>
    apiRequest<string>(`/api/admin/rooms/${id}`, { method: "DELETE" }),

  // ─── Periods ───────────────────────────────────────────────────────────────
  listPeriods: () => apiRequest<PeriodResponse[]>("/api/admin/periods"),
  createPeriod: (request: PeriodRequest) =>
    apiRequest<PeriodResponse>("/api/admin/periods", {
      method: "POST",
      body: jsonBody(request),
    }),
  updatePeriod: (id: number | string, request: PeriodRequest) =>
    apiRequest<PeriodResponse>(`/api/admin/periods/${id}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
  deletePeriod: (id: number | string) =>
    apiRequest<string>(`/api/admin/periods/${id}`, { method: "DELETE" }),

  // ─── Enrollments ───────────────────────────────────────────────────────────
  searchEnrollments: (params: AdminEnrollmentSearchQuery = {}) =>
    apiRequest<SpringPage<AdminEnrollmentResponse>>(
      `/api/admin/enrollments${queryString(params as Record<string, string | number | undefined>)}`,
    ),
  overrideEnrollment: (request: AdminOverrideEnrollmentRequest) =>
    apiRequest<AdminEnrollmentResponse>("/api/admin/enrollments/override", {
      method: "POST",
      body: jsonBody(request),
    }),
  lockEnrollmentSemester: (semesterId: number | string) =>
    apiRequest<string>(`/api/admin/enrollments/lock-semester/${semesterId}`, {
      method: "POST",
    }),
  lockRetakeSemester: (semesterId: number | string) =>
    apiRequest<string>(`/api/admin/enrollments/lock-retakes/${semesterId}`, {
      method: "POST",
    }),

  // ─── Academic Results ──────────────────────────────────────────────────────
  calculateSemesterGpa: (studentId: number | string, semesterId: number | string) =>
    apiRequest<AcademicResultResponse>(
      `/api/admin/academic-results/calculate-semester-gpa${queryString({ studentId, semesterId })}`,
      { method: "POST" },
    ),
  calculateCumulativeGpa: (studentId: number | string) =>
    apiRequest<AcademicResultResponse>(
      `/api/admin/academic-results/calculate-cumulative-gpa${queryString({ studentId })}`,
      { method: "POST" },
    ),
  lockSemesterGrades: (semesterId: number | string) =>
    apiRequest<string>(
      `/api/admin/academic-results/lock-semester-grades/${semesterId}`,
      { method: "POST" },
    ),
  listStudentAcademicResults: (studentId: number | string) =>
    apiRequest<AcademicResultResponse[]>(
      `/api/admin/academic-results/student/${studentId}`,
    ),

  // ─── Settings ──────────────────────────────────────────────────────────────
  getRetakeFee: () =>
    apiRequest<RetakeFeeResponse>("/api/admin/settings/retake-fee"),
  updateRetakeFee: (request: RetakeFeeRequest) =>
    apiRequest<UpdateRetakeFeeResponse>("/api/admin/settings/retake-fee", {
      method: "PUT",
      body: jsonBody(request),
    }),
};
