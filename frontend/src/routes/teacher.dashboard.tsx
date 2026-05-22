import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { GraduationCap, Layers, NotebookPen, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { teacherApi } from "@/lib/api/teacher";

export const Route = createFileRoute("/teacher/dashboard")({ component: TeacherDashboardPage });

const dayLabels: Record<number, string> = { 1: "Thu 2", 2: "Thu 3", 3: "Thu 4", 4: "Thu 5", 5: "Thu 6", 6: "Thu 7", 7: "CN" };

function TeacherDashboardPage() {
  const { profile, name } = useAuth();
  const semestersQuery = useQuery({ queryKey: ["teacher", "semesters"], queryFn: teacherApi.listSemesters });
  const semesters = semestersQuery.data ?? [];
  const currentSemester = semesters.find((s) => s.registrationOpen) ?? semesters[0];
  const semesterId = currentSemester?.id;

  const classesQuery = useQuery({
    queryKey: ["teacher", "classes", semesterId],
    queryFn: () => teacherApi.getMyClasses(semesterId as number),
    enabled: semesterId != null,
  });

  const classes = classesQuery.data ?? [];
  const today = new Date().getDay() || 7;
  const todaySchedule = classes.flatMap((cs) =>
    cs.schedules
      .filter((s) => s.dayOfWeek === today)
      .map((s) => ({ cs, s })),
  );

  const totalStudents = classes.reduce((sum, c) => sum + (c.currentSlots ?? 0), 0);
  const ungradedCount = classes.filter((c) => !c.closed).length;
  const displayName = profile?.fullName ?? name ?? "Giang vien";

  return (
    <div>
      <PageHeader title={`Xin chao, ${displayName.split(" ").slice(-1)[0]}!`} description={profile?.code ? `Ma GV ${profile.code}` : currentSemester?.name} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Lop dang day" value={classes.length} icon={Layers} tone="primary" />
        <StatCard label="Tong sinh vien" value={totalStudents} icon={GraduationCap} tone="info" />
        <StatCard label="Lop chua khoa diem" value={ungradedCount} icon={NotebookPen} tone={ungradedCount > 0 ? "warning" : "success"} />
        <StatCard label="Hoc ky hien tai" value={currentSemester?.name ?? "-"} icon={Users} tone="info" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Lich day hom nay - {dayLabels[today]}</h2>
          {todaySchedule.length === 0
            ? <p className="mt-4 text-sm text-muted-foreground">Hom nay ban khong co lich day.</p>
            : <ul className="mt-3 divide-y">{todaySchedule.map((x, i) => (
              <li key={i} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{x.cs.courseName}</div>
                  <div className="font-mono text-xs text-muted-foreground">{x.cs.classCode} - Phong {x.cs.room ?? "-"}</div>
                </div>
                <span className="tabular-nums text-muted-foreground">Tiet {x.s.startPeriod}-{x.s.endPeriod}</span>
              </li>))}</ul>}
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Danh sach lop hoc phan</h2>
          {classes.length === 0
            ? <p className="mt-4 text-sm text-muted-foreground">Chua co lop nao trong hoc ky nay.</p>
            : <ul className="mt-3 divide-y">{classes.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{c.courseName}</div>
                  <div className="font-mono text-xs text-muted-foreground">{c.classCode}</div>
                </div>
                <span className="tabular-nums text-muted-foreground">{c.currentSlots ?? 0} SV</span>
              </li>))}</ul>}
        </div>
      </div>
    </div>
  );
}

