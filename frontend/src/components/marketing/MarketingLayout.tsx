import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useLanding } from "@/lib/landing-content";
import { Button } from "@/components/ui/button";
import { Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Trang chủ" },
  { to: "/about", label: "Giới thiệu" },
  { to: "/programs", label: "Ngành học" },
  { to: "/admissions", label: "Tuyển sinh" },
  { to: "/tuition", label: "Học phí" },
  { to: "/articles", label: "Tin tức" },
  { to: "/contact", label: "Liên hệ" },
] as const;

export function MarketingLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { content } = useLanding();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary font-bold text-primary-foreground shadow-sm">TL</div>
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-semibold">Thang Long University</div>
              <div className="text-[11px] text-muted-foreground">Đại học Thăng Long</div>
            </div>
          </Link>
          <nav aria-label="Điều hướng chính" className="ml-auto hidden items-center gap-1 md:flex">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto md:ml-2">
            <Button asChild size="sm" className="gap-2">
              <Link to="/login">Đăng nhập Portal</Link>
            </Button>
          </div>
        </div>
        <nav aria-label="Điều hướng phụ" className="border-t md:hidden">
          <div className="flex gap-1 overflow-x-auto px-3 py-2">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link key={n.to} to={n.to} className={cn("shrink-0 rounded-md px-3 py-1.5 text-xs font-medium", active ? "bg-primary/10 text-primary" : "text-muted-foreground")}>{n.label}</Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-primary font-bold text-primary-foreground">TL</div>
              <div className="text-sm font-semibold">Đại học Thăng Long</div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Trường đại học ngoài công lập đầu tiên của Việt Nam, thành lập năm 1988.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Liên kết nhanh</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {nav.slice(1).map((n) => (
                <li key={n.to}><Link to={n.to} className="hover:text-foreground">{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Liên hệ</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" />{content.contactAddress}</li>
              <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0" />{content.contactPhone}</li>
              <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0" />{content.contactEmail}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Kết nối</h3>
            <div className="mt-3 flex gap-2">
              <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-md border hover:bg-muted"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label="Youtube" className="grid h-9 w-9 place-items-center rounded-md border hover:bg-muted"><Youtube className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="border-t">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>© {new Date().getFullYear()} Trường Đại học Thăng Long. Bảo lưu mọi quyền.</div>
            <div>Mã trường: DTL · Hà Nội, Việt Nam</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
