import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getTeacherRosterRows } from "@/features/teacher/teacherData";
import { teacherApi } from "@/lib/api/teacher";
import type { ClassSectionResponse } from "@/lib/api/types";

export const Route = createFileRoute("/teacher/classes/$classSectionId/students")({
  component: TeacherClassStudentsPage,
});

function TeacherClassStudentsPage() {
  const { classSectionId } = Route.useParams();
  const queryClient = useQueryClient();
  const cachedClass = useMemo(() => {
    const classQueries = queryClient.getQueriesData<ClassSectionResponse[]>({ queryKey: ["teacher", "classes"] });
    return classQueries
      .flatMap(([, data]) => data ?? [])
      .find((section) => String(section.id) === classSectionId);
  }, [classSectionId, queryClient]);
  const title = cachedClass ? `${cachedClass.courseName} - ${cachedClass.classCode}` : "Danh sach sinh vien";

  const rosterQuery = useQuery({
    queryKey: ["teacher", "classes", classSectionId, "students"],
    queryFn: () => teacherApi.listClassStudents(classSectionId),
    enabled: Boolean(classSectionId),
    refetchOnMount: "always",
    retry: false,
  });

  const rows = useMemo(() => {
    return getTeacherRosterRows(
      rosterQuery.isError ? undefined : rosterQuery.data,
      classSectionId,
    );
  }, [classSectionId, rosterQuery.data, rosterQuery.isError]);

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1">
        <Link to="/teacher/classes">
          <ChevronLeft className="h-4 w-4" />
          Quay lai
        </Link>
      </Button>

      <PageHeader
        title={title}
        description={
          rosterQuery.isError
            ? "Chua tai duoc danh sach sinh vien tu backend"
            : "Danh sach sinh vien da chot trong lop hoc phan"
        }
      />

      <DataTable
        data={rows}
        rowKey={(row) => row.enrollmentId}
        pageSize={12}
        searchPlaceholder="Tim ma sinh vien, ho ten, lop, so dien thoai, email..."
        emptyMessage="Chua co sinh vien nao trong lop nay"
        columns={[
          {
            key: "studentCode",
            header: "MSV",
            render: (row) => <span className="font-mono text-xs font-semibold">{row.studentCode}</span>,
          },
          {
            key: "fullName",
            header: "Ho ten",
            render: (row) => <span className="min-w-48 font-medium">{row.fullName}</span>,
          },
          {
            key: "className",
            header: "Lop SH",
            render: (row) => <span className="text-sm">{row.className}</span>,
          },
          {
            key: "phone",
            header: "SDT",
            render: (row) => <span className="font-mono text-xs">{row.phone}</span>,
          },
          {
            key: "email",
            header: "Email",
            render: (row) => <span className="text-xs text-muted-foreground">{row.email}</span>,
          },
          {
            key: "advisorName",
            header: "Co van HT",
            render: (row) => <span className="text-sm">{row.advisorName}</span>,
          },
          {
            key: "majorName",
            header: "Nganh",
            render: (row) => <span className="text-sm">{row.majorName}</span>,
          },
          {
            key: "facultyName",
            header: "Khoa hoc",
            render: (row) => <span className="text-sm">{row.facultyName}</span>,
          },
        ]}
      />
    </div>
  );
}
