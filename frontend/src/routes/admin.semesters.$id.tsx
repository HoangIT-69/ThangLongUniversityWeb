import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, CalendarCheck, CalendarDays, ClipboardList, Layers } from "lucide-react";
import { OverviewTab } from "@/features/semester-hub/OverviewTab";
import { ClassSectionsTab } from "@/features/semester-hub/ClassSectionsTab";
import { EnrollmentsTab } from "@/features/semester-hub/EnrollmentsTab";
import { ExamSchedulesTab } from "@/features/semester-hub/ExamSchedulesTab";

export const Route = createFileRoute("/admin/semesters/$id")({ component: SemesterHubPage });

function SemesterHubPage() {
  const { id } = Route.useParams();
  const semesterId = Number(id);

  const semestersQuery = useQuery({
    queryKey: ["admin", "semesters"],
    queryFn: adminApi.listSemesters,
    staleTime: 60_000,
  });
  const semester = semestersQuery.data?.find((s) => s.id === semesterId);

  if (semestersQuery.isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!semester) {
    return (
      <div className="p-6">
        <p className="text-destructive">Không tìm thấy học kỳ (id={id})</p>
        <Link to="/admin/semesters">
          <Button variant="outline" className="mt-4">← Quay lại</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/admin/semesters" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Quản lý Học kỳ
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            {semester.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {semester.startDate
              ? new Intl.DateTimeFormat("vi-VN").format(new Date(semester.startDate))
              : "?"}{" "}→{" "}
            {semester.endDate
              ? new Intl.DateTimeFormat("vi-VN").format(new Date(semester.endDate))
              : "?"}
          </p>
        </div>
        <Link to="/admin/semesters">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
        </Link>
      </div>

      {/* Hub tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4 h-11 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Tổng quan
          </TabsTrigger>
          <TabsTrigger value="class-sections" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Lớp học phần
          </TabsTrigger>
          <TabsTrigger value="enrollments" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" /> Đăng ký học
          </TabsTrigger>
          <TabsTrigger value="exam-schedules" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5" /> Lịch thi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab semesterId={semesterId} />
        </TabsContent>
        <TabsContent value="class-sections" className="mt-6">
          <ClassSectionsTab semesterId={semesterId} />
        </TabsContent>
        <TabsContent value="enrollments" className="mt-6">
          <EnrollmentsTab semesterId={semesterId} />
        </TabsContent>
        <TabsContent value="exam-schedules" className="mt-6">
          <ExamSchedulesTab semesterId={semesterId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
