import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { classSections as initial, getCourse, getTeacher, getSemester, getRoom, dayLabels, type ClassSection } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export const Route = createFileRoute("/admin/class-sections")({ component: ClassSectionsPage });

function ClassSectionsPage() {
  const [data, setData] = useState<ClassSection[]>(initial);
  const [toDelete, setToDelete] = useState<ClassSection | null>(null);
  return (
    <div>
      <PageHeader title="Lớp học phần" description={`${data.length} lớp`} actions={
        <Button className="gap-2" onClick={() => toast.success("Mở dialog thêm lớp (demo)")}><Plus className="h-4 w-4" />Thêm lớp học phần</Button>
      } />
      <DataTable
        data={data}
        rowKey={(c) => c.id}
        pageSize={10}
        searchPlaceholder="Tìm theo mã lớp, môn, giảng viên…"
        columns={[
          { key: "code", header: "Mã lớp", render: (c) => <span className="font-mono text-xs font-medium">{c.code}</span> },
          { key: "course", header: "Môn học", accessor: (c) => getCourse(c.courseId).name, render: (c) => <span className="font-medium">{getCourse(c.courseId).name}</span> },
          { key: "teacher", header: "Giảng viên", accessor: (c) => getTeacher(c.teacherId).fullName, render: (c) => <span className="text-sm">{getTeacher(c.teacherId).fullName}</span> },
          { key: "sem", header: "Học kỳ", accessor: (c) => getSemester(c.semesterId).name, render: (c) => <span className="text-xs text-muted-foreground">{getSemester(c.semesterId).name}</span> },
          { key: "schedule", header: "Lịch học", render: (c) => (
            <div className="space-y-0.5 text-xs">
              {c.schedule.map((s, i) => (<div key={i}>{dayLabels[s.dayOfWeek]} · T{s.periods.join(",")} · {getRoom(s.roomId).name}</div>))}
            </div>
          )},
          { key: "size", header: "Sĩ số", render: (c) => <span className="tabular-nums">{c.enrolled}/{c.capacity}</span> },
          { key: "status", header: "Trạng thái", render: (c) => <StatusBadge value={c.status} /> },
          { key: "actions", header: "", className: "w-24 text-right", searchable: false, render: (c) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success(`Sửa lớp ${c.code} (demo)`)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setToDelete(c)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )},
        ]}
      />
      <ConfirmDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa lớp học phần?" description={toDelete?.code} destructive confirmText="Xóa"
        onConfirm={() => { if (toDelete) { setData((d) => d.filter((x) => x.id !== toDelete.id)); toast.success("Đã xóa lớp học phần"); } setToDelete(null); }}
      />
    </div>
  );
}
