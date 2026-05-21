import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, type Control, type FieldValues, type Path } from "react-hook-form";
import type { FormEventHandler, ReactNode } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import type {
  AdminMajorRequest,
  AdminPeriodRequest,
  AdminRoomRequest,
  AdminSemesterRequest,
} from "@/lib/api/types";

interface DialogProps<TValues> {
  open: boolean;
  editing: TValues | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TValues) => void;
}

const majorSchema = z.object({
  majorCode: z.string().trim().min(1, "Ma nganh khong duoc de trong"),
  name: z.string().trim().min(1, "Ten nganh khong duoc de trong"),
  description: z.string().optional(),
});

const roomSchema = z.object({
  name: z.string().trim().min(1, "Ten phong khong duoc de trong"),
  capacity: z.coerce.number().int().min(1, "Suc chua phai lon hon 0"),
});

const periodSchema = z
  .object({
    periodNumber: z.coerce.number().int().min(1).max(20),
    startTime: z.string().trim().min(1, "Gio bat dau khong duoc de trong"),
    endTime: z.string().trim().min(1, "Gio ket thuc khong duoc de trong"),
  })
  .refine((value) => value.startTime < value.endTime, {
    path: ["endTime"],
    message: "Gio ket thuc phai sau gio bat dau",
  });

const semesterSchema = z
  .object({
    name: z.string().trim().min(1, "Ten hoc ky khong duoc de trong"),
    startDate: z.string().trim().min(1, "Ngay bat dau khong duoc de trong"),
    endDate: z.string().trim().min(1, "Ngay ket thuc khong duoc de trong"),
    registrationOpen: z.boolean().optional(),
  })
  .refine((value) => value.startDate < value.endDate, {
    path: ["endDate"],
    message: "Ngay ket thuc phai sau ngay bat dau",
  });

export function MajorFormDialog(props: DialogProps<AdminMajorRequest>) {
  const form = useForm<AdminMajorRequest>({
    resolver: zodResolver(majorSchema),
    defaultValues: props.editing ?? { majorCode: "", name: "", description: "" },
  });

  useEffect(() => {
    if (props.open) form.reset(props.editing ?? { majorCode: "", name: "", description: "" });
  }, [form, props.editing, props.open]);

  return (
    <BaseDialog
      open={props.open}
      title={props.editing ? "Sua nganh hoc" : "Them nganh hoc"}
      description="Quan ly danh muc nganh cho sinh vien, mon hoc va lop hoc phan."
      isPending={props.isPending}
      onOpenChange={props.onOpenChange}
      onSubmit={form.handleSubmit(props.onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-4">
          <TextField control={form.control} name="majorCode" label="Ma nganh" />
          <TextField control={form.control} name="name" label="Ten nganh" />
          <TextAreaField control={form.control} name="description" label="Mo ta" />
        </div>
      </Form>
    </BaseDialog>
  );
}

export function RoomFormDialog(props: DialogProps<AdminRoomRequest>) {
  const form = useForm<AdminRoomRequest>({
    resolver: zodResolver(roomSchema),
    defaultValues: props.editing ?? { name: "", capacity: 60 },
  });

  useEffect(() => {
    if (props.open) form.reset(props.editing ?? { name: "", capacity: 60 });
  }, [form, props.editing, props.open]);

  return (
    <BaseDialog
      open={props.open}
      title={props.editing ? "Sua phong hoc" : "Them phong hoc"}
      description="Phong hoc duoc dung khi admin xep lich lop hoc phan."
      isPending={props.isPending}
      onOpenChange={props.onOpenChange}
      onSubmit={form.handleSubmit(props.onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-4">
          <TextField control={form.control} name="name" label="Ten phong" />
          <TextField control={form.control} name="capacity" label="Suc chua" type="number" />
        </div>
      </Form>
    </BaseDialog>
  );
}

export function PeriodFormDialog(props: DialogProps<AdminPeriodRequest>) {
  const form = useForm<AdminPeriodRequest>({
    resolver: zodResolver(periodSchema),
    defaultValues: props.editing ?? { periodNumber: 1, startTime: "07:00", endTime: "07:50" },
  });

  useEffect(() => {
    if (props.open) {
      form.reset(props.editing ?? { periodNumber: 1, startTime: "07:00", endTime: "07:50" });
    }
  }, [form, props.editing, props.open]);

  return (
    <BaseDialog
      open={props.open}
      title={props.editing ? "Sua tiet hoc" : "Them tiet hoc"}
      description="Tiet hoc la moc thoi gian dung de xep lich phong va giang vien."
      isPending={props.isPending}
      onOpenChange={props.onOpenChange}
      onSubmit={form.handleSubmit(props.onSubmit)}
    >
      <Form {...form}>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField control={form.control} name="periodNumber" label="Tiet" type="number" />
          <TextField control={form.control} name="startTime" label="Bat dau" type="time" />
          <TextField control={form.control} name="endTime" label="Ket thuc" type="time" />
        </div>
      </Form>
    </BaseDialog>
  );
}

export function SemesterFormDialog(props: DialogProps<AdminSemesterRequest>) {
  const form = useForm<AdminSemesterRequest>({
    resolver: zodResolver(semesterSchema),
    defaultValues: props.editing ?? {
      name: "",
      startDate: "",
      endDate: "",
      registrationOpen: false,
    },
  });

  useEffect(() => {
    if (props.open) {
      form.reset(
        props.editing ?? { name: "", startDate: "", endDate: "", registrationOpen: false },
      );
    }
  }, [form, props.editing, props.open]);

  return (
    <BaseDialog
      open={props.open}
      title={props.editing ? "Sua hoc ky" : "Them hoc ky"}
      description="Hoc ky la ngu canh mo lop hoc phan va dang ky mon."
      isPending={props.isPending}
      onOpenChange={props.onOpenChange}
      onSubmit={form.handleSubmit(props.onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-4">
          <TextField control={form.control} name="name" label="Ten hoc ky" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={form.control} name="startDate" label="Ngay bat dau" type="date" />
            <TextField control={form.control} name="endDate" label="Ngay ket thuc" type="date" />
          </div>
        </div>
      </Form>
    </BaseDialog>
  );
}

function BaseDialog({
  open,
  title,
  description,
  isPending,
  children,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description: string;
  isPending: boolean;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          {children}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Luu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TextField<TValues extends FieldValues>({
  control,
  name,
  label,
  type = "text",
}: {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  type?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} {...field} value={String(field.value ?? "")} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TextAreaField<TValues extends FieldValues>({
  control,
  name,
  label,
}: {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea {...field} value={String(field.value ?? "")} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
