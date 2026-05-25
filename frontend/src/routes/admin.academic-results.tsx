import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api/admin";
import type { AcademicResultResponse, AdminStudentResponse } from "@/lib/api/types";
import { Calculator, Lock, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/academic-results")({ component: AcademicResultsPage });

function AcademicResultsPage() {
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);

  const { data: students, isPending: loadingStudents } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: adminApi.listStudents,
  });
  const { data: semesters, isPending: loadingSemesters } = useQuery({
    queryKey: ["admin", "semesters"],
    queryFn: adminApi.listSemesters,
  });

  const { data: results, isPending: loadingResults, isError: resultsError } = useQuery({
    queryKey: ["admin", "academic-results", selectedStudentId],
    queryFn: () => adminApi.listStudentAcademicResults(selectedStudentId!),
    enabled: selectedStudentId != null,
  });

  const calcSemGpaMutation = useMutation({
    mutationFn: () => {
      if (!selectedStudentId || !selectedSemesterId) throw new Error("Chọn sinh viên và học kỳ");
      return adminApi.calculateSemesterGpa(selectedStudentId, selectedSemesterId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "academic-results", selectedStudentId] });
      toast.success(
        `Đã tính GPA học kỳ: ${(result.semesterGpa ?? 0).toFixed(2)}`,
      );
    },
    onError: (err) => toast.error(err.message),
  });

  const calcCumGpaMutation = useMutation({
    mutationFn: () => {
      if (!selectedStudentId) throw new Error("Chọn sinh viên");
      return adminApi.calculateCumulativeGpa(selectedStudentId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "academic-results", selectedStudentId] });
      toast.success(
        `Đã tính CPA tích lũy: ${(result.cumulativeGpa ?? 0).toFixed(2)}`,
      );
    },
    onError: (err) => toast.error(err.message),
  });

  const lockGradesMutation = useMutation({
    mutationFn: () => {
      if (!selectedSemesterId) throw new Error("Chọn học kỳ");
      return adminApi.lockSemesterGrades(selectedSemesterId);
    },
    onSuccess: (msg) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "semesters"] });
      toast.success(msg || "Đã khóa điểm học kỳ");
    },
    onError: (err) => toast.error(err.message),
  });

  const selectedStudent = (students ?? []).find((s) => s.id === selectedStudentId);
  const displayResults = results ?? [];

  const latestResult = displayResults[displayResults.length - 1];

  if (loadingStudents || loadingSemesters) return <AcademicResultsSkeleton />;

  const studentList: AdminStudentResponse[] = students ?? [];
  const semesterList = semesters ?? [];

  return (
    <div>
      <PageHeader
        title="Kết quả học tập"
        description="Xem & tính toán GPA / CPA cho sinh viên"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedStudentId || !selectedSemesterId || calcSemGpaMutation.isPending}
              onClick={() => calcSemGpaMutation.mutate()}
            >
              {calcSemGpaMutation.isPending ? (
                <RotateCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              Tính GPA học kỳ
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedStudentId || calcCumGpaMutation.isPending}
              onClick={() => calcCumGpaMutation.mutate()}
            >
              {calcCumGpaMutation.isPending ? (
                <RotateCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              Tính CPA tích lũy
            </Button>
            <Button
              className="gap-2"
              disabled={!selectedSemesterId || lockGradesMutation.isPending}
              onClick={() => lockGradesMutation.mutate()}
            >
              {lockGradesMutation.isPending ? (
                <RotateCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Khóa điểm học kỳ
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          value={selectedStudentId != null ? String(selectedStudentId) : ""}
          onValueChange={(v) => setSelectedStudentId(Number(v))}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Chọn sinh viên..." />
          </SelectTrigger>
          <SelectContent>
            {studentList.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.studentCode} — {s.fullName ?? "N/A"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedSemesterId != null ? String(selectedSemesterId) : ""}
          onValueChange={(v) => setSelectedSemesterId(Number(v))}
        >
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Chọn học kỳ..." />
          </SelectTrigger>
          <SelectContent>
            {semesterList.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStudent && (
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="GPA học kỳ" value={(latestResult?.semesterGpa ?? 0).toFixed(2)} />
          <StatCard label="CPA tích lũy" value={(latestResult?.cumulativeGpa ?? 0).toFixed(2)} />
          <StatCard label="Tín chỉ học kỳ" value={String(latestResult?.totalCredits ?? 0)} />
          <StatCard label="Tổng tín chỉ" value={String(latestResult?.cumulativeCredits ?? 0)} />
        </div>
      )}

      {!selectedStudentId && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Chọn sinh viên để xem kết quả học tập
        </div>
      )}

      {selectedStudentId && loadingResults && <Skeleton className="h-64 w-full" />}

      {selectedStudentId && resultsError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Không tải được kết quả học tập
        </div>
      )}

      {selectedStudentId && !loadingResults && !resultsError && (
        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Học kỳ</TableHead>
                <TableHead>GPA học kỳ</TableHead>
                <TableHead>CPA tích lũy</TableHead>
                <TableHead>Tín chỉ kỳ</TableHead>
                <TableHead>Tổng tín chỉ</TableHead>
                <TableHead>Tính lúc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Chưa có kết quả học tập nào. Nhấn &quot;Tính GPA&quot; để bắt đầu.
                  </TableCell>
                </TableRow>
              ) : (
                displayResults.map((r) => (
                  <ResultRow key={r.id} result={r} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function ResultRow({ result }: { result: AcademicResultResponse }) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{result.semester?.name ?? "CPA Tích lũy"}</div>
        {result.semester && (
          <div className="text-xs text-muted-foreground">
            {result.semester.startDate} – {result.semester.endDate}
          </div>
        )}
      </TableCell>
      <TableCell className="tabular-nums font-semibold">
        {result.semesterGpa != null ? result.semesterGpa.toFixed(2) : "—"}
      </TableCell>
      <TableCell className="tabular-nums">
        {result.cumulativeGpa != null ? result.cumulativeGpa.toFixed(2) : "—"}
      </TableCell>
      <TableCell className="tabular-nums">{result.totalCredits ?? "—"}</TableCell>
      <TableCell className="tabular-nums">{result.cumulativeCredits ?? "—"}</TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {result.calculatedAt
          ? new Date(result.calculatedAt).toLocaleString("vi-VN")
          : "—"}
      </TableCell>
    </TableRow>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function AcademicResultsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-72" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
