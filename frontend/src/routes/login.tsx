import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/api/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  ShieldCheck,
  UserCog,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const BACKEND_PROBE_TIMEOUT_MS = 3000;

type BackendStatus = "checking" | "online" | "offline";
type Credentials = {
  username: string;
  password: string;
};

const DEMO_CREDENTIALS: Record<Role, Credentials> = {
  ADMIN: { username: "admin", password: "password123" },
  TEACHER: { username: "gv101", password: "password123" },
  STUDENT: { username: "sv001", password: "password123" },
};

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function buildApiUrl(path: string) {
  return new URL(path, API_BASE_URL).toString();
}

async function probeBackend() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), BACKEND_PROBE_TIMEOUT_MS);

  try {
    await fetch(buildApiUrl("/api/auth/login"), {
      method: "OPTIONS",
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function resolveDashboard(role: Role) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "TEACHER") return "/teacher/dashboard";
  return "/student/dashboard";
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<Role | null>(null);

  useEffect(() => {
    let alive = true;

    probeBackend().then((online) => {
      if (!alive) return;
      setBackendStatus(online ? "online" : "offline");
    });

    return () => {
      alive = false;
    };
  }, []);

  const submitLogin = async (credentials: Credentials, demoRole?: Role) => {
    setIsSubmitting(true);
    setActiveDemoRole(demoRole ?? null);
    setErrorMessage(null);

    try {
      const role = await login(credentials.username, credentials.password);
      toast.success(`Dang nhap thanh cong voi vai tro ${role.toLowerCase()}`);
      navigate({ to: resolveDashboard(role) });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dang nhap that bai";
      console.error("[Login]", error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setActiveDemoRole(null);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitLogin({ username, password });
  };

  const loginAs = (role: Role) => {
    const credentials = DEMO_CREDENTIALS[role];
    setUsername(credentials.username);
    setPassword(credentials.password);
    void submitLogin(credentials, role);
  };

  const statusIcon =
    backendStatus === "checking" ? (
      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
    ) : backendStatus === "online" ? (
      <CheckCircle2 className="h-3 w-3 text-green-500" />
    ) : (
      <WifiOff className="h-3 w-3 text-destructive" />
    );

  const statusText =
    backendStatus === "checking"
      ? `Kiem tra ket noi backend (${API_BASE_URL})...`
      : backendStatus === "online"
        ? `Backend ket noi (${API_BASE_URL})`
        : `Khong ket noi duoc backend tai ${API_BASE_URL}. Hay kiem tra Spring Boot, CORS va VITE_API_BASE_URL.`;

  const statusTextClassName =
    backendStatus === "offline" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-accent/30">
      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/30">
              TL
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Thang Long University</div>
              <div className="text-xl font-semibold">University Management System</div>
            </div>
          </div>
          <h1 className="mt-10 text-4xl font-semibold leading-tight tracking-tight">
            Cong quan ly dao tao
            <br />
            <span className="text-primary">ket noi truc tiep backend</span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Dang nhap bang tai khoan backend de vao dung khong gian lam viec cua admin, giang vien
            hoac sinh vien.
          </p>
        </div>

        <Card className="border bg-card/95 p-8 shadow-xl backdrop-blur">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">
              TL
            </div>
            <div className="font-semibold">Thang Long University</div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {statusIcon}
            <span className={statusTextClassName}>{statusText}</span>
          </div>

          <h2 className="mt-4 text-xl font-semibold">Dang nhap</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Su dung tai khoan trong backend Spring Boot.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="username">Ten dang nhap</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin / gv101 / sv001"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mat khau</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && !activeDemoRole ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Dang nhap
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            Role sau khi dang nhap lay tu token/backend
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => loginAs("ADMIN")}
              disabled={isSubmitting}
            >
              <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
              Dang nhap tai khoan admin
              {activeDemoRole === "ADMIN" && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => loginAs("TEACHER")}
              disabled={isSubmitting}
            >
              <UserCog className="mr-2 h-4 w-4 text-info" />
              Dang nhap tai khoan giang vien
              {activeDemoRole === "TEACHER" && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => loginAs("STUDENT")}
              disabled={isSubmitting}
            >
              <GraduationCap className="mr-2 h-4 w-4 text-success" />
              Dang nhap tai khoan sinh vien
              {activeDemoRole === "STUDENT" && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
