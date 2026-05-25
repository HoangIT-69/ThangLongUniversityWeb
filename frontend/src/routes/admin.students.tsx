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
import { StatusBadge } from "@/components/ui/status-badge";
import { adminApi } from "@/lib/api/admin";
import type { AdminStudentResponse, MajorResponse } from "@/lib/api/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/students")({ component: StudentsPage });

const studentSchema = z.object({
  username: z.string().min(3, "Tối thiểu 3 ký tự"),
  password: z.string().min(6, "Tối thiểu 6 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  studentCode: z.string().min(1, "Bắt buộc"),
  fullName: z.string().min(1, "Bắt buộc"),
  dob: z.string().optional(),
  phone: z.string().optional(),
  majorId: z.coerce.number().min(1, "Chọn ngành học"),
  academicYear: z.coerce.number().optional(),
  cohort: z.string().optional(),
  className: z.string().optional(),
  advisor: z.string().optional(),
  address: z.string().optional(),
  status: z.string().optional(),
});
type StudentFormData = z.infer<typeof studentSchema>;

function StudentsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminStudentResponse | null>(null);
  const [toDelete, setToDelete] = useState<AdminStudentResponse | null>(null);

  const { data: students, isPending, isError, error } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: adminApi.listStudents,
  });
  const { data: majors } = useQuery({
    queryKey: ["admin", "majors"],
    queryFn: adminApi.listMajors,
  });

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: { username: "", password: "", email: "", studentCode: "", fullName: "", majorId: 0 },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "students"] });

  const createMutation = useMutation({
    mutationFn: adminApi.createStudent,
    onSuccess: () => { invalidate(); toast.success("Đã tạo sinh viên"); closeForm(); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: StudentFormData }) =>
      adminApi.updateStudent(id, data),
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật sinh viên"); closeForm(); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteStudent(id),
    onSuccess: () => { invalidate(); toast.success("Đã xóa sinh viên"); setToDelete(null); },
    onError: (err) => toast.error(err.message),
  });

  function openCreate() {
    setEditing(null);
    form.reset({ username: "", password: "", email: "", studentCode: "", fullName: "", majorId: 0 });
    setOpen(true);
  }

  function openEdit(student: AdminStudentResponse) {
    setEditing(student);
    form.reset({
      username: student.username ?? "",
      password: "placeholder_not_used",
      email: student.email ?? "",
      studentCode: student.studentCode,
      fullName: student.fullName ?? "",
      dob: student.dob ?? undefined,
      phone: student.phone ?? undefined,
      majorId: student.majorId ?? 0,
      academicYear: student.academicYear ?? undefined,
      cohort: student.cohort ?? undefined,
      className: student.className ?? undefined,
      advisor: student.advisor ?? undefined,
      address: student.address ?? undefined,
      status: student.status ?? undefined,
    });
    setOpen(true);
  }

  function closeForm() { setOpen(false); setEditing(null); }

  function onSubmit(data: StudentFormData) {
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

  const rows = students ?? [];
  const majorList: MajorResponse[] = majors ?? [];

  return (
    <div>
      <PageHeader
        title="Sinh viên"
        description={`${rows.length} sinh viên`}
        actions={
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Thêm sinh viên
          </Button>
        }
      />

      <DataTable
        data={rows}
        rowKey={(s) => String(s.id)}
        pageSize={10}
        searchPlaceholder="Tìm theo mã, tên, email, ngành..."
        columns={[
          {
            key: "studentCode",
            header: "Mã SV",
            render: (s) => <span className="font-mono text-xs">{s.studentCode}</span>,
          },
          {
            key: "fullName",
            header: "Họ tên",
            render: (s) => (
              <div className="min-w-48">
                <div className="font-medium">{s.fullName ?? "—"}</div>
                <div className="text-xs text-muted-foreground">@{s.username ?? "—"}</div>
              </div>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (s) => <span className="text-xs text-muted-foreground">{s.email ?? "—"}</span>,
          },
          {
            key: "majorName",
            header: "Ngành",
            render: (s) => (
              <div>
                <div className="text-sm">{s.majorName ?? "—"}</div>
                <div className="text-xs text-muted-foreground">
                  {s.academicYear != null ? `${s.academicYear}-${s.academicYear + 4}` : ""}
                </div>
              </div>
            ),
          },
          {
            key: "cohort",
            header: "Khóa",
            render: (s) => <span>{s.cohort ?? "—"}</span>,
          },
          {
            key: "dob",
            header: "Ngày sinh",
            render: (s) => <span className="text-xs text-muted-foreground">{s.dob ?? "—"}</span>,
          },
          {
            key: "status",
            header: "Trạng thái",
            render: (s) => s.status ? <StatusBadge value={s.status} /> : <span>—</span>,
          },
          {
            key: "actions",
            header: "",
            className: "w-24 text-right",
            searchable: false,
            render: (s) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => openEdit(s)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                  onClick={() => setToDelete(s)}
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
            <DialogTitle>{editing ? "Sửa sinh viên" : "Thêm sinh viên"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>{editing ? "Mật khẩu (không đổi nếu để trống)" : "Mật khẩu"}</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="studentCode" render={({ field }) => (
                <FormItem><FormLabel>Mã sinh viên</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem className="sm:col-span-2"><FormLabel>Họ tên</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="majorId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngành học</FormLabel>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Chọn ngành" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {majorList.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="academicYear" render={({ field }) => (
                <FormItem><FormLabel>Năm nhập học</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem><FormLabel>Ngày sinh</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Điện thoại</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="cohort" render={({ field }) => (
                <FormItem><FormLabel>Khóa</FormLabel><FormControl><Input placeholder="VD: K2024" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="className" render={({ field }) => (
                <FormItem><FormLabel>Lớp</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="advisor" render={({ field }) => (
                <FormItem><FormLabel>Cố vấn học tập</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="sm:col-span-2"><FormLabel>Địa chỉ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo sinh viên"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa sinh viên?"
        description={`Hành động này không thể hoàn tác. Sinh viên: ${toDelete?.fullName ?? toDelete?.studentCode}`}
        destructive
        confirmText="Xóa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id); }}
      />
    </div>
  );
}
