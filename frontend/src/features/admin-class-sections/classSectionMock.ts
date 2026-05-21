import {
  classSections,
  courses,
  enrollments,
  getCourse,
  getMajor,
  getRoom,
  getSemester,
  getStudent,
  getTeacher,
  periods,
  rooms,
  semesters,
  teachers,
} from "@/data/mock";
import type {
  AdminClassSectionStatus,
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
  2: "Thu 2",
  3: "Thu 3",
  4: "Thu 4",
  5: "Thu 5",
  6: "Thu 6",
  7: "Thu 7",
  8: "Chu nhat",
};

export function formatClassDay(dayOfWeek: number) {
  return dayLabels[dayOfWeek] ?? `Thu ${dayOfWeek}`;
}

export function mapApiClassSection(
  section: ClassSectionResponse,
  statusOverride?: AdminClassSectionStatus,
): ClassSectionRow {
  const firstSchedule = section.schedules[0];
  const fallbackRoomId = section.roomId ?? firstSchedule?.roomId ?? 0;

  return {
    id: String(section.id),
    numericId: section.id,
    classCode: section.classCode,
    courseId: section.courseId,
    courseName: `${section.courseCode} - ${section.courseName}`,
    majorName: "Can BE: majorName",
    semesterId: section.semesterId,
    semesterName: section.semesterName,
    teacherId: section.teacherId ?? 0,
    teacherName: section.teacherName ?? "Can BE: teacherName",
    roomId: fallbackRoomId,
    roomName: section.room ?? firstSchedule?.roomName ?? "Can BE: room",
    dayOfWeek: firstSchedule?.dayOfWeek ?? 2,
    startPeriodId: firstSchedule?.startPeriodId ?? 0,
    startPeriod: firstSchedule?.startPeriod ?? 1,
    endPeriodId: firstSchedule?.endPeriodId ?? 0,
    endPeriod: firstSchedule?.endPeriod ?? 2,
    currentSlots: section.currentSlots ?? 0,
    maxSlots: section.maxSlots ?? 0,
    status: statusOverride ?? (section.closed ? "CLOSED" : "OPEN"),
    source: "API",
  };
}

export function mapMockClassSections(): ClassSectionRow[] {
  return classSections.map((section, index) => {
    const course = getCourse(section.courseId);
    const teacher = getTeacher(section.teacherId);
    const semester = getSemester(section.semesterId);
    const firstSchedule = section.schedule[0];
    const room = firstSchedule ? getRoom(firstSchedule.roomId) : rooms[0];
    const startPeriod = firstSchedule?.periods[0] ?? 1;
    const endPeriod = firstSchedule?.periods[firstSchedule.periods.length - 1] ?? 2;

    return {
      id: section.id,
      classCode: section.code,
      courseId: toNumericId(course.id, index + 1),
      courseName: `${course.code} - ${course.name}`,
      majorName: getMajor(course.majorId).name,
      semesterId: toNumericId(semester.id, 1),
      semesterName: semester.name,
      teacherId: toNumericId(teacher.id, 1),
      teacherName: teacher.fullName,
      roomId: toNumericId(room.id, 1),
      roomName: room.name,
      dayOfWeek: (firstSchedule?.dayOfWeek ?? 1) + 1,
      startPeriodId: startPeriod,
      startPeriod,
      endPeriodId: endPeriod,
      endPeriod,
      currentSlots: section.enrolled,
      maxSlots: section.capacity,
      status: section.status === "CLOSED" ? "CLOSED" : "OPEN",
      source: "Mock",
    };
  });
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
    email: student.email ?? "Can BE: email",
    majorName: student.majorName ?? "Can BE: majorName",
    cohort: getStudentCohort(student.academicYear, student.cohort),
    enrolledAt: student.enrolledAt ?? "Can BE: enrolledAt",
    status: student.status ?? "ENROLLED",
    source: "API",
  };
}

export function mapMockClassSectionStudents(section: ClassSectionRow): ClassSectionStudentRow[] {
  const matchedEnrollments =
    enrollments.filter((enrollment) => enrollment.classSectionId === section.id) ?? [];
  const demoEnrollments = matchedEnrollments.length
    ? matchedEnrollments
    : enrollments.filter((_, index) => index % 5 === getSectionSeed(section.id));

  return demoEnrollments
    .slice(0, Math.max(1, Math.min(section.currentSlots, 12)))
    .map((enrollment) => {
      const student = getStudent(enrollment.studentId);
      return {
        enrollmentId: enrollment.id,
        studentId: student.id,
        studentCode: student.code,
        fullName: student.fullName,
        email: student.email,
        majorName: getMajor(student.majorId).name,
        cohort: student.cohort,
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        source: "Mock",
      };
    });
}

function mapApiCourses(items?: ReferenceApiData["courses"]): CourseOption[] {
  if (items?.length)
    return items.map((course) => ({ id: course.id, code: course.code, name: course.name }));
  return courses.map((course, index) => ({
    id: toNumericId(course.id, index + 1),
    code: course.code,
    name: course.name,
  }));
}

function mapApiSemesters(items?: ReferenceApiData["semesters"]): SemesterOption[] {
  if (items?.length) return items.map((semester) => ({ id: semester.id, name: semester.name }));
  return semesters.map((semester, index) => ({
    id: toNumericId(semester.id, index + 1),
    name: semester.name,
  }));
}

function mapApiTeachers(items?: ReferenceApiData["teachers"]): TeacherOption[] {
  if (items?.length) return items.map((teacher) => ({ id: teacher.id, name: teacher.fullName }));
  return teachers.map((teacher, index) => ({
    id: toNumericId(teacher.id, index + 1),
    name: teacher.fullName,
  }));
}

function mapApiRooms(items?: ReferenceApiData["rooms"]): RoomOption[] {
  if (items?.length)
    return items.map((room) => ({ id: room.id, name: room.name, capacity: room.capacity }));
  return rooms.map((room, index) => ({
    id: toNumericId(room.id, index + 1),
    name: room.name,
    capacity: room.capacity,
  }));
}

function mapApiPeriods(items?: ReferenceApiData["periods"]): PeriodOption[] {
  if (items?.length) {
    return items.map((period) => ({
      id: period.id,
      periodNumber: period.periodNumber,
      label: `Tiet ${period.periodNumber} (${period.startTime}-${period.endTime})`,
    }));
  }
  return periods.map((period) => ({
    id: toNumericId(period.id, period.index),
    periodNumber: period.index,
    label: `Tiet ${period.index} (${period.start}-${period.end})`,
  }));
}

function mergeCourseOptions(options: CourseOption[], rows: ClassSectionRow[]) {
  const fromRows = rows.map((row) => ({
    id: row.courseId,
    code: row.courseName.split(" - ")[0],
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

function toNumericId(value: string, fallback: number) {
  const numeric = Number(value.replace(/\D/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function getStudentCohort(value?: number | string | null, fallback?: string | null) {
  if (fallback?.trim()) return fallback;
  if (typeof value === "number") return `K${value}`;
  if (typeof value === "string" && value.trim()) return `K${value.split("-")[0]}`;
  return "Can BE: cohort";
}

function getSectionSeed(id: string) {
  const seed = Number(id.replace(/\D/g, ""));
  return Number.isFinite(seed) ? seed % 5 : 0;
}
