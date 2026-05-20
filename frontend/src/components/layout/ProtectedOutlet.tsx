import { Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/api/types";
import { AppLayout } from "./AppLayout";
import { Loader2 } from "lucide-react";

export function ProtectedOutlet({ role }: { role: Role }) {
  const { role: current, isReady } = useAuth();

  // ✅ While auth is still initializing (validating token with backend),
  // show a loading state instead of redirecting to /login
  if (!isReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (!current) return <Navigate to="/login" />;
  if (current !== role) {
    const to = current === "ADMIN" ? "/admin/dashboard" : current === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";
    return <Navigate to={to} />;
  }
  return <AppLayout><Outlet /></AppLayout>;
}

