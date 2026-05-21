import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarDays, GraduationCap, Layers } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getDefaultTeacherSemesterId,
  getTeacherClassRows,
  teacherSemesterOptions,
} from "@/features/teacher/teacherData";
import { teacherApi } from "@/lib/api/teacher";

export const Route = createFileRoute("/teacher/classes")({ component: TeacherClassesPage });

function TeacherClassesPage() {
  const [semesterId, setSemesterId] = useState(getDefaultTeacherSemesterId());

  const classesQuery = useQuery({
    queryKey: ["teacher", "classes", semesterId],
    queryFn: () => teacherApi.listMyClasses(semesterId),
    retry: false,
  });

  const rows = useMemo(
    () => getTeacherClassRows(classesQuery.isError ? undefined : classesQuery.data, semesterId),
    [classesQuery.data, classesQuery.isError, semesterId],
  );

  const studentCount = rows.reduce((sum, row) => sum + row.currentSlots, 0);
  const openClassCount = rows.filter((row) => row.status === "OPEN").length;
  const pendingGradeCount = rows.filter((row) => row.gradeStatus !== "LOCKED").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lop hoc phan dang day"
        description={
          classesQuery.isError
            ? "API teacher classes chua san sang hoac bi tu choi, dang hien demo truc quan"
            : "Danh sach lop hoc phan duoc phan cong theo hoc ky"
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lop phu trach" value={rows.length} icon={Layers} tone="primary" />
        <StatCard label="Lop dang mo" value={openClassCount} icon={BookOpen} tone="success" />
        <StatCard label="Tong sinh vien" value={studentCount} icon={GraduationCap} tone="info" />
        <StatCard label="Bang diem can xu ly" value={pendingGradeCount} icon={CalendarDays} tone="warning" />
      </div>

      <DataTable
        data={rows}
        rowKey={(row) => row.id}
        toolbar={<SemesterFilter value={semesterId} onValueChange={setSemesterId} />}
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
                <div className="mt-1">
                  <Badge variant={row.source === "API" ? "secondary" : "outline"}>{row.source}</Badge>
                </div>
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
            key: "scheduleText",
            header: "Lich hoc",
            render: (row) => <span className="text-xs text-muted-foreground">{row.scheduleText}</span>,
          },
          {
            key: "roomText",
            header: "Phong",
            render: (row) => <span className="font-mono text-xs">{row.roomText}</span>,
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
            key: "gradeStatus",
            header: "Diem",
            render: (row) => <StatusBadge value={row.gradeStatus} />,
          },
          {
            key: "actions",
            header: "",
            className: "w-28 text-right",
            searchable: false,
            render: (row) => (
              <Button asChild variant="outline" size="sm">
                <Link to="/teacher/classes/$classSectionId/students" params={{ classSectionId: row.id }}>
                  Xem SV
                </Link>
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
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Chon hoc ky" />
      </SelectTrigger>
      <SelectContent>
        {teacherSemesterOptions.map((semester) => (
          <SelectItem key={semester.id} value={semester.id}>
            {semester.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
