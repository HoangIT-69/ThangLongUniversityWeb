import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import type { AdminClassSectionStatus } from "@/lib/api/types";
import { ClassSectionSelectField } from "./ClassSectionSelectField";
import type { ClassSectionFormValues, ClassSectionOptionSets, ClassSectionRow } from "./types";

const statuses: AdminClassSectionStatus[] = ["DRAFT", "OPEN", "CLOSED", "CANCELLED"];

const classSectionSchema = z.object({
  classCode: z.string().trim().min(1, "Mã lớp không được để trống"),
  courseId: z.coerce.number().min(1, "Bắt buộc chọn môn học"),
  semesterId: z.coerce.number().min(1, "Bắt buộc chọn học kỳ"),
  teacherId: z.coerce.number().min(1, "Bắt buộc chọn giảng viên"),
  roomId: z.coerce.number().min(1, "Bắt buộc chọn phòng học"),
  dayOfWeek: z.coerce.number().min(2).max(8),
  startPeriodId: z.coerce.number().min(1, "Bắt buộc chọn tiết bắt đầu"),
  endPeriodId: z.coerce.number().min(1, "Bắt buộc chọn tiết kết thúc"),
  maxSlots: z.coerce.number().int().min(1, "Sĩ số tối đa phải lớn hơn 0"),
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "CANCELLED"]),
});

interface ClassSectionFormDialogProps {
  open: boolean;
  editing: ClassSectionRow | null;
  options: ClassSectionOptionSets;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ClassSectionFormValues) => void;
}

export function ClassSectionFormDialog({
  open,
  editing,
  options,
  isPending,
  onOpenChange,
  onSubmit,
}: ClassSectionFormDialogProps) {
  const form = useForm<ClassSectionFormValues>({
    resolver: zodResolver(classSectionSchema),
    defaultValues: getDefaultValues(editing, options),
  });

  useEffect(() => {
    if (open) form.reset(getDefaultValues(editing, options));
  }, [editing, form, open, options]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Sửa lớp học phần" : "Mở lớp học phần"}</DialogTitle>
          <DialogDescription>
            Chọn môn học, học kỳ, giảng viên, phòng học và lịch học cho lớp học phần.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="classCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã lớp học phần</FormLabel>
                    <FormControl>
                      <Input placeholder="JAVA101-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ClassSectionSelectField
                control={form.control}
                name="status"
                label="Trạng thái"
                options={statuses.map((status) => ({ value: status, label: status }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="courseId"
                label="Môn học"
                options={options.courses.map((course) => ({
                  value: course.id,
                  label: `${course.code} - ${course.name}`,
                }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="semesterId"
                label="Học kỳ"
                options={options.semesters.map((semester) => ({
                  value: semester.id,
                  label: semester.name,
                }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="teacherId"
                label="Giảng viên"
                options={options.teachers.map((teacher) => ({
                  value: teacher.id,
                  label: teacher.name,
                }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="roomId"
                label="Phòng học"
                options={options.rooms.map((room) => ({
                  value: room.id,
                  label: `${room.name} (${room.capacity})`,
                }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="dayOfWeek"
                label="Thứ học"
                options={[
                  { value: 2, label: "Thứ 2" },
                  { value: 3, label: "Thứ 3" },
                  { value: 4, label: "Thứ 4" },
                  { value: 5, label: "Thứ 5" },
                  { value: 6, label: "Thứ 6" },
                  { value: 7, label: "Thứ 7" },
                  { value: 8, label: "Chủ nhật" },
                ]}
              />
              <FormField
                control={form.control}
                name="maxSlots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sĩ số tối đa</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ClassSectionSelectField
                control={form.control}
                name="startPeriodId"
                label="Tiết bắt đầu"
                options={options.periods.map((period) => ({
                  value: period.id,
                  label: period.label,
                }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="endPeriodId"
                label="Tiết kết thúc"
                options={options.periods.map((period) => ({
                  value: period.id,
                  label: period.label,
                }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Lưu thay đổi" : "Mở lớp"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(
  editing: ClassSectionRow | null,
  options: ClassSectionOptionSets,
): ClassSectionFormValues {
  return {
    classCode: editing?.classCode ?? "",
    courseId: editing?.courseId ?? options.courses[0]?.id ?? 0,
    semesterId: editing?.semesterId ?? options.semesters[0]?.id ?? 0,
    teacherId: editing?.teacherId ?? options.teachers[0]?.id ?? 0,
    roomId: editing?.roomId ?? options.rooms[0]?.id ?? 0,
    dayOfWeek: editing?.dayOfWeek ?? 2,
    startPeriodId: editing?.startPeriodId ?? options.periods[0]?.id ?? 0,
    endPeriodId: editing?.endPeriodId ?? options.periods[1]?.id ?? options.periods[0]?.id ?? 0,
    maxSlots: editing?.maxSlots ?? 40,
    status: editing?.status ?? "DRAFT",
  };
}
