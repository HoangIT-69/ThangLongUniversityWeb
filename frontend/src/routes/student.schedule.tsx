import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { studentApi } from "@/lib/api/student";
import { pickCurrentSemester } from "@/lib/semester";
import type { EnrollmentResponse } from "@/lib/api/types";

export const Route = createFileRoute("/student/schedule")({ component: SchedulePage });

const dayLabels: Record<number, string> = { 2: "Thu 2", 3: "Thu 3", 4: "Thu 4", 5: "Thu 5", 6: "Thu 6", 7: "Thu 7", 8: "CN" };
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
  name: string;
  room: string;
  code: string;
  lessonCount: number;
  periodRange: string;
  startTime: string;
  endTime: string;
  teacherName: string;
  teacherCode: string;
  teacherEmail: string;
  rowSpan: number;
  isStart: boolean;
};

function formatApiTime(value: string | null | undefined) {
  if (!value) return "";
  const [hour = "", minute = ""] = value.split(":");
  return hour && minute ? `${hour}g${minute}` : value;
}

function getTodayDayOfWeek() {
  const day = new Date().getDay();
  return day === 0 ? 8 : day + 1;
}

function getScheduleSlots(item: EnrollmentResponse) {
  if (item.schedules?.length) {
    return item.schedules.map((slot) => ({
      dayOfWeek: slot.dayOfWeek,
      startPeriod: slot.startPeriod,
      endPeriod: slot.endPeriod,
      room: slot.roomName ?? item.room ?? "",
      lessonCount: slot.lessonCount ?? Math.max(slot.endPeriod - slot.startPeriod + 1, 1),
      periodRange: slot.periodRange ?? `${slot.startPeriod}-${slot.endPeriod}`,
      startTime: formatApiTime(slot.startTime),
      endTime: formatApiTime(slot.endTime),
    }));
  }

  return [{
    dayOfWeek: item.dayOfWeek,
    startPeriod: item.startPeriod,
    endPeriod: item.endPeriod,
    room: item.room ?? "",
    lessonCount: Math.max(item.endPeriod - item.startPeriod + 1, 1),
    periodRange: `${item.startPeriod}-${item.endPeriod}`,
    startTime: "",
    endTime: "",
  }];
}

function SchedulePage() {
  const semestersQuery = useQuery({ queryKey: ["student", "semesters"], queryFn: studentApi.listSemesters });
  const semesters = semestersQuery.data ?? [];
  const [semesterId, setSemesterId] = useState<number | null>(null);

  useEffect(() => {
    if (!semesterId && semesters.length) setSemesterId(pickCurrentSemester(semesters)?.id ?? null);
  }, [semesterId, semesters]);

  const scheduleQuery = useQuery({
    queryKey: ["student", "schedule", semesterId],
    queryFn: () => studentApi.getSchedule(semesterId as number),
    enabled: semesterId != null,
  });
  const todayDayOfWeek = getTodayDayOfWeek();

  const cells: Record<string, ScheduleCell | null> = {};
  (scheduleQuery.data ?? []).forEach((item) => {
    getScheduleSlots(item).forEach((slot) => {
      const rowSpan = Math.max(slot.endPeriod - slot.startPeriod + 1, 1);
      for (let p = slot.startPeriod; p <= slot.endPeriod; p += 1) {
        cells[`${slot.dayOfWeek}-${p}`] = {
          name: item.courseName,
          room: slot.room,
          code: item.classCode,
          lessonCount: slot.lessonCount,
          periodRange: slot.periodRange,
          startTime: slot.startTime,
          endTime: slot.endTime,
          teacherName: item.teacherName ?? "",
          teacherCode: item.teacherCode ?? "",
          teacherEmail: item.teacherEmail ?? "",
          rowSpan,
          isStart: p === slot.startPeriod,
        };
      }
    });
  });

  return (
    <div>
      <PageHeader
        title="Thoi khoa bieu"
        description="Lich hoc theo hoc ky"
        actions={
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={semesterId ?? ""} onChange={(e) => setSemesterId(Number(e.target.value))}>
            {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
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
              <th className="border-b p-2 text-left text-xs uppercase tracking-wide text-muted-foreground">Tiet</th>
              {days.map((d) => (
                <th
                  key={d}
                  className={cn(
                    "border-b border-l p-2 text-left text-xs uppercase tracking-wide text-muted-foreground",
                    d === todayDayOfWeek && "bg-primary/10 text-primary",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{dayLabels[d]}</span>
                    {d === todayDayOfWeek && <Badge className="shrink-0">Hom nay</Badge>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p.index}>
                <td className="border-b p-2 align-top"><div className="font-semibold">Tiet {p.index}</div><div className="text-[10px] tabular-nums text-muted-foreground">{p.start}-{p.end}</div></td>
                {days.map((d) => {
                  const cell = cells[`${d}-${p.index}`];
                  if (cell && !cell.isStart) return null;

                  return <td key={d} rowSpan={cell?.rowSpan ?? 1} className={cn("h-20 border-b border-l p-1.5 align-top", d === todayDayOfWeek && "bg-primary/[0.03]", cell && "bg-primary/5")}>{cell && (
                    <div className="flex h-full min-h-16 w-full max-w-full flex-col overflow-hidden rounded-md border border-primary/30 bg-card p-2 text-xs leading-tight">
                      <div className="truncate font-semibold text-primary">{cell.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{cell.code}</div>
                      <div className="text-muted-foreground">Phòng: {cell.room}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">So tiet: {cell.lessonCount}</div>
                      <div className="text-[10px] text-muted-foreground">Tiet: {cell.periodRange}</div>
                      {cell.startTime && <div className="text-[10px] text-muted-foreground">Bat dau: {cell.startTime}{cell.endTime ? ` - ${cell.endTime}` : ""}</div>}
                      {cell.teacherName && <div className="text-[10px] text-info">GV: {cell.teacherName}{cell.teacherCode ? ` (${cell.teacherCode})` : ""}</div>}
                      {cell.teacherEmail && <div className="break-all text-[10px] text-info">Email: {cell.teacherEmail}</div>}
                    </div>
                  )}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {scheduleQuery.isError && <div className="mt-4 text-sm text-destructive">{scheduleQuery.error instanceof Error ? scheduleQuery.error.message : "Khong tai duoc thoi khoa bieu"}</div>}
    </div>
  );
}
