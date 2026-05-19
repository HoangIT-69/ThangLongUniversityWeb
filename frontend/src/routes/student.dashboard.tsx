import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { Award, BookOpen, GraduationCap, Receipt } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { studentApi } from "@/lib/api/student";

export const Route = createFileRoute("/student/dashboard")({ component: StudentDashboardPage });

const dayLabels: Record<number, string> = { 1: "Thu 2", 2: "Thu 3", 3: "Thu 4", 4: "Thu 5", 5: "Thu 6", 6: "Thu 7", 7: "CN" };

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function StudentDashboardPage() {
  const { profile, name } = useAuth();
  const semestersQuery = useQuery({ queryKey: ["student", "semesters"], queryFn: studentApi.listSemesters });
  const semesters = semestersQuery.data ?? [];
  const currentSemester = semesters.find((s) => s.registrationOpen) ?? semesters[0];
  const semesterId = currentSemester?.id;

  const gradesQuery = useQuery({
    queryKey: ["student", "grades", semesterId],
    queryFn: () => studentApi.getGrades(semesterId),
    enabled: semesterId != null,
  });
  const scheduleQuery = useQuery({
    queryKey: ["student", "schedule", semesterId],
    queryFn: () => studentApi.getSchedule(semesterId as number),
    enabled: semesterId != null,
  });
  const tuitionQuery = useQuery({
    queryKey: ["student", "tuition", semesterId],
    queryFn: () => studentApi.getTuition(semesterId as number),
    enabled: semesterId != null,
  });

  const today = new Date().getDay() || 7;
  const todaySchedule = (scheduleQuery.data ?? []).filter((item) => item.dayOfWeek === today).slice(0, 4);
  const credits = gradesQuery.data?.items.reduce((sum, item) => sum + (item.credits ?? 0), 0) ?? 0;
  const tuitionRemaining = tuitionQuery.data?.paid ? 0 : tuitionQuery.data?.totalAmount ?? 0;
  const displayName = profile?.fullName ?? name ?? "Sinh vien";

  return (
    <div>
      <PageHeader title={`Xin chao, ${displayName.split(" ").slice(-1)[0]}!`} description={profile?.code ? `Ma SV ${profile.code}` : currentSemester?.name} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="GPA hoc ky" value={(gradesQuery.data?.semesterGpa ?? 0).toFixed(2)} icon={Award} tone="primary" />
        <StatCard label="CPA tich luy" value={(gradesQuery.data?.cumulativeGpa ?? 0).toFixed(2)} icon={GraduationCap} tone="info" />
        <StatCard label="Tin chi co diem" value={credits} icon={BookOpen} tone="success" />
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
          <h2 className="text-sm font-semibold">Tong quan hoc ky</h2>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Hoc ky</span><span className="font-medium">{currentSemester?.name ?? "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">So mon co diem</span><span className="font-medium tabular-nums">{gradesQuery.data?.items.length ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Trang thai hoc phi</span><span className="font-medium">{tuitionQuery.data?.paid ? "Da thanh toan" : "Chua thanh toan"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
