import type { ClassSectionFormValues, ClassSectionRow, PeriodOption, RoomOption } from "./types";

export function validateClassSectionPlan({
  values,
  rows,
  periods,
  rooms,
  editingId,
}: {
  values: ClassSectionFormValues;
  rows: ClassSectionRow[];
  periods: PeriodOption[];
  rooms: RoomOption[];
  editingId?: string;
}): string | null {
  const startPeriod = findPeriodNumber(periods, values.startPeriodId);
  const endPeriod = findPeriodNumber(periods, values.endPeriodId);

  if (startPeriod >= endPeriod) {
    return "Tiết bắt đầu phải nhỏ hơn tiết kết thúc.";
  }

  const selectedRoom = rooms.find((room) => room.id === values.roomId);
  if (selectedRoom && values.maxSlots > selectedRoom.capacity) {
    return `Sĩ số tối đa vượt sức chứa phòng ${selectedRoom.name} (${selectedRoom.capacity}).`;
  }

  const conflictingRows = rows.filter(
    (row) =>
      row.id !== editingId &&
      row.semesterId === values.semesterId &&
      row.dayOfWeek === values.dayOfWeek &&
      row.status !== "CANCELLED" &&
      isPeriodOverlap(startPeriod, endPeriod, row.startPeriod, row.endPeriod),
  );

  const roomConflict = conflictingRows.find((row) => row.roomId === values.roomId);
  if (roomConflict) {
    return `Phòng ${roomConflict.roomName} đã có lớp ${roomConflict.classCode} cùng khung giờ trong học kỳ này.`;
  }

  const teacherConflict = conflictingRows.find((row) => row.teacherId === values.teacherId);
  if (teacherConflict) {
    return `Giảng viên ${teacherConflict.teacherName} đã có lớp ${teacherConflict.classCode} cùng khung giờ trong học kỳ này.`;
  }

  return null;
}

function findPeriodNumber(periods: PeriodOption[], periodId: number) {
  return periods.find((period) => period.id === periodId)?.periodNumber ?? periodId;
}

function isPeriodOverlap(startA: number, endA: number, startB: number, endB: number) {
  return startA <= endB && startB <= endA;
}
