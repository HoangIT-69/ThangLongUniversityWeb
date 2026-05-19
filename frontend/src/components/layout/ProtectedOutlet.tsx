import { Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/api/types";
import { AppLayout } from "./AppLayout";

export function ProtectedOutlet({ role }: { role: Role }) {
  const { role: current } = useAuth();
  if (!current) return <Navigate to="/login" />;
  if (current !== role) {
    const to = current === "ADMIN" ? "/admin/dashboard" : current === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";
    return <Navigate to={to} />;
  }
  return <AppLayout><Outlet /></AppLayout>;
}
