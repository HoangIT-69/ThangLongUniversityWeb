import { classSections, dayLabels, getCourse, getRoom, periods, semesters } from "@/data/mock";
import type { ClassSectionResponse } from "@/lib/api/types";

export interface TeacherTimetableSlot {
  id: string;
  classSectionId: string;
  classCode: string;
  courseName: string;
  courseCode: string;
  semesterId: string;
  roomName: string;
  dayOfWeek: number;
  dayLabel: string;
  startPeriod: number;
  endPeriod: number;
  timeRange: string;
  currentSlots: number;
  maxSlots: number;
  weekText: string;
  source: "API" | "Mock";
}

export function getTeacherTimetableSlots(
  apiRows: ClassSectionResponse[] | undefined,
  selectedSemesterId: string,
): TeacherTimetableSlot[] {
  if (apiRows) return apiRows.flatMap(mapApiClassSectionSlots);
  const mockSemesterId = resolveMockSemesterId(selectedSemesterId);
  return classSections
    .filter((section) => section.semesterId === mockSemesterId)
    .slice(0, 8)
    .flatMap(mapMockClassSectionSlots);
}

export function getTodayDayOfWeek() {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

function mapApiClassSectionSlots(section: ClassSectionResponse): TeacherTimetableSlot[] {
  const schedules = section.schedules ?? [];
  if (!schedules.length) {
    return [
      {
        id: `${section.id}-missing-schedule`,
        classSectionId: String(section.id),
        classCode: section.classCode,
        courseName: section.courseName,
        courseCode: section.courseCode,
        semesterId: String(section.semesterId),
        roomName: section.room ?? "Can BE: room",
        dayOfWeek: 2,
        dayLabel: "Can BE: dayOfWeek",
        startPeriod: 0,
        endPeriod: 0,
        timeRange: "Can BE: start/end period",
        currentSlots: section.currentSlots ?? 0,
        maxSlots: section.maxSlots ?? 0,
        weekText: "Can BE: weekRange",
        source: "API",
      },
    ];
  }

  return schedules.map((schedule, index) => ({
    id: `${section.id}-${index}`,
    classSectionId: String(section.id),
    classCode: section.classCode,
    courseName: section.courseName,
    courseCode: section.courseCode,
    semesterId: String(section.semesterId),
    roomName: schedule.roomName ?? section.room ?? "Can BE: roomName",
    dayOfWeek: schedule.dayOfWeek,
    dayLabel: toDayLabel(schedule.dayOfWeek),
    startPeriod: schedule.startPeriod,
    endPeriod: schedule.endPeriod,
    timeRange: getPeriodRangeText(schedule.startPeriod, schedule.endPeriod),
    currentSlots: section.currentSlots ?? 0,
    maxSlots: section.maxSlots ?? 0,
    weekText: "Can BE: weekRange",
    source: "API",
  }));
}

function mapMockClassSectionSlots(section: (typeof classSections)[number]): TeacherTimetableSlot[] {
  const course = getCourse(section.courseId);
  return section.schedule.map((slot, index) => {
    const startPeriod = slot.periods[0] ?? 0;
    const endPeriod = slot.periods[slot.periods.length - 1] ?? startPeriod;
    return {
      id: `${section.id}-${index}`,
      classSectionId: section.id,
      classCode: section.code,
      courseName: course.name,
      courseCode: course.code,
      semesterId: section.semesterId,
      roomName: getRoom(slot.roomId).name,
      dayOfWeek: slot.dayOfWeek,
      dayLabel: dayLabels[slot.dayOfWeek] ?? `Thu ${slot.dayOfWeek}`,
      startPeriod,
      endPeriod,
      timeRange: getPeriodRangeText(startPeriod, endPeriod),
      currentSlots: section.enrolled,
      maxSlots: section.capacity,
      weekText: "Tuan 1-15",
      source: "Mock",
    };
  });
}

function getPeriodRangeText(startPeriod: number, endPeriod: number) {
  const start = periods.find((period) => period.index === startPeriod);
  const end = periods.find((period) => period.index === endPeriod);
  if (!start || !end) return `Tiet ${startPeriod}-${endPeriod}`;
  return `Tiet ${startPeriod}-${endPeriod}, ${start.start}-${end.end}`;
}

function toDayLabel(dayOfWeek: number) {
  return dayLabels[dayOfWeek] ?? `Thu ${dayOfWeek}`;
}

function resolveMockSemesterId(selectedSemesterId: string) {
  if (selectedSemesterId.startsWith("sem")) return selectedSemesterId;
  return semesters.find((semester) => semester.status === "OPEN")?.id ?? semesters[0]?.id ?? "sem4";
}
