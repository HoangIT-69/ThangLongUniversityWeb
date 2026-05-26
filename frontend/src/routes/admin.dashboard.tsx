import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { adminApi } from "@/lib/api/admin";
import { BookOpen, GraduationCap, Layers, Users } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboard });

function AdminDashboard() {
  const studentsQuery = useQuery({ queryKey: ["admin", "students"], queryFn: adminApi.listStudents });
  const teachersQuery = useQuery({ queryKey: ["admin", "teachers"], queryFn: adminApi.listTeachers });
  const coursesQuery = useQuery({ queryKey: ["admin", "courses"], queryFn: adminApi.listCourses });
  const classSectionsQuery = useQuery({ queryKey: ["admin", "class-sections"], queryFn: adminApi.listClassSections });

  return (
    <div>
      <PageHeader title="Tổng quan hệ thống" description="Dữ liệu trực tiếp từ hệ thống" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Sinh viên"
          value={studentsQuery.data?.length ?? 0}
          icon={GraduationCap}
          tone="primary"
        />
        <StatCard
          label="Giảng viên"
          value={teachersQuery.data?.length ?? 0}
          icon={Users}
          tone="info"
        />
        <StatCard
          label="Môn học"
          value={coursesQuery.data?.length ?? 0}
          icon={BookOpen}
          tone="success"
        />
        <StatCard
          label="Lớp học phần"
          value={classSectionsQuery.data?.length ?? 0}
          icon={Layers}
          tone="warning"
        />
      </div>
    </div>
  );
}
