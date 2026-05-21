import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Mail, UserRound } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { classSections, getCourse } from "@/data/mock";
import { getTeacherRosterRows } from "@/features/teacher/teacherData";
import { teacherApi } from "@/lib/api/teacher";

export const Route = createFileRoute("/teacher/classes/$classSectionId/students")({
  component: TeacherClassStudentsPage,
});

function TeacherClassStudentsPage() {
  const { classSectionId } = Route.useParams();
  const mockClass = classSections.find((section) => section.id === classSectionId);
  const mockCourse = mockClass ? getCourse(mockClass.courseId) : null;

  const rosterQuery = useQuery({
    queryKey: ["teacher", "classes", classSectionId, "students"],
    queryFn: () => teacherApi.listClassStudents(classSectionId),
    retry: false,
  });

  const rows = useMemo(() => {
    const baseRows = getTeacherRosterRows(
      rosterQuery.isError ? undefined : rosterQuery.data,
      classSectionId,
    );
    if (baseRows.length || !rosterQuery.isError) return baseRows;
    return getTeacherRosterRows(undefined, "api-demo");
  }, [classSectionId, rosterQuery.data, rosterQuery.isError]);

  const gradedCount = rows.filter((row) => row.totalScore !== null && row.totalScore !== undefined).length;
  const registeredCount = rows.filter((row) => row.status !== "CANCELLED").length;

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1">
        <Link to="/teacher/classes">
          <ChevronLeft className="h-4 w-4" />
          Quay lai
        </Link>
      </Button>

      <PageHeader
        title={mockCourse ? `${mockCourse.name} - ${mockClass?.code}` : `Lop hoc phan ${classSectionId}`}
        description={
          rosterQuery.isError
            ? "API roster chua san sang, dang hien danh sach demo de teacher xem luong"
            : "Danh sach sinh vien da chot trong lop hoc phan"
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Sinh vien trong lop" value={rows.length} icon={UserRound} tone="primary" />
        <StatCard label="Dang hoc hop le" value={registeredCount} icon={UserRound} tone="success" />
        <StatCard label="Da co diem" value={gradedCount} icon={Mail} tone="info" />
      </div>

      <DataTable
        data={rows}
        rowKey={(row) => row.enrollmentId}
        pageSize={12}
        searchPlaceholder="Tim ma sinh vien, ho ten, email..."
        emptyMessage="Chua co sinh vien nao trong lop nay"
        columns={[
          {
            key: "studentCode",
            header: "Ma SV",
            render: (row) => <span className="font-mono text-xs font-semibold">{row.studentCode}</span>,
          },
          {
            key: "fullName",
            header: "Sinh vien",
            render: (row) => (
              <div className="min-w-56">
                <div className="font-medium">{row.fullName}</div>
                <div className="mt-1 flex gap-1">
                  <Badge variant={row.source === "API" ? "secondary" : "outline"}>{row.source}</Badge>
                  <span className="text-xs text-muted-foreground">{row.cohort}</span>
                </div>
              </div>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (row) => <span className="text-xs text-muted-foreground">{row.email}</span>,
          },
          {
            key: "majorName",
            header: "Nganh",
            render: (row) => <span className="text-sm">{row.majorName}</span>,
          },
          {
            key: "midtermScore",
            header: "Giua ky",
            render: (row) => <ScoreCell value={row.midtermScore} />,
          },
          {
            key: "finalScore",
            header: "Cuoi ky",
            render: (row) => <ScoreCell value={row.finalScore} />,
          },
          {
            key: "totalScore",
            header: "Tong",
            render: (row) => <ScoreCell value={row.totalScore} strong />,
          },
          {
            key: "status",
            header: "Trang thai",
            render: (row) => <StatusBadge value={row.status} />,
          },
        ]}
      />
    </div>
  );
}

function ScoreCell({ value, strong = false }: { value?: number | null; strong?: boolean }) {
  if (value === null || value === undefined) {
    return <span className="text-xs text-muted-foreground">Can BE</span>;
  }
  return (
    <span className={strong ? "font-semibold tabular-nums" : "tabular-nums"}>
      {value.toFixed(2)}
    </span>
  );
}
