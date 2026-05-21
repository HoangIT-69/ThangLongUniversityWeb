import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { StudentFormDialog } from "@/features/admin-crud/AcademicEntityFormDialogs";
import { adminApi } from "@/lib/api/admin";
import type { AdminStudentRequest, AdminStudentResponse } from "@/lib/api/types";
import { getMajor, students as mockStudents } from "@/data/mock";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/students")({ component: StudentsPage });

type StudentRow = {
  id: string;
  numericId?: number;
  code: string;
  username: string;
  fullName: string;
  email: string;
  majorId: number;
  majorName: string;
  cohort: string;
  academicYear: string;
  dob: string;
  address: string;
  status: "ACTIVE" | "SUSPENDED" | "GRADUATED";
  gpa: number;
  credits: number;
  source: "API" | "Mock";
};

function StudentsPage() {
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<StudentRow | null>(null);
  const [editing, setEditing] = useState<{ id?: number; values: AdminStudentRequest } | null>(null);

  const query = useQuery({
    queryKey: ["admin", "students"],
    queryFn: adminApi.listStudents,
  });
  const majorsQuery = useQuery({
    queryKey: ["admin", "majors"],
    queryFn: adminApi.listMajors,
    retry: false,
  });

  const rows = useMemo(() => {
    if (query.data?.length) return query.data.map(mapApiStudent);
    return mockStudents.map((student) => ({
      id: student.id,
      code: student.code,
      username: student.code.toLowerCase(),
      fullName: student.fullName,
      email: student.email,
      majorId: Number(student.majorId),
      majorName: getMajor(student.majorId).name,
      cohort: student.cohort,
      academicYear: `${Number(student.cohort.replace("K", ""))}-${Number(student.cohort.replace("K", "")) + 4}`,
      dob: "Can BE: dob",
      address: "Can BE: address",
      status: student.status,
      gpa: student.gpa,
      credits: student.credits,
      source: "Mock" as const,
    }));
  }, [query.data]);

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      toast.success("Da xoa sinh vien");
      setToDelete(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: { id?: number; values: AdminStudentRequest }) =>
      id ? adminApi.updateStudent(id, values) : adminApi.createStudent(values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      toast.success(variables.id ? "Da cap nhat sinh vien" : "Da them sinh vien");
      setEditing(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const majorOptions = useMemo(() => {
    const source = majorsQuery.data?.length
      ? majorsQuery.data.map((major) => ({ value: major.id, label: `${major.majorCode} - ${major.name}` }))
      : [];
    if (source.length) return source;
    return mockStudents.length
      ? Array.from(
          new Map(
            mockStudents.map((student) => {
              const major = getMajor(student.majorId);
              return [major.id, { value: Number(major.id), label: `${major.code} - ${major.name}` }];
            }),
          ).values(),
        )
      : [];
  }, [majorsQuery.data]);

  return (
    <div>
      <PageHeader
        title="Sinh vien"
        description={`${rows.length} sinh vien${query.isError ? " - dang dung du lieu mau" : ""}`}
        actions={
          <Button
            className="gap-2"
            onClick={() => setEditing({ values: getDefaultStudentRequest(majorOptions[0]?.value) })}
          >
            <Plus className="h-4 w-4" />
            Them sinh vien
          </Button>
        }
      />

      <DataTable
        data={rows}
        rowKey={(student) => student.id}
        pageSize={10}
        searchPlaceholder="Tim theo ma, ten, email, nganh..."
        columns={[
          {
            key: "code",
            header: "Ma SV",
            render: (student) => <span className="font-mono text-xs">{student.code}</span>,
          },
          {
            key: "fullName",
            header: "Ho ten",
            render: (student) => (
              <div className="min-w-48">
                <div className="font-medium">{student.fullName}</div>
                <div className="mt-1 flex gap-1">
                  <Badge variant={student.source === "API" ? "secondary" : "outline"}>
                    {student.source}
                  </Badge>
                  <span className="text-xs text-muted-foreground">@{student.username}</span>
                </div>
              </div>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (student) => (
              <span className="text-xs text-muted-foreground">{student.email}</span>
            ),
          },
          {
            key: "majorName",
            header: "Nganh",
            render: (student) => (
              <div>
                <div className="text-sm">{student.majorName}</div>
                <div className="text-xs text-muted-foreground">{student.academicYear}</div>
              </div>
            ),
          },
          { key: "cohort", header: "Khoa" },
          {
            key: "profile",
            header: "Ho so",
            accessor: (student) => `${student.dob} ${student.address}`,
            render: (student) => (
              <div className="max-w-56 text-xs text-muted-foreground">
                <div>{student.dob}</div>
                <div className="truncate">{student.address}</div>
              </div>
            ),
          },
          {
            key: "gpa",
            header: "Hoc tap",
            render: (student) => (
              <div className="text-sm tabular-nums">
                <div>GPA {student.gpa.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">{student.credits} tin chi</div>
              </div>
            ),
          },
          {
            key: "status",
            header: "Trang thai",
            render: (student) => <StatusBadge value={student.status} />,
          },
          {
            key: "actions",
            header: "",
            className: "w-24 text-right",
            searchable: false,
            render: (student) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (!student.numericId) {
                      toast.info("Du lieu mock chi dung de xem demo, chua the sua len backend.");
                      return;
                    }
                    setEditing({ id: student.numericId, values: toStudentRequest(student) });
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  disabled={!student.numericId}
                  onClick={() => setToDelete(student)}
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
        title="Xoa sinh vien?"
        description={`Hanh dong nay khong the hoan tac. Sinh vien: ${toDelete?.fullName}`}
        destructive
        confirmText="Xoa"
        onConfirm={() => {
          if (toDelete?.numericId) deleteMutation.mutate(toDelete.numericId);
        }}
      />
      <StudentFormDialog
        open={!!editing}
        editing={editing?.values ?? null}
        majors={majorOptions}
        isPending={saveMutation.isPending}
        onOpenChange={(open) => !open && setEditing(null)}
        onSubmit={(values) => {
          if (!editing) return;
          saveMutation.mutate({ id: editing.id, values });
        }}
      />
    </div>
  );
}

function mapApiStudent(student: AdminStudentResponse): StudentRow {
  const academicYear = formatAcademicYear(student.academicYear);
  const cohort = getCohort(student.academicYear);

  return {
    id: String(student.id),
    numericId: student.id,
    code: student.studentCode,
    username: student.username,
    fullName: student.fullName,
    email: student.email,
    majorId: student.majorId ?? 0,
    majorName: student.majorName ?? "Can BE: majorName",
    cohort,
    academicYear,
    dob: student.dob ?? "Can BE: dob",
    address: student.address ?? "Can BE: address",
    status: "ACTIVE",
    gpa: 3 + (student.id % 8) / 10,
    credits: 24 + (student.id % 8) * 12,
    source: "API",
  };
}

function formatAcademicYear(value: AdminStudentResponse["academicYear"]) {
  if (typeof value === "number") return `${value}-${value + 4}`;
  if (typeof value === "string" && value.trim()) return value;
  return "Can BE: academicYear";
}

function getCohort(value: AdminStudentResponse["academicYear"]) {
  if (typeof value === "number") return `K${value}`;
  if (typeof value === "string" && value.trim()) return `K${value.split("-")[0]}`;
  return "K2024";
}

function getDefaultStudentRequest(firstMajorId?: number | string): AdminStudentRequest {
  return {
    username: "",
    password: "password123",
    email: "",
    studentCode: "",
    fullName: "",
    dob: "",
    majorId: Number(firstMajorId ?? 0),
    academicYear: 2026,
    address: "",
  };
}

function toStudentRequest(student: StudentRow): AdminStudentRequest {
  return {
    username: student.username,
    password: "password123",
    email: student.email,
    studentCode: student.code,
    fullName: student.fullName,
    dob: student.dob.startsWith("Can BE") ? "" : student.dob,
    majorId: student.majorId,
    academicYear: Number(student.academicYear.split("-")[0]) || 2026,
    address: student.address.startsWith("Can BE") ? "" : student.address,
  };
}
