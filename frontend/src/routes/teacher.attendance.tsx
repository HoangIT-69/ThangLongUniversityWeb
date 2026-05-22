import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Lock,
  LockOpen,
  Search,
  UserMinus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getTeacherClassRows,
  getTeacherRosterRows,
  type TeacherRosterRow,
} from "@/features/teacher/teacherData";
import { useTeacherSemester } from "@/features/teacher/useTeacherSemester";
import type { AttendanceRecordRequest } from "@/lib/api/types";
import { teacherApi } from "@/lib/api/teacher";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/attendance")({ component: TeacherAttendancePage });

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "UNMARKED";
type AttendanceBook = Record<string, Record<number, AttendanceStatus>>;

const WEEKS_PER_COURSE = 15;
const ABSENT_LIMIT = 3;

const statusMeta: Record<AttendanceStatus, { label: string; short: string; className: string }> = {
  PRESENT: {
    label: "Co mat",
    short: "C",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  LATE: {
    label: "Muon",
    short: "M",
    className: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
  ABSENT: {
    label: "Vang",
    short: "V",
    className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  },
  UNMARKED: {
    label: "Chua diem",
    short: "-",
    className: "border-border bg-background text-muted-foreground hover:bg-muted",
  },
};

function TeacherAttendancePage() {
  const { semesterId, setSemesterId, semesterOptions } = useTeacherSemester();
  const [classSectionId, setClassSectionId] = useState("");
  const [selectedSession, setSelectedSession] = useState(1);
  const [search, setSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [lockedSessions, setLockedSessions] = useState<Set<number>>(new Set());
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceBook>({});
  const queryClient = useQueryClient();

  const classesQuery = useQuery({
    queryKey: ["teacher", "classes", semesterId],
    queryFn: () => teacherApi.listMyClasses(semesterId),
    enabled: Boolean(semesterId),
    retry: false,
  });

  const classRows = useMemo(
    () => getTeacherClassRows(classesQuery.isError ? undefined : classesQuery.data, semesterId),
    [classesQuery.data, classesQuery.isError, semesterId],
  );

  useEffect(() => {
    if (classSectionId && !classRows.some((row) => row.id === classSectionId)) {
      setClassSectionId("");
      setSelectedSession(1);
      setAttendance({});
    }
  }, [classRows, classSectionId]);

  const uniqueCourses = useMemo(() => {
    const map = new Map<string, string>();
    classRows.forEach((row) => map.set(row.courseCode, row.courseName));
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [classRows]);

  const ALL_COURSES = "__all__";

  const filteredClasses = useMemo(() => {
    let rows = classRows;
    if (courseFilter && courseFilter !== ALL_COURSES)
      rows = rows.filter((r) => r.courseCode === courseFilter);
    if (classSearch.trim()) {
      const kw = classSearch.toLowerCase();
      rows = rows.filter(
        (r) => r.classCode.toLowerCase().includes(kw) || r.courseName.toLowerCase().includes(kw),
      );
    }
    return rows;
  }, [classRows, courseFilter, classSearch]);

  const selectedClass = classRows.find((row) => row.id === classSectionId);
  const selectedApiClass = classesQuery.data?.find((row) => String(row.id) === classSectionId);
  const sessionsPerWeek = Math.min(Math.max(selectedApiClass?.schedules?.length ?? 1, 1), 2);
  const totalSessions = WEEKS_PER_COURSE * sessionsPerWeek;
  const sessionNumbers = useMemo(
    () => Array.from({ length: totalSessions }, (_, index) => index + 1),
    [totalSessions],
  );

  const rosterQuery = useQuery({
    queryKey: ["teacher", "classes", classSectionId, "students"],
    queryFn: () => teacherApi.listClassStudents(selectedClass?.numericId ?? classSectionId),
    enabled: Boolean(selectedClass?.numericId),
    retry: false,
  });

  const rosterRows = useMemo(
    () => getTeacherRosterRows(rosterQuery.isError ? undefined : rosterQuery.data, classSectionId),
    [classSectionId, rosterQuery.data, rosterQuery.isError],
  );

  // Load saved attendance records for the selected session from backend
  const sessionQuery = useQuery({
    queryKey: ["teacher", "attendance", classSectionId, selectedSession],
    queryFn: () =>
      teacherApi.getAttendanceSession(
        selectedClass?.numericId ?? classSectionId,
        selectedSession,
      ),
    enabled: Boolean(selectedClass?.numericId) && rosterRows.length > 0,
    retry: false,
  });

  // Load all sessions to determine locked state and auto-select current session
  const allSessionsQuery = useQuery({
    queryKey: ["teacher", "attendance", classSectionId, "all"],
    queryFn: () => teacherApi.getAttendanceSessions(selectedClass?.numericId ?? classSectionId),
    enabled: Boolean(selectedClass?.numericId),
    retry: false,
  });

  // Initialize locked sessions from backend data
  useEffect(() => {
    if (!allSessionsQuery.data) return;
    const locked = new Set(
      allSessionsQuery.data.filter((s) => s.locked).map((s) => s.sessionNumber),
    );
    setLockedSessions(locked);
  }, [allSessionsQuery.data]);

  // Auto-select the current (today's) session: first session not yet locked
  useEffect(() => {
    if (hasAutoSelected || !allSessionsQuery.data || !rosterRows.length) return;
    const lockedNums = new Set(
      allSessionsQuery.data.filter((s) => s.locked).map((s) => s.sessionNumber),
    );
    const firstUnlocked = sessionNumbers.find((n) => !lockedNums.has(n)) ?? sessionNumbers[0] ?? 1;
    setSelectedSession(firstUnlocked);
    setHasAutoSelected(true);
  }, [allSessionsQuery.data, rosterRows.length, hasAutoSelected, sessionNumbers]);

  // Hydrate local state with records returned from backend
  useEffect(() => {
    if (!sessionQuery.data) return;
    const records = sessionQuery.data.records;
    if (records.length === 0) return;
    setAttendance((current) => {
      const next = { ...current };
      records.forEach((record) => {
        const eid = String(record.enrollmentId);
        next[eid] = {
          ...(next[eid] ?? {}),
          [selectedSession]: record.status as AttendanceStatus,
        };
      });
      return next;
    });
  }, [sessionQuery.data, selectedSession]);

  useEffect(() => {
    setAttendance((current) => {
      const next: AttendanceBook = {};
      rosterRows.forEach((row) => {
        next[row.enrollmentId] = {};
        sessionNumbers.forEach((session) => {
          next[row.enrollmentId][session] = current[row.enrollmentId]?.[session] ?? "UNMARKED";
        });
      });
      return next;
    });
  }, [rosterRows, sessionNumbers]);

  useEffect(() => {
    if (selectedSession > totalSessions) setSelectedSession(1);
  }, [selectedSession, totalSessions]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rosterRows;
    return rosterRows.filter((row) =>
      [row.studentCode, row.fullName].some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [rosterRows, search]);

  const nextAllowedSession = useMemo(
    () => getNextAllowedSession(attendance, rosterRows, sessionNumbers),
    [attendance, rosterRows, sessionNumbers],
  );
  const currentCounts = useMemo(
    () => countSession(attendance, rosterRows, selectedSession),
    [attendance, rosterRows, selectedSession],
  );
  const activeStudentCount = useMemo(
    () =>
      rosterRows.filter((row) => countAbsences(attendance[row.enrollmentId] ?? {}) <= ABSENT_LIMIT)
        .length,
    [attendance, rosterRows],
  );
  const currentWeek = Math.ceil(selectedSession / sessionsPerWeek);
  const sessionInWeek = ((selectedSession - 1) % sessionsPerWeek) + 1;
  const isCurrentSessionComplete = rosterRows.length > 0 && currentCounts.UNMARKED === 0;
  const isSessionLocked = lockedSessions.has(selectedSession);

  const lockMutation = useMutation({
    mutationFn: async () => {
      const records: AttendanceRecordRequest[] = rosterRows
        .map((row) => {
          const status = attendance[row.enrollmentId]?.[selectedSession];
          if (!status || status === "UNMARKED") return null;
          return {
            enrollmentId: row.numericEnrollmentId ?? Number(row.enrollmentId),
            status: status as "PRESENT" | "LATE" | "ABSENT",
          };
        })
        .filter((r): r is AttendanceRecordRequest => r !== null);
      await teacherApi.saveAttendanceRecords(
        selectedClass?.numericId ?? classSectionId,
        selectedSession,
        records,
      );
      await teacherApi.lockAttendanceSession(
        selectedClass?.numericId ?? classSectionId,
        selectedSession,
      );
    },
    onSuccess: () => {
      toast.success(`Đã khóa buổi ${selectedSession}.`);
      setLockedSessions((prev) => new Set([...prev, selectedSession]));
      void queryClient.invalidateQueries({
        queryKey: ["teacher", "classes", classSectionId, "students"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["teacher", "attendance", classSectionId, selectedSession],
      });
      void queryClient.invalidateQueries({
        queryKey: ["teacher", "attendance", classSectionId, "all"],
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Khóa thất bại, vui lòng thử lại.");
    },
  });

  const setStudentStatus = (enrollmentId: string, status: AttendanceStatus) => {
    setAttendance((current) => ({
      ...current,
      [enrollmentId]: {
        ...current[enrollmentId],
        [selectedSession]: status,
      },
    }));
  };

  const selectSession = (session: number) => {
    if (session > nextAllowedSession && !lockedSessions.has(session)) {
      toast.error(`Cần hoàn thành buổi ${nextAllowedSession} trước khi điểm danh buổi ${session}`);
      return;
    }
    setSelectedSession(session);
  };

  const lockCurrentSession = () => {
    if (!isCurrentSessionComplete) {
      toast.error("Còn sinh viên chưa được điểm danh trong buổi này");
      return;
    }
    lockMutation.mutate();
  };

  const selectClass = (id: string) => {
    setClassSectionId(id);
    setSelectedSession(1);
    setSearch("");
    setAttendance({});
    setHasAutoSelected(false);
    setLockedSessions(new Set());
  };

  const clearClass = () => {
    setClassSectionId("");
    setSelectedSession(1);
    setSearch("");
    setAttendance({});
    setHasAutoSelected(false);
    setLockedSessions(new Set());
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Diem danh"
        description="Diem danh theo tung buoi hoc, 15 tuan co dinh va khoa cac buoi tuong lai neu buoi hien tai chua xong"
      />

      <section className="rounded-xl border bg-card p-4 shadow-sm">
        {!classSectionId ? (
          /* ── Class list picker ── */
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <Select
                value={semesterId}
                onValueChange={setSemesterId}
                disabled={semesterOptions.length === 0}
              >
                <SelectTrigger className="sm:w-52">
                  <SelectValue placeholder="Chon hoc ky" />
                </SelectTrigger>
                <SelectContent>
                  {semesterOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Tim lop hoc phan..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>
              <Select
                value={courseFilter || ALL_COURSES}
                onValueChange={(v) => setCourseFilter(v === ALL_COURSES ? "" : v)}
                disabled={uniqueCourses.length === 0}
              >
                <SelectTrigger className="sm:w-56">
                  <SelectValue placeholder="Tat ca mon hoc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_COURSES}>Tat ca mon hoc</SelectItem>
                  {uniqueCourses.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!semesterId && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Hay chon hoc ky de xem danh sach lop hoc phan.
              </div>
            )}
            {classesQuery.isLoading && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Dang tai danh sach lop...
              </div>
            )}
            {classesQuery.isError && (
              <div className="py-4 text-sm text-destructive">
                {classesQuery.error instanceof Error
                  ? classesQuery.error.message
                  : "Khong tai duoc danh sach lop"}
              </div>
            )}
            {semesterId && !classesQuery.isLoading && !classesQuery.isError && filteredClasses.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Khong tim thay lop hoc phan phu hop.
              </div>
            )}

            <div className="grid gap-3 lg:grid-cols-2">
              {filteredClasses.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{row.courseName}</div>
                    <div className="text-sm text-muted-foreground">{row.classCode}</div>
                    {row.scheduleText && (
                      <div className="mt-0.5 text-xs text-muted-foreground">{row.scheduleText}</div>
                    )}
                  </div>
                  <Button size="sm" onClick={() => selectClass(row.id)}>
                    Diem danh
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ── Selected class header ── */
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{selectedClass?.courseName}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                {selectedClass?.classCode}
                {selectedClass?.scheduleText ? ` · ${selectedClass.scheduleText}` : ""}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">{WEEKS_PER_COURSE} tuan</Badge>
                <Badge variant="outline">{sessionsPerWeek} buoi/tuan</Badge>
                <Badge variant="outline">{totalSessions} buoi hoc</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={clearClass} className="shrink-0">
              ← Doi lop
            </Button>
          </div>
        )}
      </section>

      {selectedClass && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Con lai lop" value={activeStudentCount} icon={Users} tone="primary" />
            <StatCard label="Di hoc buoi nay" value={currentCounts.PRESENT} icon={CheckCircle2} tone="success" />
            <StatCard label="Muon buoi nay" value={currentCounts.LATE} icon={Clock} tone="warning" />
            <StatCard label="Nghi buoi nay" value={currentCounts.ABSENT} icon={UserMinus} tone="destructive" />
          </div>

          <section className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  Buoi {selectedSession} - Tuan {currentWeek}
                  {sessionsPerWeek > 1 ? `, ca ${sessionInWeek}` : ""}
                  {isSessionLocked && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" /> Da khoa
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isSessionLocked
                    ? "Buoi nay da duoc khoa, khong the chinh sua them."
                    : "Diem danh xong tat ca sinh vien roi bam Khoa buoi."}
                </div>
              </div>
              <div>
                {isSessionLocked ? (
                  <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                    <Lock className="h-3.5 w-3.5" /> Buoi da khoa
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    disabled={
                      !isCurrentSessionComplete || lockMutation.isPending || rosterRows.length === 0
                    }
                    onClick={lockCurrentSession}
                    className="gap-2"
                  >
                    <LockOpen className="h-4 w-4" />
                    {lockMutation.isPending ? "Dang khoa..." : `Khoa buoi ${selectedSession}`}
                  </Button>
                )}
              </div>
            </div>

            <SessionTimeline
              attendance={attendance}
              nextAllowedSession={nextAllowedSession}
              rosterRows={rosterRows}
              selectedSession={selectedSession}
              sessionsPerWeek={sessionsPerWeek}
              lockedSessions={lockedSessions}
              onSelect={selectSession}
            />
          </section>

          <section className="rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-semibold">Danh sach diem danh buoi {selectedSession}</h2>
                <p className="text-xs text-muted-foreground">
                  Sinh vien nghi qua {ABSENT_LIMIT} buoi se chuyen trang thai mon hoc thanh Hoc lai.
                </p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8 sm:w-80"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tim ma SV hoac ho ten"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-32 font-semibold">Ma SV</TableHead>
                    <TableHead className="font-semibold">Ho ten</TableHead>
                    <TableHead className="w-36 text-center font-semibold">Trang thai mon</TableHead>
                    <TableHead className="w-24 text-center font-semibold">Da nghi</TableHead>
                    <TableHead className="w-[360px] text-center font-semibold">Diem danh buoi nay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => {
                    const studentSessions = attendance[row.enrollmentId] ?? {};
                    const status = studentSessions[selectedSession] ?? "UNMARKED";
                    const absentCount = countAbsences(studentSessions);
                    const backendStatus = row.courseStatus;
                    const localBanned = absentCount > ABSENT_LIMIT;
                    const isBanned =
                      backendStatus === "BANNED_FROM_EXAM" ||
                      backendStatus === "REPEAT_COURSE" ||
                      localBanned;

                    const courseStatusLabel: Record<string, string> = {
                      IN_PROGRESS: "Đang học",
                      PASSED: "Qua môn",
                      BANNED_FROM_EXAM: "Cấm thi",
                      REPEAT_COURSE: "Học lại",
                      RETAKE_EXAM: "Thi lại",
                    };
                    const statusLabel = backendStatus
                      ? (courseStatusLabel[backendStatus] ?? backendStatus)
                      : isBanned
                        ? "Cấm thi"
                        : "Đang học";

                    return (
                      <TableRow key={row.enrollmentId}>
                        <TableCell className="font-mono text-xs font-semibold">
                          {row.studentCode}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{row.fullName}</div>
                          <div className="text-xs text-muted-foreground">{row.className}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={isBanned ? "destructive" : "outline"}
                            className={cn(
                              !isBanned &&
                                backendStatus === "PASSED" &&
                                "border-emerald-200 text-emerald-700",
                              !isBanned &&
                                backendStatus === "RETAKE_EXAM" &&
                                "border-amber-200 text-amber-700",
                            )}
                          >
                            {statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn("tabular-nums", isBanned && "font-semibold text-destructive")}
                          >
                            {absentCount}/{ABSENT_LIMIT}
                          </span>
                        </TableCell>
                        <TableCell>
                          <AttendanceControls
                            value={status}
                            onChange={(nextStatus) =>
                              setStudentStatus(row.enrollmentId, nextStatus)
                            }
                            disabled={isSessionLocked}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!rosterQuery.isLoading && filteredRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                        Khong co sinh vien phu hop.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {rosterQuery.isLoading && (
              <div className="border-t p-4 text-sm text-muted-foreground">
                Dang tai danh sach sinh vien...
              </div>
            )}
            {rosterQuery.isError && (
              <div className="border-t p-4 text-sm text-destructive">
                {rosterQuery.error instanceof Error
                  ? rosterQuery.error.message
                  : "Khong tai duoc danh sach sinh vien"}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function AttendanceControls({
  value,
  onChange,
  disabled,
}: {
  value: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {(["PRESENT", "LATE", "ABSENT"] as const).map((status) => {
        const meta = statusMeta[status];
        const active = value === status;
        return (
          <Button
            key={status}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-9 justify-center border text-xs font-semibold",
              active ? meta.className : "bg-background text-muted-foreground",
            )}
            onClick={() => onChange(status)}
          >
            {meta.label}
          </Button>
        );
      })}
    </div>
  );
}

function SessionTimeline({
  attendance,
  nextAllowedSession,
  rosterRows,
  selectedSession,
  sessionsPerWeek,
  lockedSessions,
  onSelect,
}: {
  attendance: AttendanceBook;
  nextAllowedSession: number;
  rosterRows: TeacherRosterRow[];
  selectedSession: number;
  sessionsPerWeek: number;
  lockedSessions: Set<number>;
  onSelect: (session: number) => void;
}) {
  return (
    <div className="mt-4 overflow-x-auto pb-1">
      <div className="grid min-w-[860px] gap-2" style={{ gridTemplateColumns: `repeat(${WEEKS_PER_COURSE}, minmax(0, 1fr))` }}>
        {Array.from({ length: WEEKS_PER_COURSE }, (_, weekIndex) => {
          const week = weekIndex + 1;
          return (
            <div key={week} className="rounded-lg border bg-background p-2">
              <div className="mb-2 text-center text-[11px] font-semibold text-muted-foreground">
                Tuan {week}
              </div>
              <div className="grid gap-1">
                {Array.from({ length: sessionsPerWeek }, (_, slotIndex) => {
                  const session = weekIndex * sessionsPerWeek + slotIndex + 1;
                  const state = getSessionState(attendance, rosterRows, session);
                  const isLocked = lockedSessions.has(session);
                  const locked = !isLocked && session > nextAllowedSession;
                  return (
                    <Button
                      key={session}
                      type="button"
                      variant={selectedSession === session ? "default" : "outline"}
                      className={cn(
                        "h-8 px-0 text-[11px]",
                        state === "done" && selectedSession !== session && "border-emerald-200 bg-emerald-50 text-emerald-700",
                        isLocked && selectedSession !== session && "border-emerald-300 bg-emerald-100 text-emerald-800",
                        state === "partial" && selectedSession !== session && "border-amber-200 bg-amber-50 text-amber-700",
                        locked && "opacity-45",
                      )}
                      onClick={() => onSelect(session)}
                    >
                      B{session}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Check className="h-3.5 w-3.5 text-emerald-600" /> Da xong
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-amber-600" /> Dang lam
        </span>
        <span className="inline-flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" /> Chua mo
        </span>
      </div>
    </div>
  );
}

function countSession(attendance: AttendanceBook, rows: TeacherRosterRow[], session: number) {
  const counts: Record<AttendanceStatus, number> = {
    PRESENT: 0,
    LATE: 0,
    ABSENT: 0,
    UNMARKED: 0,
  };

  rows.forEach((row) => {
    const status = attendance[row.enrollmentId]?.[session] ?? "UNMARKED";
    counts[status] += 1;
  });

  return counts;
}

function countAbsences(studentSessions: Record<number, AttendanceStatus>) {
  return Object.values(studentSessions).filter((status) => status === "ABSENT").length;
}

function getSessionState(attendance: AttendanceBook, rows: TeacherRosterRow[], session: number) {
  const counts = countSession(attendance, rows, session);
  if (rows.length === 0 || counts.UNMARKED === rows.length) return "empty";
  if (counts.UNMARKED === 0) return "done";
  return "partial";
}

function getNextAllowedSession(
  attendance: AttendanceBook,
  rows: TeacherRosterRow[],
  sessions: number[],
) {
  if (rows.length === 0) return 1;
  const firstIncomplete = sessions.find((session) => countSession(attendance, rows, session).UNMARKED > 0);
  return firstIncomplete ?? sessions[sessions.length - 1] ?? 1;
}
