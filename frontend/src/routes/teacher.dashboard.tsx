import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { classSections, students, enrollments, chatRooms, getCourse, getRoom, dayLabels } from "@/data/mock";
import { Layers, GraduationCap, NotebookPen, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/teacher/dashboard")({ component: () => {
  const myClasses = classSections.slice(0, 4);
  const today = new Date().getDay() || 7;
  const todaySchedule = myClasses.flatMap((cs) => cs.schedule.filter((s) => s.dayOfWeek === today).map((s) => ({ cs, s })));
  return (
    <div>
      <PageHeader title="Bảng điều khiển giảng viên" description="Tổng quan lớp dạy của bạn" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Lớp đang dạy" value={myClasses.length} icon={Layers} tone="primary" />
        <StatCard label="Sinh viên" value={students.length} icon={GraduationCap} tone="info" />
        <StatCard label="Chưa nhập điểm" value={2} icon={NotebookPen} tone="warning" />
        <StatCard label="Tin nhắn mới" value={chatRooms.reduce((s,r)=>s+r.unread,0)} icon={MessageSquare} tone="success" />
      </div>
      <div className="mt-6 rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Lịch dạy hôm nay — {dayLabels[today]}</h2>
        {todaySchedule.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Hôm nay bạn không có lịch dạy.</p>
          : <ul className="mt-4 divide-y">{todaySchedule.map((x, i) => (
            <li key={i} className="flex items-center justify-between py-3">
              <div><div className="font-medium">{getCourse(x.cs.courseId).name}</div><div className="text-xs text-muted-foreground font-mono">{x.cs.code} · Phòng {getRoom(x.s.roomId).name}</div></div>
              <span className="text-sm tabular-nums text-muted-foreground">Tiết {x.s.periods.join(", ")}</span>
            </li>))}</ul>}
      </div>
      <div className="mt-4 text-xs text-muted-foreground">{enrollments.length} đăng ký môn được ghi nhận.</div>
    </div>
  );
}});
