import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Users,
  CalendarCheck,
  RotateCcw,
  Lock,
  Megaphone,
  Power,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  semesterId: number;
}

export function OverviewTab({ semesterId }: Props) {
  const queryClient = useQueryClient();
  const summaryQuery = useQuery({
    queryKey: ["admin", "semester-summary", semesterId],
    queryFn: () => adminApi.getSemesterSummary(semesterId),
  });
  const s = summaryQuery.data;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "semester-summary", semesterId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "semesters"] });
  };

  const toggleRegMutation = useMutation({
    mutationFn: (open: boolean) => adminApi.toggleRegistration(semesterId, open),
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật trạng thái đăng ký"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Lỗi"),
  });

  const lockEnrollMutation = useMutation({
    mutationFn: () => adminApi.lockEnrollments(semesterId),
    onSuccess: (res) => { invalidate(); toast.success(res.message || "Đã chốt học phần"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Lỗi"),
  });

  const publishExamMutation = useMutation({
    mutationFn: () => adminApi.publishExamSchedules(semesterId),
    onSuccess: () => { invalidate(); toast.success("Đã công bố lịch thi"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Lỗi"),
  });

  const unpublishExamMutation = useMutation({
    mutationFn: () => adminApi.unpublishExamSchedules(semesterId),
    onSuccess: () => { invalidate(); toast.success("Đã hủy công bố lịch thi"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Lỗi"),
  });

  const toggleRetakeMutation = useMutation({
    mutationFn: (open: boolean) => adminApi.toggleRetakeRegistration(semesterId, open),
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật trạng thái thi lại"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Lỗi"),
  });

  const lockRetakeMutation = useMutation({
    mutationFn: () => adminApi.lockRetakes(semesterId),
    onSuccess: (res) => { invalidate(); toast.success(res.message || "Đã chốt thi lại"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Lỗi"),
  });

  if (summaryQuery.isLoading) {
    return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>;
  }

  if (!s) return null;

  const step1Done = s.locked;
  const step2Done = s.examPublished;
  const step3Done = s.retakeLocked;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GradientCard
          icon={<BookOpen className="h-5 w-5" />}
          value={s.classSectionCount}
          label="Lớp học phần"
        />
        <GradientCard
          icon={<Users className="h-5 w-5" />}
          value={s.enrollmentCount}
          label="Lượt đăng ký"
        />
        <GradientCard
          icon={<CalendarCheck className="h-5 w-5" />}
          value={`${s.examScheduledCount}/${s.classSectionCount}`}
          label="Lớp có lịch thi"
        />
        <GradientCard
          icon={<RotateCcw className="h-5 w-5" />}
          value={s.retakeRegistrations}
          label="Đăng ký thi lại"
        />
      </div>

      {/* Stepper lifecycle */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-border" />

        <div className="space-y-4">
          {/* Step 1: Enrollment */}
          <StepCard
            stepNum={1}
            done={step1Done}
            title="Đăng ký học phần"
            subtitle={
              step1Done
                ? `Đã chốt: ${s.registeredEnrollments} đăng ký`
                : s.registrationOpen
                  ? "Đang mở đăng ký"
                  : "Chưa mở đăng ký"
            }
            statusBadge={
              step1Done
                ? <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Đã chốt</Badge>
                : s.registrationOpen
                  ? <Badge className="bg-green-100 text-green-800 border-green-200">Đang mở</Badge>
                  : <Badge variant="outline">Đóng</Badge>
            }
            actions={
              !step1Done ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={toggleRegMutation.isPending}
                    onClick={() => toggleRegMutation.mutate(!s.registrationOpen)}
                  >
                    <Power className="h-3.5 w-3.5 mr-1" />
                    {s.registrationOpen ? "Đóng đăng ký" : "Mở đăng ký"}
                  </Button>
                  <Button
                    size="sm"
                    disabled={lockEnrollMutation.isPending}
                    onClick={() => lockEnrollMutation.mutate()}
                  >
                    <Lock className="h-3.5 w-3.5 mr-1" />
                    Chốt học phần
                    {s.pendingEnrollments > 0 && (
                      <Badge variant="secondary" className="ml-1.5 h-4 text-xs px-1">
                        {s.pendingEnrollments}
                      </Badge>
                    )}
                  </Button>
                </div>
              ) : null
            }
            note="Khi chốt: Tất cả PENDING chuyển thành REGISTERED, tạo Grade, khóa đăng ký"
          />

          {/* Step 2: Exam schedules */}
          <StepCard
            stepNum={2}
            done={step2Done}
            title="Công bố lịch thi"
            subtitle={`${s.examScheduledCount}/${s.classSectionCount} lớp đã có lịch thi`}
            statusBadge={
              step2Done
                ? <Badge className="bg-blue-100 text-blue-800 border-blue-200">Đã công bố</Badge>
                : <Badge variant="outline">Chưa công bố</Badge>
            }
            actions={
              <div className="flex flex-wrap gap-2">
                {!step2Done ? (
                  <Button
                    size="sm"
                    disabled={publishExamMutation.isPending}
                    onClick={() => publishExamMutation.mutate()}
                  >
                    <Megaphone className="h-3.5 w-3.5 mr-1" />
                    Công bố lịch thi
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={unpublishExamMutation.isPending}
                    onClick={() => unpublishExamMutation.mutate()}
                  >
                    Hủy công bố
                  </Button>
                )}
              </div>
            }
            note="Khi công bố: Sinh viên sẽ thấy lịch thi trên trang Lịch thi"
          />

          {/* Step 3: Retake registration */}
          <StepCard
            stepNum={3}
            done={step3Done}
            title="Đăng ký thi lại / Nâng điểm"
            subtitle={
              step3Done
                ? `Đã chốt: ${s.retakeRegistered} đăng ký`
                : s.retakeOpen
                  ? "Đang mở đăng ký"
                  : "Chưa mở đăng ký"
            }
            statusBadge={
              step3Done
                ? <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Đã chốt</Badge>
                : s.retakeOpen
                  ? <Badge className="bg-amber-100 text-amber-800 border-amber-200">Đang mở</Badge>
                  : <Badge variant="outline">Đóng</Badge>
            }
            actions={
              !step3Done ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={toggleRetakeMutation.isPending || !step1Done}
                    title={!step1Done ? "Phải chốt học phần trước khi mở thi lại" : undefined}
                    onClick={() => toggleRetakeMutation.mutate(!s.retakeOpen)}
                  >
                    <Power className="h-3.5 w-3.5 mr-1" />
                    {s.retakeOpen ? "Đóng đăng ký thi lại" : "Mở đăng ký thi lại"}
                  </Button>
                  {s.retakeOpen && (
                    <Button
                      size="sm"
                      disabled={lockRetakeMutation.isPending}
                      onClick={() => lockRetakeMutation.mutate()}
                    >
                      <Lock className="h-3.5 w-3.5 mr-1" />
                      Chốt thi lại
                      {s.retakePending > 0 && (
                        <Badge variant="secondary" className="ml-1.5 h-4 text-xs px-1">
                          {s.retakePending}
                        </Badge>
                      )}
                    </Button>
                  )}
                </div>
              ) : null
            }
            note="Khi chốt: Tất cả PENDING chuyển thành REGISTERED"
          />
        </div>
      </div>
    </div>
  );
}

function GradientCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-3xl font-semibold tabular-nums">{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StepCard({
  stepNum,
  done,
  title,
  subtitle,
  statusBadge,
  actions,
  note,
}: {
  stepNum: number;
  done: boolean;
  title: string;
  subtitle: string;
  statusBadge: React.ReactNode;
  actions: React.ReactNode;
  note: string;
}) {
  return (
    <div className="relative flex gap-4">
      {/* Step circle */}
      <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-background border-2 border-border">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Card */}
      <Card className={cn("flex-1 mb-2", done && "bg-muted/30")}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-sm">
                Bước {stepNum}: {title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
            {statusBadge}
          </div>
          {actions && <div>{actions}</div>}
          <p className="text-xs text-muted-foreground/70 italic">{note}</p>
        </CardContent>
      </Card>
    </div>
  );
}
