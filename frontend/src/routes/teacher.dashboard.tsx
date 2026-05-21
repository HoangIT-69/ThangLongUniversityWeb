import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, GraduationCap, Layers, MessageSquare, NotebookPen } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { chatRooms } from "@/data/mock";
import {
  getDefaultTeacherSemesterId,
  getTeacherClassRows,
} from "@/features/teacher/teacherData";
import { teacherApi } from "@/lib/api/teacher";

export const Route = createFileRoute("/teacher/dashboard")({ component: TeacherDashboardPage });

function TeacherDashboardPage() {
  const semesterId = getDefaultTeacherSemesterId();
  const classesQuery = useQuery({
    queryKey: ["teacher", "classes", semesterId],
    queryFn: () => teacherApi.listMyClasses(semesterId),
    retry: false,
  });

  const rows = useMemo(
    () => getTeacherClassRows(classesQuery.isError ? undefined : classesQuery.data, semesterId),
    [classesQuery.data, classesQuery.isError, semesterId],
  );

  const today = new Date().getDay() || 7;
  const todayRows = rows.filter((row) => row.scheduleText.includes(`Thu ${today}`) || row.scheduleText.includes("Thu Hai"));
  const studentCount = rows.reduce((sum, row) => sum + row.currentSlots, 0);
  const pendingGradeCount = rows.filter((row) => row.gradeStatus !== "LOCKED").length;
  const unreadMessages = chatRooms.reduce((sum, room) => sum + room.unread, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bang dieu khien giang vien"
        description={
          classesQuery.isError
            ? "Chua co API dashboard summary, dang tong hop tu lop hoc phan va mock"
            : "Tong quan lop day, lich day va bang diem can xu ly"
        }
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link to="/teacher/grades">
              <NotebookPen className="h-4 w-4" />
              Nhap diem
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Lop dang day" value={rows.length} icon={Layers} tone="primary" />
        <StatCard label="Sinh vien" value={studentCount} icon={GraduationCap} tone="info" />
        <StatCard label="Bang diem can xu ly" value={pendingGradeCount} icon={NotebookPen} tone="warning" />
        <StatCard label="Tin nhan moi" value={unreadMessages} icon={MessageSquare} tone="success" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Lich day gan nhat</h2>
              <p className="text-xs text-muted-foreground">
                BE nen bo sung `/api/teacher/dashboard/summary` de tra lich hom nay chinh xac.
              </p>
            </div>
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
          </div>

          {todayRows.length === 0 ? (
            <p className="mt-5 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Hom nay chua co lich day trong du lieu hien tai.
            </p>
          ) : (
            <div className="mt-4 divide-y">
              {todayRows.slice(0, 5).map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <div className="font-medium">{row.courseName}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.classCode} - {row.roomText} - {row.scheduleText}
                    </div>
                  </div>
                  <StatusBadge value={row.status} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Viec can lam</h2>
          <div className="mt-4 space-y-3">
            {rows.slice(0, 5).map((row) => (
              <div key={row.id} className="rounded-lg border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{row.classCode}</div>
                  <StatusBadge value={row.gradeStatus} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{row.courseName}</div>
                <div className="mt-3 flex justify-end">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/teacher/classes/$classSectionId/students" params={{ classSectionId: row.id }}>
                      Xem lop
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
