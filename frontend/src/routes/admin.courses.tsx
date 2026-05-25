import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
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
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/lib/api/admin";
import type { CourseResponse } from "@/lib/api/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/courses")({ component: CoursesPage });

const courseSchema = z.object({
  code: z.string().min(1, "Bắt buộc"),
  name: z.string().min(1, "Bắt buộc"),
  credits: z.coerce.number().min(1, "Tối thiểu 1 tín chỉ"),
  description: z.string().optional(),
  courseType: z.enum(["REQUIRED", "ELECTIVE"]).default("REQUIRED"),
  majorId: z.coerce.number().min(1, "Chọn ngành học"),
  prerequisiteCourseIds: z.array(z.number()).optional(),
});
type CourseFormData = z.infer<typeof courseSchema>;

function CoursesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CourseResponse | null>(null);
  const [toDelete, setToDelete] = useState<CourseResponse | null>(null);

  const { data: courses, isPending, isError, error } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: adminApi.listCourses,
  });
  const { data: majors } = useQuery({
    queryKey: ["admin", "majors"],
    queryFn: adminApi.listMajors,
  });

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema) as import("react-hook-form").Resolver<CourseFormData>,
    defaultValues: { code: "", name: "", credits: 3, courseType: "REQUIRED", majorId: 0 },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });

  const createMutation = useMutation({
    mutationFn: adminApi.createCourse,
    onSuccess: () => { invalidate(); toast.success("Đã tạo môn học"); closeForm(); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CourseFormData }) =>
      adminApi.updateCourse(id, data),
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật môn học"); closeForm(); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCourse(id),
    onSuccess: () => { invalidate(); toast.success("Đã xóa môn học"); setToDelete(null); },
    onError: (err) => toast.error(err.message),
  });

  function openCreate() {
    setEditing(null);
    form.reset({ code: "", name: "", credits: 3, courseType: "REQUIRED", majorId: 0 });
    setOpen(true);
  }

  function openEdit(course: CourseResponse) {
    setEditing(course);
    // Note: API does not return majorId in response, so we can't pre-fill it
    form.reset({
      code: course.code,
      name: course.name,
      credits: course.credits,
      description: course.description ?? undefined,
      courseType: course.courseType ?? "REQUIRED",
      majorId: 0, // Cannot pre-fill: API response does not include majorId
    });
    setOpen(true);
  }

  function closeForm() { setOpen(false); setEditing(null); }

  function onSubmit(data: CourseFormData) {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  }

  if (isPending) return <Skeleton className="h-96 w-full" />;
  if (isError)
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error.message}
      </div>
    );

  const rows = courses ?? [];
  const majorList = majors ?? [];

  return (
    <div>
      <PageHeader
        title="Môn học"
        description={`${rows.length} môn học`}
        actions={
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Thêm môn
          </Button>
        }
      />

      <DataTable
        data={rows}
        rowKey={(c) => String(c.id)}
        pageSize={10}
        searchPlaceholder="Tìm theo mã, tên môn, ngành..."
        columns={[
          {
            key: "code",
            header: "Mã môn",
            render: (c) => <span className="font-mono text-xs">{c.code}</span>,
          },
          {
            key: "name",
            header: "Tên môn",
            render: (c) => (
              <div className="min-w-56">
                <div className="font-medium">{c.name}</div>
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    {c.courseTypeLabel ?? c.courseType ?? "—"}
                  </Badge>
                </div>
              </div>
            ),
          },
          {
            key: "credits",
            header: "Tín chỉ",
            render: (c) => <span className="tabular-nums">{c.credits}</span>,
          },
          {
            key: "majorName",
            header: "Ngành",
            render: (c) => <span className="text-sm">{c.majorName ?? "—"}</span>,
          },
          {
            key: "description",
            header: "Mô tả",
            render: (c) => (
              <span className="line-clamp-2 max-w-64 text-xs text-muted-foreground">
                {c.description ?? "—"}
              </span>
            ),
          },
          {
            key: "prerequisites",
            header: "Tiên quyết",
            accessor: (c) => (c.prerequisiteNames ?? []).join(", "),
            render: (c) => (
              <span className="text-xs text-muted-foreground">
                {(c.prerequisiteNames ?? []).length > 0
                  ? c.prerequisiteNames.join(", ")
                  : "Không"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            className: "w-24 text-right",
            searchable: false,
            render: (c) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                  onClick={() => setToDelete(c)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeForm(); }}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa môn học" : "Thêm môn học"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <p className="text-xs text-muted-foreground">
              Lưu ý: API không trả về majorId trong response, vui lòng chọn lại ngành khi cập nhật.
            </p>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Mã môn</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="credits" render={({ field }) => (
                <FormItem><FormLabel>Số tín chỉ</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="sm:col-span-2"><FormLabel>Tên môn học</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="majorId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngành học</FormLabel>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Chọn ngành" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {majorList.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="courseType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại môn</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="REQUIRED">Bắt buộc</SelectItem>
                      <SelectItem value="ELECTIVE">Tự chọn</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="sm:col-span-2"><FormLabel>Mô tả</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo môn học"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xóa môn học?"
        description={toDelete?.name}
        destructive
        confirmText="Xóa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id); }}
      />
    </div>
  );
}
