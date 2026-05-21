import {
  classSections,
  enrollments,
  formatDateTime,
  getClassSection,
  getCourse,
  getSemester,
  getStudent,
  getTeacher,
  students,
} from "@/data/mock";
import type {
  AdminEnrollmentResponse,
  AdminEnrollmentStatus,
  AdminStudentResponse,
  ClassSectionResponse,
  PageResponse,
} from "@/lib/api/types";
import {
  mapApiClassSection,
  mapMockClassSections,
} from "@/features/admin-class-sections/classSectionMock";
import type {
  EnrollmentApprovalRow,
  EnrollmentClassSectionOption,
  EnrollmentStudentOption,
} from "./types";

const mockStatusSequence: AdminEnrollmentStatus[] = [
  "REGISTERED",
  "ENROLLED",
  "CANCELLED",
  "FAILED",
];

export function normalizeEnrollmentStatus(status?: string | null): AdminEnrollmentStatus {
  if (status === "SUCCESS") return "REGISTERED";
  if (status === "CANCELED") return "CANCELLED";
  if (isAdminEnrollmentStatus(status)) return status;
  return "PENDING";
}

export function mapApiEnrollment(row: AdminEnrollmentResponse): EnrollmentApprovalRow {
  return {
    id: String(row.enrollmentId),
    numericId: row.enrollmentId,
    studentId: row.studentId,
    studentCode: row.studentCode,
    studentName: row.studentName,
    classSectionId: row.classSectionId,
    classCode: row.classCode,
    courseName: buildCourseName(row.courseCode, row.courseName),
    semesterId: row.semesterId,
    semesterName: row.semesterName ?? "Can BE: semesterName",
    teacherName: row.teacherName ?? "Can BE: teacherName",
    enrolledAt: row.enrolledAt ?? "Can BE: enrolledAt",
    checkedAt: row.checkedAt ?? "Can BE: checkedAt",
    approvedAt: row.approvedAt ?? "Can BE: approvedAt",
    status: normalizeEnrollmentStatus(row.status),
    note: row.note ?? "Can BE: note",
    source: "API",
    registrationSource: row.note?.toLowerCase().includes("override") ? "Admin" : "Student",
  };
}

export function mapMockEnrollments(): EnrollmentApprovalRow[] {
  return enrollments.map((enrollment, index) => {
    const student = getStudent(enrollment.studentId);
    const section = getClassSection(enrollment.classSectionId);
    const course = getCourse(section.courseId);
    const semester = getSemester(enrollment.semesterId);
    const teacher = getTeacher(section.teacherId);
    const status = mockStatusSequence[index % mockStatusSequence.length];

    return {
      id: enrollment.id,
      classSectionId: toNumericId(section.id, index + 1),
      studentId: toNumericId(student.id, index + 1),
      studentCode: student.code,
      studentName: student.fullName,
      classCode: section.code,
      courseName: `${course.code} - ${course.name}`,
      semesterName: semester.name,
      teacherName: teacher.fullName,
      enrolledAt: enrollment.enrolledAt,
      checkedAt: index % 3 === 0 ? "Dang cho he thong kiem tra" : enrollment.enrolledAt,
      approvedAt:
        status === "APPROVED" || status === "ENROLLED" ? enrollment.enrolledAt : "Chua duyet",
      status,
      note: getMockNote(status),
      source: "Mock",
      registrationSource: index % 7 === 0 ? "Admin" : "Student",
    };
  });
}

export function mapStudentOptions(items?: AdminStudentResponse[]): EnrollmentStudentOption[] {
  if (items?.length) {
    return items.map((student) => ({
      id: student.id,
      code: student.studentCode,
      name: student.fullName,
    }));
  }
  return students.map((student, index) => ({
    id: toNumericId(student.id, index + 1),
    code: student.code,
    name: student.fullName,
  }));
}

export function mapClassSectionOptions(
  items?: ClassSectionResponse[],
): EnrollmentClassSectionOption[] {
  const rows = items?.length
    ? items.map((item) => mapApiClassSection(item))
    : mapMockClassSections();
  return rows.map((row) => ({
    id: row.numericId ?? toNumericId(row.id, 1),
    code: row.classCode,
    courseName: row.courseName,
    semesterName: row.semesterName,
    locked: row.status === "CLOSED" || row.status === "CANCELLED",
  }));
}

export function createManualEnrollmentRow(
  id: string,
  student: EnrollmentStudentOption,
  section: EnrollmentClassSectionOption,
  note: string,
): EnrollmentApprovalRow {
  return {
    id,
    studentId: student.id,
    studentCode: student.code,
    studentName: student.name,
    classSectionId: section.id,
    classCode: section.code,
    courseName: section.courseName,
    semesterName: section.semesterName,
    teacherName: "Can BE: teacherName",
    enrolledAt: new Date().toISOString(),
    checkedAt: "Admin override",
    approvedAt: "Khi khoa dang ky",
    status: "REGISTERED",
    note: note || "Admin them thu cong vao lop hoc phan",
    source: "Mock",
    registrationSource: "Admin",
  };
}

export function getEnrollmentPageContent(
  response?: PageResponse<AdminEnrollmentResponse> | AdminEnrollmentResponse[],
) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  return response.content ?? [];
}

export function formatEnrollmentDate(value: string) {
  if (value.startsWith("Can BE") || value === "Chua duyet" || value.startsWith("Dang cho")) {
    return value;
  }
  return formatDateTime(value);
}

export function getEnrollmentStats(rows: EnrollmentApprovalRow[]) {
  return {
    total: rows.length,
    registered: rows.filter((row) => row.status === "REGISTERED").length,
    enrolled: rows.filter((row) => row.status === "ENROLLED" || row.status === "PASSED").length,
    cancelled: rows.filter((row) => row.status === "CANCELLED" || row.status === "FAILED").length,
    manual: rows.filter((row) => row.registrationSource === "Admin").length,
    classes: new Set(rows.map((row) => row.classCode)).size || classSections.length,
  };
}

function buildCourseName(courseCode?: string | null, courseName?: string | null) {
  if (courseCode && courseName) return `${courseCode} - ${courseName}`;
  return courseName ?? "Can BE: courseName";
}

function getMockNote(status: AdminEnrollmentStatus) {
  if (status === "REGISTERED") return "He thong da kiem tra hop le";
  if (status === "ENROLLED") return "Da khoa dang ky va chot vao danh sach hoc";
  if (status === "FAILED") return "Khong dat dieu kien dang ky";
  if (status === "CANCELLED") return "Sinh vien da huy dang ky";
  return "Can BE: note";
}

function toNumericId(value: string, fallback: number) {
  const numeric = Number(value.replace(/\D/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function isAdminEnrollmentStatus(value?: string | null): value is AdminEnrollmentStatus {
  return (
    value === "PENDING" ||
    value === "REGISTERED" ||
    value === "ENROLLED" ||
    value === "CANCELLED" ||
    value === "CANCELED" ||
    value === "FAILED" ||
    value === "PASSED"
  );
}
