import type {
  AdminClassSectionStudentResponse,
  ClassSectionResponse,
} from "@/lib/api/types";
import type {
  ClassSectionFormValues,
  ClassSectionOptionSets,
  ClassSectionRow,
  ClassSectionStudentRow,
  CourseOption,
  PeriodOption,
  ReferenceApiData,
  RoomOption,
  SemesterOption,
  TeacherOption,
} from "./types";

const dayLabels: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "Chủ nhật",
};

export function formatClassDay(dayOfWeek: number) {
  return dayLabels[dayOfWeek] ?? `Thứ ${dayOfWeek}`;
}

export function mapApiClassSection(section: ClassSectionResponse): ClassSectionRow {
  const firstSchedule = section.schedules[0];
  const fallbackRoomId = section.roomId ?? firstSchedule?.roomId ?? 0;

  return {
    id: String(section.id),
    numericId: section.id,
    classCode: section.classCode,
    courseId: section.courseId,
    courseName: `${section.courseCode} - ${section.courseName}`,
    majorName: "",
    semesterId: section.semesterId,
    semesterName: section.semesterName,
    teacherId: section.teacherId ?? 0,
    teacherName: section.teacherName ?? "—",
    roomId: fallbackRoomId,
    roomName: section.room ?? firstSchedule?.roomName ?? "—",
    dayOfWeek: firstSchedule?.dayOfWeek ?? 2,
    startPeriodId: firstSchedule?.startPeriodId ?? 0,
    startPeriod: firstSchedule?.startPeriod ?? 1,
    endPeriodId: firstSchedule?.endPeriodId ?? 0,
    endPeriod: firstSchedule?.endPeriod ?? 2,
    currentSlots: section.currentSlots ?? 0,
    maxSlots: section.maxSlots ?? 0,
    status: section.closed ? "CLOSED" : "OPEN",
    source: "API",
  };
}

export function buildOptionSets(
  data: ReferenceApiData,
  rows: ClassSectionRow[],
): ClassSectionOptionSets {
  return {
    courses: mergeCourseOptions(mapApiCourses(data.courses), rows),
    semesters: mergeSemesterOptions(mapApiSemesters(data.semesters), rows),
    teachers: mergeTeacherOptions(mapApiTeachers(data.teachers), rows),
    rooms: mergeRoomOptions(mapApiRooms(data.rooms), rows),
    periods: mapApiPeriods(data.periods),
  };
}

export function toClassSectionRequest(values: ClassSectionFormValues) {
  return {
    classCode: values.classCode.trim(),
    courseId: values.courseId,
    semesterId: values.semesterId,
    teacherId: values.teacherId,
    maxSlots: values.maxSlots,
    schedules: [
      {
        dayOfWeek: values.dayOfWeek,
        startPeriodId: values.startPeriodId,
        endPeriodId: values.endPeriodId,
        roomId: values.roomId,
      },
    ],
  };
}

export function mapApiClassSectionStudent(
  student: AdminClassSectionStudentResponse,
): ClassSectionStudentRow {
  return {
    enrollmentId: String(student.enrollmentId),
    studentId: String(student.studentId),
    studentCode: student.studentCode,
    fullName: student.fullName,
    email: student.email ?? "—",
    majorName: student.majorName ?? "—",
    cohort: getStudentCohort(student.academicYear, student.cohort),
    enrolledAt: student.enrolledAt ?? "—",
    status: student.status ?? "ENROLLED",
    source: "API",
  };
}

// ─── Private helpers ─────────────────────────────────────────────────────────

function mapApiCourses(items?: ReferenceApiData["courses"]): CourseOption[] {
  if (!items?.length) return [];
  return items.map((course) => ({ id: course.id, code: course.code, name: course.name }));
}

function mapApiSemesters(items?: ReferenceApiData["semesters"]): SemesterOption[] {
  if (!items?.length) return [];
  return items.map((semester) => ({ id: semester.id, name: semester.name }));
}

function mapApiTeachers(items?: ReferenceApiData["teachers"]): TeacherOption[] {
  if (!items?.length) return [];
  return items.map((teacher) => ({ id: teacher.id, name: teacher.fullName ?? teacher.teacherCode }));
}

function mapApiRooms(items?: ReferenceApiData["rooms"]): RoomOption[] {
  if (!items?.length) return [];
  return items.map((room) => ({ id: room.id, name: room.name, capacity: room.capacity }));
}

function mapApiPeriods(items?: ReferenceApiData["periods"]): PeriodOption[] {
  if (!items?.length) return [];
  return items.map((period) => ({
    id: period.id,
    periodNumber: period.periodNumber,
    label: `Tiết ${period.periodNumber} (${period.startTime}–${period.endTime})`,
  }));
}

function mergeCourseOptions(options: CourseOption[], rows: ClassSectionRow[]) {
  const fromRows = rows.map((row) => ({
    id: row.courseId,
    code: row.courseName.split(" - ")[0] ?? "",
    name: row.courseName,
  }));
  return uniqueById([...options, ...fromRows]);
}

function mergeSemesterOptions(options: SemesterOption[], rows: ClassSectionRow[]) {
  return uniqueById([
    ...options,
    ...rows.map((row) => ({ id: row.semesterId, name: row.semesterName })),
  ]);
}

function mergeTeacherOptions(options: TeacherOption[], rows: ClassSectionRow[]) {
  return uniqueById([
    ...options,
    ...rows.map((row) => ({ id: row.teacherId, name: row.teacherName })),
  ]).filter((teacher) => teacher.id > 0);
}

function mergeRoomOptions(options: RoomOption[], rows: ClassSectionRow[]) {
  return uniqueById([
    ...options,
    ...rows.map((row) => ({ id: row.roomId, name: row.roomName, capacity: row.maxSlots })),
  ]).filter((room) => room.id > 0);
}

function uniqueById<T extends { id: number }>(items: T[]) {
  const map = new Map<number, T>();
  items.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function getStudentCohort(value?: number | string | null, fallback?: string | null) {
  if (fallback?.trim()) return fallback;
  if (typeof value === "number") return `K${value}`;
  if (typeof value === "string" && value.trim()) return `K${value.split("-")[0]}`;
  return "—";
}
