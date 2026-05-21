import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatEnrollmentDate } from "./enrollmentApprovalMock";
import type { EnrollmentApprovalRow } from "./types";

interface EnrollmentApprovalTableProps {
  rows: EnrollmentApprovalRow[];
}

export function EnrollmentApprovalTable({ rows }: EnrollmentApprovalTableProps) {
  return (
    <DataTable
      data={rows}
      rowKey={(row) => row.id}
      pageSize={10}
      searchPlaceholder="Tim theo sinh vien, ma lop, mon hoc, hoc ky..."
      emptyMessage="Khong co dang ky nao phu hop"
      columns={[
        {
          key: "student",
          header: "Sinh vien",
          accessor: (row) => `${row.studentCode} ${row.studentName}`,
          render: (row) => (
            <div className="min-w-48">
              <div className="font-medium">{row.studentName}</div>
              <div className="mt-1 flex items-center gap-1">
                <span className="font-mono text-xs text-muted-foreground">{row.studentCode}</span>
                <Badge variant={row.source === "API" ? "secondary" : "outline"}>{row.source}</Badge>
              </div>
            </div>
          ),
        },
        {
          key: "course",
          header: "Lop hoc phan",
          accessor: (row) => `${row.classCode} ${row.courseName}`,
          render: (row) => (
            <div className="min-w-56">
              <div className="text-sm font-medium">{row.courseName}</div>
              <div className="font-mono text-xs text-muted-foreground">{row.classCode}</div>
            </div>
          ),
        },
        {
          key: "semester",
          header: "Hoc ky",
          render: (row) => (
            <div>
              <div className="text-sm">{row.semesterName}</div>
              <div className="text-xs text-muted-foreground">{row.teacherName}</div>
            </div>
          ),
        },
        {
          key: "timeline",
          header: "Dang ky",
          accessor: (row) => `${row.enrolledAt} ${row.checkedAt} ${row.approvedAt}`,
          render: (row) => (
            <div className="min-w-56 text-xs text-muted-foreground">
              <div>Dang ky: {formatEnrollmentDate(row.enrolledAt)}</div>
              <div>Kiem tra: {formatEnrollmentDate(row.checkedAt)}</div>
              <div>Chot lop: {formatEnrollmentDate(row.approvedAt)}</div>
            </div>
          ),
        },
        {
          key: "source",
          header: "Nguon",
          accessor: (row) => `${row.registrationSource} ${row.source}`,
          render: (row) => (
            <div className="space-y-1">
              <Badge variant={row.registrationSource === "Admin" ? "secondary" : "outline"}>
                {row.registrationSource === "Admin" ? "Admin them" : "SV dang ky"}
              </Badge>
              <div className="text-xs text-muted-foreground">{row.source}</div>
            </div>
          ),
        },
        {
          key: "status",
          header: "Trang thai",
          render: (row) => <StatusBadge value={row.status} />,
        },
        {
          key: "note",
          header: "Ghi chu",
          render: (row) => <span className="text-xs text-muted-foreground">{row.note}</span>,
        },
      ]}
    />
  );
}
