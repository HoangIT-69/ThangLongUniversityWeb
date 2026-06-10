import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
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

function percentValue(value?: number | null) {
  return Math.min(100, Math.max(0, Math.round(value ?? 0)));
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
  const rate = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  return { current, max, rate };
}

function AdminDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.getDashboard,
    staleTime: 60 * 1000,
  });

  if (dashboardQuery.isPending) {
    return <DashboardSkeleton />;
  }

  const dashboard = dashboardQuery.data;
  const currentSemester = dashboard?.currentSemester;
  const attentionClasses = dashboard?.attentionClasses ?? [];
  const recentClasses = dashboard?.recentClasses ?? [];
  const studentsByMajor = dashboard?.studentsByMajor ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tong quan he thong"
        description="Bang dieu khien nhanh cho dao tao, hoc ky va lop hoc phan"
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => void dashboardQuery.refetch()}
          >
            <RefreshCw className="h-4 w-4" />
            Lam moi
          </Button>
        }
      />

      {dashboardQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {dashboardQuery.error instanceof Error
            ? dashboardQuery.error.message
            : "Khong tai duoc dashboard"}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="border-b p-5 lg:border-b-0 lg:border-r">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {currentSemester?.name ?? "Chua co hoc ky"}
              </Badge>
              <Badge variant={currentSemester?.registrationOpen ? "default" : "outline"}>
                Dang ky {currentSemester?.registrationOpen ? "dang mo" : "da dong"}
              </Badge>
              <Badge variant={currentSemester?.examPublished ? "default" : "outline"}>
                Lich thi {currentSemester?.examPublished ? "da cong bo" : "chua cong bo"}
              </Badge>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <SystemMetric
                label="Lop dang mo"
                value={dashboard?.openClassCount ?? 0}
                helper={`${dashboard?.classSectionCount ?? 0} lop tong`}
              />
              <SystemMetric
                label="Co giang vien"
                value={`${percentValue(dashboard?.assignedTeacherRate)}%`}
                helper={`${dashboard?.assignedClassCount ?? 0}/${dashboard?.classSectionCount ?? 0} lop`}
              />
              <SystemMetric
                label="Da xep lich"
                value={`${percentValue(dashboard?.scheduledClassRate)}%`}
                helper={`${dashboard?.scheduledClassCount ?? 0}/${dashboard?.classSectionCount ?? 0} lop`}
              />
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Suc chua lop hoc phan</h2>
                <p className="text-xs text-muted-foreground">
                  {dashboard?.totalRegisteredSlots ?? 0} dang ky tren{" "}
                  {dashboard?.totalCapacity ?? 0} cho
                </p>
              </div>
              <School className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-3xl font-semibold tabular-nums">
                  {percentValue(dashboard?.averageOccupancy)}%
                </span>
                <span className="text-xs text-muted-foreground">Muc lap day trung binh</span>
              </div>
              <Progress value={percentValue(dashboard?.averageOccupancy)} className="h-2.5" />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <InfoLine label="Bat dau" value={formatDate(currentSemester?.startDate)} />
                <InfoLine label="Ket thuc" value={formatDate(currentSemester?.endDate)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Sinh vien"
          value={dashboard?.studentCount ?? 0}
          hint={`${studentsByMajor.length} nganh co du lieu`}
          icon={GraduationCap}
          tone="primary"
        />
        <StatCard
          label="Giang vien"
          value={dashboard?.teacherCount ?? 0}
          hint={`${dashboard?.departmentCount ?? 0} khoa / bo mon`}
          icon={Users}
          tone="info"
        />
        <StatCard
          label="Mon hoc"
          value={dashboard?.courseCount ?? 0}
          hint={`${dashboard?.totalCourseCredits ?? 0} tin chi`}
          icon={BookOpen}
          tone="success"
        />
        <StatCard
          label="Phong hoc"
          value={dashboard?.roomCount ?? 0}
          hint={`${dashboard?.roomCapacity ?? 0} cho ngoi`}
          icon={MapPin}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Lop hoc phan can chu y</h2>
              <p className="text-xs text-muted-foreground">
                Uu tien lop thieu giang vien, chua xep lich hoac gan day
              </p>
            </div>
            <AlertTriangle className="h-5 w-5 text-warning-foreground" />
          </div>

          {attentionClasses.length === 0 ? (
            <EmptyState text="Khong co lop nao can chu y ngay." />
          ) : (
            <div className="mt-4 divide-y">
              {attentionClasses.map((section) => {
                const load = occupancy(section);
                return (
                  <div key={section.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{section.classCode}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {section.courseName}
                        </div>
                      </div>
                      <Badge variant={load.rate >= 90 ? "destructive" : "outline"}>
                        {load.current}/{load.max || "-"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {!section.teacherId && <Badge variant="outline">Chua co GV</Badge>}
                      {!section.schedules?.length && <Badge variant="outline">Chua xep lich</Badge>}
                      {load.rate >= 90 && <Badge variant="outline">Gan day lop</Badge>}
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
              <h2 className="text-sm font-semibold">Sinh vien theo nganh</h2>
              <p className="text-xs text-muted-foreground">Top nganh co so luong cao nhat</p>
            </div>
            <LibraryBig className="h-5 w-5 text-muted-foreground" />
          </div>

          {studentsByMajor.length === 0 ? (
            <EmptyState text="Chua co du lieu nganh hoc." />
          ) : (
            <div className="mt-4 space-y-4">
              {studentsByMajor.map((major) => (
                <div key={major.majorId ?? major.majorName}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{major.majorName ?? "Chua phan nganh"}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {major.studentCount} SV
                    </span>
                  </div>
                  <Progress
                    value={
                      (dashboard?.studentCount ?? 0) > 0
                        ? Math.round((major.studentCount / (dashboard?.studentCount ?? 1)) * 100)
                        : 0
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Thao tac nhanh</h2>
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickAction to="/admin/semesters" icon={CalendarDays} label="Quan ly hoc ky" />
            <QuickAction to="/admin/class-sections" icon={Layers} label="Mo lop hoc phan" />
            <QuickAction to="/admin/students" icon={GraduationCap} label="Danh sach sinh vien" />
            <QuickAction to="/admin/teachers" icon={Users} label="Phan cong giang vien" />
            <QuickAction to="/admin/courses" icon={BookOpen} label="Danh muc hoc phan" />
            <QuickAction to="/admin/departments" icon={Building2} label="Khoa / Bo mon" />
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Lop hoc phan moi cap nhat</h2>
              <p className="text-xs text-muted-foreground">Theo ban ghi moi nhat trong he thong</p>
            </div>
            <Layers className="h-5 w-5 text-muted-foreground" />
          </div>
          {recentClasses.length === 0 ? (
            <EmptyState text="Chua co lop hoc phan nao." />
          ) : (
            <div className="mt-4 divide-y">
              {recentClasses.map((section) => {
                const load = occupancy(section);
                return (
                  <div
                    key={section.id}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{section.classCode}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {section.courseName} - {section.teacherName ?? "Chua co GV"}
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

function SystemMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
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

function QuickAction({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
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
      <PageHeader title="Tong quan he thong" description="Dang tai du lieu tong quan" />
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
