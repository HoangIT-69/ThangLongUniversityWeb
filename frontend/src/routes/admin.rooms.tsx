import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { rooms as fallbackRooms, type Room } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { adminApi } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/rooms")({ component: RoomsPage });

function RoomsPage() {
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<Room | null>(null);

  const query = useQuery({
    queryKey: ["admin", "rooms"],
    queryFn: adminApi.listRooms,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rooms"] });
      toast.success("Da xoa phong");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Xoa phong that bai"),
  });

  const data = useMemo<Room[]>(() => {
    if (!query.data) return fallbackRooms;
    return query.data.map((r) => ({
      id: String(r.id),
      name: r.name,
      capacity: r.capacity,
      type: "LECTURE",
      status: "AVAILABLE",
    }));
  }, [query.data]);

  return (
    <div>
      <PageHeader
        title="Phong hoc"
        description={query.isError ? `${data.length} phong (fallback mock)` : `${data.length} phong`}
        actions={
          <Button className="gap-2" onClick={() => toast.info("Form them/sua se noi API o buoc tiep theo")}>
            <Plus className="h-4 w-4" />Them phong
          </Button>
        }
      />
      <DataTable
        data={data}
        rowKey={(r) => r.id}
        columns={[
          { key: "name", header: "Ten phong", render: (r) => <span className="font-mono font-medium">{r.name}</span> },
          { key: "capacity", header: "Suc chua", render: (r) => <span className="tabular-nums">{r.capacity}</span> },
          { key: "type", header: "Loai", render: (r) => <StatusBadge value={r.type} /> },
          { key: "status", header: "Trang thai", render: (r) => <StatusBadge value={r.status} /> },
          { key: "actions", header: "", className: "w-24 text-right", searchable: false, render: (r) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info(`Sua phong ${r.name} se lam o buoc tiep theo`)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setToDelete(r)} disabled={query.isError}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )},
        ]}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xoa phong?"
        description={toDelete?.name}
        destructive
        confirmText="Xoa"
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
