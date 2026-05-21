import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { studentApi } from "@/lib/api/student";
import { pickCurrentSemester } from "@/lib/semester";

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

  const cells: Record<string, { name: string; room: string; code: string } | null> = {};
  (scheduleQuery.data ?? []).forEach((item) => {
    for (let p = item.startPeriod; p <= item.endPeriod; p += 1) {
      cells[`${item.dayOfWeek}-${p}`] = { name: item.courseName, room: item.room ?? "", code: item.classCode };
    }
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
        <table className="w-full min-w-[800px] border-collapse text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="w-24 border-b p-2 text-left text-xs uppercase tracking-wide text-muted-foreground">Tiet</th>
              {days.map((d) => <th key={d} className="border-b border-l p-2 text-left text-xs uppercase tracking-wide text-muted-foreground">{dayLabels[d]}</th>)}
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p.index}>
                <td className="border-b p-2 align-top"><div className="font-semibold">Tiet {p.index}</div><div className="text-[10px] tabular-nums text-muted-foreground">{p.start}-{p.end}</div></td>
                {days.map((d) => {
                  const cell = cells[`${d}-${p.index}`];
                  return <td key={d} className={cn("h-16 border-b border-l p-1.5 align-top", cell && "bg-primary/5")}>{cell && (
                    <div className="rounded-md border border-primary/30 bg-card p-1.5 text-xs leading-tight">
                      <div className="font-semibold text-primary">{cell.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{cell.code}</div>
                      <div className="text-muted-foreground">P. {cell.room}</div>
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
