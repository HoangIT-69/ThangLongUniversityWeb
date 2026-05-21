import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  EnrollmentClassSectionOption,
  EnrollmentStudentOption,
  ManualEnrollmentValues,
} from "./types";

const manualEnrollmentSchema = z.object({
  studentId: z.coerce.number().min(1, "Chon sinh vien"),
  classSectionId: z.coerce.number().min(1, "Chon lop hoc phan"),
  note: z.string().max(255, "Ghi chu toi da 255 ky tu").optional().default(""),
});

interface ManualEnrollmentDialogProps {
  open: boolean;
  students: EnrollmentStudentOption[];
  classSections: EnrollmentClassSectionOption[];
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ManualEnrollmentValues) => void;
}

export function ManualEnrollmentDialog({
  open,
  students,
  classSections,
  isPending,
  onOpenChange,
  onSubmit,
}: ManualEnrollmentDialogProps) {
  const form = useForm<ManualEnrollmentValues>({
    resolver: zodResolver(manualEnrollmentSchema),
    defaultValues: {
      studentId: students[0]?.id ?? 0,
      classSectionId:
        classSections.find((section) => !section.locked)?.id ?? classSections[0]?.id ?? 0,
      note: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      studentId: students[0]?.id ?? 0,
      classSectionId:
        classSections.find((section) => !section.locked)?.id ?? classSections[0]?.id ?? 0,
      note: "",
    });
  }, [classSections, form, open, students]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Them sinh vien thu cong</DialogTitle>
          <DialogDescription>
            Admin dung cho dieu chinh hoc vu/override khi sinh vien khong tu dang ky.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sinh vien</FormLabel>
                  <Select value={String(field.value)} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chon sinh vien" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={String(student.id)}>
                          {student.code} - {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classSectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lop hoc phan</FormLabel>
                  <Select value={String(field.value)} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chon lop hoc phan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classSections.map((section) => (
                        <SelectItem
                          key={section.id}
                          value={String(section.id)}
                          disabled={section.locked}
                        >
                          {section.code} - {section.courseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chu</FormLabel>
                  <FormControl>
                    <Input placeholder="Ly do them thu cong" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Huy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Dang them..." : "Them vao lop"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
