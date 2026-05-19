import { apiRequest, jsonBody } from "./client";
import type {
  ClassSectionResponse,
  CourseResponse,
  EnrollmentRequestResponse,
  EnrollmentRequestStatusResponse,
  EnrollmentResponse,
  LearningResultsResponse,
  RetakeEligibleCourseResponse,
  RetakeRegistrationResponse,
  RetakeRequestResponse,
  StudentExamResponse,
  StudentGradesSummaryResponse,
  StudentSemesterResponse,
  TuitionResponse,
} from "./types";

export const studentApi = {
  listSemesters: () => apiRequest<StudentSemesterResponse[]>("/api/student/semesters"),

  listAvailableClasses: (semesterId: number | string) =>
    apiRequest<ClassSectionResponse[]>(`/api/student/classes/semester/${semesterId}`),

  enrollClass: (classSectionId: number | string) =>
    apiRequest<EnrollmentRequestResponse>(`/api/student/enroll/${classSectionId}`, { method: "POST" }),

  cancelClass: (classSectionId: number | string) =>
    apiRequest<string>(`/api/student/enroll/${classSectionId}`, { method: "DELETE" }),

  getEnrollmentStatus: (requestId: string) =>
    apiRequest<EnrollmentRequestStatusResponse>(`/api/student/enrollments/status/${encodeURIComponent(requestId)}`),

  getSchedule: (semesterId: number | string) =>
    apiRequest<EnrollmentResponse[]>(`/api/student/my-schedule/${semesterId}`),

  getGrades: (semesterId?: number | string | null) => {
    const qs = semesterId ? `?semesterId=${encodeURIComponent(String(semesterId))}` : "";
    return apiRequest<StudentGradesSummaryResponse>(`/api/student/grades${qs}`);
  },

  getLearningResults: (semesterId?: number | string | null) => {
    const qs = semesterId ? `?semesterId=${encodeURIComponent(String(semesterId))}` : "";
    return apiRequest<LearningResultsResponse>(`/api/student/learning-results${qs}`);
  },

  getCurriculum: () => apiRequest<CourseResponse[]>("/api/student/curriculum"),

  getExams: (semesterId: number | string) =>
    apiRequest<StudentExamResponse[]>(`/api/student/exams?semesterId=${encodeURIComponent(String(semesterId))}`),

  getTuition: (semesterId: number | string) =>
    apiRequest<TuitionResponse>(`/api/student/tuition/${semesterId}`),

  createVNPayUrl: (semesterId: number | string) =>
    apiRequest<string>(`/api/student/tuition/${semesterId}/vnpay-url`, { method: "POST" }),

  listRetakeEligibleCourses: (semesterId?: number | string | null) => {
    const qs = semesterId ? `?semesterId=${encodeURIComponent(String(semesterId))}` : "";
    return apiRequest<RetakeEligibleCourseResponse[]>(`/api/student/retakes/eligible-courses${qs}`);
  },

  registerRetakes: (courseIds: Array<number | string>) =>
    apiRequest<RetakeRegistrationResponse>("/api/student/retakes/register", {
      method: "POST",
      body: jsonBody({ courseIds: courseIds.map(Number) }),
    }),

  listRetakeRequests: (semesterId?: number | string | null) => {
    const qs = semesterId ? `?semesterId=${encodeURIComponent(String(semesterId))}` : "";
    return apiRequest<RetakeRequestResponse[]>(`/api/student/retakes/my-requests${qs}`);
  },
};

