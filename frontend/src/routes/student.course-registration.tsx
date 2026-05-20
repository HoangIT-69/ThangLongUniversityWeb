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

  const scheduleQuery = useQuery({
    queryKey: ["student", "schedule", semesterId],
    queryFn: () => studentApi.getSchedule(semesterId as number),
    enabled: semesterId != null,
  });

  const enrollMutation = useMutation({
    mutationFn: (classSectionId: number) => studentApi.enrollClass(classSectionId),
    onSuccess: (response, classSectionId) => {
      setSentIds((current) => ({ ...current, [classSectionId]: response.requestId }));
      queryClient.invalidateQueries({ queryKey: ["student", "available-classes", semesterId] });
      queryClient.invalidateQueries({ queryKey: ["student", "schedule", semesterId] });
      toast.success(response.message || "Da gui yeu cau dang ky");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Dang ky that bai"),
  });

  const cancelMutation = useMutation({
    mutationFn: (classSectionId: number) => studentApi.cancelClass(classSectionId),
    onSuccess: (response, classSectionId) => {
      queryClient.invalidateQueries({ queryKey: ["student", "available-classes", semesterId] });
      queryClient.invalidateQueries({ queryKey: ["student", "schedule", semesterId] });
      toast.success(typeof response === "string" ? response : "Đã hủy đăng ký thành công");
      setSentIds((current) => {
        const next = { ...current };
        delete next[classSectionId];
        return next;
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Hủy đăng ký thất bại"),
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

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[1000px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="p-3 text-left font-semibold text-muted-foreground">Mã lớp</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Môn học</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Giảng viên</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Lịch học</th>
              <th className="p-3 text-right font-semibold text-muted-foreground">Học phí</th>
              <th className="p-3 text-center font-semibold text-muted-foreground">Sĩ số</th>
              <th className="p-3 text-center font-semibold text-muted-foreground">Trạng thái</th>
              <th className="p-3 text-right font-semibold text-muted-foreground">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {classesQuery.isLoading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-muted-foreground">Đang tải dữ liệu...</td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-muted-foreground">Không có lớp học phần phù hợp.</td>
              </tr>
            ) : list.map((cs) => {
              const seats = Math.max((cs.maxSlots ?? 0) - (cs.currentSlots ?? 0), 0);
              const sent = sentIds[cs.id];
              const isPending = enrollMutation.isPending && enrollMutation.variables === cs.id;
              const closed = cs.closed || seats <= 0;

              return (
                <tr key={cs.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs text-muted-foreground align-middle">{cs.classCode}</td>
                  <td className="p-3 font-medium align-middle">{cs.courseName}</td>
                  <td className="p-3 text-muted-foreground align-middle">{cs.teacherName ?? "Chưa phân công"}</td>
                  <td className="p-3 text-muted-foreground align-middle">{formatSchedule(cs)}</td>
                  <td className="p-3 text-right tabular-nums align-middle">{formatVND((cs.credits ?? 0) * 850000)}</td>
                  <td className="p-3 text-center align-middle">
                    <span className={seats < 5 ? "font-semibold text-destructive" : "font-semibold text-success"}>
                      {seats}/{cs.maxSlots ?? 0}
                    </span>
                  </td>
                  <td className="p-3 text-center align-middle">
                    <StatusBadge value={closed ? "CLOSED" : "OPEN"} />
                  </td>
                  <td className="p-3 text-right align-middle">
                    {sent ? (
                      <Button size="sm" variant="outline" disabled className="gap-2">
                        <Check className="h-3.5 w-3.5 text-success" />
                        Đã gửi
                      </Button>
                    ) : (
                      <Button size="sm" disabled={closed || isPending} onClick={() => enrollMutation.mutate(cs.id)} className="gap-2">
                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        Đăng ký
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">Các môn đã đăng ký</h3>
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="p-3 text-left font-semibold text-muted-foreground">Mã lớp</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Môn học</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Giảng viên</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Lịch học</th>
                <th className="p-3 text-right font-semibold text-muted-foreground">Học phí</th>
                <th className="p-3 text-center font-semibold text-muted-foreground">Trạng thái</th>
                <th className="p-3 text-right font-semibold text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scheduleQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">Đang tải dữ liệu...</td>
                </tr>
              ) : !scheduleQuery.data || scheduleQuery.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">Chưa đăng ký môn học nào.</td>
                </tr>
              ) : (
                scheduleQuery.data.map((enrollment) => (
                  <tr key={enrollment.enrollmentId} className="transition-colors hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs text-muted-foreground align-middle">{enrollment.classCode}</td>
                    <td className="p-3 font-medium align-middle">{enrollment.courseName}</td>
                    <td className="p-3 text-muted-foreground align-middle">{enrollment.teacherName ?? "Chưa phân công"}</td>
                    <td className="p-3 text-muted-foreground align-middle">{`${dayLabels[enrollment.dayOfWeek] ?? `Thu ${enrollment.dayOfWeek}`} tiết ${enrollment.startPeriod}-${enrollment.endPeriod}${enrollment.room ? ` ${enrollment.room}` : ""}`}</td>
                    <td className="p-3 text-right tabular-nums align-middle">{formatVND((enrollment.credits ?? 0) * 850000)}</td>
                    <td className="p-3 text-center align-middle">
                      <StatusBadge value={enrollment.status || "ENROLLED"} />
                    </td>
                    <td className="p-3 text-right align-middle">
                      {(() => {
                        const isCanceling = cancelMutation.isPending && cancelMutation.variables === enrollment.classSectionId;
                        return (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isCanceling}
                            onClick={() => cancelMutation.mutate(enrollment.classSectionId)}
                            className="gap-2"
                          >
                            {isCanceling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            Hủy
                          </Button>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
