import type { AdminEnrollmentStatus } from "@/lib/api/types";

export type EnrollmentSource = "API" | "Mock";

export interface EnrollmentApprovalRow {
  id: string;
  numericId?: number;
  studentId?: number;
  studentCode: string;
  studentName: string;
  classSectionId?: number;
  classCode: string;
  courseName: string;
  semesterId?: number;
  semesterName: string;
  teacherName: string;
  enrolledAt: string;
  checkedAt: string;
  approvedAt: string;
  status: AdminEnrollmentStatus;
  note: string;
  source: EnrollmentSource;
  registrationSource: "Student" | "Admin";
}

export type EnrollmentFilter = "ALL" | AdminEnrollmentStatus;

export interface EnrollmentStudentOption {
  id: number;
  code: string;
  name: string;
}

export interface EnrollmentClassSectionOption {
  id: number;
  code: string;
  courseName: string;
  semesterName: string;
  locked: boolean;
}

export interface ManualEnrollmentValues {
  studentId: number;
  classSectionId: number;
  note: string;
}
