import { apiRequest } from "./client";
import type { ClassSectionResponse, StudentSemesterResponse } from "./types";

export interface TeacherStudentGradeResponse {
  enrollmentId: number;
  studentCode: string;
  studentName: string;
  midTermScore?: number | null;
  finalScore?: number | null;
  totalScore?: number | null;
  gradePoint?: number | null;
}

export const teacherApi = {
  listSemesters: () =>
    apiRequest<StudentSemesterResponse[]>("/api/student/semesters"),

  getMyClasses: (semesterId: number | string) =>
    apiRequest<ClassSectionResponse[]>(`/api/teacher/my-classes/semester/${semesterId}`),

  getClassStudents: (classSectionId: number | string) =>
    apiRequest<TeacherStudentGradeResponse[]>(`/api/teacher/classes/${classSectionId}/students`),
};
