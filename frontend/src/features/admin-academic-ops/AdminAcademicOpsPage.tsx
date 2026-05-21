import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, Lock, Play, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { adminApi } from "@/lib/api/admin";
import type { ClassSectionResponse } from "@/lib/api/types";
import { toast } from "sonner";
import {
  curriculumRows,
  departmentRows,
  facultyRows,
  flowTestSteps,
  moduleConfigs,
  notificationRows,
  registrationPeriodRows,
  workflowMermaid,
  workflowSteps,
} from "./academicOpsMock";
import type { AcademicOpsModule, ModuleRow } from "./types";

interface AdminAcademicOpsPageProps {
  module: AcademicOpsModule;
}

export function AdminAcademicOpsPage({ module }: AdminAcademicOpsPageProps) {
  const config = moduleConfigs[module];
  const queryClient = useQueryClient();
  const [registrationLocked, setRegistrationLocked] = useState(false);
  const [gradesLocked, setGradesLocked] = useState(false);

  const [
    semestersQuery,
    coursesQuery,
    classSectionsQuery,
    studentsQuery,
    teachersQuery,
    enrollmentsQuery,
  ] = useQueries({
    queries: [
      { queryKey: ["admin", "semesters"], queryFn: adminApi.listSemesters, retry: false },
      { queryKey: ["admin", "courses"], queryFn: adminApi.listCourses, retry: false },
      { queryKey: ["admin", "class-sections"], queryFn: adminApi.listClassSections, retry: false },
      { queryKey: ["admin", "students"], queryFn: adminApi.listStudents, retry: false },
      { queryKey: ["admin", "teachers"], queryFn: adminApi.listTeachers, retry: false },
      {
        queryKey: ["admin", "enrollments", "ops"],
        queryFn: () => adminApi.listEnrollments(),
        retry: false,
      },
    ],
  });

  const openRegistrationMutation = useMutation({
    mutationFn: async () => "opened",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "semesters"] });
      setRegistrationLocked(false);
      toast.success("Demo: da mo dang ky hoc phan");
    },
  });

  const lockRegistrationMutation = useMutation({
    mutationFn: async () => "locked",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "enrollments"] });
      setRegistrationLocked(true);
      toast.success("Demo: da khoa dang ky va chot danh sach lop");
    },
  });

  const lockGradesMutation = useMutation({
    mutationFn: async () => "grades-locked",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "academic-results"] });
      setGradesLocked(true);
      toast.success("Demo: da khoa diem hoc ky");
    },
  });

  const rows = useMemo(
    () =>
      getRows(module, {
        courses: coursesQuery.data,
        classSections: classSectionsQuery.data,
        teachers: teachersQuery.data,
      }),
    [classSectionsQuery.data, coursesQuery.data, module, teachersQuery.data],
  );

  const hasApiError =
    semestersQuery.isError ||
    coursesQuery.isError ||
    classSectionsQuery.isError ||
    studentsQuery.isError ||
    teachersQuery.isError ||
    enrollmentsQuery.isError;

  if (module === "workflow") {
    return (
      <WorkflowView
        registrationLocked={registrationLocked}
        gradesLocked={gradesLocked}
        onOpenRegistration={() => openRegistrationMutation.mutate()}
        onLockRegistration={() => lockRegistrationMutation.mutate()}
        onLockGrades={() => lockGradesMutation.mutate()}
      />
    );
  }

  if (module === "reports") {
    return (
      <ReportsView
        hasApiError={hasApiError}
        stats={{
          semesters: semestersQuery.data?.length ?? 5,
          courses: coursesQuery.data?.length ?? 24,
          classSections: classSectionsQuery.data?.length ?? 36,
          students: studentsQuery.data?.length ?? 1200,
          teachers: teachersQuery.data?.length ?? 86,
          enrollments: enrollmentsQuery.data?.totalElements ?? 3560,
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={config.title}
        description={`${config.description}${hasApiError ? " - dang fallback mock" : ""}`}
        actions={<ModuleActions module={module} />}
      />
      <div className="mb-4 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
        {config.sourceNote}
      </div>
      <DataTable
        data={rows}
        rowKey={(row) => String(row.code ?? row.id ?? row.title)}
        pageSize={10}
        searchPlaceholder={`Tim trong ${config.title.toLowerCase()}...`}
        emptyMessage="Chua co du lieu"
        columns={[
          {
            key: "primary",
            header: "Doi tuong",
            accessor: (row) => String(row.name ?? row.title ?? row.code),
            render: (row) => (
              <div className="min-w-52">
                <div className="font-medium">{String(row.name ?? row.title ?? row.classCode)}</div>
                <div className="text-xs text-muted-foreground">
                  {String(row.code ?? row.semester ?? row.course)}
                </div>
              </div>
            ),
          },
          {
            key: "context",
            header: "Lien ket",
            accessor: (row) => String(row.major ?? row.teacher ?? row.target ?? row.room ?? ""),
            render: (row) => (
              <div className="text-sm text-muted-foreground">
                {String(row.major ?? row.teacher ?? row.target ?? row.room ?? row.dean ?? "Can BE")}
              </div>
            ),
          },
          {
            key: "metrics",
            header: "Chi so",
            accessor: (row) =>
              `${String(row.students ?? row.teachers ?? row.courses ?? row.enrollments ?? row.maxSlots ?? "")}`,
            render: (row) => <div className="text-sm tabular-nums">{formatMetrics(row)}</div>,
          },
          {
            key: "time",
            header: "Thoi gian / Lich",
            accessor: (row) => String(row.schedule ?? row.startTime ?? row.sentAt ?? ""),
            render: (row) => (
              <span className="text-xs text-muted-foreground">
                {String(
                  row.schedule ?? row.startTime ?? row.sentAt ?? row.effectiveYear ?? "Can BE",
                )}
              </span>
            ),
          },
          {
            key: "status",
            header: "Trang thai",
            render: (row) => <StatusBadge value={String(row.status ?? "ACTIVE")} />,
          },
        ]}
      />
    </div>
  );
}

function ModuleActions({ module }: { module: AcademicOpsModule }) {
  if (module === "registration-periods") {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => toast.success("Demo: mo dang ky")}
        >
          <Play className="h-4 w-4" />
          Mo dang ky
        </Button>
        <Button className="gap-2" onClick={() => toast.success("Demo: khoa dang ky")}>
          <Lock className="h-4 w-4" />
          Khoa dang ky
        </Button>
      </div>
    );
  }

  if (module === "notifications") {
    return (
      <Button className="gap-2" onClick={() => toast.success("Demo: gui thong bao")}>
        <Bell className="h-4 w-4" />
        Gui thong bao
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={() => toast.success("Demo: da luu thay doi")}
    >
      <Save className="h-4 w-4" />
      Luu demo
    </Button>
  );
}

function ReportsView({
  hasApiError,
  stats,
}: {
  hasApiError: boolean;
  stats: Record<
    "semesters" | "courses" | "classSections" | "students" | "teachers" | "enrollments",
    number
  >;
}) {
  return (
    <div>
      <PageHeader
        title={moduleConfigs.reports.title}
        description={`${moduleConfigs.reports.description}${hasApiError ? " - co fallback mock" : ""}`}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Hoc ky" value={stats.semesters} icon={CheckCircle2} tone="info" />
        <StatCard label="Mon hoc" value={stats.courses} icon={CheckCircle2} tone="success" />
        <StatCard
          label="Lop hoc phan"
          value={stats.classSections}
          icon={CheckCircle2}
          tone="warning"
        />
        <StatCard label="Sinh vien" value={stats.students} icon={CheckCircle2} tone="primary" />
        <StatCard label="Giang vien" value={stats.teachers} icon={CheckCircle2} tone="info" />
        <StatCard label="Dang ky" value={stats.enrollments} icon={CheckCircle2} tone="warning" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ReportPanel title="Tinh trang workflow" items={workflowSteps.slice(0, 6)} />
        <ReportPanel
          title="Can BE bo sung"
          items={[
            "registration period API",
            "grade lock API",
            "notification API",
            "department/curriculum API",
          ]}
        />
      </div>
    </div>
  );
}

function WorkflowView({
  registrationLocked,
  gradesLocked,
  onOpenRegistration,
  onLockRegistration,
  onLockGrades,
}: {
  registrationLocked: boolean;
  gradesLocked: boolean;
  onOpenRegistration: () => void;
  onLockRegistration: () => void;
  onLockGrades: () => void;
}) {
  return (
    <div>
      <PageHeader
        title={moduleConfigs.workflow.title}
        description={moduleConfigs.workflow.description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={onOpenRegistration}>
              <Play className="h-4 w-4" />
              Mo dang ky
            </Button>
            <Button className="gap-2" onClick={onLockRegistration}>
              <Lock className="h-4 w-4" />
              Khoa dang ky
            </Button>
            <Button className="gap-2" onClick={onLockGrades}>
              <Lock className="h-4 w-4" />
              Khoa diem
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold">Flow test ngan</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {flowTestSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold">Trang thai demo</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge
                value={registrationLocked ? "REGISTRATION_LOCKED" : "REGISTRATION_OPEN"}
              />
              <StatusBadge value={gradesLocked ? "GRADES_LOCKED" : "GRADES_EDITING"} />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold">Mermaid flow</h2>
            <pre className="mt-4 overflow-x-auto rounded bg-muted p-4 text-xs">
              {workflowMermaid}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function getRows(
  module: AcademicOpsModule,
  data: {
    courses?: {
      id: number;
      code: string;
      name: string;
      credits: number;
      majorName?: string | null;
    }[];
    classSections?: ClassSectionResponse[];
    teachers?: { id: number; teacherCode: string; fullName: string; department?: string | null }[];
  },
): ModuleRow[] {
  if (module === "departments") return departmentRows;
  if (module === "faculties") return facultyRows;
  if (module === "curriculums") return buildCurriculumRows(data.courses);
  if (module === "registration-periods") return registrationPeriodRows;
  if (module === "notifications") return notificationRows;
  if (module === "timetables") return buildTimetableRows(data.classSections);
  if (module === "teaching-assignments")
    return buildAssignmentRows(data.classSections, data.teachers);
  return [];
}

function buildCurriculumRows(courses: Parameters<typeof getRows>[1]["courses"]) {
  if (!courses?.length) return curriculumRows;
  const grouped = new Map<string, { courses: number; credits: number }>();
  courses.forEach((course) => {
    const key = course.majorName ?? "Can BE: majorName";
    const current = grouped.get(key) ?? { courses: 0, credits: 0 };
    grouped.set(key, { courses: current.courses + 1, credits: current.credits + course.credits });
  });
  return Array.from(grouped.entries()).map(([major, value], index) => ({
    code: `CTDT-${index + 1}`,
    name: `Chuong trinh ${major}`,
    major,
    courses: value.courses,
    totalCredits: value.credits,
    status: "ACTIVE",
  }));
}

function buildTimetableRows(classSections: ClassSectionResponse[] | undefined): ModuleRow[] {
  if (!classSections?.length) return registrationPeriodRows;
  return classSections.slice(0, 20).map((section) => ({
    classCode: section.classCode,
    course: section.courseName,
    teacher: section.teacherName ?? "Can BE: teacherName",
    room: section.schedules?.[0]?.roomName ?? "Can BE: roomName",
    schedule: section.schedules?.[0]
      ? `Thu ${section.schedules[0].dayOfWeek}, tiet ${section.schedules[0].startPeriod}-${section.schedules[0].endPeriod}`
      : "Can BE: schedules",
    maxSlots: section.maxSlots,
    status: section.closed ? "CLOSED" : "OPEN",
  }));
}

function buildAssignmentRows(
  classSections: ClassSectionResponse[] | undefined,
  teachers:
    | { id: number; teacherCode: string; fullName: string; department?: string | null }[]
    | undefined,
): ModuleRow[] {
  if (!classSections?.length) return departmentRows;
  return classSections.slice(0, 20).map((section, index) => {
    const teacher = teachers?.find((item) => item.id === section.teacherId);
    return {
      code: section.classCode,
      name: section.courseName,
      teacher: section.teacherName ?? teacher?.fullName ?? "Can BE: teacherName",
      department: teacher?.department ?? "Can BE: department",
      semester: section.semesterName,
      students: section.currentSlots ?? 0,
      status: section.closed ? "CLOSED" : index % 4 === 0 ? "DRAFT" : "ACTIVE",
    };
  });
}

function formatMetrics(row: ModuleRow) {
  if (row.students !== undefined) return `${row.students} sinh vien`;
  if (row.teachers !== undefined) return `${row.teachers} giang vien`;
  if (row.courses !== undefined) return `${row.courses} mon`;
  if (row.enrollments !== undefined) return `${row.enrollments} dang ky`;
  if (row.totalCredits !== undefined) return `${row.totalCredits} tin chi`;
  if (row.maxSlots !== undefined) return `${row.maxSlots} si so toi da`;
  return "Can BE";
}
