import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Lock, LockOpen, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeacherGradeTable } from "@/features/teacher/TeacherGradeTable";
import {
  getTeacherClassRows,
  getTeacherGradeRows,
  type TeacherGradeRow,
} from "@/features/teacher/teacherData";
import { useTeacherSemester } from "@/features/teacher/useTeacherSemester";
import { teacherApi } from "@/lib/api/teacher";

export const Route = createFileRoute("/teacher/grades")({ component: TeacherGradesPage });

const ALL_COURSES = "__all__";

function TeacherGradesPage() {
  const queryClient = useQueryClient();
  const { semesterId, setSemesterId, semesterOptions } = useTeacherSemester();
  const [classSectionId, setClassSectionId] = useState<string>("");
  const [draftRows, setDraftRows] = useState<TeacherGradeRow[]>([]);
  const [classSearch, setClassSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [gradeLocked, setGradeLocked] = useState(false);

  const classesQuery = useQuery({
    queryKey: ["teacher", "classes", semesterId],
    queryFn: () => teacherApi.listMyClasses(semesterId),
    enabled: Boolean(semesterId),
    retry: false,
  });

  const classRows = useMemo(
    () => getTeacherClassRows(classesQuery.isError ? undefined : classesQuery.data, semesterId),
    [classesQuery.data, classesQuery.isError, semesterId],
  );

  const uniqueCourses = useMemo(() => {
    const map = new Map<string, string>();
    classRows.forEach((row) => map.set(row.courseCode, row.courseName));
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [classRows]);

  const filteredClasses = useMemo(() => {
    let rows = classRows;
    if (courseFilter && courseFilter !== ALL_COURSES)
      rows = rows.filter((r) => r.courseCode === courseFilter);
    if (classSearch.trim()) {
      const kw = classSearch.toLowerCase();
      rows = rows.filter(
        (r) => r.classCode.toLowerCase().includes(kw) || r.courseName.toLowerCase().includes(kw),
      );
    }
    return rows;
  }, [classRows, courseFilter, classSearch]);

  const gradesQuery = useQuery({
    queryKey: ["teacher", "grades", classSectionId],
    queryFn: () => teacherApi.getClassGrades(classSectionId),
    enabled: Boolean(classSectionId),
    retry: false,
  });

  const rows = useMemo(
    () => getTeacherGradeRows(gradesQuery.isError ? undefined : gradesQuery.data, classSectionId),
    [classSectionId, gradesQuery.data, gradesQuery.isError],
  );

  useEffect(() => {
    setDraftRows(rows);
  }, [rows]);

  // Sync gradeLocked from class data
  useEffect(() => {
    if (!classSectionId) return;
    const apiClass = classesQuery.data?.find((c) => String(c.id) === classSectionId);
    setGradeLocked(apiClass?.gradeLocked ?? false);
  }, [classSectionId, classesQuery.data]);

  const selectedClass = classRows.find((row) => row.id === classSectionId);

  const updateGradeMutation = useMutation({
    mutationFn: (row: TeacherGradeRow) =>
      teacherApi.updateGrade(row.numericEnrollmentId ?? row.enrollmentId, {
        enrollmentId: Number(row.numericEnrollmentId ?? row.enrollmentId),
        participationScore: row.participationScore,
        midTermScore: row.midtermScore,
        finalScore: row.finalScore,
        retestScore: row.retestScore,
      }),
    onSuccess: () => toast.success("Da luu diem"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Luu diem that bai"),
  });

  const lockMutation = useMutation({
    mutationFn: async () => {
      // Save all editable rows first
      const editableRows = draftRows.filter((r) => r.canEdit && r.numericEnrollmentId);
      for (const row of editableRows) {
        await teacherApi.updateGrade(row.numericEnrollmentId!, {
          enrollmentId: Number(row.numericEnrollmentId),
          participationScore: row.participationScore,
          midTermScore: row.midtermScore,
          finalScore: row.finalScore,
          retestScore: row.retestScore,
        });
      }
      await teacherApi.lockClassGrades(classSectionId);
    },
    onSuccess: () => {
      toast.success("Đã lưu và khóa điểm toàn bộ lớp.");
      setGradeLocked(true);
      void queryClient.invalidateQueries({ queryKey: ["teacher", "grades", classSectionId] });
      void queryClient.invalidateQueries({ queryKey: ["teacher", "classes", semesterId] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Khóa điểm thất bại"),
  });

  const selectClass = (id: string) => {
    setClassSectionId(id);
    setDraftRows([]);
    setGradeLocked(false);
  };

  const clearClass = () => {
    setClassSectionId("");
    setDraftRows([]);
    setGradeLocked(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quan ly diem"
        description="Nhap diem thanh phan, tinh tong va khoa bang diem"
        actions={
          classSectionId ? (
            gradeLocked ? (
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                <Lock className="h-3.5 w-3.5" /> Bang diem da khoa
              </Badge>
            ) : (
              <Button
                className="gap-2"
                disabled={lockMutation.isPending || draftRows.length === 0}
                onClick={() => lockMutation.mutate()}
              >
                <LockOpen className="h-4 w-4" />
                {lockMutation.isPending ? "Dang khoa..." : "Khoa diem"}
              </Button>
            )
          ) : undefined
        }
      />

      <section className="rounded-xl border bg-card p-4 shadow-sm">
        {!classSectionId ? (
          /* ── Class list picker ── */
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <Select
                value={semesterId}
                onValueChange={setSemesterId}
                disabled={semesterOptions.length === 0}
              >
                <SelectTrigger className="sm:w-52">
                  <SelectValue placeholder="Chon hoc ky" />
                </SelectTrigger>
                <SelectContent>
                  {semesterOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Tim lop hoc phan..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>
              <Select
                value={courseFilter || ALL_COURSES}
                onValueChange={(v) => setCourseFilter(v === ALL_COURSES ? "" : v)}
                disabled={uniqueCourses.length === 0}
              >
                <SelectTrigger className="sm:w-56">
                  <SelectValue placeholder="Tat ca mon hoc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_COURSES}>Tat ca mon hoc</SelectItem>
                  {uniqueCourses.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!semesterId && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Hay chon hoc ky de xem danh sach lop hoc phan.
              </div>
            )}
            {classesQuery.isLoading && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Dang tai danh sach lop...
              </div>
            )}
            {classesQuery.isError && (
              <div className="py-4 text-sm text-destructive">
                {classesQuery.error instanceof Error
                  ? classesQuery.error.message
                  : "Khong tai duoc danh sach lop"}
              </div>
            )}
            {semesterId &&
              !classesQuery.isLoading &&
              !classesQuery.isError &&
              filteredClasses.length === 0 && (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Khong tim thay lop hoc phan phu hop.
                </div>
              )}

            <div className="grid gap-3 lg:grid-cols-2">
              {filteredClasses.map((row) => {
                const isLocked =
                  classesQuery.data?.find((c) => String(c.id) === row.id)?.gradeLocked ?? false;
                return (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold">{row.courseName}</span>
                        <Badge variant={isLocked ? "secondary" : "outline"} className="shrink-0 gap-1 text-xs">
                          {isLocked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
                          {isLocked ? "Da khoa" : "Chua khoa"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{row.classCode}</div>
                      {row.scheduleText && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {row.scheduleText}
                        </div>
                      )}
                    </div>
                    <Button size="sm" onClick={() => selectClass(row.id)}>
                      Quan ly diem
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* ── Selected class header ── */
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{selectedClass?.courseName}</span>
                <Badge variant={gradeLocked ? "secondary" : "outline"} className="gap-1 text-xs">
                  {gradeLocked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
                  {gradeLocked ? "Da khoa" : "Chua khoa"}
                </Badge>
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                {selectedClass?.classCode}
                {selectedClass?.scheduleText ? ` · ${selectedClass.scheduleText}` : ""}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={clearClass} className="shrink-0">
              ← Doi lop
            </Button>
          </div>
        )}
      </section>

      {classSectionId && (
        <TeacherGradeTable
          rows={draftRows}
          disabled={gradeLocked}
          onChange={(nextRow) =>
            setDraftRows((current) =>
              current.map((item) =>
                item.enrollmentId === nextRow.enrollmentId ? nextRow : item,
              ),
            )
          }
          onSave={(row) => {
            if (!row.numericEnrollmentId) return;
            updateGradeMutation.mutate(row);
          }}
        />
      )}
    </div>
  );
}
