import { apiRequest, jsonBody } from "./client";
import type {
  AdminClassSectionRequest,
  AdminClassSectionStudentResponse,
  AdminStudentResponse,
  AdminTeacherResponse,
  AdminUserResponse,
  ClassSectionResponse,
  CourseResponse,
  MajorResponse,
  PeriodRequest,
  PeriodResponse,
  RoomResponse,
  SemesterRequest,
  StudentSemesterResponse,
} from "./types";

export interface CreateAdminRequest {
  username: string;
  password: string;
  email: string;
}

export const adminApi = {
  listUsers: () => apiRequest<AdminUserResponse[]>("/api/admin/users"),
  createAdmin: (request: CreateAdminRequest) => {
    const params = new URLSearchParams({
      username: request.username,
      password: request.password,
      email: request.email,
    });
    return apiRequest<string>(`/api/admin/users/admin?${params.toString()}`, { method: "POST" });
  },
  toggleUserStatus: (id: number | string) =>
    apiRequest<string>(`/api/admin/users/${id}/toggle-status`, { method: "PUT" }),
  deleteAdminUser: (id: number | string) =>
    apiRequest<string>(`/api/admin/users/admin/${id}`, { method: "DELETE" }),

  listStudents: () => apiRequest<AdminStudentResponse[]>("/api/admin/students"),
  deleteStudent: (id: number | string) =>
    apiRequest<string>(`/api/admin/students/${id}`, { method: "DELETE" }),

  listTeachers: () => apiRequest<AdminTeacherResponse[]>("/api/admin/teachers"),
  deleteTeacher: (id: number | string) =>
    apiRequest<string>(`/api/admin/teachers/${id}`, { method: "DELETE" }),

  listCourses: () => apiRequest<CourseResponse[]>("/api/admin/courses"),
  deleteCourse: (id: number | string) =>
    apiRequest<string>(`/api/admin/courses/${id}`, { method: "DELETE" }),

  listSemesters: () => apiRequest<StudentSemesterResponse[]>("/api/admin/semesters"),
  updateSemester: (id: number | string, request: SemesterRequest) =>
    apiRequest<StudentSemesterResponse>(`/api/admin/semesters/${id}`, { method: "PUT", body: jsonBody(request) }),
  deleteSemester: (id: number | string) =>
    apiRequest<string>(`/api/admin/semesters/${id}`, { method: "DELETE" }),
  lockEnrollmentSemester: (semesterId: number | string) =>
    apiRequest<string>(`/api/admin/enrollments/lock-semester/${semesterId}`, { method: "POST" }),
  lockRetakeSemester: (semesterId: number | string) =>
    apiRequest<string>(`/api/admin/enrollments/lock-retakes/${semesterId}`, { method: "POST" }),

  listClassSections: () => apiRequest<ClassSectionResponse[]>("/api/admin/class-sections"),
  createClassSection: (request: AdminClassSectionRequest) =>
    apiRequest<ClassSectionResponse>("/api/admin/class-sections", {
      method: "POST",
      body: JSON.stringify(request),
    }),
  updateClassSection: (id: number | string, request: AdminClassSectionRequest) =>
    apiRequest<ClassSectionResponse>(`/api/admin/class-sections/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    }),
  deleteClassSection: (id: number | string) =>
    apiRequest<string>(`/api/admin/class-sections/${id}`, { method: "DELETE" }),
  listClassSectionStudents: (id: number | string) =>
    apiRequest<AdminClassSectionStudentResponse[]>(`/api/admin/class-sections/${id}/students`),

  listMajors: () => apiRequest<MajorResponse[]>("/api/admin/majors"),
  deleteMajor: (id: number | string) =>
    apiRequest<string>(`/api/admin/majors/${id}`, { method: "DELETE" }),

  listRooms: () => apiRequest<RoomResponse[]>("/api/admin/rooms"),
  deleteRoom: (id: number | string) =>
    apiRequest<string>(`/api/admin/rooms/${id}`, { method: "DELETE" }),

  listPeriods: () => apiRequest<PeriodResponse[]>("/api/admin/periods"),
  createPeriod: (request: PeriodRequest) =>
    apiRequest<PeriodResponse>("/api/admin/periods", { method: "POST", body: jsonBody(request) }),
  deletePeriod: (id: number | string) =>
    apiRequest<string>(`/api/admin/periods/${id}`, { method: "DELETE" }),
};
