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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCourseRequest, AdminStudentRequest, AdminTeacherRequest } from "@/lib/api/types";

interface SelectOption {
  value: number | string;
  label: string;
}

interface DialogProps<TValues> {
  open: boolean;
  editing: TValues | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TValues) => void;
}

const studentSchema = z.object({
  username: z.string().trim().min(1, "Username khong duoc de trong"),
  password: z.string().trim().min(6, "Password toi thieu 6 ky tu"),
  email: z.string().trim().email("Email khong hop le"),
  studentCode: z.string().trim().min(1, "Ma sinh vien khong duoc de trong"),
  fullName: z.string().trim().min(1, "Ho ten khong duoc de trong"),
  dob: z.string().trim().min(1, "Ngay sinh khong duoc de trong"),
  majorId: z.coerce.number().min(1, "Bat buoc chon nganh"),
  academicYear: z.coerce.number().int().min(2000, "Nam hoc khong hop le"),
  address: z.string().optional(),
});

const teacherSchema = z.object({
  username: z.string().trim().min(1, "Username khong duoc de trong"),
  password: z.string().trim().min(6, "Password toi thieu 6 ky tu"),
  email: z.string().trim().email("Email khong hop le"),
  teacherCode: z.string().trim().min(1, "Ma giang vien khong duoc de trong"),
  fullName: z.string().trim().min(1, "Ho ten khong duoc de trong"),
  dob: z.string().optional(),
  department: z.string().optional(),
  degree: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const courseSchema = z.object({
  code: z.string().trim().min(1, "Ma mon khong duoc de trong"),
  name: z.string().trim().min(1, "Ten mon khong duoc de trong"),
  credits: z.coerce.number().int().min(1, "Tin chi phai lon hon 0"),
  description: z.string().optional(),
  courseType: z.enum(["REQUIRED", "ELECTIVE"]).optional(),
  majorId: z.coerce.number().min(1, "Bat buoc chon nganh"),
  prerequisiteCourseIds: z.array(z.number()).optional(),
});

export function StudentFormDialog({
  open,
  editing,
  majors,
  isPending,
  onOpenChange,
  onSubmit,
}: DialogProps<AdminStudentRequest> & { majors: SelectOption[] }) {
  const form = useForm<AdminStudentRequest>({
    resolver: zodResolver(studentSchema),
    defaultValues: editing ?? getDefaultStudent(),
  });

  useEffect(() => {
    if (open) form.reset(editing ?? getDefaultStudent());
  }, [editing, form, open]);

  return (
    <BaseDialog
      open={open}
      title={editing ? "Sua sinh vien" : "Them sinh vien"}
      description="Thong tin nay dung cho tai khoan sinh vien va ho so dao tao."
      isPending={isPending}
      onOpenChange={onOpenChange}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={form.control} name="studentCode" label="Ma sinh vien" />
          <TextField control={form.control} name="username" label="Username" />
          <TextField control={form.control} name="password" label="Password" type="password" />
          <TextField control={form.control} name="email" label="Email" type="email" />
          <TextField control={form.control} name="fullName" label="Ho ten" />
          <TextField control={form.control} name="dob" label="Ngay sinh" type="date" />
          <SelectField control={form.control} name="majorId" label="Nganh" options={majors} />
          <TextField
            control={form.control}
            name="academicYear"
            label="Nam nhap hoc"
            type="number"
          />
          <div className="sm:col-span-2">
            <TextAreaField control={form.control} name="address" label="Dia chi" />
          </div>
        </div>
      </Form>
    </BaseDialog>
  );
}

export function TeacherFormDialog({
  open,
  editing,
  isPending,
  onOpenChange,
  onSubmit,
}: DialogProps<AdminTeacherRequest>) {
  const form = useForm<AdminTeacherRequest>({
    resolver: zodResolver(teacherSchema),
    defaultValues: editing ?? getDefaultTeacher(),
  });

  useEffect(() => {
    if (open) form.reset(editing ?? getDefaultTeacher());
  }, [editing, form, open]);

  return (
    <BaseDialog
      open={open}
      title={editing ? "Sua giang vien" : "Them giang vien"}
      description="Thong tin giang vien dung cho tai khoan, phan cong day va lop hoc phan."
      isPending={isPending}
      onOpenChange={onOpenChange}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={form.control} name="teacherCode" label="Ma giang vien" />
          <TextField control={form.control} name="username" label="Username" />
          <TextField control={form.control} name="password" label="Password" type="password" />
          <TextField control={form.control} name="email" label="Email" type="email" />
          <TextField control={form.control} name="fullName" label="Ho ten" />
          <TextField control={form.control} name="dob" label="Ngay sinh" type="date" />
          <TextField control={form.control} name="department" label="Bo mon / khoa" />
          <TextField control={form.control} name="degree" label="Hoc vi" />
          <TextField control={form.control} name="phone" label="So dien thoai" />
          <TextField control={form.control} name="address" label="Dia chi" />
        </div>
      </Form>
    </BaseDialog>
  );
}

export function CourseFormDialog({
  open,
  editing,
  majors,
  isPending,
  onOpenChange,
  onSubmit,
}: DialogProps<AdminCourseRequest> & { majors: SelectOption[] }) {
  const form = useForm<AdminCourseRequest>({
    resolver: zodResolver(courseSchema),
    defaultValues: editing ?? getDefaultCourse(),
  });

  useEffect(() => {
    if (open) form.reset(editing ?? getDefaultCourse());
  }, [editing, form, open]);

  return (
    <BaseDialog
      open={open}
      title={editing ? "Sua mon hoc" : "Them mon hoc"}
      description="Mon hoc la danh muc de mo lop hoc phan trong tung hoc ky."
      isPending={isPending}
      onOpenChange={onOpenChange}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={form.control} name="code" label="Ma mon" />
          <TextField control={form.control} name="name" label="Ten mon" />
          <TextField control={form.control} name="credits" label="Tin chi" type="number" />
          <SelectField control={form.control} name="majorId" label="Nganh" options={majors} />
          <SelectField
            control={form.control}
            name="courseType"
            label="Loai mon"
            options={[
              { value: "REQUIRED", label: "Bat buoc" },
              { value: "ELECTIVE", label: "Tu chon" },
            ]}
          />
          <div className="sm:col-span-2">
            <TextAreaField control={form.control} name="description" label="Mo ta" />
          </div>
        </div>
      </Form>
    </BaseDialog>
  );
}

function getDefaultStudent(): AdminStudentRequest {
  return {
    username: "",
    password: "password123",
    email: "",
    studentCode: "",
    fullName: "",
    dob: "",
    majorId: 0,
    academicYear: 2026,
    address: "",
  };
}

function getDefaultTeacher(): AdminTeacherRequest {
  return {
    username: "",
    password: "password123",
    email: "",
    teacherCode: "",
    fullName: "",
    dob: "",
    department: "",
    degree: "",
    address: "",
    phone: "",
  };
}

function getDefaultCourse(): AdminCourseRequest {
  return {
    code: "",
    name: "",
    credits: 3,
    description: "",
    courseType: "REQUIRED",
    majorId: 0,
    prerequisiteCourseIds: [],
  };
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
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

function SelectField<TValues extends FieldValues>({
  control,
  name,
  label,
  options,
}: {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  options: SelectOption[];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            value={field.value === undefined || field.value === null ? "" : String(field.value)}
            onValueChange={(value) =>
              field.onChange(Number.isNaN(Number(value)) ? value : Number(value))
            }
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Chon ${label.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
