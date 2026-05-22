import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { Award, BookOpen, CalendarCheck, GraduationCap, Layers, Receipt } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { studentApi } from "@/lib/api/student";
import type { EnrollmentResponse } from "@/lib/api/types";

export const Route = createFileRoute("/student/dashboard")({ component: StudentDashboardPage });

const dayLabels: Record<number, string> = { 1: "Thu 2", 2: "Thu 3", 3: "Thu 4", 4: "Thu 5", 5: "Thu 6", 6: "Thu 7", 7: "CN" };

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function formatExamDate(examAt: string | null | undefined) {
  if (!examAt) return "-";
  const d = new Date(examAt);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getTodaySlots(items: EnrollmentResponse[], apiDayOfWeek: number) {
  return items.flatMap((item) => {
    const schedules = item.schedules?.length
      ? item.schedules
      : [{ dayOfWeek: item.dayOfWeek, startPeriod: item.startPeriod, endPeriod: item.endPeriod, roomName: item.room }];

    return schedules
      .filter((schedule) => schedule.dayOfWeek === apiDayOfWeek)
      .map((schedule) => ({
        ...item,
        room: schedule.roomName ?? item.room,
        startPeriod: schedule.startPeriod,
        endPeriod: schedule.endPeriod,
      }));
  });
}

function StudentDashboardPage() {
  const { profile, name } = useAuth();
  const dashboardQuery = useQuery({ queryKey: ["student", "dashboard"], queryFn: () => studentApi.getDashboard() });
  const dashboard = dashboardQuery.data;
  const currentSemester = dashboard?.currentSemester;

  const jsToday = new Date().getDay();
  const today = jsToday || 7;
  const apiToday = jsToday === 0 ? 8 : jsToday + 1;
  const todaySchedule = getTodaySlots(dashboard?.todaySchedule ?? [], apiToday).slice(0, 4);
  const credits = dashboard?.registeredCredits ?? 0;
  const tuitionRemaining = dashboard?.tuitionRemaining ?? 0;
  const displayName = profile?.fullName ?? name ?? "Sinh vien";

  const courseCount = dashboard?.activeCourseCount ?? 0;
  const upcomingExams = dashboard?.upcomingExams ?? [];
  const nextExamsPanel = upcomingExams.slice(0, 4);

  return (
    <div>
      <PageHeader title={`Xin chao, ${displayName.split(" ").slice(-1)[0]}!`} description={profile?.code ? `Ma SV ${profile.code}` : currentSemester?.name} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="GPA hoc ky" value={(dashboard?.semesterGpa ?? 0).toFixed(2)} icon={Award} tone="primary" />
        <StatCard label="CPA tich luy" value={(dashboard?.cumulativeGpa ?? 0).toFixed(2)} icon={GraduationCap} tone="info" />
        <StatCard label="Tin chi" value={credits} icon={BookOpen} tone="success" />
        <StatCard label="Mon dang hoc" value={courseCount} icon={Layers} tone="info" />
        <StatCard label="Lich thi sap toi" value={dashboard?.upcomingExamCount ?? upcomingExams.length} icon={CalendarCheck} tone={upcomingExams.length > 0 ? "warning" : "success"} />
        <StatCard label="Hoc phi con no" value={formatVND(tuitionRemaining)} icon={Receipt} tone={tuitionRemaining > 0 ? "warning" : "success"} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Lich hoc hom nay - {dayLabels[today]}</h2>
          {todaySchedule.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Ban khong co lich hom nay.</p>
            : <ul className="mt-3 divide-y">{todaySchedule.map((item) => (
              <li key={item.enrollmentId} className="flex items-center justify-between py-3 text-sm">
                <div><div className="font-medium">{item.courseName}</div><div className="font-mono text-xs text-muted-foreground">{item.classCode} - Phong {item.room ?? "-"}</div></div>
                <span className="tabular-nums text-muted-foreground">Tiet {item.startPeriod}-{item.endPeriod}</span>
              </li>))}</ul>}
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Lich thi sap toi</h2>
          {nextExamsPanel.length === 0
            ? <p className="mt-4 text-sm text-muted-foreground">Khong co lich thi sap toi.</p>
            : <ul className="mt-3 divide-y">{nextExamsPanel.map((exam, i) => (
              <li key={i} className="flex items-center justify-between py-3 text-sm">
                <div><div className="font-medium">{exam.courseName}</div><div className="font-mono text-xs text-muted-foreground">Phong {exam.examRoom ?? "-"}</div></div>
                <span className="tabular-nums text-muted-foreground text-right">{formatExamDate(exam.examAt)}</span>
              </li>))}</ul>}
        </div>
      </div>
      <div className="mt-4 rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Tong quan hoc ky</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="flex flex-col"><span className="text-muted-foreground">Hoc ky</span><span className="font-medium">{currentSemester?.name ?? "-"}</span></div>
          <div className="flex flex-col"><span className="text-muted-foreground">So mon dang hoc</span><span className="font-medium tabular-nums">{courseCount}</span></div>
          <div className="flex flex-col"><span className="text-muted-foreground">Trang thai hoc phi</span><span className="font-medium">{dashboard?.tuitionStatus ?? "-"}</span></div>
          <div className="flex flex-col"><span className="text-muted-foreground">Dang ky hoc phan</span><span className="font-medium">{dashboard?.registrationStatus ?? "-"}</span></div>
        </div>
      </div>
    </div>
  );
}
