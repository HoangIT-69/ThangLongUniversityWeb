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
import type { RoomResponse } from "@/lib/api/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rooms")({ component: RoomsPage });

const roomSchema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  capacity: z.coerce.number().min(1, "Sức chứa tối thiểu 1"),
});
type RoomFormData = z.infer<typeof roomSchema>;

function RoomsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomResponse | null>(null);
  const [toDelete, setToDelete] = useState<RoomResponse | null>(null);

  const { data: rooms, isPending, isError, error } = useQuery({
    queryKey: ["admin", "rooms"],
    queryFn: adminApi.listRooms,
  });

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: "", capacity: 30 },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "rooms"] });

  const createMutation = useMutation({
    mutationFn: adminApi.createRoom,
    onSuccess: () => { invalidate(); toast.success("Đã tạo phòng học"); closeForm(); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Tạo phòng thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoomFormData }) =>
      adminApi.updateRoom(id, data),
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật phòng học"); closeForm(); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Cập nhật phòng thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteRoom(id),
    onSuccess: () => { invalidate(); toast.success("Đã xóa phòng học"); setToDelete(null); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Xóa phòng thất bại"),
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", capacity: 30 });
    setOpen(true);
  }

  function openEdit(room: RoomResponse) {
    setEditing(room);
    form.reset({ name: room.name, capacity: room.capacity });
    setOpen(true);
  }

  function closeForm() { setOpen(false); setEditing(null); }

  function onSubmit(data: RoomFormData) {
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

  const rows = rooms ?? [];

  return (
    <div>
      <PageHeader
        title="Phòng học"
        description={`${rows.length} phòng`}
        actions={
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Thêm phòng
          </Button>
        }
      />

      <DataTable
        data={rows}
        rowKey={(r) => String(r.id)}
        searchPlaceholder="Tìm theo tên phòng..."
        columns={[
          {
            key: "name",
            header: "Tên phòng",
            render: (r) => <span className="font-mono font-medium">{r.name}</span>,
          },
          {
            key: "capacity",
            header: "Sức chứa",
            render: (r) => <span className="tabular-nums">{r.capacity}</span>,
          },
          {
            key: "actions",
            header: "",
            className: "w-24 text-right",
            searchable: false,
            render: (r) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                  onClick={() => setToDelete(r)}
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
            <DialogTitle>{editing ? "Sửa phòng học" : "Thêm phòng học"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Tên phòng</FormLabel><FormControl><Input placeholder="VD: A101, B203" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="capacity" render={({ field }) => (
                <FormItem><FormLabel>Sức chứa (chỗ ngồi)</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo phòng"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa phòng học?"
        description={toDelete?.name}
        destructive
        confirmText="Xóa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id); }}
      />
    </div>
  );
}
