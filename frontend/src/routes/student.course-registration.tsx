import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Loader2, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { studentApi } from "@/lib/api/student";
import type {
  ClassSectionResponse,
  EnrollmentResponse,
  StudentSemesterResponse,
} from "@/lib/api/types";
import { pickCurrentSemester } from "@/lib/semester";

export const Route = createFileRoute("/student/course-registration")({
  component: CourseRegistrationPage,
});

const emptySemesters: StudentSemesterResponse[] = [];
const emptyEnrollments: EnrollmentResponse[] = [];

const dayLabels: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "CN",
};

type CourseGroup = {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  courseType: "REQUIRED" | "ELECTIVE";
  courseTypeLabel: string;
  sections: ClassSectionResponse[];
};

function formatSchedule(section: ClassSectionResponse) {
  if (!section.schedules?.length) return "Chưa có lịch";
  return section.schedules
    .map(
      (s) =>
        `${dayLabels[s.dayOfWeek] ?? `Thứ ${s.dayOfWeek}`} tiết ${s.startPeriod}-${s.endPeriod}${s.roomName ? `, ${s.roomName}` : ""}`,
    )
    .join(" | ");
}

function getSeats(section: ClassSectionResponse) {
  return Math.max((section.maxSlots ?? 0) - (section.currentSlots ?? 0), 0);
}

function isPeriodOverlap(startA: number, endA: number, startB: number, endB: number) {
  return startA <= endA && startB <= endB && startA <= endB && startB <= endA;
}

function getEnrollmentSchedules(item: EnrollmentResponse) {
  if (item.schedules?.length) return item.schedules;
  return [
    {
      dayOfWeek: item.dayOfWeek,
      startPeriod: item.startPeriod,
      endPeriod: item.endPeriod,
      roomName: item.room,
    },
  ];
}

function formatEnrollmentSchedule(item: EnrollmentResponse) {
  return getEnrollmentSchedules(item)
    .map(
      (schedule) =>
        `${dayLabels[schedule.dayOfWeek] ?? `Thứ ${schedule.dayOfWeek}`} tiết ${schedule.startPeriod}-${schedule.endPeriod}${schedule.roomName ? `, ${schedule.roomName}` : ""}`,
    )
    .join(" | ");
}

function overlapsSelectedSchedule(section: ClassSectionResponse, selected: EnrollmentResponse[]) {
  return section.schedules.some((schedule) =>
    selected.some(
      (item) =>
        item.classSectionId !== section.id &&
        getEnrollmentSchedules(item).some(
          (selectedSchedule) =>
            selectedSchedule.dayOfWeek === schedule.dayOfWeek &&
            isPeriodOverlap(
              schedule.startPeriod,
              schedule.endPeriod,
              selectedSchedule.startPeriod,
              selectedSchedule.endPeriod,
            ),
        ),
    ),
  );
}

function groupByCourse(sections: ClassSectionResponse[]): CourseGroup[] {
  const groups = new Map<number, CourseGroup>();
  for (const section of sections) {
    const courseType = section.courseType ?? "REQUIRED";
    const existing = groups.get(section.courseId);
    if (existing) {
      existing.sections.push(section);
      continue;
    }
    groups.set(section.courseId, {
      courseId: section.courseId,
      courseCode: section.courseCode,
      courseName: section.courseName,
      credits: section.credits,
      courseType,
      courseTypeLabel:
        section.courseTypeLabel ?? (courseType === "ELECTIVE" ? "Tự chọn" : "Bắt buộc"),
      sections: [section],
    });
  }
  return Array.from(groups.values()).sort((a, b) => a.courseCode.localeCompare(b.courseCode));
}

