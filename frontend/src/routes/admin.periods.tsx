import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { periods as fallbackPeriods, type Period } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { adminApi } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/periods")({ component: PeriodsPage });

function PeriodsPage() {
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<Period | null>(null);

  const query = useQuery({
    queryKey: ["admin", "periods"],
    queryFn: adminApi.listPeriods,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "periods"] });
      toast.success("Da xoa tiet");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Xoa tiet that bai"),
  });

  const data = useMemo<Period[]>(() => {
    if (!query.data) return fallbackPeriods;
    return query.data.map((p) => ({
      id: String(p.id),
      index: p.periodNumber,
      start: p.startTime,
      end: p.endTime,
    }));
  }, [query.data]);

  return (
    <div>
      <PageHeader
        title="Tiet hoc"
        description={query.isError ? `${data.length} tiet (fallback mock)` : `${data.length} tiet`}
        actions={
          <Button className="gap-2" onClick={() => toast.info("Form them/sua se noi API o buoc tiep theo")}>
            <Plus className="h-4 w-4" />Them tiet
          </Button>
        }
      />
      <DataTable
        data={data}
        rowKey={(p) => p.id}
        columns={[
          { key: "index", header: "Tiet", render: (p) => <span className="font-mono font-semibold">Tiet {p.index}</span> },
          { key: "start", header: "Gio bat dau", render: (p) => <span className="tabular-nums">{p.start}</span> },
          { key: "end", header: "Gio ket thuc", render: (p) => <span className="tabular-nums">{p.end}</span> },
          { key: "actions", header: "", className: "w-24 text-right", searchable: false, render: (p) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info(`Sua tiet ${p.index} se lam o buoc tiep theo`)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setToDelete(p)} disabled={query.isError}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )},
        ]}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xoa tiet?"
        description={`Tiet ${toDelete?.index}`}
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
