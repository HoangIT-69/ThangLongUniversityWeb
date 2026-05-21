import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ClipboardList, GraduationCap, Lock, UserPlus, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import type { AdminEnrollmentStatus } from "@/lib/api/types";
import {
  createManualEnrollmentRow,
  getEnrollmentPageContent,
  getEnrollmentStats,
  mapClassSectionOptions,
  mapApiEnrollment,
  mapMockEnrollments,
  mapStudentOptions,
} from "./enrollmentApprovalMock";
import { EnrollmentApprovalTable } from "./EnrollmentApprovalTable";
import { ManualEnrollmentDialog } from "./ManualEnrollmentDialog";
import type { EnrollmentApprovalRow, EnrollmentFilter, ManualEnrollmentValues } from "./types";

const enrollmentKey = ["admin", "enrollments"] as const;
const allFilter = "ALL";
const filterOptions: EnrollmentFilter[] = ["ALL", "REGISTERED", "ENROLLED", "CANCELLED", "FAILED"];

export function AdminEnrollmentsContent() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<EnrollmentFilter>(allFilter);
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [localRows, setLocalRows] = useState<EnrollmentApprovalRow[]>([]);
  const [lockedClassIds, setLockedClassIds] = useState<Record<string, boolean>>({});
  const [statusOverrides, setStatusOverrides] = useState<Record<string, AdminEnrollmentStatus>>({});

  const query = useQuery({
    queryKey: [...enrollmentKey, filter],
    queryFn: () =>
      adminApi.listEnrollments({
        page: 0,
        size: 50,
        status: filter === allFilter ? undefined : filter,
      }),
    retry: false,
    staleTime: 60 * 1000,
  });
  const studentsQuery = useQuery({
    queryKey: ["admin", "students"],
    queryFn: adminApi.listStudents,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const classSectionsQuery = useQuery({
    queryKey: ["admin", "class-sections"],
    queryFn: adminApi.listClassSections,
    retry: false,
    staleTime: 60 * 1000,
  });

  const studentOptions = useMemo(() => mapStudentOptions(studentsQuery.data), [studentsQuery.data]);
  const classSectionOptions = useMemo(
    () =>
      mapClassSectionOptions(classSectionsQuery.data).map((section) => ({
        ...section,
        locked: lockedClassIds[String(section.id)] ?? section.locked,
      })),
    [classSectionsQuery.data, lockedClassIds],
  );

  const rows = useMemo(() => {
    const sourceRows = query.data
      ? getEnrollmentPageContent(query.data).map(mapApiEnrollment)
      : mapMockEnrollments();
    return [...localRows, ...sourceRows].map((row) => ({
      ...row,
      status: statusOverrides[row.id] ?? row.status,
      approvedAt:
        statusOverrides[row.id] === "ENROLLED" ? new Date().toISOString() : row.approvedAt,
    }));
  }, [localRows, query.data, statusOverrides]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesStatus = filter === allFilter || row.status === filter;
      const matchesClass =
        selectedClassId === "ALL" || String(row.classSectionId) === selectedClassId;
      return matchesStatus && matchesClass;
    });
  }, [filter, rows, selectedClassId]);

  const stats = useMemo(() => getEnrollmentStats(rows), [rows]);

  const manualMutation = useMutation({
    mutationFn: (values: ManualEnrollmentValues) =>
      adminApi.overrideEnrollment({
        studentId: values.studentId,
        classSectionId: values.classSectionId,
        note: values.note,
      }),
    onSuccess: (response) => {
      setLocalRows((current) => [mapApiEnrollment(response), ...current]);
      queryClient.invalidateQueries({ queryKey: enrollmentKey });
      toast.success("Da them sinh vien vao lop hoc phan");
      setManualOpen(false);
    },
    onError: (error, values) => {
      const student = studentOptions.find((item) => item.id === values.studentId);
      const section = classSectionOptions.find((item) => item.id === values.classSectionId);
      if (!student || !section) {
        toast.error(error.message);
        return;
      }
      setLocalRows((current) => [
        createManualEnrollmentRow(`manual-${Date.now()}`, student, section, values.note),
        ...current,
      ]);
      toast.warning("API override chua san sang, FE da them demo local");
      setManualOpen(false);
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: (classSectionId: number) =>
      adminApi.finalizeClassSectionEnrollments(classSectionId, {
        note: "Khoa dang ky va chot danh sach lop",
      }),
    onSuccess: (response) => {
      lockClassSection(String(response.classSectionId));
      queryClient.invalidateQueries({ queryKey: enrollmentKey });
      toast.success(`Da khoa dang ky lop ${response.classCode}`);
    },
    onError: () => {
      if (selectedClassId === "ALL") {
        toast.error("Chon mot lop hoc phan truoc khi khoa dang ky");
        return;
      }
      lockClassSection(selectedClassId);
      toast.warning("API khoa dang ky chua san sang, FE da chot demo local");
    },
  });

  if (query.isPending) return <EnrollmentsSkeleton />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quan ly dang ky hoc phan"
        description={`${filteredRows.length} dang ky${query.isError ? " - dang dung demo" : ""}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setManualOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Them SV thu cong
            </Button>
            <Button
              className="gap-2"
              disabled={selectedClassId === "ALL" || finalizeMutation.isPending}
              onClick={() => finalizeMutation.mutate(Number(selectedClassId))}
            >
              <Lock className="h-4 w-4" />
              Khoa dang ky lop
            </Button>
          </div>
        }
      />

      {query.isError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Chua tai duoc API dang ky hoc phan</AlertTitle>
          <AlertDescription>
            {query.error.message}. FE dang hien demo luong he thong tu kiem tra, admin them thu cong
            va khoa dang ky.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Tong dang ky" value={stats.total} icon={ClipboardList} />
        <StatCard label="Da dang ky" value={stats.registered} icon={AlertCircle} />
        <StatCard label="Da chot lop" value={stats.enrolled} icon={GraduationCap} />
        <StatCard label="Admin them" value={stats.manual} icon={UserPlus} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Danh sach dang ky hoc phan</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Dang ky hop le do he thong xu ly tu dong. Admin chi can them thu cong khi can dieu
              chinh hoc vu va khoa dang ky de chot lop.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full sm:w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tat ca lop hoc phan</SelectItem>
                {classSectionOptions.map((section) => (
                  <SelectItem key={section.id} value={String(section.id)}>
                    {section.code} {section.locked ? "(da khoa)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filter} onValueChange={(value: EnrollmentFilter) => setFilter(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === allFilter ? "Tat ca trang thai" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <EnrollmentApprovalTable rows={filteredRows} />
        </CardContent>
      </Card>

      <ManualEnrollmentDialog
        open={manualOpen}
        students={studentOptions}
        classSections={classSectionOptions}
        isPending={manualMutation.isPending}
        onOpenChange={setManualOpen}
        onSubmit={(values) => manualMutation.mutate(values)}
      />
    </div>
  );

  function lockClassSection(classSectionId: string) {
    setLockedClassIds((current) => ({ ...current, [classSectionId]: true }));
    setStatusOverrides((current) => {
      const next = { ...current };
      rows.forEach((row) => {
        if (String(row.classSectionId) === classSectionId && row.status === "REGISTERED") {
          next[row.id] = "ENROLLED";
        }
      });
      return next;
    });
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardList;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

function EnrollmentsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-80" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
