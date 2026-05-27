import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Save, Users } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type {
  AdminClassSectionStudentResponse,
  AdminStudentResponse,
  AdminExamRegistrationResponse,
  ExamScheduleRequest,
  ExamScheduleResponse,
} from "@/lib/api/types";
import { triggerBrowserDownload } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  semesterId: number;
}

type ExamStudentRow = {
  key: string;
  studentCode: string;
  studentName: string;
  email?: string | null;
  majorName?: string | null;
  examKind: "NORMAL" | "RETAKE" | "IMPROVE";
  status?: string | null;
  feeCharged?: number | null;
};

export function ExamSchedulesTab({ semesterId }: Props) {
  const queryClient = useQueryClient();
  const [studentsSchedule, setStudentsSchedule] = useState<ExamScheduleResponse | null>(null);
  const [edits, setEdits] = useState<Record<number, Partial<ExamScheduleRequest>>>({});

  const schedulesQuery = useQuery({
    queryKey: ["admin", "exam-schedules", semesterId],
    queryFn: () => adminApi.getExamSchedules(semesterId),
  });

  const retakeQuery = useQuery({
    queryKey: ["admin", "exam-registrations", semesterId, "all"],
    queryFn: () => adminApi.listExamRegistrations(semesterId),
  });

  const schedules = schedulesQuery.data ?? [];
  const retakeRegistrations = retakeQuery.data ?? [];

  const updateMutation = useMutation({
    mutationFn: ({ classSectionId, req }: { classSectionId: number; req: ExamScheduleRequest }) =>
      adminApi.updateExamSchedule(classSectionId, req),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exam-schedules", semesterId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "class-sections", "semester", semesterId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "semester-summary", semesterId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "exam-registrations", semesterId] });
      toast.success("Đã lưu lịch thi");
      setEdits((current) => {
        const next = { ...current };
        delete next[vars.classSectionId];
        return next;
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không lưu được lịch thi"),
  });

  function getField<K extends keyof ExamScheduleRequest>(id: number, field: K, original: ExamScheduleRequest[K]) {
    return edits[id]?.[field] !== undefined ? edits[id][field] : original;
  }

  function setField<K extends keyof ExamScheduleRequest>(id: number, field: K, value: ExamScheduleRequest[K]) {
    setEdits((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));
  }

  function saveRow(schedule: ExamScheduleResponse) {
    const edit = edits[schedule.classSectionId] ?? {};
    updateMutation.mutate({
      classSectionId: schedule.classSectionId,
      req: {
        classSectionId: schedule.classSectionId,
        examAt: (edit.examAt !== undefined ? edit.examAt : schedule.examAt) || null,
        examRoom: (edit.examRoom !== undefined ? edit.examRoom : schedule.examRoom) || null,
        examType: "NORMAL",
      },
    });
  }

  if (schedulesQuery.isLoading) return <Skeleton className="h-64 w-full" />;

  const scheduledCount = schedules.filter((schedule) => schedule.examAt).length;
  const retakeCount = retakeRegistrations.filter((item) =>
    ["RETAKE", "IMPROVE"].includes(item.registrationType ?? ""),
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{scheduledCount}</span>/{schedules.length} lớp đã có lịch thi
          </span>
          <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
            Bao gồm {retakeCount} đăng ký thi lại/nâng điểm
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            void adminApi
              .exportExamSchedules(semesterId)
              .catch((error) => toast.error(error instanceof Error ? error.message : "Không xuất được Excel"))
          }
        >
          <Download className="mr-1 h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left font-medium">Lớp HP</th>
              <th className="p-3 text-left font-medium">Môn học</th>
              <th className="p-3 text-left font-medium">Giảng viên</th>
              <th className="p-3 text-left font-medium">Thời gian thi</th>
              <th className="p-3 text-left font-medium">Phòng thi</th>
              <th className="p-3 text-left font-medium">Sinh viên thi</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => {
              const examAt = getField(schedule.classSectionId, "examAt", schedule.examAt) as string | null;
              const examRoom = getField(schedule.classSectionId, "examRoom", schedule.examRoom) as string | null;
              const hasEdit = !!edits[schedule.classSectionId];
              const noSchedule = !schedule.examAt && !edits[schedule.classSectionId]?.examAt;
              const extraStudents = getMatchingRetakeRegistrations(schedule, retakeRegistrations).length;

              return (
                <tr
                  key={schedule.classSectionId}
                  className={`border-t hover:bg-muted/30 ${hasEdit ? "bg-muted/40" : noSchedule ? "bg-muted/20" : ""}`}
                >
                  <td className="p-3 font-mono text-xs">{schedule.classCode}</td>
                  <td className="p-3">{schedule.courseName}</td>
                  <td className="p-3 text-xs text-muted-foreground">{schedule.teacherName}</td>
                  <td className="p-3">
                    <Input
                      type="datetime-local"
                      className="h-8 w-44 text-xs"
                      value={examAt ? examAt.slice(0, 16) : ""}
                      onChange={(event) =>
                        setField(schedule.classSectionId, "examAt", event.target.value ? `${event.target.value}:00` : null)
                      }
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      className="h-8 w-28 text-xs"
                      value={examRoom ?? ""}
                      onChange={(event) => setField(schedule.classSectionId, "examRoom", event.target.value || null)}
                    />
                  </td>
                  <td className="p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => setStudentsSchedule(schedule)}
                    >
                      <Users className="h-3.5 w-3.5" />
                      {schedule.studentCount + extraStudents}
                    </Button>
                  </td>
                  <td className="p-3">
                    {hasEdit && (
                      <Button size="sm" className="h-7 text-xs" disabled={updateMutation.isPending} onClick={() => saveRow(schedule)}>
                        <Save className="mr-1 h-3 w-3" />
                        Lưu
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {schedules.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">Chưa có lịch thi</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ExamStudentsDialog
        open={!!studentsSchedule}
        schedule={studentsSchedule}
        retakeRegistrations={retakeRegistrations}
        onOpenChange={(open) => {
          if (!open) setStudentsSchedule(null);
        }}
      />
    </div>
  );
}

function ExamStudentsDialog({
  open,
  schedule,
  retakeRegistrations,
  onOpenChange,
}: {
  open: boolean;
  schedule: ExamScheduleResponse | null;
  retakeRegistrations: AdminExamRegistrationResponse[];
  onOpenChange: (open: boolean) => void;
}) {
  const studentsQuery = useQuery({
    queryKey: ["admin", "class-sections", schedule?.classSectionId, "students", "exam"],
    queryFn: () => adminApi.listClassSectionStudents(schedule?.classSectionId ?? 0),
    enabled: open && !!schedule?.classSectionId,
    retry: false,
  });
  const allStudentsQuery = useQuery({
    queryKey: ["admin", "students", "exam-dialog"],
    queryFn: adminApi.listStudents,
    enabled: open,
    staleTime: 60_000,
    retry: false,
  });

  const rows = useMemo(() => {
    if (!schedule) return [];
    return buildExamStudentRows(
      studentsQuery.data ?? [],
      getMatchingRetakeRegistrations(schedule, retakeRegistrations),
      allStudentsQuery.data ?? [],
    );
  }, [schedule, studentsQuery.data, retakeRegistrations, allStudentsQuery.data]);

  const exportRows = () => {
    if (!schedule) return;
    exportExamRoomStudents(schedule, rows);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danh sách sinh viên thi
          </DialogTitle>
          <DialogDescription>
            {schedule
              ? `${schedule.classCode} - ${schedule.courseName} - ${formatDateTime(schedule.examAt)} - Phòng ${schedule.examRoom ?? "-"}`
              : "Sinh viên dự thi theo lịch thi đã chọn"}
          </DialogDescription>
          <div className="pt-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={exportRows} disabled={rows.length === 0}>
              <Download className="h-4 w-4" />
              Xuất danh sách phòng thi
            </Button>
          </div>
        </DialogHeader>

        {studentsQuery.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left font-medium">MSSV</th>
                  <th className="p-3 text-left font-medium">Họ tên</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">Ngành</th>
                  <th className="p-3 text-left font-medium">Hình thức thi</th>
                  <th className="p-3 text-left font-medium">Trạng thái</th>
                  <th className="p-3 text-left font-medium">Phí</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">{row.studentCode}</td>
                    <td className="p-3 font-medium">{row.studentName}</td>
                    <td className="p-3 text-xs text-muted-foreground">{row.email ?? "-"}</td>
                    <td className="p-3 text-xs text-muted-foreground">{row.majorName ?? "-"}</td>
                    <td className="p-3">
                      <ExamKindBadge kind={row.examKind} />
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{formatStatus(row.status)}</td>
                    <td className="p-3 text-xs tabular-nums">
                      {row.feeCharged != null ? `${row.feeCharged.toLocaleString("vi-VN")}đ` : "-"}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Chưa có sinh viên trong lịch thi này
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function buildExamStudentRows(
  normalStudents: AdminClassSectionStudentResponse[],
  retakeRegistrations: AdminExamRegistrationResponse[],
  allStudents: AdminStudentResponse[],
): ExamStudentRow[] {
  const knownStudents = new Map<string, AdminClassSectionStudentResponse | AdminStudentResponse>();
  for (const student of allStudents) knownStudents.set(student.studentCode, student);
  for (const student of normalStudents) knownStudents.set(student.studentCode, student);

  const normalRows: ExamStudentRow[] = normalStudents.map((student) => ({
    key: `normal-${student.enrollmentId}`,
    studentCode: student.studentCode,
    studentName: student.fullName,
    email: student.email,
    majorName: student.majorName,
    examKind: "NORMAL",
    status: student.status,
  }));

  const retakeRows: ExamStudentRow[] = retakeRegistrations.map((item) => ({
    ...buildRetakeStudentRow(item, knownStudents.get(item.studentCode)),
  }));

  return [...normalRows, ...retakeRows].sort((a, b) => a.studentCode.localeCompare(b.studentCode));
}

function buildRetakeStudentRow(
  item: AdminExamRegistrationResponse,
  fallback?: AdminClassSectionStudentResponse | AdminStudentResponse,
): ExamStudentRow {
  return {
    key: `retake-${item.id}`,
    studentCode: item.studentCode,
    studentName: item.studentName || fallback?.fullName || "-",
    email: fallback?.email,
    majorName: fallback?.majorName,
    examKind: item.registrationType === "IMPROVE" ? "IMPROVE" : "RETAKE",
    status: item.status,
    feeCharged: item.feeCharged,
  };
}

function getMatchingRetakeRegistrations(
  schedule: ExamScheduleResponse,
  retakeRegistrations: AdminExamRegistrationResponse[],
) {
  return retakeRegistrations.filter((item) => {
    if (!["RETAKE", "IMPROVE"].includes(item.registrationType ?? "")) return false;
    if (item.classSectionId === schedule.classSectionId) return true;
    const sameCourse = item.courseCode === schedule.courseCode;
    const sameExamAt = !!item.examAt && !!schedule.examAt && item.examAt === schedule.examAt;
    const sameRoom = !item.examRoom || !schedule.examRoom || item.examRoom === schedule.examRoom;
    return sameCourse && sameExamAt && sameRoom;
  });
}

function ExamKindBadge({ kind }: { kind: ExamStudentRow["examKind"] }) {
  if (kind === "NORMAL") return <Badge variant="outline">Thi thường</Badge>;
  if (kind === "IMPROVE") return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Nâng điểm</Badge>;
  return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Thi lại</Badge>;
}

function formatStatus(status?: string | null) {
  if (status === "REGISTERED") return "Đã xác nhận";
  if (status === "PENDING") return "Chờ duyệt";
  if (status === "CANCELED") return "Đã hủy";
  return status ?? "-";
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function exportExamRoomStudents(schedule: ExamScheduleResponse, rows: ExamStudentRow[]) {
  const header = ["STT", "MSSV", "Họ tên", "Email", "Ngành", "Hình thức thi", "Trạng thái", "Phí"];
  const lines = rows.map((row, index) => [
    index + 1,
    row.studentCode,
    row.studentName,
    row.email ?? "",
    row.majorName ?? "",
    formatExamKind(row.examKind),
    formatStatus(row.status),
    row.feeCharged ?? "",
  ]);
  const csv = [header, ...lines].map((line) => line.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const room = schedule.examRoom ? schedule.examRoom.replace(/\s+/g, "-") : "chua-co-phong";
  const classCode = schedule.classCode.replace(/\s+/g, "-");
  triggerBrowserDownload(blob, `danh-sach-thi-${classCode}-${room}.csv`);
}

function formatExamKind(kind: ExamStudentRow["examKind"]) {
  if (kind === "NORMAL") return "Thi thường";
  if (kind === "IMPROVE") return "Nâng điểm";
  return "Thi lại";
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}
