import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getTeacherClassRows,
} from "@/features/teacher/teacherData";
import { useTeacherSemester, type TeacherSemesterOption } from "@/features/teacher/useTeacherSemester";
import { teacherApi } from "@/lib/api/teacher";

export const Route = createFileRoute("/teacher/classes")({ component: TeacherClassesRouteShell });

function TeacherClassesRouteShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname !== "/teacher/classes") return <Outlet />;
  return <TeacherClassesPage />;
}

function TeacherClassesPage() {
  const { semesterId, setSemesterId, semesterOptions } = useTeacherSemester();
  const navigate = useNavigate();

  const classesQuery = useQuery({
    queryKey: ["teacher", "classes", semesterId],
    queryFn: () => teacherApi.listMyClasses(semesterId),
    enabled: Boolean(semesterId),
    retry: false,
  });

  const rows = useMemo(
    () => getTeacherClassRows(classesQuery.isError ? undefined : classesQuery.data, semesterId),
    [classesQuery.data, classesQuery.isError, semesterId],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lop hoc phan dang day"
        description={
          classesQuery.isError
            ? "Chua tai duoc du lieu lop hoc tu backend"
            : "Danh sach lop hoc phan duoc phan cong theo hoc ky"
        }
      />

      <DataTable
        data={rows}
        rowKey={(row) => row.id}
        toolbar={<SemesterFilter value={semesterId} options={semesterOptions} onValueChange={setSemesterId} />}
        pageSize={10}
        searchPlaceholder="Tim ma lop, mon hoc, phong..."
        emptyMessage="Chua co lop hoc phan nao trong hoc ky nay"
        columns={[
          {
            key: "classCode",
            header: "Ma lop",
            render: (row) => (
              <div>
                <span className="font-mono text-xs font-semibold">{row.classCode}</span>
              </div>
            ),
          },
          {
            key: "courseName",
            header: "Mon hoc",
            render: (row) => (
              <div className="min-w-56">
                <div className="font-medium">{row.courseName}</div>
                <div className="text-xs text-muted-foreground">
                  {row.courseCode} - {row.credits} tin chi
                </div>
              </div>
            ),
          },
          {
            key: "scheduleRoomItems",
            header: "Lich hoc / Phong",
            accessor: (row) => row.scheduleRoomItems.join(" "),
            render: (row) => (
              <div className="min-w-72 space-y-1">
                {row.scheduleRoomItems.map((item, index) => (
                  <div key={`${row.id}-${index}-${item}`} className="text-xs text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: "size",
            header: "Si so",
            accessor: (row) => `${row.currentSlots}/${row.maxSlots}`,
            render: (row) => (
              <span className="tabular-nums">
                {row.currentSlots}/{row.maxSlots}
              </span>
            ),
          },
          {
            key: "status",
            header: "Lop",
            render: (row) => <StatusBadge value={row.status} />,
          },
          {
            key: "actions",
            header: "",
            className: "w-28 text-right",
            searchable: false,
            render: (row) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate({
                    to: "/teacher/classes/$classSectionId/students",
                    params: { classSectionId: row.id },
                  })
                }
              >
                Xem SV
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

function SemesterFilter({
  value,
  options,
  onValueChange,
}: {
  value: string;
  options: TeacherSemesterOption[];
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Chon hoc ky" />
      </SelectTrigger>
      <SelectContent>
        {options.map((semester) => (
          <SelectItem key={semester.id} value={semester.id}>
            {semester.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
