import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { majors as fallbackMajors, type Major } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { adminApi } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/majors")({ component: MajorsPage });

function MajorsPage() {
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<Major | null>(null);

  const query = useQuery({
    queryKey: ["admin", "majors"],
    queryFn: adminApi.listMajors,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteMajor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "majors"] });
      toast.success("Da xoa nganh");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Xoa nganh that bai"),
  });

  const data = useMemo<Major[]>(() => {
    if (!query.data) return fallbackMajors;
    return query.data.map((m) => ({
      id: String(m.id),
      code: m.majorCode,
      name: m.name,
      students: 0,
      courses: 0,
    }));
  }, [query.data]);

  return (
    <div>
      <PageHeader
        title="Nganh hoc"
        description={query.isError ? `${data.length} nganh (fallback mock)` : `${data.length} nganh`}
        actions={
          <Button className="gap-2" onClick={() => toast.info("Form them/sua se noi API o buoc tiep theo")}>
            <Plus className="h-4 w-4" />Them nganh
          </Button>
        }
      />
      <DataTable
        data={data}
        rowKey={(m) => m.id}
        searchPlaceholder="Tim theo ma, ten nganh..."
        columns={[
          { key: "code", header: "Ma nganh", render: (m) => <span className="font-mono text-xs">{m.code}</span> },
          { key: "name", header: "Ten nganh", render: (m) => <span className="font-medium">{m.name}</span> },
          { key: "students", header: "Sinh vien", render: (m) => <span className="tabular-nums">{m.students.toLocaleString()}</span> },
          { key: "courses", header: "Mon hoc", render: (m) => <span className="tabular-nums">{m.courses}</span> },
          { key: "actions", header: "", className: "w-24 text-right", searchable: false, render: (m) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info(`Sua nganh ${m.name} se lam o buoc tiep theo`)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setToDelete(m)} disabled={query.isError}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )},
        ]}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xoa nganh?"
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
