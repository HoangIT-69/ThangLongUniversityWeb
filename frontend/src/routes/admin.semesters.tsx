import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { StatusBadge } from "@/components/ui/status-badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Plus, Power, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import type { SemesterResponse } from "@/lib/api/types";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/semesters")({ component: SemestersPage });

const semesterSchema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  startDate: z.string().min(1, "Bắt buộc"),
  endDate: z.string().min(1, "Bắt buộc"),
  registrationOpen: z.boolean(),
});
type SemesterFormData = z.infer<typeof semesterSchema>;

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function SemestersPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<SemesterResponse | null>(null);

  const { data: semesters, isPending, isError, error } = useQuery({
    queryKey: ["admin", "semesters"],
    queryFn: adminApi.listSemesters,
  });

  const form = useForm<SemesterFormData>({
    resolver: zodResolver(semesterSchema) as import("react-hook-form").Resolver<SemesterFormData>,
    defaultValues: { name: "", startDate: "", endDate: "", registrationOpen: false },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "semesters"] });
    queryClient.invalidateQueries({ queryKey: ["student", "semesters"] });
  };

  const createMutation = useMutation({
    mutationFn: adminApi.createSemester,
    onSuccess: () => { invalidate(); toast.success("Đã tạo học kỳ"); setOpen(false); form.reset(); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Tạo học kỳ thất bại"),
  });

  const toggleRegistrationMutation = useMutation({
    mutationFn: ({ semester, registrationOpen }: { semester: SemesterResponse; registrationOpen: boolean }) =>
      adminApi.updateSemester(semester.id, {
        name: semester.name,
        startDate: semester.startDate ?? "",
        endDate: semester.endDate ?? "",
        registrationOpen,
      }),
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật trạng thái đăng ký"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Không cập nhật được"),
  });

  const lockEnrollmentMutation = useMutation({
    mutationFn: (semesterId: number) => adminApi.lockEnrollmentSemester(semesterId),
    onSuccess: (msg) => { invalidate(); toast.success(msg || "Đã chốt đăng ký học phần"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Không chốt được"),
  });

  const lockRetakeMutation = useMutation({
    mutationFn: (semesterId: number) => adminApi.lockRetakeSemester(semesterId),
    onSuccess: (msg) => { invalidate(); toast.success(msg || "Đã chốt đăng ký thi lại"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Không chốt được"),
  });

  const lockGradesMutation = useMutation({
    mutationFn: (semesterId: number) => adminApi.lockSemesterGrades(semesterId),
    onSuccess: (msg) => { invalidate(); toast.success(msg || "Đã khóa điểm học kỳ"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Không khóa được điểm"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteSemester(id),
    onSuccess: () => { invalidate(); toast.success("Đã xóa học kỳ"); setToDelete(null); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Xóa học kỳ thất bại"),
  });

  if (isPending) return <Skeleton className="h-96 w-full" />;
  if (isError)
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error.message}
      </div>
    );

  const rows = semesters ?? [];

  return (
    <div>
      <PageHeader
        title="Học kỳ"
        description={`${rows.length} học kỳ`}
        actions={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Thêm học kỳ
          </Button>
        }
      />

      <DataTable
        data={rows}
        rowKey={(s) => String(s.id)}
        columns={[
          {
            key: "name",
            header: "Học kỳ",
            render: (s) => <span className="font-medium">{s.name}</span>,
          },
          {
            key: "range",
            header: "Thời gian",
            accessor: (s) => s.startDate ?? "",
            render: (s) => (
              <span className="text-sm">
                {formatDate(s.startDate)} – {formatDate(s.endDate)}
              </span>
            ),
          },
          {
            key: "registration",
            header: "Đăng ký",
            render: (s) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={s.registrationOpen}
                  disabled={s.locked || toggleRegistrationMutation.isPending}
                  onCheckedChange={(open) =>
                    toggleRegistrationMutation.mutate({ semester: s, registrationOpen: open })
                  }
                />
                <StatusBadge value={s.registrationOpen ? "OPEN" : "CLOSED"} />
              </div>
            ),
          },
          {
            key: "lock",
            header: "Khóa",
            render: (s) => <StatusBadge value={s.locked ? "LOCKED" : "UNLOCKED"} />,
          },
          {
            key: "actions",
            header: "",
            className: "min-w-[380px] text-right",
            searchable: false,
            render: (s) => {
              const locking = lockEnrollmentMutation.isPending && lockEnrollmentMutation.variables === s.id;
              const lockingRetake = lockRetakeMutation.isPending && lockRetakeMutation.variables === s.id;
              const lockingGrades = lockGradesMutation.isPending && lockGradesMutation.variables === s.id;
              return (
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline" size="sm" className="gap-1"
                    disabled={s.locked || lockEnrollmentMutation.isPending}
                    onClick={() => lockEnrollmentMutation.mutate(s.id)}
                  >
                    {locking ? <RotateCcw className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
                    Chốt học phần
                  </Button>
                  <Button
                    variant="outline" size="sm" className="gap-1"
                    disabled={lockRetakeMutation.isPending}
                    onClick={() => lockRetakeMutation.mutate(s.id)}
                  >
                    {lockingRetake ? <RotateCcw className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
                    Chốt thi lại
                  </Button>
                  <Button
                    variant="outline" size="sm" className="gap-1"
                    disabled={lockGradesMutation.isPending}
                    onClick={() => lockGradesMutation.mutate(s.id)}
                  >
                    {lockingGrades ? <RotateCcw className="h-3 w-3 animate-spin" /> : <Power className="h-3 w-3" />}
                    Khóa điểm
                  </Button>
                  <Button
                    variant="ghost" size="sm" className="text-destructive gap-1"
                    onClick={() => setToDelete(s)}
                  >
                    Xóa
                  </Button>
                </div>
              );
            },
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo học kỳ mới</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Tên học kỳ</FormLabel><FormControl><Input placeholder="VD: Học kỳ 1 (2025-2026)" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem><FormLabel>Ngày bắt đầu</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem><FormLabel>Ngày kết thúc</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Đang tạo..." : "Tạo học kỳ"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa học kỳ?"
        description={`Xóa học kỳ: ${toDelete?.name}`}
        destructive
        confirmText="Xóa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id); }}
      />
    </div>
  );
}
