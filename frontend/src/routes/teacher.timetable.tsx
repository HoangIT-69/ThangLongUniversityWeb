import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import type { ClassSectionResponse } from "@/lib/api/types";
import { teacherApi } from "@/lib/api/teacher";
import {
  useTeacherSemester,
  type TeacherSemesterOption,
} from "@/features/teacher/useTeacherSemester";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/teacher/timetable")({ component: TeacherTimetablePage });

const dayLabels: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "CN",
};

const periods = [
  { index: 1, start: "07:00", end: "07:50" },
  { index: 2, start: "08:00", end: "08:50" },
  { index: 3, start: "09:00", end: "09:50" },
  { index: 4, start: "10:00", end: "10:50" },
  { index: 5, start: "13:00", end: "13:50" },
  { index: 6, start: "14:00", end: "14:50" },
  { index: 7, start: "15:00", end: "15:50" },
  { index: 8, start: "16:00", end: "16:50" },
];

const days = [2, 3, 4, 5, 6, 7, 8];

type ScheduleCell = {
  courseName: string;
  courseCode: string;
  classCode: string;
  roomName: string;
  lessonCount: number;
  periodRange: string;
  startTime: string;
  endTime: string;
  rowSpan: number;
  isStart: boolean;
};

function getTodayDayOfWeek() {
  const day = new Date().getDay();
  return day === 0 ? 8 : day + 1;
}

function formatApiTime(value: string | null | undefined) {
  if (!value) return "";
  const [hour = "", minute = ""] = value.split(":");
  return hour && minute ? `${hour}:${minute}` : value;
}

function buildScheduleCells(classes: ClassSectionResponse[]) {
  const cells: Record<string, ScheduleCell | null> = {};

  classes.forEach((section) => {
    (section.schedules ?? []).forEach((slot) => {
      const startPeriod = slot.startPeriod;
      const endPeriod = slot.endPeriod;
      if (!slot.dayOfWeek || !startPeriod || !endPeriod) return;

      const rowSpan = Math.max(endPeriod - startPeriod + 1, 1);
      for (let period = startPeriod; period <= endPeriod; period += 1) {
        cells[`${slot.dayOfWeek}-${period}`] = {
          courseName: section.courseName,
          courseCode: section.courseCode,
          classCode: section.classCode,
          roomName: slot.roomName ?? section.room ?? "",
          lessonCount: slot.lessonCount ?? rowSpan,
          periodRange: slot.periodRange ?? `${startPeriod}-${endPeriod}`,
          startTime: formatApiTime(slot.startTime),
          endTime: formatApiTime(slot.endTime),
          rowSpan,
          isStart: period === startPeriod,
        };
      }
    });
  });

  return cells;
}

function TeacherTimetablePage() {
  const { semesterId, setSemesterId, semesterOptions, semestersQuery } = useTeacherSemester();
  const todayDayOfWeek = getTodayDayOfWeek();

  const classesQuery = useQuery({
    queryKey: ["teacher", "classes", semesterId],
    queryFn: () => teacherApi.listMyClasses(semesterId),
    enabled: Boolean(semesterId),
    retry: false,
  });

  const cells = buildScheduleCells(classesQuery.data ?? []);
  const hasSchedule = Object.keys(cells).length > 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Thời khóa biểu"
        description="Lịch dạy của giảng viên theo học kỳ, phòng học và tiết học"
        actions={
          <SemesterFilter
            value={semesterId}
            options={semesterOptions}
            disabled={semestersQuery.isLoading || semesterOptions.length === 0}
            onValueChange={setSemesterId}
          />
        }
      />

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[900px] table-fixed border-collapse text-sm">
          <colgroup>
            <col style={{ width: 104 }} />
            {days.map((day) => (
              <col key={day} style={{ width: "calc((100% - 104px) / 7)" }} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-muted/40">
              <th className="border-b p-2 text-left text-xs uppercase tracking-wide text-muted-foreground">
                Tiết
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className={cn(
                    "border-b border-l p-2 text-left text-xs uppercase tracking-wide text-muted-foreground",
                    day === todayDayOfWeek && "bg-primary/10 text-primary",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{dayLabels[day]}</span>
                    {day === todayDayOfWeek && <Badge className="shrink-0">Hôm nay</Badge>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period.index}>
                <td className="border-b p-2 align-top">
                  <div className="font-semibold">Tiết {period.index}</div>
                  <div className="text-[10px] tabular-nums text-muted-foreground">
                    {period.start}-{period.end}
                  </div>
                </td>
                {days.map((day) => {
                  const cell = cells[`${day}-${period.index}`];
                  if (cell && !cell.isStart) return null;

                  return (
                    <td
                      key={day}
                      rowSpan={cell?.rowSpan ?? 1}
                      className={cn(
                        "h-20 border-b border-l p-1.5 align-top",
                        day === todayDayOfWeek && "bg-primary/[0.03]",
                        cell && "bg-primary/5",
                      )}
                    >
                      {cell && (
                        <div className="flex h-full min-h-16 w-full max-w-full flex-col overflow-hidden rounded-md border border-primary/30 bg-card p-2 text-xs leading-tight shadow-sm">
                          <div className="truncate font-semibold text-primary">
                            {cell.courseName}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {cell.classCode} - {cell.courseCode}
                          </div>
                          <div className="mt-1 text-muted-foreground">Phòng: {cell.roomName}</div>
                          <div className="text-[10px] text-muted-foreground">
                            Số tiết: {cell.lessonCount}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Tiết: {cell.periodRange}
                          </div>
                          {cell.startTime && (
                            <div className="text-[10px] text-muted-foreground">
                              {cell.startTime}
                              {cell.endTime ? ` - ${cell.endTime}` : ""}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {classesQuery.isLoading && (
        <div className="text-sm text-muted-foreground">Đang tải thời khóa biểu...</div>
      )}
      {!classesQuery.isLoading && !classesQuery.isError && semesterId && !hasSchedule && (
        <div className="text-sm text-muted-foreground">Chưa có lịch dạy trong học kỳ này.</div>
      )}
      {classesQuery.isError && (
        <div className="text-sm text-destructive">
          {classesQuery.error instanceof Error
            ? classesQuery.error.message
            : "Không tải được thời khóa biểu"}
        </div>
      )}
      {semestersQuery.isError && (
        <div className="text-sm text-destructive">
          {semestersQuery.error instanceof Error
            ? semestersQuery.error.message
            : "Không tải được danh sách học kỳ"}
        </div>
      )}
    </div>
  );
}

function SemesterFilter({
  value,
  options,
  disabled,
  onValueChange,
}: {
  value: string;
  options: TeacherSemesterOption[];
  disabled?: boolean;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Chọn học kỳ" />
      </SelectTrigger>
      <SelectContent>
        {options.map((semester) => (
          <SelectItem key={semester.id} value={semester.id}>
            {semester.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
