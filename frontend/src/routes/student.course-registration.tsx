import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { studentApi } from "@/lib/api/student";
import type { ClassSectionResponse } from "@/lib/api/types";

export const Route = createFileRoute("/student/course-registration")({ component: CourseRegistrationPage });

const dayLabels: Record<number, string> = {
  1: "Thu 2",
  2: "Thu 3",
  3: "Thu 4",
  4: "Thu 5",
  5: "Thu 6",
  6: "Thu 7",
  7: "CN",
};

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function formatSchedule(section: ClassSectionResponse) {
  if (!section.schedules?.length) return "Chua co lich";
  return section.schedules
    .map((s) => `${dayLabels[s.dayOfWeek] ?? `Thu ${s.dayOfWeek}`} tiet ${s.startPeriod}-${s.endPeriod}${s.roomName ? ` ${s.roomName}` : ""}`)
    .join(" - ");
}

function CourseRegistrationPage() {
  const queryClient = useQueryClient();
  const semestersQuery = useQuery({ queryKey: ["student", "semesters"], queryFn: studentApi.listSemesters });
  const semesters = semestersQuery.data ?? [];
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [sentIds, setSentIds] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!semesterId && semesters.length) {
      setSemesterId((semesters.find((s) => s.registrationOpen) ?? semesters[0]).id);
    }
  }, [semesterId, semesters]);

  const classesQuery = useQuery({
    queryKey: ["student", "available-classes", semesterId],
    queryFn: () => studentApi.listAvailableClasses(semesterId as number),
    enabled: semesterId != null,
  });

  const enrollMutation = useMutation({
    mutationFn: (classSectionId: number) => studentApi.enrollClass(classSectionId),
    onSuccess: (response, classSectionId) => {
      setSentIds((current) => ({ ...current, [classSectionId]: response.requestId }));
      queryClient.invalidateQueries({ queryKey: ["student", "available-classes", semesterId] });
      toast.success(response.message || "Da gui yeu cau dang ky");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Dang ky that bai"),
  });

  const list = classesQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="Dang ky mon hoc"
        description="Chon lop hoc phan de dang ky"
        actions={
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={semesterId ?? ""}
            onChange={(e) => {
              setSemesterId(Number(e.target.value));
              setSentIds({});
            }}
          >
            {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        }
      />

      {classesQuery.isError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {classesQuery.error instanceof Error ? classesQuery.error.message : "Khong tai duoc danh sach lop hoc phan"}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {classesQuery.isLoading ? (
          <div className="col-span-full rounded-lg border bg-card p-6 text-sm text-muted-foreground">Dang tai du lieu...</div>
        ) : list.length === 0 ? (
          <div className="col-span-full rounded-lg border bg-card p-6 text-sm text-muted-foreground">Khong co lop hoc phan phu hop.</div>
        ) : list.map((cs) => {
          const seats = Math.max((cs.maxSlots ?? 0) - (cs.currentSlots ?? 0), 0);
          const sent = sentIds[cs.id];
          const isPending = enrollMutation.isPending && enrollMutation.variables === cs.id;
          const closed = cs.closed || seats <= 0;

          return (
            <div key={cs.id} className="flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted-foreground">{cs.classCode}</div>
                  <h3 className="mt-0.5 truncate font-semibold">{cs.courseName}</h3>
                </div>
                <StatusBadge value={closed ? "CLOSED" : "OPEN"} />
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="text-muted-foreground">GV: <span className="text-foreground">{cs.teacherName ?? "Chua phan cong"}</span></div>
                <div className="text-muted-foreground">Lich: <span className="text-foreground">{formatSchedule(cs)}</span></div>
                <div className="text-muted-foreground">Con lai: <span className={seats < 5 ? "font-semibold text-destructive" : "font-semibold text-success"}>{seats}/{cs.maxSlots ?? 0}</span></div>
                <div className="text-muted-foreground">Hoc phi du kien: <span className="font-medium tabular-nums text-foreground">{formatVND((cs.credits ?? 0) * 850000)}</span></div>
              </div>
              <div className="mt-4">
                {sent ? (
                  <Button className="w-full gap-2" variant="outline" disabled><Check className="h-4 w-4 text-success" />Da gui yeu cau</Button>
                ) : (
                  <Button className="w-full gap-2" disabled={closed || isPending} onClick={() => enrollMutation.mutate(cs.id)}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Dang ky
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
