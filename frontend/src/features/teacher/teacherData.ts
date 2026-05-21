import {
  classSections,
  dayLabels,
  enrollments,
  getCourse,
  getRoom,
  getStudent,
  grades,
  semesters,
  students,
} from "@/data/mock";
import type {
  ClassSectionResponse,
  TeacherGradeResponse,
  TeacherStudentGradeResponse,
} from "@/lib/api/types";

export interface TeacherSemesterOption {
  id: string;
  name: string;
  source: "API hint" | "Mock";
}

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
  currentSlots: number;
  maxSlots: number;
  status: string;
  gradeStatus: string;
  source: "API" | "Mock";
}

export interface TeacherRosterRow {
  enrollmentId: string;
  numericEnrollmentId?: number;
  studentCode: string;
  fullName: string;
  email: string;
  cohort: string;
  majorName: string;
  midtermScore?: number | null;
  finalScore?: number | null;
  totalScore?: number | null;
  status: string;
  source: "API" | "Mock";
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
  source: "API" | "Mock";
}

export const teacherSemesterOptions: TeacherSemesterOption[] = [
  { id: "1", name: "API: Hoc ky 1", source: "API hint" },
  { id: "2", name: "API: Hoc ky 2", source: "API hint" },
  ...semesters.map((semester) => ({
    id: semester.id,
    name: semester.name,
    source: "Mock" as const,
  })),
];

export function getDefaultTeacherSemesterId() {
  return "1";
}

export function getTeacherClassRows(
  apiRows: ClassSectionResponse[] | undefined,
  selectedSemesterId: string,
): TeacherClassRow[] {
  if (apiRows) return apiRows.map(mapApiClassSection);
  const mockSemesterId = resolveMockSemesterId(selectedSemesterId);
  return classSections
    .filter((section) => section.semesterId === mockSemesterId)
    .slice(0, 8)
    .map(mapMockClassSection);
}

export function getTeacherRosterRows(
  apiRows: TeacherStudentGradeResponse[] | undefined,
  classSectionId: string,
): TeacherRosterRow[] {
  if (apiRows) return apiRows.map(mapApiRosterRow);
  return enrollments
    .filter((enrollment) => enrollment.classSectionId === classSectionId || classSectionId === "api-demo")
    .slice(0, 12)
    .map((enrollment) => {
      const student = getStudent(enrollment.studentId);
      const grade = grades.find((item) => item.enrollmentId === enrollment.id);
      return {
        enrollmentId: enrollment.id,
        studentCode: student.code,
        fullName: student.fullName,
        email: student.email,
        cohort: student.cohort,
        majorName: "Can BE: majorName",
        midtermScore: grade?.midterm ?? null,
        finalScore: grade?.final ?? null,
        totalScore: grade?.total ?? null,
        status: enrollment.status,
        source: "Mock",
      };
    });
}

export function getTeacherGradeRows(
  apiRows: TeacherGradeResponse[] | undefined,
  classSectionId: string,
): TeacherGradeRow[] {
  if (apiRows) return apiRows.map(mapApiGradeRow);
  return enrollments
    .filter(
      (enrollment) =>
        (enrollment.classSectionId === classSectionId || classSectionId === "api-demo") &&
        enrollment.status === "SUCCESS",
    )
    .slice(0, 20)
    .map((enrollment, index) => {
      const student = getStudent(enrollment.studentId);
      const classSection = classSections.find((item) => item.id === enrollment.classSectionId);
      const course = classSection ? getCourse(classSection.courseId) : undefined;
      const grade = grades.find((item) => item.enrollmentId === enrollment.id);
      const participationScore = grade?.attendance ?? 8;
      const midtermScore = grade?.midterm ?? 6 + (index % 3);
      const finalScore = grade?.final ?? 7 + (index % 3);
      const totalScore = calculateTotal(participationScore, midtermScore, finalScore);
      return {
        enrollmentId: enrollment.id,
        studentCode: student.code,
        studentName: student.fullName,
        classCode: classSection?.code ?? "Can BE: classCode",
        courseName: course?.name ?? "Can BE: courseName",
        participationScore,
        midtermScore,
        finalScore,
        retestScore: grade?.retake ?? 0,
        totalScore,
        letterGrade: grade?.letter ?? getLetterGrade(totalScore),
        gpa4: grade?.gpa4 ?? getGpa4(totalScore),
        canEdit: !(grade?.locked ?? false),
        gradeStatus: grade?.locked ? "LOCKED" : "DRAFT",
        source: "Mock",
      };
    });
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
      : "Can BE: schedules",
    roomText: schedules.length
      ? schedules.map((schedule) => schedule.roomName ?? section.room ?? "Can BE: room").join(", ")
      : section.room ?? "Can BE: room",
    currentSlots: section.currentSlots ?? 0,
    maxSlots: section.maxSlots ?? 0,
    status: isClosed ? "CLOSED" : "OPEN",
    gradeStatus: section.gradeStatus ?? (section.gradeLocked ? "LOCKED" : "Can BE: gradeStatus"),
    source: "API",
  };
}

function mapMockClassSection(section: (typeof classSections)[number]): TeacherClassRow {
  const course = getCourse(section.courseId);
  return {
    id: section.id,
    classCode: section.code,
    courseName: course.name,
    courseCode: course.code,
    credits: course.credits,
    semesterId: section.semesterId,
    semesterName: semesters.find((semester) => semester.id === section.semesterId)?.name ?? "Hoc ky demo",
    scheduleText: section.schedule
      .map((slot) => `${dayLabels[slot.dayOfWeek]} tiet ${slot.periods.join(", ")}`)
      .join("; "),
    roomText: section.schedule.map((slot) => getRoom(slot.roomId).name).join(", "),
    currentSlots: section.enrolled,
    maxSlots: section.capacity,
    status: section.status,
    gradeStatus: section.enrolled > 30 ? "PENDING" : "DRAFT",
    source: "Mock",
  };
}

function mapApiRosterRow(row: TeacherStudentGradeResponse): TeacherRosterRow {
  return {
    enrollmentId: String(row.enrollmentId),
    numericEnrollmentId: row.enrollmentId,
    studentCode: row.studentCode,
    fullName: row.fullName,
    email: "Can BE: email",
    cohort: "Can BE: cohort",
    majorName: "Can BE: majorName",
    midtermScore: row.midTermScore ?? null,
    finalScore: row.finalScore ?? null,
    totalScore: row.totalScore ?? null,
    status: row.status,
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
    gradeStatus: row.gradeStatus ?? "Can BE: gradeStatus",
    source: "API",
  };
}

function resolveMockSemesterId(selectedSemesterId: string) {
  if (selectedSemesterId.startsWith("sem")) return selectedSemesterId;
  return semesters.find((semester) => semester.status === "OPEN")?.id ?? semesters[0]?.id ?? "sem4";
}
