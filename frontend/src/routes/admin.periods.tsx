import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { periods as fallbackPeriods } from "@/data/mock";
import { adminApi } from "@/lib/api/admin";
import type { PeriodResponse } from "@/lib/api/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/periods")({ component: PeriodsPage });

type PeriodForm = {
  periodNumber: string;
  startTime: string;
  endTime: string;
};

type PeriodRow = {
  id: number | string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  fallback?: boolean;
};

const emptyForm: PeriodForm = {
  periodNumber: "",
  startTime: "",
  endTime: "",
};

function PeriodsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<PeriodRow | null>(null);
  const [toDelete, setToDelete] = useState<PeriodRow | null>(null);

  const query = useQuery({
    queryKey: ["admin", "periods"],
    queryFn: adminApi.listPeriods,
    retry: false,
  });

  const data = useMemo<PeriodRow[]>(() => {
    if (query.data?.length) {
      return query.data.map(mapApiPeriod).sort((a, b) => a.periodNumber - b.periodNumber);
    }
    return fallbackPeriods
      .map((period) => ({
        id: period.id,
        periodNumber: period.index,
        startTime: period.start,
        endTime: period.end,
        fallback: true,
      }))
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }, [query.data]);

  const createMutation = useMutation({
    mutationFn: (form: PeriodForm) => adminApi.createPeriod(toPeriodRequest(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "periods"] });
      setCreateOpen(false);
      toast.success("Da them tiet hoc");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Them tiet hoc that bai"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: number | string; form: PeriodForm }) =>
      adminApi.updatePeriod(id, toPeriodRequest(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "periods"] });
      setEditItem(null);
      toast.success("Da cap nhat tiet hoc");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Cap nhat tiet hoc that bai"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => adminApi.deletePeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "periods"] });
      toast.success("Da xoa tiet hoc");
      setToDelete(null);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Xoa tiet hoc that bai"),
  });

  const apiUnavailable = query.isError;

  return (
    <div>
      <PageHeader
        title="Tiet hoc"
        description={apiUnavailable ? `${data.length} tiet - dang hien du lieu mau` : `${data.length} tiet`}
      />

      <DataTable
        data={data}
        rowKey={(period) => String(period.id)}
        searchPlaceholder="Tim theo tiet, gio bat dau, gio ket thuc..."
        toolbar={
          <Button className="gap-2" onClick={() => setCreateOpen(true)} disabled={apiUnavailable}>
            <Plus className="h-4 w-4" />
            Them tiet hoc
          </Button>
        }
        columns={[
          {
            key: "periodNumber",
            header: "Tiet",
            render: (period) => <span className="font-mono font-semibold">Tiet {period.periodNumber}</span>,
          },
          {
            key: "startTime",
            header: "Gio bat dau",
            render: (period) => <span className="tabular-nums">{period.startTime}</span>,
          },
          {
            key: "endTime",
            header: "Gio ket thuc",
            render: (period) => <span className="tabular-nums">{period.endTime}</span>,
          },
          {
            key: "actions",
            header: "",
            className: "w-24 text-right",
            searchable: false,
            render: (period) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={period.fallback}
                  onClick={() => setEditItem(period)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  disabled={period.fallback}
                  onClick={() => setToDelete(period)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <PeriodFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Them tiet hoc"
        initial={emptyForm}
        submitting={createMutation.isPending}
        onSubmit={(form) => createMutation.mutate(form)}
      />

      <PeriodFormDialog
        open={!!editItem}
        onOpenChange={(value) => !value && setEditItem(null)}
        title={`Sua tiet ${editItem?.periodNumber ?? ""}`}
        initial={editItem ? toForm(editItem) : emptyForm}
        submitting={updateMutation.isPending}
        onSubmit={(form) => editItem && updateMutation.mutate({ id: editItem.id, form })}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(value) => !value && setToDelete(null)}
        title="Xoa tiet hoc?"
        description={toDelete ? `Tiet ${toDelete.periodNumber}` : undefined}
        destructive
        confirmText="Xoa"
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id);
        }}
      />
    </div>
  );
}

function PeriodFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  initial: PeriodForm;
  submitting: boolean;
  onSubmit: (form: PeriodForm) => void;
}) {
  const [form, setForm] = useState<PeriodForm>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [initial, open]);

  const periodNumber = Number(form.periodNumber);
  const canSubmit =
    Number.isInteger(periodNumber) &&
    periodNumber >= 1 &&
    periodNumber <= 12 &&
    isTimeValue(form.startTime) &&
    isTimeValue(form.endTime) &&
    form.startTime < form.endTime;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">So tiet</Label>
            <Input
              className="h-9 text-sm"
              type="number"
              min={1}
              max={12}
              value={form.periodNumber}
              placeholder="VD: 1"
              onChange={(event) => setForm((prev) => ({ ...prev, periodNumber: event.target.value }))}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Gio bat dau</Label>
              <Input
                className="h-9 text-sm"
                type="time"
                value={form.startTime}
                onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs">Gio ket thuc</Label>
              <Input
                className="h-9 text-sm"
                type="time"
                value={form.endTime}
                onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={submitting}>
            Huy
          </Button>
          <Button size="sm" disabled={submitting || !canSubmit} onClick={() => onSubmit(form)}>
            {submitting ? "Dang luu..." : "Luu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function mapApiPeriod(period: PeriodResponse): PeriodRow {
  return {
    id: period.id,
    periodNumber: period.periodNumber,
    startTime: normalizeTime(period.startTime),
    endTime: normalizeTime(period.endTime),
  };
}

function toForm(period: PeriodRow): PeriodForm {
  return {
    periodNumber: String(period.periodNumber),
    startTime: normalizeTime(period.startTime),
    endTime: normalizeTime(period.endTime),
  };
}

function toPeriodRequest(form: PeriodForm) {
  return {
    periodNumber: Number(form.periodNumber),
    startTime: form.startTime,
    endTime: form.endTime,
  };
}

function normalizeTime(value: string) {
  return value.length >= 5 ? value.slice(0, 5) : value;
}

function isTimeValue(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}
