import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { students, teachers, courses, classSections, enrollments, tuitionInvoices, semesters, formatDateTime, getStudent, getClassSection, getCourse } from "@/data/mock";
import { Users, GraduationCap, BookOpen, Layers, ClipboardList, Receipt } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboard });

function AdminDashboard() {
  const pending = enrollments.filter((e) => e.status === "PENDING").length;
  const unpaid = tuitionInvoices.filter((i) => i.status !== "PAID").length;
  const recent = enrollments.slice(0, 6);
  const currentSem = semesters.find((s) => s.status === "OPEN")!;

  return (
    <div>
      <PageHeader
        title="Tổng quan hệ thống"
        description={`Học kỳ hiện tại: ${currentSem.name}`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Sinh viên" value={students.length.toLocaleString()} icon={GraduationCap} tone="primary" hint="Đang hoạt động" />
        <StatCard label="Giảng viên" value={teachers.length} icon={Users} tone="info" />
        <StatCard label="Môn học" value={courses.length} icon={BookOpen} tone="success" />
        <StatCard label="Lớp học phần" value={classSections.length} icon={Layers} tone="warning" hint={`${classSections.filter((c) => c.status === "OPEN").length} đang mở`} />
        <StatCard label="Đăng ký chờ" value={pending} icon={ClipboardList} tone="warning" />
        <StatCard label="Hóa đơn chưa TT" value={unpaid} icon={Receipt} tone="destructive" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Đăng ký gần đây</h2>
            <span className="text-xs text-muted-foreground">{recent.length} mục</span>
          </div>
          <ul className="divide-y">
            {recent.map((e) => {
              const s = getStudent(e.studentId);
              const cs = getClassSection(e.classSectionId);
              const c = getCourse(cs.courseId);
              return (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{s.fullName} <span className="text-muted-foreground">— {s.code}</span></div>
                    <div className="truncate text-xs text-muted-foreground">{c.code} · {c.name} · {cs.code}</div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="hidden md:inline">{formatDateTime(e.enrolledAt)}</span>
                    <StatusBadge value={e.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Phân bổ theo học kỳ</h2>
          <ul className="space-y-3">
            {semesters.map((s) => {
              const enr = enrollments.filter((e) => e.semesterId === s.id).length;
              const pct = Math.min(100, enr * 10);
              return (
                <li key={s.id}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground">{enr} đăng ký</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
