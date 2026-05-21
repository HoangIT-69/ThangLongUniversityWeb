import { createFileRoute } from "@tanstack/react-router";
import { AdminAcademicOpsPage } from "@/features/admin-academic-ops/AdminAcademicOpsPage";

export const Route = createFileRoute("/admin/curriculums")({
  component: () => <AdminAcademicOpsPage module="curriculums" />,
});
