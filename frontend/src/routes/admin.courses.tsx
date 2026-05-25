import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { adminApi } from "@/lib/api/admin";
import type { CourseResponse } from "@/lib/api/types";
import { courses as mockCourses, formatVND, getMajor } from "@/data/mock";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/courses")({ component: CoursesPage });

type CourseRow = {
  id: string;
  numericId?: number;
  code: string;
  name: string;
  credits: number;
  majorName: string;
  description: string;
  courseType: string;
  feePerCredit: number;
  prerequisites: string;
  source: "API" | "Mock";
};

function CoursesPage() {
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<CourseRow | null>(null);

  const query = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: adminApi.listCourses,
    retry: false,
  });

  const rows = useMemo(() => {
    if (query.data?.length) return query.data.map(mapApiCourse);
    return mockCourses.map((course) => ({
      id: course.id,
      code: course.code,
      name: course.name,
      credits: course.credits,
      majorName: getMajor(course.majorId).name,
      description: "Can BE: description",
      courseType: "Can BE: courseType",
      feePerCredit: course.feePerCredit,
      prerequisites: course.prerequisites.length ? course.prerequisites.join(", ") : "Khong",
      source: "Mock" as const,
    }));
  }, [query.data]);

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Da xoa mon hoc");
      setToDelete(null);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div>
      <PageHeader
        title="Mon hoc"
        description={`${rows.length} mon${query.isError ? " - API admin/courses dang loi, hien du lieu mau" : ""}`}
        actions={
          <Button
            className="gap-2"
            onClick={() => toast.info("Form them/sua se noi API CourseRequest o buoc tiep theo.")}
          >
            <Plus className="h-4 w-4" />
            Them mon
          </Button>
        }
      />

      <DataTable
        data={rows}
        rowKey={(course) => course.id}
        pageSize={10}
        searchPlaceholder="Tim theo ma, ten mon, nganh..."
        columns={[
          {
            key: "code",
            header: "Ma mon",
            render: (course) => <span className="font-mono text-xs">{course.code}</span>,
          },
          {
            key: "name",
            header: "Ten mon",
            render: (course) => (
              <div className="min-w-56">
                <div className="font-medium">{course.name}</div>
                <div className="mt-1 flex gap-1">
                  <Badge variant={course.source === "API" ? "secondary" : "outline"}>
                    {course.source}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{course.courseType}</span>
                </div>
              </div>
            ),
          },
          {
            key: "credits",
            header: "Tin chi",
            render: (course) => <span className="tabular-nums">{course.credits}</span>,
          },
          {
            key: "majorName",
            header: "Nganh",
            render: (course) => <span className="text-sm">{course.majorName}</span>,
          },
          {
            key: "description",
            header: "Mo ta",
            render: (course) => (
              <span className="line-clamp-2 max-w-64 text-xs text-muted-foreground">
                {course.description}
              </span>
            ),
          },
          {
            key: "feePerCredit",
            header: "Hoc phi / TC",
            render: (course) => (
              <span className="tabular-nums">{formatVND(course.feePerCredit)}</span>
            ),
          },
          {
            key: "prerequisites",
            header: "Tien quyet",
            render: (course) => (
              <span className="text-xs text-muted-foreground">{course.prerequisites}</span>
            ),
          },
          {
            key: "actions",
            header: "",
            className: "w-24 text-right",
            searchable: false,
            render: (course) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toast.info(`Sua mon ${course.name}: cho noi API update.`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  disabled={!course.numericId}
                  onClick={() => setToDelete(course)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(value) => !value && setToDelete(null)}
        title="Xoa mon hoc?"
        description={toDelete?.name}
        destructive
        confirmText="Xoa"
        onConfirm={() => {
          if (toDelete?.numericId) deleteMutation.mutate(toDelete.numericId);
        }}
      />
    </div>
  );
}

function mapApiCourse(course: CourseResponse): CourseRow {
  return {
    id: String(course.id),
    numericId: course.id,
    code: course.code,
    name: course.name,
    credits: course.credits,
    majorName: course.majorName ?? "Can BE: majorName",
    description: course.description ?? "Can BE: description",
    courseType: course.courseTypeLabel ?? course.courseType ?? "Can BE: courseType",
    feePerCredit: 850000,
    prerequisites: course.prerequisiteNames?.length ? course.prerequisiteNames.join(", ") : "Khong",
    source: "API",
  };
}
