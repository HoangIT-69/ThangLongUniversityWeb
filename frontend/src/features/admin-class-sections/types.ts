import type {
  AdminClassSectionStatus,
  AdminSemesterResponse,
  AdminTeacherResponse,
  ClassSectionResponse,
  CourseResponse,
  PeriodResponse,
  RoomResponse,
} from "@/lib/api/types";

export type ClassSectionSource = "API" | "Mock";

export interface ClassSectionRow {
  id: string;
  numericId?: number;
  classCode: string;
  courseId: number;
  courseName: string;
  majorName: string;
  semesterId: number;
  semesterName: string;
  teacherId: number;
  teacherName: string;
  roomId: number;
  roomName: string;
  dayOfWeek: number;
  startPeriodId: number;
  startPeriod: number;
  endPeriodId: number;
  endPeriod: number;
  currentSlots: number;
  maxSlots: number;
  status: AdminClassSectionStatus;
  source: ClassSectionSource;
}

export interface ClassSectionStudentRow {
  enrollmentId: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  email: string;
  majorName: string;
  cohort: string;
  enrolledAt: string;
  status: string;
  source: ClassSectionSource;
}

export interface CourseOption {
  id: number;
  code: string;
  name: string;
}

export interface SemesterOption {
  id: number;
  name: string;
}

export interface TeacherOption {
  id: number;
  name: string;
}

export interface RoomOption {
  id: number;
  name: string;
  capacity: number;
}

export interface PeriodOption {
  id: number;
  periodNumber: number;
  label: string;
}

export interface ClassSectionOptionSets {
  courses: CourseOption[];
  semesters: SemesterOption[];
  teachers: TeacherOption[];
  rooms: RoomOption[];
  periods: PeriodOption[];
}

export interface ClassSectionFormValues {
  classCode: string;
  courseId: number;
  semesterId: number;
  teacherId: number;
  roomId: number;
  dayOfWeek: number;
  startPeriodId: number;
  endPeriodId: number;
  maxSlots: number;
  status: AdminClassSectionStatus;
}

export interface ReferenceApiData {
  courses?: CourseResponse[];
  semesters?: AdminSemesterResponse[];
  teachers?: AdminTeacherResponse[];
  rooms?: RoomResponse[];
  periods?: PeriodResponse[];
  classSections?: ClassSectionResponse[];
}
