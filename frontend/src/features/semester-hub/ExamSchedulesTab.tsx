import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Save, Users } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { ExamScheduleRequest, ExamScheduleResponse } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassSectionStudentsDialog } from "@/features/admin-class-sections/ClassSectionStudentsDialog";
import type { ClassSectionRow } from "@/features/admin-class-sections/types";

interface Props {
  semesterId: number;
}

const EXAM_TYPE_OPTIONS = ["NORMAL", "RETAKE", "IMPROVE"] as const;
const EXAM_TYPE_LABEL: Record<string, string> = {
  NORMAL: "Thi thường",
  RETAKE: "Thi lại",
  IMPROVE: "Nâng điểm",
};

export function ExamSchedulesTab({ semesterId }: Props) {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("");
  const [studentsSection, setStudentsSection] = useState<ClassSectionRow | null>(null);
  const [edits, setEdits] = useState<Record<number, Partial<ExamScheduleRequest>>>({});

  const query = useQuery({
    queryKey: ["admin", "exam-schedules", semesterId],
    queryFn: () => adminApi.getExamSchedules(semesterId),
  });
  const schedules = query.data ?? [];
  const visibleSchedules = typeFilter
    ? schedules.filter((schedule) => (schedule.examType ?? "NORMAL") === typeFilter)
    : schedules;

  const updateMutation = useMutation({
    mutationFn: ({ classSectionId, req }: { classSectionId: number; req: ExamScheduleRequest }) =>
      adminApi.updateExamSchedule(classSectionId, req),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exam-schedules", semesterId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "class-sections", "semester", semesterId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "semester-summary", semesterId] });
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
        examType: (edit.examType !== undefined ? edit.examType : schedule.examType) || "NORMAL",
      },
    });
  }

  if (query.isLoading) return <Skeleton className="h-64 w-full" />;

  const scheduledCount = schedules.filter((schedule) => schedule.examAt).length;
  const retakeLikeCount = schedules.filter((schedule) => ["RETAKE", "IMPROVE"].includes(schedule.examType ?? "")).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{scheduledCount}</span>/{schedules.length} lớp đã có lịch thi
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
            {retakeLikeCount} lịch thi lại/nâng điểm
          </span>
          <Select value={typeFilter || "__all__"} onValueChange={(value) => setTypeFilter(value === "__all__" ? "" : value)}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả lịch thi</SelectItem>
              {EXAM_TYPE_OPTIONS.map((type) => (
                <SelectItem key={type} value={type}>{EXAM_TYPE_LABEL[type]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <a href={adminApi.exportExamSchedulesUrl(semesterId)} download>
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            Xuất Excel
          </Button>
        </a>
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
              <th className="p-3 text-left font-medium">Loại lịch thi</th>
              <th className="p-3 text-left font-medium">SV</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {visibleSchedules.map((schedule) => {
              const examAt = getField(schedule.classSectionId, "examAt", schedule.examAt) as string | null;
              const examRoom = getField(schedule.classSectionId, "examRoom", schedule.examRoom) as string | null;
              const examType = getField(schedule.classSectionId, "examType", schedule.examType) as string | null;
              const hasEdit = !!edits[schedule.classSectionId];
              const noSchedule = !schedule.examAt && !edits[schedule.classSectionId]?.examAt;

              return (
                <tr
                  key={schedule.classSectionId}
                  className={`border-t hover:bg-muted/30 ${hasEdit ? "bg-yellow-50" : noSchedule ? "bg-amber-50/50" : ""}`}
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
                    <Select
                      value={examType ?? "NORMAL"}
                      onValueChange={(value) =>
                        setField(schedule.classSectionId, "examType", value as "NORMAL" | "RETAKE" | "IMPROVE")
                      }
                    >
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXAM_TYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type}>{EXAM_TYPE_LABEL[type]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => setStudentsSection(toClassSectionRow(schedule))}>
                      <Users className="h-3.5 w-3.5" />
                      {schedule.studentCount}
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
            {visibleSchedules.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">Chưa có lịch thi</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ClassSectionStudentsDialog
        open={!!studentsSection}
        section={studentsSection}
        onOpenChange={(open) => {
          if (!open) setStudentsSection(null);
        }}
      />
    </div>
  );
}

function toClassSectionRow(schedule: ExamScheduleResponse): ClassSectionRow {
  return {
    id: String(schedule.classSectionId),
    numericId: schedule.classSectionId,
    classCode: schedule.classCode,
    courseId: 0,
    courseName: `${schedule.courseCode} - ${schedule.courseName}`,
    majorName: "",
    semesterId: schedule.semesterId,
    semesterName: schedule.semesterName,
    teacherId: 0,
    teacherName: schedule.teacherName,
    roomId: 0,
    roomName: schedule.examRoom ?? "",
    dayOfWeek: 2,
    startPeriodId: 0,
    startPeriod: 0,
    endPeriodId: 0,
    endPeriod: 0,
    currentSlots: schedule.studentCount,
    maxSlots: schedule.studentCount,
    status: "OPEN",
    source: "API",
  };
}
