import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { adminApi } from "@/lib/api/admin";
import { Users, GraduationCap, BookOpen, Layers, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboard });

function AdminDashboard() {
  const studentsQuery = useQuery({
    queryKey: ["admin", "students"],
    queryFn: adminApi.listStudents,
    staleTime: 5 * 60 * 1000,
  });
  const teachersQuery = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: adminApi.listTeachers,
    staleTime: 5 * 60 * 1000,
  });
  const coursesQuery = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: adminApi.listCourses,
    staleTime: 5 * 60 * 1000,
  });
  const classSectionsQuery = useQuery({
    queryKey: ["admin", "class-sections"],
    queryFn: adminApi.listClassSections,
    staleTime: 60 * 1000,
  });
  const semestersQuery = useQuery({
    queryKey: ["admin", "semesters"],
    queryFn: adminApi.listSemesters,
    staleTime: 5 * 60 * 1000,
  });
  const enrollmentsQuery = useQuery({
    queryKey: ["admin", "enrollments", { page: 0, size: 10 }],
    queryFn: () => adminApi.searchEnrollments({ page: 0, size: 10 }),
    staleTime: 60 * 1000,
  });

  const students = studentsQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];
  const courses = coursesQuery.data ?? [];
  const sections = classSectionsQuery.data ?? [];
  const semesters = semestersQuery.data ?? [];
  const recentEnrollments = enrollmentsQuery.data?.content ?? [];

  const openSections = sections.filter((s) => !s.closed).length;
  const currentSemester = semesters.find((s) => s.registrationOpen && !s.locked) ?? semesters[0];

  const isLoading = studentsQuery.isPending || teachersQuery.isPending;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div>
      <PageHeader
        title="Tổng quan hệ thống"
        description={currentSemester ? `Học kỳ hiện tại: ${currentSemester.name}` : "Quản trị hệ thống"}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Sinh viên"
          value={studentsQuery.isPending ? "..." : students.length.toLocaleString()}
          icon={GraduationCap}
          tone="primary"
          hint="Trong hệ thống"
        />
        <StatCard
          label="Giảng viên"
          value={teachersQuery.isPending ? "..." : teachers.length}
          icon={Users}
          tone="info"
        />
        <StatCard
          label="Môn học"
          value={coursesQuery.isPending ? "..." : courses.length}
          icon={BookOpen}
          tone="success"
        />
        <StatCard
          label="Lớp học phần"
          value={classSectionsQuery.isPending ? "..." : sections.length}
          icon={Layers}
          tone="warning"
          hint={`${openSections} đang mở`}
        />
        <StatCard
          label="Học kỳ"
          value={semestersQuery.isPending ? "..." : semesters.length}
          icon={ClipboardList}
          tone="info"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Đăng ký gần đây</h2>
            <span className="text-xs text-muted-foreground">
              {enrollmentsQuery.data?.totalElements ?? 0} tổng
            </span>
          </div>
          {enrollmentsQuery.isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : enrollmentsQuery.isError ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Không tải được danh sách đăng ký
            </div>
          ) : recentEnrollments.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Chưa có đăng ký nào
            </div>
          ) : (
            <ul className="divide-y">
              {recentEnrollments.map((e) => (
                <li key={e.enrollmentId} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {e.studentName}{" "}
                      <span className="text-muted-foreground">— {e.studentCode}</span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {e.courseName} · {e.classCode}
                    </div>
                  </div>
                  <StatusBadge value={e.status ?? "PENDING"} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Học kỳ</h2>
          {semestersQuery.isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {semesters.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{s.name}</span>
                    <StatusBadge value={s.registrationOpen ? "OPEN" : s.locked ? "LOCKED" : "CLOSED"} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {s.startDate ?? "—"} – {s.endDate ?? "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
