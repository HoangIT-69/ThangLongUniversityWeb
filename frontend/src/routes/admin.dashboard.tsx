import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Layers,
  LibraryBig,
  MapPin,
  RefreshCw,
  School,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import type { ClassSectionResponse } from "@/lib/api/types";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboard });

function percent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function occupancy(section: ClassSectionResponse) {
  const current = section.currentSlots ?? 0;
  const max = section.maxSlots ?? section.roomCapacity ?? 0;
  return { current, max, rate: percent(current, max) };
}

function AdminDashboard() {
  const studentsQuery = useQuery({ queryKey: ["admin", "students"], queryFn: adminApi.listStudents });
  const teachersQuery = useQuery({ queryKey: ["admin", "teachers"], queryFn: adminApi.listTeachers });
  const coursesQuery = useQuery({ queryKey: ["admin", "courses"], queryFn: adminApi.listCourses });
  const classSectionsQuery = useQuery({
    queryKey: ["admin", "class-sections"],
    queryFn: adminApi.listClassSections,
  });
  const semestersQuery = useQuery({ queryKey: ["admin", "semesters"], queryFn: adminApi.listSemesters });
  const departmentsQuery = useQuery({
    queryKey: ["admin", "departments"],
    queryFn: adminApi.listDepartments,
  });
  const roomsQuery = useQuery({ queryKey: ["admin", "rooms"], queryFn: adminApi.listRooms });

  const queries = [
    studentsQuery,
    teachersQuery,
    coursesQuery,
    classSectionsQuery,
    semestersQuery,
    departmentsQuery,
    roomsQuery,
  ];
  const isLoading = queries.some((query) => query.isPending);
  const hasError = queries.some((query) => query.isError);
  const refreshAll = () => queries.forEach((query) => void query.refetch());

  const students = studentsQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];
  const courses = coursesQuery.data ?? [];
  const classSections = classSectionsQuery.data ?? [];
  const semesters = semestersQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];
  const rooms = roomsQuery.data ?? [];

  const currentSemester =
    semesters.find((semester) => semester.registrationOpen || semester.retakeOpen) ?? semesters[0];
  const assignedClasses = classSections.filter((section) => section.teacherId || section.teacherName);
  const scheduledClasses = classSections.filter((section) => section.schedules?.length);
  const totalRegisteredSlots = classSections.reduce(
    (sum, section) => sum + (section.currentSlots ?? 0),
    0,
  );
  const totalCapacity = classSections.reduce(
    (sum, section) => sum + (section.maxSlots ?? section.roomCapacity ?? 0),
    0,
  );
  const averageOccupancy = percent(totalRegisteredSlots, totalCapacity);
  const openClasses = classSections.filter((section) => !(section.closed ?? section.isClosed)).length;
  const roomCapacity = rooms.reduce((sum, room) => sum + (room.capacity ?? 0), 0);

  const studentsByMajor = Object.entries(
    students.reduce<Record<string, number>>((acc, student) => {
      const key = student.majorName ?? "Chưa phân ngành";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const attentionClasses = classSections
    .filter((section) => {
      const load = occupancy(section);
      return !section.teacherName || load.rate >= 90 || !section.schedules?.length;
    })
    .sort((a, b) => occupancy(b).rate - occupancy(a).rate)
    .slice(0, 5);

  const recentClasses = [...classSections]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tổng quan hệ thống"
        description="Bảng điều hành nhanh cho dữ liệu đào tạo, học kỳ và lớp học phần"
        actions={
          <Button variant="outline" className="gap-2" onClick={refreshAll}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        }
      />

      {hasError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Một số dữ liệu chưa tải được. Các khối còn lại vẫn hiển thị theo dữ liệu có sẵn.
        </div>
      )}

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="border-b p-5 lg:border-b-0 lg:border-r">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {currentSemester?.name ?? "Chưa có học kỳ"}
              </Badge>
              <Badge variant={currentSemester?.registrationOpen ? "default" : "outline"}>
                Đăng ký {currentSemester?.registrationOpen ? "đang mở" : "đã đóng"}
              </Badge>
              <Badge variant={currentSemester?.examPublished ? "default" : "outline"}>
                Lịch thi {currentSemester?.examPublished ? "đã công bố" : "chưa công bố"}
              </Badge>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <SystemMetric label="Lớp đang mở" value={openClasses} helper={`${classSections.length} lớp tổng`} />
              <SystemMetric
                label="Tỷ lệ có giảng viên"
                value={`${percent(assignedClasses.length, classSections.length)}%`}
                helper={`${assignedClasses.length}/${classSections.length} lớp`}
              />
              <SystemMetric
                label="Đã xếp lịch"
                value={`${percent(scheduledClasses.length, classSections.length)}%`}
                helper={`${scheduledClasses.length}/${classSections.length} lớp`}
              />
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Sức chứa lớp học phần</h2>
                <p className="text-xs text-muted-foreground">
                  {totalRegisteredSlots} đăng ký trên {totalCapacity || 0} chỗ
                </p>
              </div>
              <School className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-3xl font-semibold tabular-nums">{averageOccupancy}%</span>
                <span className="text-xs text-muted-foreground">Mức lấp đầy trung bình</span>
              </div>
              <Progress value={averageOccupancy} className="h-2.5" />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <InfoLine label="Bắt đầu" value={formatDate(currentSemester?.startDate)} />
                <InfoLine label="Kết thúc" value={formatDate(currentSemester?.endDate)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Sinh viên"
          value={students.length}
          hint={`${studentsByMajor.length} nhóm ngành có dữ liệu`}
          icon={GraduationCap}
          tone="primary"
        />
        <StatCard
          label="Giảng viên"
          value={teachers.length}
          hint={`${departments.length} khoa / bộ môn`}
          icon={Users}
          tone="info"
        />
        <StatCard
          label="Môn học"
          value={courses.length}
          hint={`${courses.reduce((sum, course) => sum + (course.credits ?? 0), 0)} tín chỉ`}
          icon={BookOpen}
          tone="success"
        />
        <StatCard
          label="Phòng học"
          value={rooms.length}
          hint={`${roomCapacity} chỗ ngồi`}
          icon={MapPin}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Lớp học phần cần chú ý</h2>
              <p className="text-xs text-muted-foreground">Ưu tiên lớp thiếu giảng viên, chưa xếp lịch hoặc gần đầy</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-warning-foreground" />
          </div>

          {attentionClasses.length === 0 ? (
            <EmptyState text="Không có lớp nào cần chú ý ngay." />
          ) : (
            <div className="mt-4 divide-y">
              {attentionClasses.map((section) => {
                const load = occupancy(section);
                return (
                  <div key={section.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{section.classCode}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{section.courseName}</div>
                      </div>
                      <Badge variant={load.rate >= 90 ? "destructive" : "outline"}>
                        {load.current}/{load.max || "-"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {!section.teacherName && <Badge variant="outline">Chưa phân công GV</Badge>}
                      {!section.schedules?.length && <Badge variant="outline">Chưa xếp lịch</Badge>}
                      {load.rate >= 90 && <Badge variant="outline">Gần đầy lớp</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Phân bổ sinh viên theo ngành</h2>
              <p className="text-xs text-muted-foreground">Top ngành có số lượng sinh viên cao nhất</p>
            </div>
            <LibraryBig className="h-5 w-5 text-muted-foreground" />
          </div>

          {studentsByMajor.length === 0 ? (
            <EmptyState text="Chưa có dữ liệu ngành học." />
          ) : (
            <div className="mt-4 space-y-4">
              {studentsByMajor.map(([major, count]) => (
                <div key={major}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{major}</span>
                    <span className="tabular-nums text-muted-foreground">{count} SV</span>
                  </div>
                  <Progress value={percent(count, students.length)} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Thao tác nhanh</h2>
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickAction to="/admin/semesters" icon={CalendarDays} label="Quản lý học kỳ" />
            <QuickAction to="/admin/class-sections" icon={Layers} label="Mở lớp học phần" />
            <QuickAction to="/admin/students" icon={GraduationCap} label="Danh sách sinh viên" />
            <QuickAction to="/admin/teachers" icon={Users} label="Phân công giảng viên" />
            <QuickAction to="/admin/courses" icon={BookOpen} label="Danh mục học phần" />
            <QuickAction to="/admin/departments" icon={Building2} label="Khoa / Bộ môn" />
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Lớp học phần mới cập nhật</h2>
              <p className="text-xs text-muted-foreground">Theo mã bản ghi mới nhất trong hệ thống</p>
            </div>
            <Layers className="h-5 w-5 text-muted-foreground" />
          </div>
          {recentClasses.length === 0 ? (
            <EmptyState text="Chưa có lớp học phần nào." />
          ) : (
            <div className="mt-4 divide-y">
              {recentClasses.map((section) => {
                const load = occupancy(section);
                return (
                  <div key={section.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{section.classCode}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {section.courseName} - {section.teacherName ?? "Chưa có GV"}
                      </div>
                    </div>
                    <div className="w-28 shrink-0">
                      <div className="mb-1 text-right text-xs tabular-nums text-muted-foreground">
                        {load.current}/{load.max || "-"}
                      </div>
                      <Progress value={load.rate} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SystemMetric({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{helper}</div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Button asChild variant="outline" className="h-12 justify-between gap-3 px-3">
      <Link to={to}>
        <span className="flex min-w-0 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </Button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="mt-4 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <PageHeader title="Tổng quan hệ thống" description="Đang tải dữ liệu tổng quan" />
      <Skeleton className="h-56 rounded-xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
