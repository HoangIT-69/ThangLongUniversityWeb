import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { enrollments, getStudent, getClassSection, getCourse, grades } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/teacher/classes/$classSectionId/students")({ component: () => {
  const { classSectionId } = Route.useParams();
  const cs = getClassSection(classSectionId);
  const c = getCourse(cs.courseId);
  const enrs = enrollments.filter((e) => e.classSectionId === classSectionId);
  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 gap-1"><Link to="/teacher/classes"><ChevronLeft className="h-4 w-4" />Quay lại</Link></Button>
      <PageHeader title={`${c.name} — ${cs.code}`} description={`${enrs.length} sinh viên`} />
      <DataTable data={enrs} rowKey={(e) => e.id}
        columns={[
          { key: "code", header: "Mã SV", accessor: (e) => getStudent(e.studentId).code, render: (e) => <span className="font-mono text-xs">{getStudent(e.studentId).code}</span> },
          { key: "name", header: "Họ tên", accessor: (e) => getStudent(e.studentId).fullName, render: (e) => <span className="font-medium">{getStudent(e.studentId).fullName}</span> },
          { key: "email", header: "Email", accessor: (e) => getStudent(e.studentId).email, render: (e) => <span className="text-xs text-muted-foreground">{getStudent(e.studentId).email}</span> },
          { key: "status", header: "Trạng thái", render: (e) => <StatusBadge value={e.status} /> },
          { key: "grade", header: "Điểm hiện tại", render: (e) => {
            const g = grades.find((gr) => gr.enrollmentId === e.id);
            return g ? <span className="tabular-nums font-semibold">{g.total} ({g.letter})</span> : <span className="text-xs text-muted-foreground">—</span>;
          }},
        ]}
      />
    </div>
  );
}});
