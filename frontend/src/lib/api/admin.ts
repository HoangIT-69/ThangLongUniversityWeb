import { apiRequest, jsonBody } from "./client";
import type { MajorResponse, PeriodRequest, PeriodResponse, RoomResponse, SemesterRequest, StudentSemesterResponse } from "./types";

export const adminApi = {
  listMajors: () => apiRequest<MajorResponse[]>("/api/admin/majors"),
  deleteMajor: (id: number | string) => apiRequest<string>(`/api/admin/majors/${id}`, { method: "DELETE" }),

  listRooms: () => apiRequest<RoomResponse[]>("/api/admin/rooms"),
  deleteRoom: (id: number | string) => apiRequest<string>(`/api/admin/rooms/${id}`, { method: "DELETE" }),

  listPeriods: () => apiRequest<PeriodResponse[]>("/api/admin/periods"),
  createPeriod: (request: PeriodRequest) =>
    apiRequest<PeriodResponse>("/api/admin/periods", { method: "POST", body: jsonBody(request) }),
  deletePeriod: (id: number | string) => apiRequest<string>(`/api/admin/periods/${id}`, { method: "DELETE" }),

  listSemesters: () => apiRequest<StudentSemesterResponse[]>("/api/admin/semesters"),
  updateSemester: (id: number | string, request: SemesterRequest) =>
    apiRequest<StudentSemesterResponse>(`/api/admin/semesters/${id}`, { method: "PUT", body: jsonBody(request) }),
  deleteSemester: (id: number | string) => apiRequest<string>(`/api/admin/semesters/${id}`, { method: "DELETE" }),
  lockEnrollmentSemester: (semesterId: number | string) =>
    apiRequest<string>(`/api/admin/enrollments/lock-semester/${semesterId}`, { method: "POST" }),
  lockRetakeSemester: (semesterId: number | string) =>
    apiRequest<string>(`/api/admin/enrollments/lock-retakes/${semesterId}`, { method: "POST" }),
};
