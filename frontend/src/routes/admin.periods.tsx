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
import type { PeriodResponse } from "@/lib/api/types";
import { Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/periods")({ component: PeriodsPage });

const periodSchema = z.object({
  periodNumber: z.coerce.number().min(1).max(12),
  startTime: z.string().min(1, "Bắt buộc"),
  endTime: z.string().min(1, "Bắt buộc"),
});
type PeriodFormData = z.infer<typeof periodSchema>;

function PeriodsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PeriodResponse | null>(null);
  const [toDelete, setToDelete] = useState<PeriodResponse | null>(null);

  const { data: periods, isPending, isError, error } = useQuery({
    queryKey: ["admin", "periods"],
    queryFn: adminApi.listPeriods,
  });

  const form = useForm<PeriodFormData>({
    resolver: zodResolver(periodSchema),
    defaultValues: { periodNumber: 1, startTime: "", endTime: "" },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "periods"] });

  const createMutation = useMutation({
    mutationFn: adminApi.createPeriod,
    onSuccess: () => { invalidate(); toast.success("Đã tạo tiết học"); closeForm(); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Tạo tiết thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PeriodFormData }) =>
      adminApi.updatePeriod(id, data),
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật tiết học"); closeForm(); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Cập nhật tiết thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deletePeriod(id),
    onSuccess: () => { invalidate(); toast.success("Đã xóa tiết học"); setToDelete(null); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Xóa tiết thất bại"),
  });

  const addLatePeriodsMutation = useMutation({
    mutationFn: async () => {
      const existing = new Set((periods ?? []).map((p) => p.periodNumber));
      const toAdd = [
        { periodNumber: 7, startTime: "15:00", endTime: "15:50" },
        { periodNumber: 8, startTime: "16:00", endTime: "16:50" },
      ].filter((p) => !existing.has(p.periodNumber));
      for (const p of toAdd) await adminApi.createPeriod(p);
      return toAdd.length;
    },
    onSuccess: (count) => {
      invalidate();
      toast.success(count > 0 ? `Đã thêm ${count} tiết học` : "Tiết 7 và 8 đã có sẵn");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Thêm tiết thất bại"),
  });

  function openCreate() {
    setEditing(null);
    form.reset({ periodNumber: 1, startTime: "", endTime: "" });
    setOpen(true);
  }

  function openEdit(period: PeriodResponse) {
    setEditing(period);
    form.reset({ periodNumber: period.periodNumber, startTime: period.startTime, endTime: period.endTime });
    setOpen(true);
  }

  function closeForm() { setOpen(false); setEditing(null); }

  function onSubmit(data: PeriodFormData) {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  }

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (isError)
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error.message}
      </div>
    );

  const rows = (periods ?? []).sort((a, b) => a.periodNumber - b.periodNumber);

  return (
    <div>
      <PageHeader
        title="Tiết học"
        description={`${rows.length} tiết`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => addLatePeriodsMutation.mutate()}
              disabled={addLatePeriodsMutation.isPending}
            >
              <Clock3 className="h-4 w-4" />
              Thêm tiết 7-8
            </Button>
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Thêm tiết
            </Button>
          </div>
        }
      />

      <DataTable
        data={rows}
        rowKey={(p) => String(p.id)}
        columns={[
          {
            key: "periodNumber",
            header: "Tiết",
            render: (p) => <span className="font-mono font-semibold">Tiết {p.periodNumber}</span>,
          },
          {
            key: "startTime",
            header: "Giờ bắt đầu",
            render: (p) => <span className="tabular-nums">{p.startTime}</span>,
          },
          {
            key: "endTime",
            header: "Giờ kết thúc",
            render: (p) => <span className="tabular-nums">{p.endTime}</span>,
          },
          {
            key: "actions",
            header: "",
            className: "w-24 text-right",
            searchable: false,
            render: (p) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                  onClick={() => setToDelete(p)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeForm(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa tiết học" : "Thêm tiết học"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="periodNumber" render={({ field }) => (
                <FormItem><FormLabel>Số thứ tự tiết (1-12)</FormLabel><FormControl><Input type="number" min={1} max={12} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="startTime" render={({ field }) => (
                <FormItem><FormLabel>Giờ bắt đầu</FormLabel><FormControl><Input placeholder="VD: 07:00" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="endTime" render={({ field }) => (
                <FormItem><FormLabel>Giờ kết thúc</FormLabel><FormControl><Input placeholder="VD: 07:50" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo tiết"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa tiết học?"
        description={`Tiết ${toDelete?.periodNumber} (${toDelete?.startTime} - ${toDelete?.endTime})`}
        destructive
        confirmText="Xóa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id); }}
      />
    </div>
  );
}
