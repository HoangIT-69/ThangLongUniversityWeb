import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/ui/page-header";
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
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import type { MajorResponse } from "@/lib/api/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/majors")({ component: MajorsPage });

const majorSchema = z.object({
  majorCode: z.string().min(1, "Bắt buộc"),
  name: z.string().min(1, "Bắt buộc"),
  description: z.string().optional(),
});
type MajorFormData = z.infer<typeof majorSchema>;

function MajorsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MajorResponse | null>(null);
  const [toDelete, setToDelete] = useState<MajorResponse | null>(null);

  const { data: majors, isPending, isError, error } = useQuery({
    queryKey: ["admin", "majors"],
    queryFn: adminApi.listMajors,
  });

  const form = useForm<MajorFormData>({
    resolver: zodResolver(majorSchema),
    defaultValues: { majorCode: "", name: "", description: "" },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "majors"] });

  const createMutation = useMutation({
    mutationFn: adminApi.createMajor,
    onSuccess: () => { invalidate(); toast.success("Đã tạo ngành học"); closeForm(); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MajorFormData }) =>
      adminApi.updateMajor(id, data),
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật ngành học"); closeForm(); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteMajor(id),
    onSuccess: () => { invalidate(); toast.success("Đã xóa ngành học"); setToDelete(null); },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Xóa ngành thất bại"),
  });

  function openCreate() {
    setEditing(null);
    form.reset({ majorCode: "", name: "", description: "" });
    setOpen(true);
  }

  function openEdit(major: MajorResponse) {
    setEditing(major);
    form.reset({
      majorCode: major.majorCode,
      name: major.name,
      description: major.description ?? "",
    });
    setOpen(true);
  }

  function closeForm() { setOpen(false); setEditing(null); }

  function onSubmit(data: MajorFormData) {
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

  const rows = majors ?? [];

  return (
    <div>
      <PageHeader
        title="Ngành học"
        description={`${rows.length} ngành`}
        actions={
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Thêm ngành
          </Button>
        }
      />

      <DataTable
        data={rows}
        rowKey={(m) => String(m.id)}
        searchPlaceholder="Tìm theo mã, tên ngành..."
        columns={[
          {
            key: "majorCode",
            header: "Mã ngành",
            render: (m) => <span className="font-mono text-xs">{m.majorCode}</span>,
          },
          {
            key: "name",
            header: "Tên ngành",
            render: (m) => <span className="font-medium">{m.name}</span>,
          },
          {
            key: "description",
            header: "Mô tả",
            render: (m) => (
              <span className="line-clamp-2 max-w-64 text-xs text-muted-foreground">
                {m.description ?? "—"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            className: "w-24 text-right",
            searchable: false,
            render: (m) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                  onClick={() => setToDelete(m)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa ngành học" : "Thêm ngành học"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="majorCode" render={({ field }) => (
                <FormItem><FormLabel>Mã ngành</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Tên ngành</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Mô tả</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo ngành"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa ngành học?"
        description={toDelete?.name}
        destructive
        confirmText="Xóa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id); }}
      />
    </div>
  );
}
