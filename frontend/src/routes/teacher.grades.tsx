import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Lock, Save, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeacherGradeTable } from "@/features/teacher/TeacherGradeTable";
import {
  getDefaultTeacherSemesterId,
  getTeacherClassRows,
  getTeacherGradeRows,
  teacherSemesterOptions,
  type TeacherGradeRow,
} from "@/features/teacher/teacherData";
import { teacherApi } from "@/lib/api/teacher";

export const Route = createFileRoute("/teacher/grades")({ component: TeacherGradesPage });

function TeacherGradesPage() {
  const queryClient = useQueryClient();
  const [semesterId, setSemesterId] = useState(getDefaultTeacherSemesterId());
  const [classSectionId, setClassSectionId] = useState<string>("");
  const [draftRows, setDraftRows] = useState<TeacherGradeRow[]>([]);
  const [submittedClassIds, setSubmittedClassIds] = useState<Set<string>>(new Set());

  const classesQuery = useQuery({
    queryKey: ["teacher", "classes", semesterId],
    queryFn: () => teacherApi.listMyClasses(semesterId),
    retry: false,
  });

  const classRows = useMemo(
    () => getTeacherClassRows(classesQuery.isError ? undefined : classesQuery.data, semesterId),
    [classesQuery.data, classesQuery.isError, semesterId],
  );

  useEffect(() => {
    if (!classSectionId && classRows[0]) setClassSectionId(classRows[0].id);
    if (classSectionId && !classRows.some((row) => row.id === classSectionId)) {
      setClassSectionId(classRows[0]?.id ?? "");
    }
  }, [classRows, classSectionId]);

  const gradesQuery = useQuery({
    queryKey: ["teacher", "grades", classSectionId],
    queryFn: () => teacherApi.getClassGrades(classSectionId),
    enabled: Boolean(classSectionId),
    retry: false,
  });

  const rows = useMemo(() => {
    const baseRows = getTeacherGradeRows(
      gradesQuery.isError ? undefined : gradesQuery.data,
      classSectionId,
    );
    if (baseRows.length || !gradesQuery.isError) return baseRows;
    return getTeacherGradeRows(undefined, "api-demo");
  }, [classSectionId, gradesQuery.data, gradesQuery.isError]);

  useEffect(() => {
    setDraftRows(rows);
  }, [rows]);

  const updateGradeMutation = useMutation({
    mutationFn: (row: TeacherGradeRow) =>
      teacherApi.updateGrade(row.numericEnrollmentId ?? row.enrollmentId, {
        enrollmentId: Number(row.numericEnrollmentId ?? row.enrollmentId),
        participationScore: row.participationScore,
        midTermScore: row.midtermScore,
        finalScore: row.finalScore,
        retestScore: row.retestScore,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "grades", classSectionId] });
      queryClient.invalidateQueries({ queryKey: ["teacher", "classes", classSectionId, "students"] });
      toast.success("Da luu diem");
    },
    onError: (error) => toast.error(error.message),
  });

  const selectedClass = classRows.find((row) => row.id === classSectionId);
  const lockedCount = draftRows.filter((row) => !row.canEdit || row.gradeStatus === "LOCKED").length;
  const completedCount = draftRows.filter((row) => row.totalScore > 0).length;
  const isSubmitted = submittedClassIds.has(classSectionId);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quan ly diem"
        description={
          gradesQuery.isError
            ? "API bang diem chua san sang, dang hien spreadsheet demo co fallback"
            : "Nhap diem thanh phan, tinh tong va gui bang diem cho admin"
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => toast.success("Da luu ban nhap demo tren giao dien")}
            >
              <Save className="h-4 w-4" />
              Luu nhap
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                setSubmittedClassIds((current) => new Set(current).add(classSectionId));
                toast.success("Da gui bang diem demo. BE can API submit de persist.");
              }}
              disabled={!classSectionId || isSubmitted}
            >
              <Send className="h-4 w-4" />
              {isSubmitted ? "Da gui diem" : "Gui bang diem"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sinh vien" value={draftRows.length} icon={CheckCircle2} tone="primary" />
        <StatCard label="Da co diem" value={completedCount} icon={CheckCircle2} tone="success" />
        <StatCard label="Da khoa" value={lockedCount} icon={Lock} tone="warning" />
        <StatCard label="Trang thai gui" value={isSubmitted ? "SUBMITTED" : "DRAFT"} icon={Send} tone="info" />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-medium">{selectedClass?.courseName ?? "Chon lop hoc phan"}</div>
          <div className="text-xs text-muted-foreground">
            {selectedClass
              ? `${selectedClass.classCode} - ${selectedClass.scheduleText}`
              : "Teacher can chon hoc ky va lop de nhap diem"}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={semesterId} onValueChange={setSemesterId}>
            <SelectTrigger className="w-full sm:w-[260px]">
              <SelectValue placeholder="Hoc ky" />
            </SelectTrigger>
            <SelectContent>
              {teacherSemesterOptions.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {semester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classSectionId} onValueChange={setClassSectionId}>
            <SelectTrigger className="w-full sm:w-[320px]">
              <SelectValue placeholder="Lop hoc phan" />
            </SelectTrigger>
            <SelectContent>
              {classRows.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.classCode} - {row.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TeacherGradeTable
        rows={draftRows}
        savingEnrollmentId={
          updateGradeMutation.isPending ? updateGradeMutation.variables?.enrollmentId : undefined
        }
        onChange={(nextRow) =>
          setDraftRows((current) =>
            current.map((item) => (item.enrollmentId === nextRow.enrollmentId ? nextRow : item)),
          )
        }
        onSave={(nextRow) => {
          if (!nextRow.numericEnrollmentId) {
            toast.success("Da luu diem demo tren FE. BE can API de persist mock row.");
            return;
          }
          updateGradeMutation.mutate(nextRow);
        }}
      />
    </div>
  );
}
