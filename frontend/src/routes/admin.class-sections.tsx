import { createFileRoute } from "@tanstack/react-router";
import { AdminClassSectionsContent } from "@/features/admin-class-sections/AdminClassSectionsContent";

export const Route = createFileRoute("/admin/class-sections")({
  component: AdminClassSectionsPage,
});

function AdminClassSectionsPage() {
  return <AdminClassSectionsContent />;
}
