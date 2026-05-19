import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { students as initial, majors, getMajor, type Student } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EntityFormDialog } from "@/components/forms/EntityFormDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/students")({ component: StudentsPage });

const empty = { code: "", fullName: "", email: "", majorId: majors[0].id, cohort: "K2024" };

function StudentsPage() {
  const [data, setData] = useState<Student[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(empty);
  const [toDelete, setToDelete] = useState<Student | null>(null);

  const submit = () => {
    if (editing) {
      setData((d) => d.map((s) => s.id === editing.id ? { ...editing, ...form } : s));
      toast.success("Đã cập nhật sinh viên");
    } else {
      setData((d) => [{ id: `s${Date.now()}`, status: "ACTIVE", gpa: 0, cpa: 0, credits: 0, ...form }, ...d]);
      toast.success("Đã thêm sinh viên");
    }
    setEditing(null); setForm(empty);
  };

  return (
    <div>
      <PageHeader
        title="Sinh viên"
        description={`${data.length} sinh viên`}
        actions={<Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />Thêm sinh viên</Button>}
      />

      <DataTable
        data={data}
        rowKey={(s) => s.id}
        searchPlaceholder="Tìm theo mã, tên, email…"
        columns={[
          { key: "code", header: "Mã SV", render: (s) => <span className="font-mono text-xs">{s.code}</span> },
          { key: "fullName", header: "Họ tên", render: (s) => <span className="font-medium">{s.fullName}</span> },
          { key: "email", header: "Email", render: (s) => <span className="text-muted-foreground text-xs">{s.email}</span> },
          { key: "major", header: "Ngành", accessor: (s) => getMajor(s.majorId).name, render: (s) => getMajor(s.majorId).name },
          { key: "cohort", header: "Khóa" },
          { key: "status", header: "Trạng thái", render: (s) => <StatusBadge value={s.status} /> },
          { key: "actions", header: "", className: "w-24 text-right", searchable: false, render: (s) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(s); setForm({ code: s.code, fullName: s.fullName, email: s.email, majorId: s.majorId, cohort: s.cohort }); setOpen(true); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setToDelete(s)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )},
        ]}
      />

      <EntityFormDialog
        open={open} onOpenChange={setOpen}
        title={editing ? "Sửa sinh viên" : "Thêm sinh viên"}
        onSubmit={submit}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Mã SV</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Khóa</Label><Input value={form.cohort} onChange={(e) => setForm({ ...form, cohort: e.target.value })} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Họ tên</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Ngành</Label>
            <Select value={form.majorId} onValueChange={(v) => setForm({ ...form, majorId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{majors.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa sinh viên?"
        description={`Hành động này không thể hoàn tác. Sinh viên: ${toDelete?.fullName}`}
        destructive confirmText="Xóa"
        onConfirm={() => {
          if (toDelete) { setData((d) => d.filter((s) => s.id !== toDelete.id)); toast.success("Đã xóa sinh viên"); }
          setToDelete(null);
        }}
      />
    </div>
  );
}
