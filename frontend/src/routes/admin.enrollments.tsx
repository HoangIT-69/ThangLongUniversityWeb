import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { adminApi } from "@/lib/api/admin";
import type { AdminEnrollmentResponse, EnrollmentStatus } from "@/lib/api/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/enrollments")({ component: EnrollmentsPage });

const ALL = "ALL" as const;
type StatusFilter = EnrollmentStatus | typeof ALL;

const overrideSchema = z.object({
  studentId: z.coerce.number().min(1, "Bắt buộc"),
  classSectionId: z.coerce.number().min(1, "Bắt buộc"),
  note: z.string().optional(),
});
type OverrideFormData = z.infer<typeof overrideSchema>;

function EnrollmentsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL);
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const [overrideOpen, setOverrideOpen] = useState(false);

  const { data: semesters } = useQuery({
    queryKey: ["admin", "semesters"],
    queryFn: adminApi.listSemesters,
  });

  const enrollmentQuery = useQuery({
    queryKey: [
      "admin",
      "enrollments",
      { status: statusFilter, semesterId: semesterFilter, page },
    ],
    queryFn: () =>
      adminApi.searchEnrollments({
        status: statusFilter !== ALL ? statusFilter : undefined,
        semesterId: semesterFilter !== "ALL" ? Number(semesterFilter) : undefined,
        page,
        size: 20,
      }),
  });

  const form = useForm<OverrideFormData>({
    resolver: zodResolver(overrideSchema),
    defaultValues: { studentId: 0, classSectionId: 0, note: "" },
  });

  const overrideMutation = useMutation({
    mutationFn: adminApi.overrideEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "enrollments"] });
      toast.success("Đã ghi danh sinh viên vào lớp");
      setOverrideOpen(false);
      form.reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const pageData = enrollmentQuery.data;
  const rows: AdminEnrollmentResponse[] = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 1;

  if (enrollmentQuery.isPending) return <EnrollmentsSkeleton />;

  return (
    <div>
      <PageHeader
        title="Đăng ký môn học"
        description={
          enrollmentQuery.isError
            ? "Không tải được dữ liệu"
            : `${pageData?.totalElements ?? 0} đăng ký`
        }
        actions={
          <Button className="gap-2" onClick={() => setOverrideOpen(true)}>
            <Plus className="h-4 w-4" />
            Ghi danh thủ công
          </Button>
        }
      />

      {enrollmentQuery.isError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {enrollmentQuery.error.message}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={semesterFilter} onValueChange={(v) => { setSemesterFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Tất cả học kỳ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả học kỳ</SelectItem>
            {(semesters ?? []).map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v: StatusFilter) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="REGISTERED">REGISTERED</SelectItem>
            <SelectItem value="CANCELED">CANCELED</SelectItem>
            <SelectItem value="PASSED">PASSED</SelectItem>
            <SelectItem value="FAILED">FAILED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={rows}
        rowKey={(e) => String(e.enrollmentId)}
        pageSize={20}
        searchPlaceholder="Tìm theo sinh viên, môn học, lớp..."
        emptyMessage="Không có đăng ký nào"
        columns={[
          {
            key: "student",
            header: "Sinh viên",
            accessor: (e) => `${e.studentName} ${e.studentCode}`,
            render: (e) => (
              <div>
                <div className="font-medium">{e.studentName}</div>
                <div className="font-mono text-xs text-muted-foreground">{e.studentCode}</div>
              </div>
            ),
          },
          {
            key: "course",
            header: "Lớp học phần",
            accessor: (e) => `${e.courseName} ${e.classCode}`,
            render: (e) => (
              <div>
                <div className="text-sm font-medium">{e.courseName}</div>
                <div className="font-mono text-xs text-muted-foreground">{e.classCode}</div>
              </div>
            ),
          },
          {
            key: "status",
            header: "Trạng thái",
            render: (e) => <StatusBadge value={e.status ?? "PENDING"} />,
          },
          {
            key: "enrollmentId",
            header: "ID",
            render: (e) => <span className="font-mono text-xs text-muted-foreground">#{e.enrollmentId}</span>,
          },
        ]}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3">
          <Button
            variant="outline" size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}

      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ghi danh thủ công (Admin Override)</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => overrideMutation.mutate(d))}
              className="space-y-4"
            >
              <FormField control={form.control} name="studentId" render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Sinh viên</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="classSectionId" render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Lớp học phần</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="note" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOverrideOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={overrideMutation.isPending}>
                  {overrideMutation.isPending ? "Đang ghi danh..." : "Ghi danh"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EnrollmentsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
