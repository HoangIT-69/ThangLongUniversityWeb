import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import type { AdminClassSectionStatus } from "@/lib/api/types";
import { buildOptionSets, mapApiClassSection, toClassSectionRequest } from "./classSectionMappers";
import { ClassSectionFormDialog } from "./ClassSectionFormDialog";
import { ClassSectionStudentsDialog } from "./ClassSectionStudentsDialog";
import { ClassSectionsByMajor } from "./ClassSectionsByMajor";
import type { ClassSectionFormValues, ClassSectionRow } from "./types";
import { validateClassSectionPlan } from "./validation";

const classSectionsKey = ["admin", "class-sections"] as const;

export function AdminClassSectionsContent() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassSectionRow | null>(null);
  const [toDelete, setToDelete] = useState<ClassSectionRow | null>(null);
  const [studentsSection, setStudentsSection] = useState<ClassSectionRow | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, AdminClassSectionStatus>>(
    {},
  );

  const classSectionsQuery = useQuery({
    queryKey: classSectionsKey,
    queryFn: adminApi.listClassSections,
    staleTime: 60 * 1000,
  });
  const coursesQuery = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: adminApi.listCourses,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const semestersQuery = useQuery({
    queryKey: ["admin", "semesters"],
    queryFn: adminApi.listSemesters,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const teachersQuery = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: adminApi.listTeachers,
    staleTime: 5 * 60 * 1000,
  });
  const roomsQuery = useQuery({
    queryKey: ["admin", "rooms"],
    queryFn: adminApi.listRooms,
    staleTime: 60 * 60 * 1000,
  });
  const periodsQuery = useQuery({
    queryKey: ["admin", "periods"],
    queryFn: adminApi.listPeriods,
    staleTime: 60 * 60 * 1000,
  });

  const rows = useMemo(() => {
    return (classSectionsQuery.data ?? []).map((section) =>
      mapApiClassSection(section, statusOverrides[String(section.id)]),
    );
  }, [classSectionsQuery.data, statusOverrides]);

  const rowsWithMajors = useMemo(() => {
    const courseMajorMap = new Map(
      (coursesQuery.data ?? []).map((course) => [course.id, course.majorName ?? "-"]),
    );
    return rows.map((row) => ({
      ...row,
      majorName: courseMajorMap.get(row.courseId) ?? row.majorName,
    }));
  }, [coursesQuery.data, rows]);

  const options = useMemo(
    () =>
      buildOptionSets(
        {
          courses: coursesQuery.data,
          semesters: semestersQuery.data,
          teachers: teachersQuery.data,
          rooms: roomsQuery.data,
          periods: periodsQuery.data,
          classSections: classSectionsQuery.data,
        },
        rowsWithMajors,
      ),
    [
      classSectionsQuery.data,
      coursesQuery.data,
      periodsQuery.data,
      roomsQuery.data,
      rowsWithMajors,
      semestersQuery.data,
      teachersQuery.data,
    ],
  );

  const createMutation = useMutation({
    mutationFn: (values: ClassSectionFormValues) =>
      adminApi.createClassSection(toClassSectionRequest(values)),
    onSuccess: (section, values) => {
      setStatusOverrides((current) => ({ ...current, [String(section.id)]: values.status }));
      queryClient.invalidateQueries({ queryKey: classSectionsKey });
      toast.success("Đã mở lớp học phần");
      closeForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: ClassSectionFormValues }) =>
      adminApi.updateClassSection(id, toClassSectionRequest(values)),
    onSuccess: (section, variables) => {
      setStatusOverrides((current) => ({
        ...current,
        [String(section.id)]: variables.values.status,
      }));
      queryClient.invalidateQueries({ queryKey: classSectionsKey });
      toast.success("Đã cập nhật lớp học phần");
      closeForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteClassSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classSectionsKey });
      toast.success("Đã xóa lớp học phần");
      setToDelete(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const submit = (values: ClassSectionFormValues) => {
    const validationMessage = validateClassSectionPlan({
      values,
      rows: rowsWithMajors,
      periods: options.periods,
      rooms: options.rooms,
      editingId: editing?.id,
    });
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }
    if (editing?.numericId) updateMutation.mutate({ id: editing.numericId, values });
    else createMutation.mutate(values);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    if (toDelete.currentSlots > 0) {
      setStatusOverrides((current) => ({ ...current, [toDelete.id]: "CANCELLED" }));
      queryClient.invalidateQueries({ queryKey: classSectionsKey });
      toast.success("Lớp đã có sinh viên, đã chuyển sang CANCELLED");
      setToDelete(null);
      return;
    }
    if (toDelete.numericId) deleteMutation.mutate(toDelete.numericId);
    else setToDelete(null);
  };

  const toggleStatus = (row: ClassSectionRow) => {
    const nextStatus = getNextStatus(row.status);
    setStatusOverrides((current) => ({ ...current, [row.id]: nextStatus }));
    queryClient.invalidateQueries({ queryKey: classSectionsKey });
    toast.success(`Đã chuyển ${row.classCode} sang ${nextStatus}`);
  };

  if (classSectionsQuery.isPending) return <ClassSectionsSkeleton />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Lớp học phần"
        description={`${rowsWithMajors.length} lớp học phần theo ngành`}
        actions={
          <Button
            className="gap-2"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Mở lớp học phần
          </Button>
        }
      />

      {classSectionsQuery.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Không tải được API lớp học phần</AlertTitle>
          <AlertDescription>{classSectionsQuery.error.message}</AlertDescription>
        </Alert>
      )}
      {(coursesQuery.isError || semestersQuery.isError) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Không tải được một số danh mục</AlertTitle>
          <AlertDescription>
            Vui lòng kiểm tra API Course/Semester trước khi tạo hoặc sửa lớp học phần.
          </AlertDescription>
        </Alert>
      )}

      <ClassSectionsByMajor
        rows={rowsWithMajors}
        onEdit={(row) => {
          setEditing(row);
          setOpen(true);
        }}
        onDelete={setToDelete}
        onStatusChange={toggleStatus}
        onViewStudents={setStudentsSection}
      />

      <ClassSectionFormDialog
        open={open}
        editing={editing}
        options={options}
        isPending={createMutation.isPending || updateMutation.isPending}
        onOpenChange={(value) => {
          if (!value) closeForm();
          else setOpen(true);
        }}
        onSubmit={submit}
      />

      <ClassSectionStudentsDialog
        open={!!studentsSection}
        section={studentsSection}
        onOpenChange={(value) => {
          if (!value) setStudentsSection(null);
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(value) => !value && setToDelete(null)}
        title={toDelete && toDelete.currentSlots > 0 ? "Hủy lớp học phần?" : "Xóa lớp học phần?"}
        description={
          toDelete && toDelete.currentSlots > 0
            ? `${toDelete.classCode} đã có ${toDelete.currentSlots} sinh viên, FE sẽ chuyển trạng thái sang CANCELLED.`
            : `${toDelete?.classCode ?? ""} sẽ bị xóa khỏi hệ thống.`
        }
        destructive
        confirmText={toDelete && toDelete.currentSlots > 0 ? "Hủy lớp" : "Xóa"}
        onConfirm={confirmDelete}
      />
    </div>
  );

  function closeForm() {
    setOpen(false);
    setEditing(null);
  }
}

function ClassSectionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

function getNextStatus(status: AdminClassSectionStatus): AdminClassSectionStatus {
  if (status === "DRAFT") return "OPEN";
  if (status === "OPEN") return "CLOSED";
  if (status === "CLOSED") return "OPEN";
  return "OPEN";
}
