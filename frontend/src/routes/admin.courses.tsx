import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { courses as initial, getMajor, formatVND, type Course } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export const Route = createFileRoute("/admin/courses")({ component: CoursesPage });

function CoursesPage() {
  const [data, setData] = useState<Course[]>(initial);
  const [toDelete, setToDelete] = useState<Course | null>(null);
  return (
    <div>
      <PageHeader title="Môn học" description={`${data.length} môn`} actions={
        <Button className="gap-2" onClick={() => toast.success("Mở dialog thêm môn (demo)")}><Plus className="h-4 w-4" />Thêm môn</Button>
      } />
      <DataTable
        data={data}
        rowKey={(c) => c.id}
        pageSize={10}
        searchPlaceholder="Tìm theo mã, tên môn…"
        columns={[
          { key: "code", header: "Mã môn", render: (c) => <span className="font-mono text-xs">{c.code}</span> },
          { key: "name", header: "Tên môn", render: (c) => <span className="font-medium">{c.name}</span> },
          { key: "credits", header: "Tín chỉ", render: (c) => <span className="tabular-nums">{c.credits}</span> },
          { key: "major", header: "Ngành", accessor: (c) => getMajor(c.majorId).name, render: (c) => <span className="text-sm">{getMajor(c.majorId).name}</span> },
          { key: "fee", header: "Học phí / TC", render: (c) => <span className="tabular-nums">{formatVND(c.feePerCredit)}</span> },
          { key: "actions", header: "", className: "w-24 text-right", searchable: false, render: (c) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success(`Sửa môn ${c.name} (demo)`)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setToDelete(c)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )},
        ]}
      />
      <ConfirmDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa môn học?" description={toDelete?.name} destructive confirmText="Xóa"
        onConfirm={() => { if (toDelete) { setData((d) => d.filter((x) => x.id !== toDelete.id)); toast.success("Đã xóa môn học"); } setToDelete(null); }}
      />
    </div>
  );
}
