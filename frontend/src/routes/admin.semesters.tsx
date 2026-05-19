import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { semesters as initial, formatDate, type Semester } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export const Route = createFileRoute("/admin/semesters")({ component: SemestersPage });

function SemestersPage() {
  const [data, setData] = useState<Semester[]>(initial);
  const [toDelete, setToDelete] = useState<Semester | null>(null);
  return (
    <div>
      <PageHeader title="Học kỳ" description={`${data.length} học kỳ`} actions={
        <Button className="gap-2" onClick={() => toast.success("Mở dialog thêm học kỳ (demo)")}><Plus className="h-4 w-4" />Thêm học kỳ</Button>
      } />
      <DataTable
        data={data}
        rowKey={(s) => s.id}
        columns={[
          { key: "name", header: "Học kỳ", render: (s) => <span className="font-medium">{s.name}</span> },
          { key: "range", header: "Thời gian học", accessor: (s) => s.startDate, render: (s) => <span className="text-sm">{formatDate(s.startDate)} → {formatDate(s.endDate)}</span> },
          { key: "reg", header: "Đăng ký môn", accessor: (s) => s.regStart, render: (s) => <span className="text-sm text-muted-foreground">{formatDate(s.regStart)} → {formatDate(s.regEnd)}</span> },
          { key: "status", header: "Trạng thái", render: (s) => <StatusBadge value={s.status} /> },
          { key: "actions", header: "", className: "w-24 text-right", searchable: false, render: (s) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success(`Sửa ${s.name} (demo)`)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setToDelete(s)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )},
        ]}
      />
      <ConfirmDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa học kỳ?" description={toDelete?.name} destructive confirmText="Xóa"
        onConfirm={() => { if (toDelete) { setData((d) => d.filter((x) => x.id !== toDelete.id)); toast.success("Đã xóa học kỳ"); } setToDelete(null); }}
      />
    </div>
  );
}
