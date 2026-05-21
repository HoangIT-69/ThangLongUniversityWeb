import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { StatusBadge } from "@/components/ui/status-badge";
import { studentApi } from "@/lib/api/student";
import { pickCurrentSemester } from "@/lib/semester";

export const Route = createFileRoute("/student/exams")({ component: ExamsPage });

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function ExamsPage() {
  const semestersQuery = useQuery({ queryKey: ["student", "semesters"], queryFn: studentApi.listSemesters });
  const semesters = semestersQuery.data ?? [];
  const [semesterId, setSemesterId] = useState<number | null>(null);

  useEffect(() => {
    if (!semesterId && semesters.length) setSemesterId(pickCurrentSemester(semesters)?.id ?? null);
  }, [semesterId, semesters]);

  const examsQuery = useQuery({
    queryKey: ["student", "exams", semesterId],
    queryFn: () => studentApi.getExams(semesterId as number),
    enabled: semesterId != null,
  });

  const exams = examsQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="Lich thi"
        description={`${exams.length} ky thi`}
        actions={
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={semesterId ?? ""} onChange={(e) => setSemesterId(Number(e.target.value))}>
            {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        }
      />
      <DataTable data={exams} rowKey={(e) => `${e.classCode}-${e.examAt ?? ""}`}
        emptyMessage={examsQuery.isLoading ? "Dang tai du lieu..." : "Chua co lich thi"}
        columns={[
          { key: "course", header: "Mon hoc", accessor: (e) => e.courseName, render: (e) => <span className="font-medium">{e.courseName}</span> },
          { key: "classCode", header: "Lop", render: (e) => <span className="font-mono text-xs">{e.classCode}</span> },
          { key: "examAt", header: "Thoi gian", render: (e) => <span className="tabular-nums">{formatDateTime(e.examAt)}</span> },
          { key: "room", header: "Phong", render: (e) => <span className="font-mono">{e.examRoom ?? "-"}</span> },
          { key: "format", header: "Hinh thuc", render: () => <StatusBadge value="OFFLINE" /> },
        ]}
      />
      {examsQuery.isError && <div className="mt-4 text-sm text-destructive">{examsQuery.error instanceof Error ? examsQuery.error.message : "Khong tai duoc lich thi"}</div>}
    </div>
  );
}
