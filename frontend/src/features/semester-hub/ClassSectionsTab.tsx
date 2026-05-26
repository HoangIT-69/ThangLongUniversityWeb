import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassSectionFormDialog } from "@/features/admin-class-sections/ClassSectionFormDialog";
import { ClassSectionStudentsDialog } from "@/features/admin-class-sections/ClassSectionStudentsDialog";
import {
  buildOptionSets,
  mapApiClassSection,
  toClassSectionRequest,
} from "@/features/admin-class-sections/classSectionMappers";
import type { ClassSectionFormValues, ClassSectionRow } from "@/features/admin-class-sections/types";

interface Props {
  semesterId: number;
}

export function ClassSectionsTab({ semesterId }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClassSectionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassSectionRow | null>(null);
  const [studentsSection, setStudentsSection] = useState<ClassSectionRow | null>(null);

  const classSectionsQuery = useQuery({
    queryKey: ["admin", "class-sections", "semester", semesterId],
    queryFn: () => adminApi.listClassSectionsBySemester(semesterId),
  });
  const coursesQuery = useQuery({ queryKey: ["admin", "courses"], queryFn: adminApi.listCourses, staleTime: 300_000 });
  const semestersQuery = useQuery({ queryKey: ["admin", "semesters"], queryFn: adminApi.listSemesters, staleTime: 300_000 });
  const teachersQuery = useQuery({ queryKey: ["admin", "teachers"], queryFn: adminApi.listTeachers, staleTime: 300_000 });
  const roomsQuery = useQuery({ queryKey: ["admin", "rooms"], queryFn: adminApi.listRooms, staleTime: 3_600_000 });
  const periodsQuery = useQuery({ queryKey: ["admin", "periods"], queryFn: adminApi.listPeriods, staleTime: 3_600_000 });

  const allSections = classSectionsQuery.data ?? [];
  const rows = allSections.map((section) => mapApiClassSection(section));
  const options = buildOptionSets(
    {
      courses: coursesQuery.data,
      semesters: (semestersQuery.data ?? []).filter((semester) => semester.id === semesterId),
      teachers: teachersQuery.data,
      rooms: roomsQuery.data,
      periods: periodsQuery.data,
      classSections: allSections,
    },
    rows,
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "class-sections", "semester", semesterId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "exam-schedules", semesterId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "semester-summary", semesterId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "semesters"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: ClassSectionFormValues) =>
      adminApi.createClassSection(toClassSectionRequest({ ...values, semesterId })),
    onSuccess: () => {
      invalidate();
      toast.success("Đã tạo lớp học phần");
      closeForm();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không tạo được lớp học phần"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: ClassSectionFormValues }) =>
      adminApi.updateClassSection(id, toClassSectionRequest({ ...values, semesterId })),
    onSuccess: () => {
      invalidate();
      toast.success("Đã cập nhật lớp học phần");
      closeForm();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không cập nhật được lớp học phần"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteClassSection(id),
    onSuccess: () => {
      invalidate();
      toast.success("Đã xóa lớp học phần");
      setDeleteTarget(null);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không xóa được lớp học phần"),
  });

  if (classSectionsQuery.isLoading) return <Skeleton className="h-64 w-full" />;
  if (classSectionsQuery.isError) {
    return <div className="text-sm text-destructive">{String(classSectionsQuery.error)}</div>;
  }

  const sections = search
    ? allSections.filter((section) =>
        section.classCode?.toLowerCase().includes(search.toLowerCase()) ||
        section.courseName?.toLowerCase().includes(search.toLowerCase()) ||
        section.teacherName?.toLowerCase().includes(search.toLowerCase())
      )
    : allSections;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{allSections.length} lớp học phần trong học kỳ này</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 w-52 pl-8"
            />
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Tạo lớp học phần
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left font-medium">Mã lớp</th>
              <th className="p-3 text-left font-medium">Môn học</th>
              <th className="p-3 text-left font-medium">Giảng viên</th>
              <th className="p-3 text-left font-medium">Phòng</th>
              <th className="p-3 text-left font-medium">Sĩ số</th>
              <th className="p-3 text-left font-medium">Loại thi</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => {
              const row = mapApiClassSection(section);
              return (
                <tr key={section.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{section.classCode}</td>
                  <td className="p-3">{section.courseName}</td>
                  <td className="p-3">{section.teacherName ?? "-"}</td>
                  <td className="p-3">{section.room ?? "-"}</td>
                  <td className="p-3">{section.currentSlots ?? 0}/{section.maxSlots ?? "-"}</td>
                  <td className="p-3"><ExamTypeBadge type={section.examType} /></td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStudentsSection(row)}>
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditing(row);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sections.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">Chưa có lớp học phần</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ClassSectionFormDialog
        open={formOpen}
        editing={editing}
        options={options}
        isPending={createMutation.isPending || updateMutation.isPending}
        onOpenChange={(open) => {
          if (!open) closeForm();
          else setFormOpen(true);
        }}
        onSubmit={(values) => {
          if (editing?.numericId) updateMutation.mutate({ id: editing.numericId, values });
          else createMutation.mutate(values);
        }}
      />

      <ClassSectionStudentsDialog
        open={!!studentsSection}
        section={studentsSection}
        onOpenChange={(open) => {
          if (!open) setStudentsSection(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa lớp học phần?"
        description={`${deleteTarget?.classCode ?? ""} chỉ xóa được nếu chưa có tham chiếu bởi đăng ký, điểm, lịch học hoặc bảng liên quan.`}
        confirmText="Xóa"
        destructive
        onConfirm={() => {
          if (deleteTarget?.numericId) deleteMutation.mutate(deleteTarget.numericId);
        }}
      />
    </div>
  );

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }
}

function ExamTypeBadge({ type }: { type?: string | null }) {
  if (!type || type === "NORMAL") return <Badge variant="outline">Thường</Badge>;
  if (type === "RETAKE") return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Thi lại</Badge>;
  if (type === "IMPROVE") return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Nâng điểm</Badge>;
  return <Badge variant="outline">{type}</Badge>;
}

