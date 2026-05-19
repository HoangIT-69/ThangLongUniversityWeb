import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { teachers as initial, type Teacher } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export const Route = createFileRoute("/admin/teachers")({ component: TeachersPage });

function TeachersPage() {
  const [data, setData] = useState<Teacher[]>(initial);
  const [toDelete, setToDelete] = useState<Teacher | null>(null);

  return (
    <div>
      <PageHeader title="Giảng viên" description={`${data.length} giảng viên`} actions={
        <Button className="gap-2" onClick={() => toast.success("Mở dialog thêm giảng viên (demo)")}>
          <Plus className="h-4 w-4" />Thêm giảng viên
        </Button>
      } />
      <DataTable
        data={data}
        rowKey={(t) => t.id}
        searchPlaceholder="Tìm theo mã, tên, khoa…"
        columns={[
          { key: "code", header: "Mã GV", render: (t) => <span className="font-mono text-xs">{t.code}</span> },
          { key: "fullName", header: "Họ tên", render: (t) => <span className="font-medium">{t.fullName}</span> },
          { key: "email", header: "Email", render: (t) => <span className="text-xs text-muted-foreground">{t.email}</span> },
          { key: "department", header: "Khoa / Ngành" },
          { key: "activeClasses", header: "Lớp đang dạy", render: (t) => <span className="tabular-nums">{t.activeClasses}</span> },
          { key: "status", header: "Trạng thái", render: (t) => <StatusBadge value={t.status} /> },
          { key: "actions", header: "", className: "w-24 text-right", searchable: false, render: (t) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success(`Sửa giảng viên ${t.fullName} (demo)`)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setToDelete(t)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )},
        ]}
      />
      <ConfirmDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa giảng viên?" description={`Hành động không thể hoàn tác: ${toDelete?.fullName}`}
        destructive confirmText="Xóa"
        onConfirm={() => { if (toDelete) { setData((d) => d.filter((x) => x.id !== toDelete.id)); toast.success("Đã xóa giảng viên"); } setToDelete(null); }}
      />
    </div>
  );
}
