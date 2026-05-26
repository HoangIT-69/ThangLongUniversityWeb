import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Pencil, Plus, Power, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import type { SemesterRequest, StudentSemesterResponse } from "@/lib/api/types";

export const Route = createFileRoute("/admin/semesters")({ component: SemestersPage });

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

type FormState = {
  name: string;
  startDate: string;
  endDate: string;
  registrationOpen: boolean;
};

function emptyForm(): FormState {
  return { name: "", startDate: "", endDate: "", registrationOpen: false };
}

function semesterToForm(s: StudentSemesterResponse): FormState {
  return {
    name: s.name,
    startDate: s.startDate ?? "",
    endDate: s.endDate ?? "",
    registrationOpen: s.registrationOpen,
  };
}

function formToRequest(f: FormState): SemesterRequest {
  return {
    name: f.name,
    startDate: f.startDate || null,
    endDate: f.endDate || null,
    registrationOpen: f.registrationOpen,
  };
}

function SemestersPage() {
  const queryClient = useQueryClient();
  const semestersQuery = useQuery({
    queryKey: ["admin", "semesters"],
    queryFn: adminApi.listSemesters,
  });
  const semesters = semestersQuery.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StudentSemesterResponse | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<StudentSemesterResponse | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "semesters"] });
    queryClient.invalidateQueries({ queryKey: ["student", "semesters"] });
  };

  const createMutation = useMutation({
    mutationFn: (req: SemesterRequest) => adminApi.createSemester(req),
    onSuccess: () => { invalidate(); toast.success("Đã tạo học kỳ mới"); setFormOpen(false); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Lỗi khi tạo học kỳ"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: SemesterRequest }) =>
      adminApi.updateSemester(id, req),
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật học kỳ"); setFormOpen(false); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Lỗi khi cập nhật học kỳ"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteSemester(id),
    onSuccess: () => { invalidate(); toast.success("Đã xóa học kỳ"); setDeleteTarget(null); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Lỗi khi xóa học kỳ"),
  });

  const toggleRegistrationMutation = useMutation({
    mutationFn: ({ semester, registrationOpen }: { semester: StudentSemesterResponse; registrationOpen: boolean }) =>
      adminApi.updateSemester(semester.id, {
        name: semester.name,
        startDate: semester.startDate,
        endDate: semester.endDate,
        registrationOpen,
      }),
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật trạng thái đăng ký học phần"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Không cập nhật được học kỳ"),
  });

  const lockEnrollmentMutation = useMutation({
    mutationFn: (semesterId: number) => adminApi.lockEnrollmentSemester(semesterId),
    onSuccess: (message) => { invalidate(); toast.success(message || "Đã chốt đăng ký học phần"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Không chốt được đăng ký học phần"),
  });

  const lockRetakeMutation = useMutation({
    mutationFn: (semesterId: number) => adminApi.lockRetakeSemester(semesterId),
    onSuccess: (message) => { invalidate(); toast.success(message || "Đã chốt đăng ký thi lại"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Không chốt được đăng ký thi lại"),
  });

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm());
    setFormOpen(true);
  }

  function openEdit(s: StudentSemesterResponse) {
    setEditTarget(s);
    setForm(semesterToForm(s));
    setFormOpen(true);
  }

  function handleFormSubmit() {
    if (!form.name.trim()) { toast.error("Tên học kỳ không được đềEtrống"); return; }
    const req = formToRequest(form);
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, req });
    } else {
      createMutation.mutate(req);
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Học kỳ"
        description={`${semesters.length} học kỳ`}
        actions={<Button onClick={openCreate}><Plus className="mr-1 h-4 w-4" />Thêm học kỳ</Button>}
      />

      {semestersQuery.isError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {semestersQuery.error instanceof Error
            ? semestersQuery.error.message
            : "Không tải được danh sách học kỳ"}
        </div>
      )}

      <DataTable
        data={semesters}
        rowKey={(s) => String(s.id)}
        columns={[
          {
            key: "name",
            header: "Học kỳ",
            render: (s) => <span className="font-medium">{s.name}</span>,
          },
          {
            key: "range",
            header: "Thời gian học",
            accessor: (s) => s.startDate ?? "",
            render: (s) => (
              <span className="text-sm">
                {formatDate(s.startDate)} - {formatDate(s.endDate)}
              </span>
            ),
          },
          {
            key: "registration",
            header: "Đăng ký",
            render: (s) => <StatusBadge value={s.registrationOpen ? "OPEN" : "CLOSED"} />,
          },
          {
            key: "lock",
            header: "Khóa",
            render: (s) => <StatusBadge value={s.locked ? "LOCKED" : "UNLOCKED"} />,
          },
          {
            key: "actions",
            header: "",
            className: "min-w-[480px] text-right",
            searchable: false,
            render: (s) => {
              const toggling = toggleRegistrationMutation.isPending && toggleRegistrationMutation.variables?.semester.id === s.id;
              const lockingEnrollment = lockEnrollmentMutation.isPending && lockEnrollmentMutation.variables === s.id;
              const lockingRetake = lockRetakeMutation.isPending && lockRetakeMutation.variables === s.id;
              return (
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => openEdit(s)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    disabled={s.locked}
                    onClick={() => setDeleteTarget(s)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={s.locked || toggling}
                    onClick={() => toggleRegistrationMutation.mutate({ semester: s, registrationOpen: !s.registrationOpen })}
                  >
                    {s.registrationOpen ? <Power className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                    {s.registrationOpen ? "Đóng đăng ký" : "MềEđăng ký"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={lockingEnrollment}
                    onClick={() => lockEnrollmentMutation.mutate(s.id)}
                  >
                    <Lock className="h-4 w-4" />
                    Chốt học phần
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={lockingRetake}
                    onClick={() => lockRetakeMutation.mutate(s.id)}
                  >
                    <Lock className="h-4 w-4" />
                    Chốt thi lại
                  </Button>
                </div>
              );
            },
          },
        ]}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Sửa học kỳ" : "Thêm học kỳ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Tên học kỳ <span className="text-destructive">*</span></Label>
              <Input
                placeholder="VD: Học kỳ 1 2024-2025"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="regOpen"
                checked={form.registrationOpen}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, registrationOpen: !!checked }))}
              />
              <Label htmlFor="regOpen" className="cursor-pointer">MềEđăng ký học phần</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
            <Button onClick={handleFormSubmit} disabled={isMutating}>
              {editTarget ? "Lưu thay đổi" : "Tạo học kỳ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa học kỳ?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa học kỳ <strong>{deleteTarget?.name}</strong>? Hành động này không thềEhoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
