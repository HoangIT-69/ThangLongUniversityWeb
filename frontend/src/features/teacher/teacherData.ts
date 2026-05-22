import type {
  ClassSectionResponse,
  TeacherGradeResponse,
  TeacherStudentGradeResponse,
} from "@/lib/api/types";

export interface TeacherClassRow {
  id: string;
  numericId?: number;
  classCode: string;
  courseName: string;
  courseCode: string;
  credits: number;
  semesterId: string;
  semesterName: string;
  scheduleText: string;
  roomText: string;
  scheduleRoomItems: string[];
  currentSlots: number;
  maxSlots: number;
  status: string;
  gradeStatus: string;
  source: "API";
}

export interface TeacherRosterRow {
  enrollmentId: string;
  numericEnrollmentId?: number;
  studentCode: string;
  fullName: string;
  phone: string;
  email: string;
  cohort: string;
  className: string;
  advisorName: string;
  majorName: string;
  facultyName: string;
  midtermScore?: number | null;
  finalScore?: number | null;
  totalScore?: number | null;
  status: string;
  courseStatus?: string | null;
  absenceCount?: number | null;
  source: "API";
}

export interface TeacherGradeRow {
  enrollmentId: string;
  numericEnrollmentId?: number;
  studentCode: string;
  studentName: string;
  classCode: string;
  courseName: string;
  participationScore: number;
  midtermScore: number;
  finalScore: number;
  retestScore: number;
  totalScore: number;
  letterGrade: string;
  gpa4: number;
  canEdit: boolean;
  gradeStatus: string;
  source: "API";
}

export function getTeacherClassRows(
  apiRows: ClassSectionResponse[] | undefined,
  _selectedSemesterId: string,
): TeacherClassRow[] {
  return apiRows?.map(mapApiClassSection) ?? [];
}

export function getTeacherRosterRows(
  apiRows: TeacherStudentGradeResponse[] | undefined,
  _classSectionId: string,
): TeacherRosterRow[] {
  return apiRows?.map(mapApiRosterRow) ?? [];
}

export function getTeacherGradeRows(
  apiRows: TeacherGradeResponse[] | undefined,
  _classSectionId: string,
): TeacherGradeRow[] {
  return apiRows?.map(mapApiGradeRow) ?? [];
}

export function calculateTotal(participationScore: number, midtermScore: number, finalScore: number) {
  return Number((participationScore * 0.1 + midtermScore * 0.3 + finalScore * 0.6).toFixed(2));
}

export function getLetterGrade(totalScore: number) {
  if (totalScore >= 8.5) return "A";
  if (totalScore >= 7) return "B";
  if (totalScore >= 5.5) return "C";
  if (totalScore >= 4) return "D";
  return "F";
}

export function getGpa4(totalScore: number) {
  if (totalScore >= 8.5) return 4;
  if (totalScore >= 7) return 3;
  if (totalScore >= 5.5) return 2;
  if (totalScore >= 4) return 1;
  return 0;
}

function mapApiClassSection(section: ClassSectionResponse): TeacherClassRow {
  const schedules = section.schedules ?? [];
  const isClosed = section.closed ?? section.isClosed ?? false;
  const scheduleRoomItems = schedules.map((schedule) => {
    const roomName = schedule.roomName ?? section.room ?? "-";
    return `Thu ${schedule.dayOfWeek}, tiet ${schedule.startPeriod}-${schedule.endPeriod} - ${roomName}`;
  });
  return {
    id: String(section.id),
    numericId: section.id,
    classCode: section.classCode,
    courseName: section.courseName,
    courseCode: section.courseCode,
    credits: section.credits,
    semesterId: String(section.semesterId),
    semesterName: section.semesterName,
    scheduleText: schedules.length
      ? schedules
          .map((schedule) => `Thu ${schedule.dayOfWeek}, tiet ${schedule.startPeriod}-${schedule.endPeriod}`)
          .join("; ")
      : "-",
    roomText: schedules.length
      ? schedules.map((schedule) => schedule.roomName ?? section.room ?? "-").join(", ")
      : section.room ?? "-",
    scheduleRoomItems: schedules.length ? scheduleRoomItems : [`- - ${section.room ?? "-"}`],
    currentSlots: section.currentSlots ?? 0,
    maxSlots: section.maxSlots ?? 0,
    status: isClosed ? "CLOSED" : "OPEN",
    gradeStatus: section.gradeStatus ?? (section.gradeLocked ? "LOCKED" : "DRAFT"),
    source: "API",
  };
}

function mapApiRosterRow(row: TeacherStudentGradeResponse): TeacherRosterRow {
  return {
    enrollmentId: String(row.enrollmentId),
    numericEnrollmentId: row.enrollmentId,
    studentCode: row.studentCode,
    fullName: row.fullName,
    phone: row.phone ?? "-",
    email: row.email ?? "-",
    cohort: row.facultyName ?? "-",
    className: row.className ?? "-",
    advisorName: row.advisorName ?? "-",
    majorName: row.majorName ?? "-",
    facultyName: row.facultyName ?? "-",
    midtermScore: row.midTermScore ?? null,
    finalScore: row.finalScore ?? null,
    totalScore: row.totalScore ?? null,
    status: row.status,
    courseStatus: row.courseStatus ?? null,
    absenceCount: row.absenceCount ?? null,
    source: "API",
  };
}

function mapApiGradeRow(row: TeacherGradeResponse): TeacherGradeRow {
  const participationScore = row.participationScore ?? 0;
  const midtermScore = row.midtermScore ?? row.midTermScore ?? 0;
  const finalScore = row.finalScore ?? 0;
  const totalScore = row.totalScore ?? calculateTotal(participationScore, midtermScore, finalScore);
  return {
    enrollmentId: String(row.enrollmentId),
    numericEnrollmentId: row.enrollmentId,
    studentCode: row.studentCode,
    studentName: row.studentName,
    classCode: row.classCode,
    courseName: row.courseName,
    participationScore,
    midtermScore,
    finalScore,
    retestScore: row.retestScore ?? 0,
    totalScore,
    letterGrade: row.letterGrade ?? getLetterGrade(totalScore),
    gpa4: row.gpa4 ?? row.gradePoint ?? getGpa4(totalScore),
    canEdit: row.canEdit ?? row.gradeStatus !== "LOCKED",
    gradeStatus: row.gradeStatus ?? "DRAFT",
    source: "API",
  };
}
