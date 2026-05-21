import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { TeacherFormDialog } from "@/features/admin-crud/AcademicEntityFormDialogs";
import { adminApi } from "@/lib/api/admin";
import type { AdminTeacherRequest, AdminTeacherResponse } from "@/lib/api/types";
import { teachers as mockTeachers } from "@/data/mock";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/teachers")({ component: TeachersPage });

type TeacherRow = {
  id: string;
  numericId?: number;
  code: string;
  fullName: string;
  email: string;
  department: string;
  degree: string;
  phone: string;
  address: string;
  activeClasses: number;
  status: "ACTIVE" | "INACTIVE";
  source: "API" | "Mock";
};

function TeachersPage() {
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<TeacherRow | null>(null);
  const [editing, setEditing] = useState<{ id?: number; values: AdminTeacherRequest } | null>(null);

  const query = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: adminApi.listTeachers,
  });

  const rows = useMemo(() => {
    if (query.data?.length) return query.data.map(mapApiTeacher);
    return mockTeachers.map((teacher) => ({
      id: teacher.id,
      code: teacher.code,
      fullName: teacher.fullName,
      email: teacher.email,
      department: teacher.department,
      degree: "Can BE: degree",
      phone: "Can BE: phone",
      address: "Can BE: address",
      activeClasses: teacher.activeClasses,
      status: teacher.status,
      source: "Mock" as const,
    }));
  }, [query.data]);

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });
      toast.success("Da xoa giang vien");
      setToDelete(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: { id?: number; values: AdminTeacherRequest }) =>
      id ? adminApi.updateTeacher(id, values) : adminApi.createTeacher(values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });
      toast.success(variables.id ? "Da cap nhat giang vien" : "Da them giang vien");
      setEditing(null);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div>
      <PageHeader
        title="Giang vien"
        description={`${rows.length} giang vien${query.isError ? " - dang dung du lieu mau" : ""}`}
        actions={
          <Button
            className="gap-2"
            onClick={() => setEditing({ values: getDefaultTeacherRequest() })}
          >
            <Plus className="h-4 w-4" />
            Them giang vien
          </Button>
        }
      />

      <DataTable
        data={rows}
        rowKey={(teacher) => teacher.id}
        searchPlaceholder="Tim theo ma, ten, khoa, hoc vi..."
        columns={[
          {
            key: "code",
            header: "Ma GV",
            render: (teacher) => <span className="font-mono text-xs">{teacher.code}</span>,
          },
          {
            key: "fullName",
            header: "Ho ten",
            render: (teacher) => (
              <div className="min-w-48">
                <div className="font-medium">{teacher.fullName}</div>
                <div className="mt-1 flex gap-1">
                  <Badge variant={teacher.source === "API" ? "secondary" : "outline"}>
                    {teacher.source}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{teacher.degree}</span>
                </div>
              </div>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (teacher) => (
              <span className="text-xs text-muted-foreground">{teacher.email}</span>
            ),
          },
          { key: "department", header: "Khoa / Bo mon" },
          {
            key: "contact",
            header: "Lien he",
            accessor: (teacher) => `${teacher.phone} ${teacher.address}`,
            render: (teacher) => (
              <div className="max-w-56 text-xs text-muted-foreground">
                <div>{teacher.phone}</div>
                <div className="truncate">{teacher.address}</div>
              </div>
            ),
          },
          {
            key: "activeClasses",
            header: "Lop dang day",
            render: (teacher) => <span className="tabular-nums">{teacher.activeClasses}</span>,
          },
          {
            key: "status",
            header: "Trang thai",
            render: (teacher) => <StatusBadge value={teacher.status} />,
          },
          {
            key: "actions",
            header: "",
            className: "w-24 text-right",
            searchable: false,
            render: (teacher) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (!teacher.numericId) {
                      toast.info("Du lieu mock chi dung de xem demo, chua the sua len backend.");
                      return;
                    }
                    setEditing({ id: teacher.numericId, values: toTeacherRequest(teacher) });
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  disabled={!teacher.numericId}
                  onClick={() => setToDelete(teacher)}
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
        title="Xoa giang vien?"
        description={`Hanh dong nay khong the hoan tac: ${toDelete?.fullName}`}
        destructive
        confirmText="Xoa"
        onConfirm={() => {
          if (toDelete?.numericId) deleteMutation.mutate(toDelete.numericId);
        }}
      />
      <TeacherFormDialog
        open={!!editing}
        editing={editing?.values ?? null}
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

function mapApiTeacher(teacher: AdminTeacherResponse): TeacherRow {
  return {
    id: String(teacher.id),
    numericId: teacher.id,
    code: teacher.teacherCode,
    fullName: teacher.fullName,
    email: teacher.email ?? `Can BE: email (${teacher.teacherCode.toLowerCase()}@tlu.edu.vn)`,
    department: teacher.department ?? "Can BE: department",
    degree: teacher.degree ?? "Can BE: degree",
    phone: teacher.phone ?? "Can BE: phone",
    address: teacher.address ?? "Can BE: address",
    activeClasses: 1 + (teacher.id % 4),
    status: "ACTIVE",
    source: "API",
  };
}

function getDefaultTeacherRequest(): AdminTeacherRequest {
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

function toTeacherRequest(teacher: TeacherRow): AdminTeacherRequest {
  return {
    username: teacher.code.toLowerCase(),
    password: "password123",
    email: teacher.email.startsWith("Can BE") ? `${teacher.code.toLowerCase()}@tlu.edu.vn` : teacher.email,
    teacherCode: teacher.code,
    fullName: teacher.fullName,
    dob: "",
    department: teacher.department.startsWith("Can BE") ? "" : teacher.department,
    degree: teacher.degree.startsWith("Can BE") ? "" : teacher.degree,
    address: teacher.address.startsWith("Can BE") ? "" : teacher.address,
    phone: teacher.phone.startsWith("Can BE") ? "" : teacher.phone,
  };
}
