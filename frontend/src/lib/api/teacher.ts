import { apiRequest, jsonBody } from "./client";
import type {
  ClassSectionResponse,
  StudentSemesterResponse,
  TeacherGradeRequest,
  TeacherGradeResponse,
  TeacherStudentGradeResponse,
} from "./types";

export const teacherApi = {
  listSemesters: () =>
    apiRequest<StudentSemesterResponse[]>("/api/student/semesters"),

  listMyClasses: (semesterId: number | string) =>
    apiRequest<ClassSectionResponse[]>(`/api/teacher/my-classes/semester/${semesterId}`),

  getMyClasses: (semesterId: number | string) =>
    apiRequest<ClassSectionResponse[]>(`/api/teacher/my-classes/semester/${semesterId}`),

  listClassStudents: (classSectionId: number | string) =>
    apiRequest<TeacherStudentGradeResponse[]>(
      `/api/teacher/classes/${classSectionId}/students`,
    ),

  getClassStudents: (classSectionId: number | string) =>
    apiRequest<TeacherStudentGradeResponse[]>(
      `/api/teacher/classes/${classSectionId}/students`,
    ),

  getClassGrades: (classSectionId: number | string) =>
    apiRequest<TeacherGradeResponse[]>(`/api/teacher/grades/class/${classSectionId}`),

  updateGrade: (enrollmentId: number | string, request: TeacherGradeRequest) =>
    apiRequest<TeacherGradeResponse>(`/api/teacher/grades/${enrollmentId}`, {
      method: "PUT",
      body: jsonBody(request),
    }),
};