import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Lock, Power, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import type { StudentSemesterResponse } from "@/lib/api/types";

export const Route = createFileRoute("/admin/semesters")({ component: SemestersPage });

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function toSemesterRequest(semester: StudentSemesterResponse, registrationOpen: boolean) {
  return {
    name: semester.name,
    startDate: semester.startDate,
    endDate: semester.endDate,
    registrationOpen,
  };
}

function SemestersPage() {
  const queryClient = useQueryClient();
  const semestersQuery = useQuery({ queryKey: ["admin", "semesters"], queryFn: adminApi.listSemesters });
  const semesters = semestersQuery.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "semesters"] });
    queryClient.invalidateQueries({ queryKey: ["student", "semesters"] });
  };

  const toggleRegistrationMutation = useMutation({
    mutationFn: ({ semester, registrationOpen }: { semester: StudentSemesterResponse; registrationOpen: boolean }) =>
      adminApi.updateSemester(semester.id, toSemesterRequest(semester, registrationOpen)),
    onSuccess: () => {
      invalidate();
      toast.success("Đã cập nhật trạng thái đăng ký học phần");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không cập nhật được học kỳ"),
  });

  const lockEnrollmentMutation = useMutation({
    mutationFn: (semesterId: number) => adminApi.lockEnrollmentSemester(semesterId),
    onSuccess: (message) => {
      invalidate();
      toast.success(message || "Đã chốt đăng ký học phần");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không chốt được đăng ký học phần"),
  });

  const lockRetakeMutation = useMutation({
    mutationFn: (semesterId: number) => adminApi.lockRetakeSemester(semesterId),
    onSuccess: (message) => {
      invalidate();
      toast.success(message || "Đã chốt đăng ký thi lại");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không chốt được đăng ký thi lại"),
  });

  return (
    <div>
      <PageHeader title="Học kỳ" description={`${semesters.length} học kỳ`} />

      {semestersQuery.isError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {semestersQuery.error instanceof Error ? semestersQuery.error.message : "Không tải được danh sách học kỳ"}
        </div>
      )}

      <DataTable
        data={semesters}
        rowKey={(s) => s.id}
        columns={[
          { key: "name", header: "Học kỳ", render: (s) => <span className="font-medium">{s.name}</span> },
          { key: "range", header: "Thời gian học", accessor: (s) => s.startDate ?? "", render: (s) => <span className="text-sm">{formatDate(s.startDate)} - {formatDate(s.endDate)}</span> },
          { key: "registration", header: "Đăng ký", render: (s) => <StatusBadge value={s.registrationOpen ? "OPEN" : "CLOSED"} /> },
          { key: "lock", header: "Khóa", render: (s) => <StatusBadge value={s.locked ? "LOCKED" : "UNLOCKED"} /> },
          { key: "actions", header: "", className: "min-w-[420px] text-right", searchable: false, render: (s) => {
            const toggling = toggleRegistrationMutation.isPending && toggleRegistrationMutation.variables?.semester.id === s.id;
            const lockingEnrollment = lockEnrollmentMutation.isPending && lockEnrollmentMutation.variables === s.id;
            const lockingRetake = lockRetakeMutation.isPending && lockRetakeMutation.variables === s.id;
            return (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={s.locked || toggling}
                  onClick={() => toggleRegistrationMutation.mutate({ semester: s, registrationOpen: !s.registrationOpen })}
                >
                  {s.registrationOpen ? <Power className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                  {s.registrationOpen ? "Đóng đăng ký" : "Mở đăng ký"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={lockingEnrollment}
                  onClick={() => lockEnrollmentMutation.mutate(s.id)}
                >
                  <Lock className="h-4 w-4" />
                  Chốt học phần
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={lockingRetake}
                  onClick={() => lockRetakeMutation.mutate(s.id)}
                >
                  <Lock className="h-4 w-4" />
                  Chốt thi lại
                </Button>
              </div>
            );
          }},
        ]}
      />
    </div>
  );
}
