import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { enrollments, getStudent, getClassSection, getCourse, getSemester, formatDateTime, type EnrollmentStatus } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/enrollments")({ component: EnrollmentsPage });

const ALL: "ALL" = "ALL";
type Filter = EnrollmentStatus | typeof ALL;

function EnrollmentsPage() {
  const [status, setStatus] = useState<Filter>(ALL);
  const data = useMemo(() => status === ALL ? enrollments : enrollments.filter((e) => e.status === status), [status]);

  return (
    <div>
      <PageHeader title="Đăng ký môn học" description={`${data.length} đăng ký`} />
      <DataTable
        data={data}
        rowKey={(e) => e.id}
        pageSize={10}
        searchPlaceholder="Tìm theo sinh viên, môn học…"
        toolbar={
          <Select value={status} onValueChange={(v: Filter) => setStatus(v)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
        columns={[
          { key: "student", header: "Sinh viên", accessor: (e) => getStudent(e.studentId).fullName, render: (e) => {
            const s = getStudent(e.studentId);
            return <div><div className="font-medium">{s.fullName}</div><div className="text-xs text-muted-foreground font-mono">{s.code}</div></div>;
          }},
          { key: "course", header: "Lớp học phần", accessor: (e) => getCourse(getClassSection(e.classSectionId).courseId).name, render: (e) => {
            const cs = getClassSection(e.classSectionId);
            const c = getCourse(cs.courseId);
            return <div><div className="text-sm font-medium">{c.name}</div><div className="text-xs text-muted-foreground font-mono">{cs.code}</div></div>;
          }},
          { key: "sem", header: "Học kỳ", accessor: (e) => getSemester(e.semesterId).name, render: (e) => <span className="text-xs text-muted-foreground">{getSemester(e.semesterId).name}</span> },
          { key: "when", header: "Thời gian", accessor: (e) => e.enrolledAt, render: (e) => <span className="text-xs">{formatDateTime(e.enrolledAt)}</span> },
          { key: "status", header: "Trạng thái", render: (e) => <StatusBadge value={e.status} /> },
        ]}
      />
    </div>
  );
}
