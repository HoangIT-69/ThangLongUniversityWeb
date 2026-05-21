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
  classCode: z.string().trim().min(1, "Ma lop khong duoc de trong"),
  courseId: z.coerce.number().min(1, "Bat buoc chon mon hoc"),
  semesterId: z.coerce.number().min(1, "Bat buoc chon hoc ky"),
  teacherId: z.coerce.number().min(1, "Bat buoc chon giang vien"),
  roomId: z.coerce.number().min(1, "Bat buoc chon phong hoc"),
  dayOfWeek: z.coerce.number().min(2).max(8),
  startPeriodId: z.coerce.number().min(1, "Bat buoc chon tiet bat dau"),
  endPeriodId: z.coerce.number().min(1, "Bat buoc chon tiet ket thuc"),
  maxSlots: z.coerce.number().int().min(1, "Si so toi da phai lon hon 0"),
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
          <DialogTitle>{editing ? "Sua lop hoc phan" : "Mo lop hoc phan"}</DialogTitle>
          <DialogDescription>
            Chon mon hoc, hoc ky, giang vien, phong hoc va lich hoc cho lop hoc phan.
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
                    <FormLabel>Ma lop hoc phan</FormLabel>
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
                label="Trang thai"
                options={statuses.map((status) => ({ value: status, label: status }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="courseId"
                label="Mon hoc"
                options={options.courses.map((course) => ({
                  value: course.id,
                  label: `${course.code} - ${course.name}`,
                }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="semesterId"
                label="Hoc ky"
                options={options.semesters.map((semester) => ({
                  value: semester.id,
                  label: semester.name,
                }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="teacherId"
                label="Giang vien"
                options={options.teachers.map((teacher) => ({
                  value: teacher.id,
                  label: teacher.name,
                }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="roomId"
                label="Phong hoc"
                options={options.rooms.map((room) => ({
                  value: room.id,
                  label: `${room.name} (${room.capacity})`,
                }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="dayOfWeek"
                label="Thu hoc"
                options={[
                  { value: 2, label: "Thu 2" },
                  { value: 3, label: "Thu 3" },
                  { value: 4, label: "Thu 4" },
                  { value: 5, label: "Thu 5" },
                  { value: 6, label: "Thu 6" },
                  { value: 7, label: "Thu 7" },
                  { value: 8, label: "Chu nhat" },
                ]}
              />
              <FormField
                control={form.control}
                name="maxSlots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Si so toi da</FormLabel>
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
                label="Tiet bat dau"
                options={options.periods.map((period) => ({
                  value: period.id,
                  label: period.label,
                }))}
              />
              <ClassSectionSelectField
                control={form.control}
                name="endPeriodId"
                label="Tiet ket thuc"
                options={options.periods.map((period) => ({
                  value: period.id,
                  label: period.label,
                }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Huy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Luu thay doi" : "Mo lop"}
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
