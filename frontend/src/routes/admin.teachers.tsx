import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import type { AdminTeacherResponse } from "@/lib/api/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/teachers")({ component: TeachersPage });

const teacherSchema = z.object({
  username: z.string().min(3, "Tối thiểu 3 ký tự"),
  password: z.string().min(6, "Tối thiểu 6 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  teacherCode: z.string().min(1, "Bắt buộc"),
  fullName: z.string().min(1, "Bắt buộc"),
  dob: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  degree: z.string().optional(),
  address: z.string().optional(),
});
type TeacherFormData = z.infer<typeof teacherSchema>;

function TeachersPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTeacherResponse | null>(null);
  const [toDelete, setToDelete] = useState<AdminTeacherResponse | null>(null);

  const { data: teachers, isPending, isError, error } = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: adminApi.listTeachers,
  });

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { username: "", password: "", email: "", teacherCode: "", fullName: "" },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });

  const createMutation = useMutation({
    mutationFn: adminApi.createTeacher,
    onSuccess: () => { invalidate(); toast.success("Đã tạo giảng viên"); closeForm(); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TeacherFormData }) =>
      adminApi.updateTeacher(id, data),
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật giảng viên"); closeForm(); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteTeacher(id),
    onSuccess: () => { invalidate(); toast.success("Đã xóa giảng viên"); setToDelete(null); },
    onError: (err) => toast.error(err.message),
  });

  function openCreate() {
    setEditing(null);
    form.reset({ username: "", password: "", email: "", teacherCode: "", fullName: "" });
    setOpen(true);
  }

  function openEdit(teacher: AdminTeacherResponse) {
    setEditing(teacher);
    form.reset({
      username: "",
      password: "placeholder_not_used",
      email: "",
      teacherCode: teacher.teacherCode,
      fullName: teacher.fullName ?? "",
      dob: teacher.dob ?? undefined,
      phone: teacher.phone ?? undefined,
      department: teacher.department ?? undefined,
      degree: teacher.degree ?? undefined,
      address: teacher.address ?? undefined,
    });
    setOpen(true);
  }

  function closeForm() { setOpen(false); setEditing(null); }

  function onSubmit(data: TeacherFormData) {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  }

  if (isPending) return <Skeleton className="h-96 w-full" />;
  if (isError)
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error.message}
      </div>
    );

  const rows = teachers ?? [];

  return (
    <div>
      <PageHeader
        title="Giảng viên"
        description={`${rows.length} giảng viên`}
        actions={
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Thêm giảng viên
          </Button>
        }
      />

      <DataTable
        data={rows}
        rowKey={(t) => String(t.id)}
        searchPlaceholder="Tìm theo mã, tên, khoa, học vị..."
        columns={[
          {
            key: "teacherCode",
            header: "Mã GV",
            render: (t) => <span className="font-mono text-xs">{t.teacherCode}</span>,
          },
          {
            key: "fullName",
            header: "Họ tên",
            render: (t) => (
              <div className="min-w-48">
                <div className="font-medium">{t.fullName ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{t.degree ?? "—"}</div>
              </div>
            ),
          },
          { key: "department", header: "Khoa / Bộ môn", render: (t) => <span>{t.department ?? "—"}</span> },
          {
            key: "contact",
            header: "Liên hệ",
            accessor: (t) => `${t.phone ?? ""} ${t.address ?? ""}`,
            render: (t) => (
              <div className="max-w-56 text-xs text-muted-foreground">
                <div>{t.phone ?? "—"}</div>
                <div className="truncate">{t.address ?? "—"}</div>
              </div>
            ),
          },
          {
            key: "dob",
            header: "Ngày sinh",
            render: (t) => <span className="text-xs text-muted-foreground">{t.dob ?? "—"}</span>,
          },
          {
            key: "actions",
            header: "",
            className: "w-24 text-right",
            searchable: false,
            render: (t) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                  onClick={() => setToDelete(t)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeForm(); }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa giảng viên" : "Thêm giảng viên"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2">
              {!editing && (
                <>
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Mật khẩu</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </>
              )}
              <FormField control={form.control} name="teacherCode" render={({ field }) => (
                <FormItem><FormLabel>Mã giảng viên</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem className="sm:col-span-2"><FormLabel>Họ tên</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem><FormLabel>Khoa / Bộ môn</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="degree" render={({ field }) => (
                <FormItem><FormLabel>Học vị</FormLabel><FormControl><Input placeholder="VD: Tiến sĩ, Thạc sĩ" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem><FormLabel>Ngày sinh</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Điện thoại</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="sm:col-span-2"><FormLabel>Địa chỉ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo giảng viên"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa giảng viên?"
        description={`Hành động này không thể hoàn tác: ${toDelete?.fullName ?? toDelete?.teacherCode}`}
        destructive
        confirmText="Xóa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id); }}
      />
    </div>
  );
}
