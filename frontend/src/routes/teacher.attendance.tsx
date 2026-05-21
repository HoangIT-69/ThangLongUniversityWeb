import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Clock, UserCheck, UserMinus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getDefaultTeacherSemesterId,
  getTeacherClassRows,
  getTeacherRosterRows,
  teacherSemesterOptions,
  type TeacherRosterRow,
} from "@/features/teacher/teacherData";
import { teacherApi } from "@/lib/api/teacher";

export const Route = createFileRoute("/teacher/attendance")({ component: TeacherAttendancePage });

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

const attendanceLabels: Record<AttendanceStatus, string> = {
  PRESENT: "Co mat",
  ABSENT: "Vang",
  LATE: "Muon",
};

function TeacherAttendancePage() {
  const [semesterId, setSemesterId] = useState(getDefaultTeacherSemesterId());
  const [classSectionId, setClassSectionId] = useState("");
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

  const classesQuery = useQuery({
    queryKey: ["teacher", "classes", semesterId],
    queryFn: () => teacherApi.listMyClasses(semesterId),
    retry: false,
  });

  const classRows = useMemo(
    () => getTeacherClassRows(classesQuery.isError ? undefined : classesQuery.data, semesterId),
    [classesQuery.data, classesQuery.isError, semesterId],
  );

  useEffect(() => {
    if (!classSectionId && classRows[0]) setClassSectionId(classRows[0].id);
    if (classSectionId && !classRows.some((row) => row.id === classSectionId)) {
      setClassSectionId(classRows[0]?.id ?? "");
    }
  }, [classRows, classSectionId]);

  const rosterQuery = useQuery({
    queryKey: ["teacher", "classes", classSectionId, "students"],
    queryFn: () => teacherApi.listClassStudents(classSectionId),
    enabled: Boolean(classSectionId),
    retry: false,
  });

  const rosterRows = useMemo(() => {
    const rows = getTeacherRosterRows(
      rosterQuery.isError ? undefined : rosterQuery.data,
      classSectionId,
    );
    return rows.length || !rosterQuery.isError ? rows : getTeacherRosterRows(undefined, "api-demo");
  }, [classSectionId, rosterQuery.data, rosterQuery.isError]);

  useEffect(() => {
    const nextAttendance: Record<string, AttendanceStatus> = {};
    rosterRows.forEach((row, index) => {
      nextAttendance[row.enrollmentId] =
        index % 9 === 0 ? "ABSENT" : index % 5 === 0 ? "LATE" : "PRESENT";
    });
    setAttendance(nextAttendance);
  }, [rosterRows]);

  const selectedClass = classRows.find((row) => row.id === classSectionId);
  const presentCount = countByStatus(attendance, "PRESENT");
  const absentCount = countByStatus(attendance, "ABSENT");
  const lateCount = countByStatus(attendance, "LATE");

  const setStudentStatus = (enrollmentId: string, status: AttendanceStatus) => {
    setAttendance((current) => ({ ...current, [enrollmentId]: status }));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Diem danh"
        description={
          rosterQuery.isError
            ? "Chua co API diem danh, FE dang demo bang roster/mock va state local"
            : "Diem danh theo tung buoi hoc: co mat, vang, di muon"
        }
        actions={
          <Button
            className="gap-2"
            onClick={() =>
              toast.success("Da luu diem danh demo. BE can API attendance de persist.")
            }
            disabled={!classSectionId || rosterRows.length === 0}
          >
            <CalendarCheck className="h-4 w-4" />
            Luu diem danh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sinh vien" value={rosterRows.length} icon={Users} tone="primary" />
        <StatCard label="Co mat" value={presentCount} icon={UserCheck} tone="success" />
        <StatCard label="Di muon" value={lateCount} icon={Clock} tone="warning" />
        <StatCard label="Vang" value={absentCount} icon={UserMinus} tone="destructive" />
      </div>

      <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-sm lg:grid-cols-[1fr_180px]">
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={semesterId} onValueChange={setSemesterId}>
            <SelectTrigger>
              <SelectValue placeholder="Hoc ky" />
            </SelectTrigger>
            <SelectContent>
              {teacherSemesterOptions.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {semester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classSectionId} onValueChange={setClassSectionId}>
            <SelectTrigger>
              <SelectValue placeholder="Lop hoc phan" />
            </SelectTrigger>
            <SelectContent>
              {classRows.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.classCode} - {row.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          value={sessionDate}
          onChange={(event) => setSessionDate(event.target.value)}
          type="date"
        />
        <div className="lg:col-span-2">
          <div className="text-sm font-medium">
            {selectedClass?.courseName ?? "Chon lop hoc phan"}
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedClass
              ? `${selectedClass.classCode} - ${selectedClass.scheduleText} - ${sessionDate}`
              : "Can chon lop de diem danh"}
          </div>
        </div>
      </div>

      <DataTable
        data={rosterRows}
        rowKey={(row) => row.enrollmentId}
        pageSize={12}
        searchPlaceholder="Tim ma sinh vien, ten, email..."
        emptyMessage="Chua co sinh vien trong lop"
        columns={[
          {
            key: "studentCode",
            header: "Sinh vien",
            render: (row) => (
              <div>
                <div className="font-mono text-xs font-semibold">{row.studentCode}</div>
                <Badge className="mt-1" variant={row.source === "API" ? "secondary" : "outline"}>
                  {row.source}
                </Badge>
              </div>
            ),
          },
          {
            key: "fullName",
            header: "Ho ten",
            render: (row) => <StudentInfo row={row} />,
          },
          { key: "majorName", header: "Nganh" },
          {
            key: "status",
            header: "Trang thai hoc",
            render: (row) => <Badge variant="outline">{row.status}</Badge>,
          },
          {
            key: "attendance",
            header: "Diem danh",
            searchable: false,
            className: "min-w-64",
            render: (row) => (
              <AttendanceActions
                value={attendance[row.enrollmentId] ?? "PRESENT"}
                onChange={(status) => setStudentStatus(row.enrollmentId, status)}
              />
            ),
          },
          {
            key: "roster",
            header: "",
            searchable: false,
            className: "w-24 text-right",
            render: () => (
              <Button asChild variant="ghost" size="sm">
                <Link to="/teacher/classes/$classSectionId/students" params={{ classSectionId }}>
                  Roster
                </Link>
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

function StudentInfo({ row }: { row: TeacherRosterRow }) {
  return (
    <div className="min-w-52">
      <div className="font-medium">{row.fullName}</div>
      <div className="text-xs text-muted-foreground">
        {row.email} - {row.cohort}
      </div>
    </div>
  );
}

function AttendanceActions({
  value,
  onChange,
}: {
  value: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(["PRESENT", "LATE", "ABSENT"] as const).map((status) => (
        <Button
          key={status}
          type="button"
          size="sm"
          variant={value === status ? "default" : "outline"}
          className={cn(
            "h-8",
            value === status && status === "ABSENT" && "bg-destructive text-destructive-foreground",
          )}
          onClick={() => onChange(status)}
        >
          {attendanceLabels[status]}
        </Button>
      ))}
    </div>
  );
}

function countByStatus(attendance: Record<string, AttendanceStatus>, status: AttendanceStatus) {
  return Object.values(attendance).filter((value) => value === status).length;
}
