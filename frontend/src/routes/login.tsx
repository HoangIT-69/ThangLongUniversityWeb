import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/api/types";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Loader2, Sparkles, WifiOff } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const BACKEND_PROBE_TIMEOUT_MS = 3000;
const schoolLogo = "/images/LogoThangLongUniversity.png";

type BackendStatus = "checking" | "online" | "offline";
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

/* ─── stat cards shown on the hero panel ─── */
const HERO_STATS = [
  { label: "Năm thành lập", value: "1988" },
  { label: "Ngành đào tạo", value: "30+" },
  { label: "Sinh viên", value: "10 000+" },
] as const;

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const submitLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const role = await login(username, password);
      toast.success(`Đăng nhập thành công với vai trò ${role.toLowerCase()}`);
      navigate({ to: resolveDashboard(role) });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đăng nhập thất bại";
      console.error("[Login]", error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitLogin();
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
      ? `Đang kiểm tra kết nối...`
      : backendStatus === "online"
        ? `Hệ thống sẵn sàng`
        : `Không kết nối được hệ thống`;

  const statusTextClassName =
    backendStatus === "offline" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px]">
      {/* ════════════════════════════════════════════════
          LEFT — Hero panel with campus image
         ════════════════════════════════════════════════ */}
      <div className="relative hidden lg:block">
        {/* Campus background image */}
        <img
          src="/images/DHTL.jpg"
          alt="Toàn cảnh khuôn viên Đại học Thăng Long"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Content on top of image */}
        <div className="relative flex h-full flex-col justify-between p-10">
          {/* Top — Logo & brand */}
          <Link to="/" className="inline-flex items-center" aria-label="Về trang chính">
            <div className="grid h-24 w-40 place-items-center rounded-2xl p-3 shadow-xl transition-transform hover:scale-[1.02]">
              <img
                src={schoolLogo}
                alt="Logo Đại học Thăng Long"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          {/* Bottom — Brand messaging */}
          <div>
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-medium uppercase tracking-widest text-amber-400">
                Trường đại học tư thục đầu tiên tại Việt Nam
              </span>
            </div>

            <h1 className="max-w-lg text-4xl font-bold leading-tight text-white xl:text-5xl">
              Cổng Quản lý
              <br />
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                Đào tạo Trực tuyến
              </span>
            </h1>

            <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
              Hệ thống quản lý đào tạo toàn diện dành cho sinh viên, giảng viên và cán bộ quản lý —
              Trường Đại học Thăng Long.
            </p>

            {/* Stats row */}
            <div className="mt-8 flex gap-6">
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="border-l border-white/20 pl-4 first:border-l-0 first:pl-0"
                >
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="mt-0.5 text-xs text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          RIGHT — Login form panel
         ════════════════════════════════════════════════ */}
      <div className="flex min-h-screen flex-col bg-background">
        {/* Mobile-only hero banner */}
        <div className="relative h-48 overflow-hidden lg:hidden">
          <img
            src="/images/DHTL.jpg"
            alt="Toàn cảnh khuôn viên Đại học Thăng Long"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <Link
              to="/"
              className="grid h-20 w-36 place-items-center rounded-2xl bg-white/95 p-2 shadow-xl transition-transform hover:scale-[1.02]"
              aria-label="Về trang chính"
            >
              <img
                src={schoolLogo}
                alt="Logo Đại học Thăng Long"
                className="h-full w-full object-contain"
              />
            </Link>
          </div>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-sm">
            {/* Desktop: show logo above form */}
            <div className="mb-1 hidden items-center gap-2 lg:flex">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Hệ thống Quản lý Đào tạo
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight">Đăng nhập</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sử dụng tài khoản được cấp để truy cập hệ thống.
            </p>

            {/* Backend status pill */}
            <div className="mt-4 flex items-center gap-1.5 text-xs">
              {statusIcon}
              <span className={statusTextClassName}>{statusText}</span>
            </div>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="h-11"
                />
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full text-sm font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Đăng nhập
              </Button>
            </form>

            {/* Footer note */}
            <p className="mt-8 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Trường Đại học Thăng Long. Bảo lưu mọi quyền.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
