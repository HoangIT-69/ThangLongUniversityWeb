import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Pencil, Plus, Trash2, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { adminApi } from "@/lib/api/admin";
import type {
  AdminStudentResponse,
  AdminTeacherResponse,
  HomeroomResponse,
  MajorResponse,
} from "@/lib/api/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/homerooms")({ component: HomeroomsPage });

type HomeroomForm = {
  className: string;
  majorId: string;
  academicYear: string;
  cohort: string;
};

const emptyForm: HomeroomForm = {
  className: "",
  majorId: "",
  academicYear: "",
  cohort: "",
};

const none = "__none";
const all = "__all";

function toForm(h: HomeroomResponse): HomeroomForm {
  return {
    className: h.className,
    majorId: h.majorId != null ? String(h.majorId) : "",
    academicYear: h.academicYear != null ? String(h.academicYear) : "",
    cohort: h.cohort ?? "",
  };
}

function toHomeroomPayload(form: HomeroomForm, advisorId?: number | null) {
  return {
    className: form.className.trim(),
    advisorId: advisorId ?? null,
    majorId: form.majorId ? Number(form.majorId) : null,
    academicYear: form.academicYear ? Number(form.academicYear) : null,
    cohort: form.cohort.trim() || undefined,
  };
}

function academicRange(year?: number | null) {
  return year ? `${year}-${year + 4}` : "-";
}

function teacherMatchesMajor(teacher: AdminTeacherResponse, major?: MajorResponse) {
  if (!major?.departmentId) return true;
  return teacher.departmentId === major.departmentId;
}

function HomeroomFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  initial: HomeroomForm;
  onSubmit: (form: HomeroomForm) => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<HomeroomForm>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [initial, open]);

  const majorsQuery = useQuery({
    queryKey: ["admin", "majors"],
    queryFn: adminApi.listMajors,
    enabled: open,
  });

  const set = (key: keyof HomeroomForm, value: string) => {
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
            <Label className="text-xs">Ten lop</Label>
            <Input
              className="h-8 text-xs"
              placeholder="VD: CNTT-K36A"
              value={form.className}
              onChange={(e) => set("className", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-xs">Nganh</Label>
            <Select value={form.majorId || none} onValueChange={(value) => set("majorId", value === none ? "" : value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Chon nganh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={none}>Chua chon</SelectItem>
                {(majorsQuery.data ?? []).map((major) => (
                  <SelectItem key={major.id} value={String(major.id)}>
                    {major.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <Label className="text-xs">Nam bat dau</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                placeholder="VD: 2024"
                value={form.academicYear}
                onChange={(e) => set("academicYear", e.target.value)}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <Label className="text-xs">Khoa</Label>
              <Input
                className="h-8 text-xs"
                placeholder="VD: K36"
                value={form.cohort}
                onChange={(e) => set("cohort", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={submitting}>
            Huy
          </Button>
          <Button
            size="sm"
            disabled={submitting || !form.className.trim() || !form.majorId}
            onClick={() => onSubmit(form)}
          >
            {submitting ? "Dang luu..." : "Luu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddStudentsDialog({
  open,
  onOpenChange,
  homeroom,
  existingStudentIds,
  majors,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  homeroom: HomeroomResponse;
  existingStudentIds: Set<number>;
  majors: MajorResponse[];
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [advisorId, setAdvisorId] = useState(homeroom.advisorId != null ? String(homeroom.advisorId) : "");

  useEffect(() => {
    if (open) {
      setSelected(new Set());
      setSearch("");
      setAdvisorId(homeroom.advisorId != null ? String(homeroom.advisorId) : "");
    }
  }, [homeroom.advisorId, open]);

  const studentsQuery = useQuery({
    queryKey: ["admin", "students"],
    queryFn: adminApi.listStudents,
    enabled: open,
  });

  const teachersQuery = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: adminApi.listTeachers,
    enabled: open,
  });

  const major = majors.find((item) => item.id === homeroom.majorId);
  const advisorOptions = (teachersQuery.data ?? []).filter((teacher) => teacherMatchesMajor(teacher, major));

  const addMutation = useMutation({
    mutationFn: () => adminApi.addStudentsToHomeroom(homeroom.id, { studentIds: Array.from(selected) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homerooms", homeroom.id, "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "homerooms"] });
      setSelected(new Set());
      toast.success("Da them sinh vien vao lop");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Them sinh vien that bai"),
  });

  const advisorMutation = useMutation({
    mutationFn: () =>
      adminApi.updateHomeroom(homeroom.id, {
        className: homeroom.className,
        advisorId: advisorId ? Number(advisorId) : null,
        majorId: homeroom.majorId ?? null,
        academicYear: homeroom.academicYear ?? null,
        cohort: homeroom.cohort ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homerooms"] });
      toast.success("Da cap nhat co van");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Cap nhat co van that bai"),
  });

  const available = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (studentsQuery.data ?? []).filter((student) => {
      const sameMajor = homeroom.majorId == null || student.majorId === homeroom.majorId;
      const matchedSearch =
        !term ||
        student.fullName.toLowerCase().includes(term) ||
        student.studentCode.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term);
      return !existingStudentIds.has(student.id) && sameMajor && matchedSearch;
    });
  }, [existingStudentIds, homeroom.majorId, search, studentsQuery.data]);

  const visible = available.slice(0, 80);
  const visibleIds = visible.map((student) => student.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Them sinh vien</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <section className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Co van hoc tap</Label>
              <Select value={advisorId || none} onValueChange={(value) => setAdvisorId(value === none ? "" : value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Chon co van" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={none}>Chua chon</SelectItem>
                  {advisorOptions.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.fullName} ({teacher.teacherCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => advisorMutation.mutate()}
              disabled={advisorMutation.isPending}
            >
              Luu co van
            </Button>
          </section>

          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                className="h-8 text-xs"
                placeholder="Tim theo ten, ma SV, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={toggleVisible}
                disabled={visibleIds.length === 0}
              >
                {allVisibleSelected ? "Bo chon tat ca" : "Chon tat ca"}
              </Button>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-md border">
              {studentsQuery.isLoading ? (
                <p className="p-3 text-center text-xs text-muted-foreground">Dang tai...</p>
              ) : visible.length === 0 ? (
                <p className="p-3 text-center text-xs text-muted-foreground">
                  Khong co sinh vien cung nganh de them
                </p>
              ) : (
                <div className="divide-y">
                  {visible.map((student) => (
                    <label
                      key={student.id}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(student.id)}
                        onChange={() => toggle(student.id)}
                        className="rounded"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">{student.fullName}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {student.studentCode} - {student.email} - {student.majorName ?? "-"}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Da chon {selected.size} sinh vien. Danh sach chi hien sinh vien cung nganh voi lop.
            </p>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={addMutation.isPending}>
            Dong
          </Button>
          <Button
            size="sm"
            disabled={addMutation.isPending || selected.size === 0}
            onClick={() => addMutation.mutate()}
          >
            {addMutation.isPending ? "Dang them..." : `Them ${selected.size} SV`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HomeroomDetailSheet({
  homeroom,
  open,
  onClose,
  majors,
}: {
  homeroom: HomeroomResponse | null;
  open: boolean;
  onClose: () => void;
  majors: MajorResponse[];
}) {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [toRemove, setToRemove] = useState<AdminStudentResponse | null>(null);

  const studentsQuery = useQuery({
    queryKey: ["admin", "homerooms", homeroom?.id, "students"],
    queryFn: () => adminApi.listHomeroomStudents(homeroom!.id),
    enabled: open && homeroom != null,
  });

  const removeMutation = useMutation({
    mutationFn: (studentId: number) => adminApi.removeStudentFromHomeroom(homeroom!.id, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homerooms", homeroom?.id, "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "homerooms"] });
      setToRemove(null);
      toast.success("Da go sinh vien khoi lop");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Go sinh vien that bai"),
  });

  const students = studentsQuery.data ?? [];
  const existingIds = useMemo(() => new Set(students.map((student) => student.id)), [students]);

  if (!homeroom) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base">{homeroom.className}</SheetTitle>
            <p className="text-xs text-muted-foreground">
              {homeroom.majorName ?? "-"} - Khoa {homeroom.cohort ?? "-"} - {academicRange(homeroom.academicYear)}
            </p>
          </SheetHeader>

          <div className="space-y-4">
            <section className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Co van: </span>
                <span className="font-medium">{homeroom.advisorName ?? "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">So SV: </span>
                <span className="font-medium">{homeroom.studentCount ?? students.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Trang thai: </span>
                <span className={homeroom.isActive ? "font-medium text-green-600" : "text-muted-foreground"}>
                  {homeroom.isActive ? "Dang hoat dong" : "Het nien khoa"}
                </span>
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Danh sach sinh vien ({students.length})
                </h3>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setAddOpen(true)}>
                  <UserPlus className="h-3.5 w-3.5" />
                  Them SV / co van
                </Button>
              </div>

              {studentsQuery.isLoading ? (
                <p className="py-4 text-center text-xs text-muted-foreground">Dang tai...</p>
              ) : students.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">Chua co sinh vien trong lop</p>
              ) : (
                <div className="max-h-96 overflow-y-auto rounded-md border">
                  <div className="divide-y">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center gap-3 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium">{student.fullName}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {student.studentCode} - {student.email}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-destructive"
                          onClick={() => setToRemove(student)}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <AddStudentsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        homeroom={homeroom}
        existingStudentIds={existingIds}
        majors={majors}
      />

      <ConfirmDialog
        open={!!toRemove}
        onOpenChange={(value) => !value && setToRemove(null)}
        title="Go sinh vien khoi lop?"
        description={toRemove?.fullName}
        destructive
        confirmText="Go"
        onConfirm={() => {
          if (toRemove) removeMutation.mutate(toRemove.id);
        }}
      />
    </>
  );
}

function HomeroomsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<HomeroomResponse | null>(null);
  const [toDelete, setToDelete] = useState<HomeroomResponse | null>(null);
  const [detailItem, setDetailItem] = useState<HomeroomResponse | null>(null);
  const [majorFilter, setMajorFilter] = useState(all);
  const [cohortFilter, setCohortFilter] = useState(all);
  const [statusFilter, setStatusFilter] = useState(all);

  const query = useQuery({
    queryKey: ["admin", "homerooms"],
    queryFn: adminApi.listHomerooms,
  });

  const majorsQuery = useQuery({
    queryKey: ["admin", "majors"],
    queryFn: adminApi.listMajors,
  });

  const data = query.data ?? [];
  const majors = majorsQuery.data ?? [];
  const cohorts = useMemo(
    () => Array.from(new Set(data.map((item) => item.cohort).filter(Boolean))).sort() as string[],
    [data],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedMajor = majorFilter === all || String(item.majorId ?? "") === majorFilter;
      const matchedCohort = cohortFilter === all || item.cohort === cohortFilter;
      const matchedStatus =
        statusFilter === all ||
        (statusFilter === "active" ? item.isActive !== false : item.isActive === false);
      return matchedMajor && matchedCohort && matchedStatus;
    });
  }, [cohortFilter, data, majorFilter, statusFilter]);

  const createMutation = useMutation({
    mutationFn: (form: HomeroomForm) => adminApi.createHomeroom(toHomeroomPayload(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homerooms"] });
      setCreateOpen(false);
      toast.success("Da tao lop");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Tao lop that bai"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form, advisorId }: { id: number; form: HomeroomForm; advisorId?: number | null }) =>
      adminApi.updateHomeroom(id, toHomeroomPayload(form, advisorId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homerooms"] });
      setEditItem(null);
      toast.success("Da cap nhat lop");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Cap nhat lop that bai"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteHomeroom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homerooms"] });
      toast.success("Da xoa lop");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Xoa lop that bai"),
  });

  return (
    <div>
      <PageHeader title="Lop hanh chinh" description={`${filteredData.length} / ${data.length} lop`} />

      <DataTable
        data={filteredData}
        rowKey={(homeroom) => String(homeroom.id)}
        searchPlaceholder="Tim theo ten lop, co van, nganh..."
        searchSlot={
          <>
            <Select value={majorFilter} onValueChange={setMajorFilter}>
              <SelectTrigger className="h-10 w-full sm:w-44">
                <SelectValue placeholder="Tat ca nganh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={all}>Tat ca nganh</SelectItem>
                {majors.map((major) => (
                  <SelectItem key={major.id} value={String(major.id)}>
                    {major.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cohortFilter} onValueChange={setCohortFilter}>
              <SelectTrigger className="h-10 w-full sm:w-36">
                <SelectValue placeholder="Tat ca khoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={all}>Tat ca khoa</SelectItem>
                {cohorts.map((cohort) => (
                  <SelectItem key={cohort} value={cohort}>
                    {cohort}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full sm:w-40">
                <SelectValue placeholder="Trang thai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={all}>Tat ca trang thai</SelectItem>
                <SelectItem value="active">Dang hoat dong</SelectItem>
                <SelectItem value="inactive">Het nien khoa</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
        toolbar={
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Them lop
          </Button>
        }
        columns={[
          {
            key: "className",
            header: "Ten lop",
            render: (homeroom) => <span className="font-medium">{homeroom.className}</span>,
          },
          {
            key: "advisorName",
            header: "Co van",
            render: (homeroom) => <span className="text-sm">{homeroom.advisorName ?? "-"}</span>,
          },
          {
            key: "majorName",
            header: "Nganh",
            render: (homeroom) => <span className="text-xs text-muted-foreground">{homeroom.majorName ?? "-"}</span>,
          },
          {
            key: "cohort",
            header: "Khoa",
            render: (homeroom) => <span className="text-xs tabular-nums">{homeroom.cohort ?? "-"}</span>,
          },
          {
            key: "academicYear",
            header: "Nien khoa",
            accessor: (homeroom) => academicRange(homeroom.academicYear),
            render: (homeroom) => <span className="text-xs tabular-nums">{academicRange(homeroom.academicYear)}</span>,
          },
          {
            key: "studentCount",
            header: "So SV",
            render: (homeroom) => <span className="text-xs tabular-nums">{homeroom.studentCount ?? "-"}</span>,
          },
          {
            key: "isActive",
            header: "Trang thai",
            accessor: (homeroom) => (homeroom.isActive === false ? "Het nien khoa" : "Dang hoat dong"),
            render: (homeroom) =>
              homeroom.isActive === false ? (
                <span className="text-xs text-muted-foreground">Het nien khoa</span>
              ) : (
                <span className="text-xs text-green-600">Dang hoat dong</span>
              ),
          },
          {
            key: "actions",
            header: "",
            className: "w-28 text-right",
            searchable: false,
            render: (homeroom) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailItem(homeroom)}>
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditItem(homeroom)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => setToDelete(homeroom)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <HomeroomFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Tao lop hanh chinh"
        initial={emptyForm}
        onSubmit={(form) => createMutation.mutate(form)}
        submitting={createMutation.isPending}
      />

      <HomeroomFormDialog
        open={!!editItem}
        onOpenChange={(value) => !value && setEditItem(null)}
        title={`Sua lop ${editItem?.className ?? ""}`}
        initial={editItem ? toForm(editItem) : emptyForm}
        onSubmit={(form) => editItem && updateMutation.mutate({ id: editItem.id, form, advisorId: editItem.advisorId })}
        submitting={updateMutation.isPending}
      />

      <HomeroomDetailSheet
        homeroom={detailItem}
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        majors={majors}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(value) => !value && setToDelete(null)}
        title="Xoa lop hanh chinh?"
        description={toDelete?.className}
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
