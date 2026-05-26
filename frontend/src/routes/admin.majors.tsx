import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { majors as fallbackMajors, type Major } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { adminApi } from "@/lib/api/admin";
import type { MajorResponse } from "@/lib/api/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/majors")({ component: MajorsPage });

type MajorForm = { majorCode: string; name: string; description: string; departmentId: string };
type MajorRow = Major & { description?: string | null; departmentName?: string | null };
const emptyForm: MajorForm = { majorCode: "", name: "", description: "", departmentId: "" };

function MajorFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  departments,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  initial: MajorForm;
  departments: { id: number; name: string }[];
  onSubmit: (form: MajorForm) => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<MajorForm>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [initial, open]);

  const set = (key: keyof MajorForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Ma nganh</Label>
            <Input
              className="h-8 text-xs"
              placeholder="VD: CNTT"
              value={form.majorCode}
              onChange={(event) => set("majorCode", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Ten nganh</Label>
            <Input
              className="h-8 text-xs"
              placeholder="VD: Cong nghe thong tin"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Mo ta</Label>
            <Input
              className="h-8 text-xs"
              placeholder="Mo ta ngan"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Khoa / Bo mon</Label>
            <Select
              value={form.departmentId || "__none"}
              onValueChange={(value) => set("departmentId", value === "__none" ? "" : value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Chon khoa..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Chua chon</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={String(department.id)}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={submitting}>
            Huy
          </Button>
          <Button
            size="sm"
            disabled={submitting || !form.majorCode.trim() || !form.name.trim()}
            onClick={() => onSubmit(form)}
          >
            {submitting ? "Dang luu..." : "Luu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MajorsPage() {
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<Major | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<MajorResponse | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const query = useQuery({
    queryKey: ["admin", "majors"],
    queryFn: adminApi.listMajors,
  });
  const departmentsQuery = useQuery({
    queryKey: ["admin", "departments"],
    queryFn: adminApi.listDepartments,
  });

  const createMutation = useMutation({
    mutationFn: (form: MajorForm) =>
      adminApi.createMajor({
        majorCode: form.majorCode.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "majors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      setCreateOpen(false);
      toast.success("Da tao nganh");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Tao nganh that bai"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: number; form: MajorForm }) =>
      adminApi.updateMajor(id, {
        majorCode: form.majorCode.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "majors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      setEditItem(null);
      toast.success("Da cap nhat nganh");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Cap nhat nganh that bai"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteMajor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "majors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      toast.success("Da xoa nganh");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Xoa nganh that bai"),
  });

  const data = useMemo<MajorRow[]>(() => {
    if (!query.data) return fallbackMajors.map((major) => ({ ...major, description: null, departmentName: null }));
    return query.data.map((m) => ({
      id: String(m.id),
      code: m.majorCode,
      name: m.name,
      description: m.description ?? null,
      departmentName: m.departmentName ?? null,
      students: m.studentCount ?? 0,
      courses: m.courseCount ?? 0,
    }));
  }, [query.data]);

  const departments = departmentsQuery.data ?? [];
  const filteredData = useMemo(() => {
    return data.filter((major) => departmentFilter === "all" || major.departmentName === departmentFilter);
  }, [data, departmentFilter]);

  return (
    <div>
      <PageHeader
        title="Nganh hoc"
        description={query.isError ? `${filteredData.length} / ${data.length} nganh (fallback mock)` : `${filteredData.length} / ${data.length} nganh`}
      />
      <DataTable
        data={filteredData}
        rowKey={(m) => m.id}
        searchPlaceholder="Tim theo ma, ten nganh..."
        searchSlot={
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-10 w-full sm:w-44">
              <SelectValue placeholder="Tat ca khoa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca khoa</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.name}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        toolbar={
          <Button className="gap-2" onClick={() => setCreateOpen(true)} disabled={query.isError}>
            <Plus className="h-4 w-4" />
            Them nganh
          </Button>
        }
        columns={[
          { key: "code", header: "Ma nganh", render: (m) => <span className="font-mono text-xs">{m.code}</span> },
          { key: "name", header: "Ten nganh", render: (m) => <span className="font-medium">{m.name}</span> },
          { key: "departmentName", header: "Khoa", render: (m) => <span className="text-xs">{m.departmentName || "-"}</span> },
          {
            key: "description",
            header: "Mo ta",
            render: (m) => <span className="text-xs text-muted-foreground">{m.description || "-"}</span>,
          },
          { key: "students", header: "Sinh vien", render: (m) => <span className="tabular-nums">{m.students.toLocaleString()}</span> },
          { key: "courses", header: "Mon hoc", render: (m) => <span className="tabular-nums">{m.courses}</span> },
          { key: "actions", header: "", className: "w-24 text-right", searchable: false, render: (m) => (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditItem(query.data?.find((item) => String(item.id) === m.id) ?? null)}
                disabled={query.isError}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setToDelete(m)} disabled={query.isError}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )},
        ]}
      />
      <MajorFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Them nganh moi"
        initial={emptyForm}
        departments={departments}
        onSubmit={(form) => createMutation.mutate(form)}
        submitting={createMutation.isPending}
      />
      <MajorFormDialog
        open={!!editItem}
        onOpenChange={(v) => !v && setEditItem(null)}
        title={`Sua nganh ${editItem?.name ?? ""}`}
        initial={
          editItem
            ? {
                majorCode: editItem.majorCode,
                name: editItem.name,
                description: editItem.description ?? "",
                departmentId: editItem.departmentId ? String(editItem.departmentId) : "",
              }
            : emptyForm
        }
        departments={departments}
        onSubmit={(form) => editItem && updateMutation.mutate({ id: editItem.id, form })}
        submitting={updateMutation.isPending}
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
