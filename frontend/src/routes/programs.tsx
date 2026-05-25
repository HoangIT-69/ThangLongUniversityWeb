import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  ArrowRight,
  Monitor,
  TrendingUp,
  Globe,
  Plane,
  HeartPulse,
  Palette,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { faculties, formatVND } from "@/data/university-data";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/programs")({
  component: ProgramsPage,
  head: () => ({
    meta: [
      { title: "Chương trình đào tạo — Đại học Thăng Long" },
      { name: "description", content: "32 chương trình đào tạo bậc đại học thuộc 7 khối ngành: Công nghệ, Kinh tế, Ngôn ngữ, Du lịch, Sức khỏe, Truyền thông, Xã hội." },
      { property: "og:title", content: "Chương trình đào tạo TLU" },
      { property: "og:description", content: "32 chương trình đào tạo — Công nghệ, Kinh tế, Ngôn ngữ, Y khoa." },
      { property: "og:url", content: `${SITE}/programs` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/programs` }],
  }),
});

const facultyIcons: Record<string, typeof Monitor> = {
  Monitor, TrendingUp, Globe, Plane, HeartPulse, Palette, BookOpen,
};

function ProgramsPage() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const filtered = activeTab ? faculties.filter((f) => f.id === activeTab) : faculties;

  return (
    <MarketingLayout>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b bg-muted/30">
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <GraduationCap className="h-3.5 w-3.5" />7 Khối ngành · 32 chương trình
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Chương trình đào tạo</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Chương trình chuẩn kiểm định AUN-QA, gắn liền với doanh nghiệp và xu hướng quốc tế. Lựa chọn khối ngành phù hợp với đam mê của bạn.
          </p>
        </div>
      </section>

      {/* ── Faculty Tabs ───────────────────────────────────────── */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3">
            <button
              onClick={() => setActiveTab(null)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${!activeTab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              Tất cả
            </button>
            {faculties.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveTab(f.id)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === f.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                {f.name.length > 30 ? f.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : f.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Faculty Cards ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {filtered.map((f) => {
            const Icon = facultyIcons[f.icon] ?? BookOpen;
            return (
              <div key={f.id} className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{f.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {f.majors.map((m) => {
                    const topBenchmark = m.benchmarks.length > 0
                      ? Math.max(...m.benchmarks.map((b) => b.score))
                      : null;
                    return (
                      <div key={m.id} className="rounded-xl border bg-background p-4 transition-shadow hover:shadow-sm">
                        <h3 className="font-semibold text-sm">{m.name}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {m.duration}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            {formatVND(m.tuitionPerYear)}/năm
                          </span>
                          {topBenchmark && (
                            <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning-foreground">
                              ĐC: {topBenchmark} điểm
                            </span>
                          )}
                        </div>
                        {m.benchmarks.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {m.benchmarks.map((b, bi) => (
                              <div key={bi} className="text-[10px] text-muted-foreground">
                                {b.year} · {b.subjectGroup}: <span className="font-medium text-foreground">{b.score}</span> điểm
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold">Tìm thấy ngành học phù hợp?</h2>
            <p className="mt-1 text-sm opacity-90">Đăng ký tư vấn tuyển sinh hoặc xem chi tiết học phí.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/admissions">Đăng ký xét tuyển <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/tuition">Xem học phí</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
