import { apiRequest, jsonBody } from "./client";
import type {
  AttendanceRecordRequest,
  AttendanceSessionResponse,
  ClassSectionResponse,
  StudentSemesterResponse,
  TeacherGradeRequest,
  TeacherGradeResponse,
  TeacherStudentGradeResponse,
} from "./types";

export const teacherApi = {
  listSemesters: () =>
    apiRequest<StudentSemesterResponse[]>("/api/teacher/semesters"),

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

  getAttendanceSessions: (classSectionId: number | string) =>
    apiRequest<AttendanceSessionResponse[]>(
      `/api/teacher/classes/${classSectionId}/attendance-sessions`,
    ),

  getAttendanceSession: (classSectionId: number | string, sessionNumber: number) =>
    apiRequest<AttendanceSessionResponse>(
      `/api/teacher/classes/${classSectionId}/attendance-sessions/${sessionNumber}`,
    ),

  saveAttendanceRecords: (
    classSectionId: number | string,
    sessionNumber: number,
    records: AttendanceRecordRequest[],
  ) =>
    apiRequest<AttendanceSessionResponse>(
      `/api/teacher/classes/${classSectionId}/attendance-sessions/${sessionNumber}/records`,
      { method: "PUT", body: jsonBody(records) },
    ),

  lockAttendanceSession: (classSectionId: number | string, sessionNumber: number) =>
    apiRequest<AttendanceSessionResponse>(
      `/api/teacher/classes/${classSectionId}/attendance-sessions/${sessionNumber}/lock`,
      { method: "POST" },
    ),

  lockClassGrades: (classSectionId: number | string) =>
    apiRequest<string>(
      `/api/teacher/grades/class/${classSectionId}/lock`,
      { method: "POST" },
    ),
};
