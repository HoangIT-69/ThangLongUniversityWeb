import { apiRequest, jsonBody } from "./client";
import type {
  ClassSectionResponse,
  TeacherGradeRequest,
  TeacherGradeResponse,
  TeacherStudentGradeResponse,
} from "./types";

export const teacherApi = {
  listMyClasses: (semesterId: number | string) =>
    apiRequest<ClassSectionResponse[]>(`/api/teacher/my-classes/semester/${semesterId}`),

  listClassStudents: (classSectionId: number | string) =>
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