function CourseRegistrationPage() {
  const queryClient = useQueryClient();
  const semestersQuery = useQuery({
    queryKey: ["student", "semesters"],
    queryFn: studentApi.listSemesters,
  });
  const semesters = semestersQuery.data ?? emptySemesters;
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [activeType, setActiveType] = useState<"REQUIRED" | "ELECTIVE">("REQUIRED");

  useEffect(() => {
    if (!semesterId && semesters.length) {
      setSemesterId(pickCurrentSemester(semesters)?.id ?? null);
    }
  }, [semesterId, semesters]);

  const currentSemester = semesters.find((s) => s.id === semesterId);
  const readonly = Boolean(currentSemester?.locked || !currentSemester?.registrationOpen);

  const classesQuery = useQuery({
    queryKey: ["student", "available-classes", semesterId],
    queryFn: () => studentApi.listAvailableClasses(semesterId as number),
    enabled: semesterId != null,
  });

  const selectedQuery = useQuery({
    queryKey: ["student", "selected-enrollments", semesterId],
    queryFn: () => studentApi.listSelectedEnrollments(semesterId as number),
    enabled: semesterId != null,
  });

  const invalidateRegistration = () => {
    queryClient.invalidateQueries({ queryKey: ["student", "available-classes", semesterId] });
    queryClient.invalidateQueries({ queryKey: ["student", "selected-enrollments", semesterId] });
    queryClient.invalidateQueries({ queryKey: ["student", "schedule", semesterId] });
    queryClient.invalidateQueries({ queryKey: ["student", "tuition", semesterId] });
  };

  const enrollMutation = useMutation({
    mutationFn: (classSectionId: number) => studentApi.enrollClass(classSectionId),
    onSuccess: (response) => {
      invalidateRegistration();
      toast.success(response.message || "Đã chọn lớp học phần");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Chọn lớp thất bại"),
  });

  const cancelMutation = useMutation({
    mutationFn: (classSectionId: number) => studentApi.cancelClass(classSectionId),
    onSuccess: (message) => {
      invalidateRegistration();
      toast.success(message || "Đã bỏ chọn lớp học phần");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Bỏ chọn thất bại"),
  });

  const selected = selectedQuery.data ?? emptyEnrollments;
  const selectedByClassId = useMemo(() => {
    const map = new Map<number, EnrollmentResponse>();
    selected.forEach((item) => {
      if (item.classSectionId != null) map.set(item.classSectionId, item);
    });
    return map;
  }, [selected]);

  const selectedCourseCodes = useMemo(
    () => new Set(selected.map((item) => item.courseCode).filter(Boolean)),
    [selected],
  );
  const selectedCredits = selected.reduce((sum, item) => sum + (item.credits ?? 0), 0);

  const groups = useMemo(() => groupByCourse(classesQuery.data ?? []), [classesQuery.data]);
  const visibleGroups = groups.filter((group) => group.courseType === activeType);

  return (
    <div>
      <PageHeader
        title="Đăng ký môn học"
        description="Chọn lớp học phần vào danh sách chờ, quản trị viên sẽ chốt sau"
        actions={
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={semesterId ?? ""}
            onChange={(e) => setSemesterId(Number(e.target.value))}
          >
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        }
      />

      {readonly && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          Kỳ đăng ký đã đóng hoặc đã khóa. Danh sách hiện tại chỉ được xem.
        </div>
      )}

      {(classesQuery.isError || selectedQuery.isError) && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Không tải được dữ liệu đăng ký học phần.
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0">
          <div className="mb-3 inline-flex rounded-lg border bg-background p-1">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${activeType === "REQUIRED" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setActiveType("REQUIRED")}
            >
              Môn bắt buộc của ngành
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${activeType === "ELECTIVE" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setActiveType("ELECTIVE")}
            >
              Tín chỉ tự do / tự chọn
            </button>
          </div>

          <div className="space-y-3">
            {classesQuery.isLoading ? (
              <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                Đang tải dữ liệu...
              </div>
            ) : visibleGroups.length === 0 ? (
              <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                Không có môn học phù hợp.
              </div>
            ) : (
              visibleGroups.map((course) => {
                const courseSelected = selectedCourseCodes.has(course.courseCode);
                return (
                  <details key={course.courseId} className="group rounded-lg border bg-card">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {course.courseCode}
                          </span>
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {course.courseTypeLabel}
                          </span>
                          {courseSelected && (
                            <span className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                              Đã chọn
                            </span>
                          )}
                        </div>
                        <div className="mt-1 truncate font-medium">{course.courseName}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                        <span>{course.credits} TC</span>
                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                      </div>
                    </summary>

                    <div className="border-t">
                      {course.sections.map((section) => {
                        const selectedClass = selectedByClassId.get(section.id);
                        const hasSelectedOtherClass = courseSelected && !selectedClass;
                        const overlapsSelected =
                          !selectedClass && overlapsSelectedSchedule(section, selected);
                        const seats = getSeats(section);
                        const closed = section.closed || seats <= 0;
                        const enrolling =
                          enrollMutation.isPending && enrollMutation.variables === section.id;
                        const canceling =
                          cancelMutation.isPending && cancelMutation.variables === section.id;
                        const disabled =
                          readonly ||
                          closed ||
                          hasSelectedOtherClass ||
                          overlapsSelected ||
                          enrolling ||
                          canceling;

                        return (
                          <div
                            key={section.id}
                            className="grid gap-3 border-b px-4 py-3 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_132px] lg:items-center"
                          >
                            <div className="min-w-0 text-sm">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="font-mono font-medium">{section.classCode}</span>
                                <span className="text-muted-foreground">
                                  GV: {section.teacherName ?? "Chưa phân công"}
                                </span>
                              </div>
                              <div className="mt-1 text-muted-foreground">
                                Lịch:{" "}
                                <span className="text-foreground">{formatSchedule(section)}</span>
                              </div>
                              <div className="mt-1 text-muted-foreground">
                                Slot:{" "}
                                <span
                                  className={
                                    seats < 5
                                      ? "font-medium text-destructive"
                                      : "font-medium text-success"
                                  }
                                >
                                  {seats}/{section.maxSlots ?? 0}
                                </span>
                              </div>
                              {overlapsSelected && (
                                <div className="mt-1 text-xs font-medium text-destructive">
                                  Trùng lịch với lớp đã chọn
                                </div>
                              )}
                            </div>
                            {selectedClass ? (
                              <Button
                                variant="outline"
                                className="gap-2"
                                disabled={readonly || canceling}
                                onClick={() => cancelMutation.mutate(section.id)}
                              >
                                {canceling ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                                Bỏ chọn
                              </Button>
                            ) : (
                              <Button
                                className="gap-2"
                                disabled={disabled}
                                onClick={() => enrollMutation.mutate(section.id)}
                              >
                                {enrolling ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                {overlapsSelected
                                  ? "Trùng lịch"
                                  : hasSelectedOtherClass
                                    ? "Đã chọn lớp khác"
                                    : "Chọn lớp"}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </details>
                );
              })
            )}
          </div>
        </section>

        <aside className="h-fit rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Danh sách học phần đã chọn</h2>
            <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              {selectedCredits} TC
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {selectedQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Đang tải danh sách...</div>
            ) : selected.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Chưa có lớp nào ở trạng thái PENDING.
              </div>
            ) : (
              selected.map((item) => {
                const classSectionId = item.classSectionId;
                const canceling =
                  classSectionId != null &&
                  cancelMutation.isPending &&
                  cancelMutation.variables === classSectionId;
                return (
                  <div key={item.enrollmentId} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-muted-foreground">
                          {item.classCode}
                        </div>
                        <div className="truncate text-sm font-medium">{item.courseName}</div>
                      </div>
                      {item.status && (
                        <span className="shrink-0 rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                          {item.status}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {item.courseCode ? `${item.courseCode} - ` : ""}
                      {item.credits} TC - {item.teacherName ?? "Chưa phân công"}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatEnrollmentSchedule(item)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full gap-2"
                      disabled={readonly || classSectionId == null || canceling}
                      onClick={() =>
                        classSectionId != null && cancelMutation.mutate(classSectionId)
                      }
                    >
                      {canceling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Bỏ chọn
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
