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
    return "Tiet bat dau phai nho hon tiet ket thuc.";
  }

  const selectedRoom = rooms.find((room) => room.id === values.roomId);
  if (selectedRoom && values.maxSlots > selectedRoom.capacity) {
    return `Si so toi da vuot suc chua phong ${selectedRoom.name} (${selectedRoom.capacity}).`;
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
    return `Phong ${roomConflict.roomName} da co lop ${roomConflict.classCode} cung khung gio trong hoc ky nay.`;
  }

  const teacherConflict = conflictingRows.find((row) => row.teacherId === values.teacherId);
  if (teacherConflict) {
    return `Giang vien ${teacherConflict.teacherName} da co lop ${teacherConflict.classCode} cung khung gio trong hoc ky nay.`;
  }

  return null;
}

function findPeriodNumber(periods: PeriodOption[], periodId: number) {
  return periods.find((period) => period.id === periodId)?.periodNumber ?? periodId;
}

function isPeriodOverlap(startA: number, endA: number, startB: number, endB: number) {
  return startA <= endB && startB <= endA;
}
