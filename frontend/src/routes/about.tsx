import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useLanding } from "@/lib/landing-content";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Quote,
  Heart,
  Lightbulb,
  Shield,
  Globe2,
  BookOpen,
  GraduationCap,
  Users,
  Award,
  Target,
  Eye,
  Sparkles,
} from "lucide-react";
import { founder, coreValues, missionVision, timeline } from "@/data/university-data";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "Giới thiệu Đại học Thăng Long — Lịch sử, Sứ mệnh và Tầm nhìn" },
      { name: "description", content: "Trường đại học tư thục đầu tiên Việt Nam (1988). Khám phá lịch sử, sứ mệnh, tầm nhìn, giá trị cốt lõi và người sáng lập GS. Hoàng Xuân Sính." },
      { property: "og:title", content: "Giới thiệu Đại học Thăng Long" },
      { property: "og:description", content: "Lịch sử 35+ năm, sứ mệnh, tầm nhìn và giá trị cốt lõi của TLU." },
      { property: "og:url", content: `${SITE}/about` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/about` }],
  }),
});

const studentValueIcons = [Shield, Heart, Target, Globe2, BookOpen];
const facultyValueIcons = [Heart, Award, Lightbulb, Sparkles, Eye];

function AboutPage() {
  const { content } = useLanding();
  return (
    <MarketingLayout>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b bg-muted/30">
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <GraduationCap className="h-3.5 w-3.5" />Thành lập năm 1988
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{content.aboutTitle}</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{content.aboutBody}</p>
        </div>
      </section>

      {/* ── Founder Tribute ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl border bg-card p-8 shadow-sm md:p-12">
          <Quote className="absolute right-6 top-6 h-16 w-16 text-primary/8" />
          <div className="grid gap-8 md:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center gap-4">
              <div className="grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-4xl font-bold text-primary shadow-inner">
                HXS
              </div>
              <div className="text-center">
                <div className="font-semibold">{founder.name}</div>
                <div className="text-xs text-primary">{founder.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{founder.role}</div>
              </div>
            </div>
            <div>
              <blockquote className="text-xl font-medium italic leading-relaxed text-foreground md:text-2xl">
                "{founder.quote}"
              </blockquote>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{founder.bio}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission / Vision / Values ──────────────────────────── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Sứ mệnh, Tầm nhìn & Giá trị</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icon: Target, t: "Sứ mệnh", d: missionVision.mission, color: "bg-primary/10 text-primary" },
              { icon: Eye, t: "Tầm nhìn", d: missionVision.visionShort, color: "bg-info/10 text-info" },
              { icon: Sparkles, t: "Triết lý hội nhập", d: missionVision.vision, color: "bg-warning/10 text-warning" },
            ].map((b) => (
              <div key={b.t} className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
                <div className={`grid h-10 w-10 place-items-center rounded-lg ${b.color}`}>
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{b.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Values ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Giá trị cốt lõi</h2>
        <p className="mt-2 text-center text-muted-foreground">Nền tảng đạo đức truyền thống kết hợp tư duy phát triển hiện đại.</p>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {/* Student values */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Dành cho Sinh viên</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {coreValues.students.map((v, i) => {
                const Icon = studentValueIcons[i] ?? Shield;
                return (
                  <div key={v} className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Faculty values */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-info" />
              <h3 className="text-lg font-semibold">Dành cho Giảng viên</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {coreValues.faculty.map((v, i) => {
                const Icon = facultyValueIcons[i] ?? Award;
                return (
                  <div key={v} className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-info/10">
                      <Icon className="h-4 w-4 text-info" />
                    </div>
                    <span className="text-sm font-medium">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ───────────────────────────────────────────── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Dòng thời gian phát triển</h2>
          <p className="mt-2 text-center text-muted-foreground">Hơn 35 năm tiên phong giáo dục đại học ngoài công lập.</p>
          <div className="relative mt-12">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 hidden h-full w-px bg-border md:left-1/2 md:block" />
            <div className="space-y-8">
              {timeline.map((m, i) => (
                <div key={m.year} className={`relative flex flex-col gap-4 md:flex-row ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="flex-1 md:text-right md:pr-12" style={{ textAlign: i % 2 === 0 ? undefined : "left", paddingRight: i % 2 === 0 ? undefined : 0, paddingLeft: i % 2 !== 0 ? undefined : 0 }}>
                    {i % 2 === 0 && (
                      <div className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                        <div className="text-xs font-bold uppercase tracking-wider text-primary">{m.year}</div>
                        <div className="mt-1 font-semibold">{m.title}</div>
                        <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                      </div>
                    )}
                  </div>
                  {/* Center dot */}
                  <div className="absolute left-4 top-2 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background md:left-1/2 md:block" />
                  <div className="flex-1 md:pl-12" style={{ paddingLeft: i % 2 !== 0 ? undefined : undefined }}>
                    {i % 2 !== 0 && (
                      <div className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                        <div className="text-xs font-bold uppercase tracking-wider text-primary">{m.year}</div>
                        <div className="mt-1 font-semibold">{m.title}</div>
                        <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                      </div>
                    )}
                  </div>
                  {/* Mobile layout */}
                  <div className="rounded-xl border bg-card p-5 md:hidden">
                    <div className="text-xs font-bold uppercase tracking-wider text-primary">{m.year}</div>
                    <div className="mt-1 font-semibold">{m.title}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-semibold tracking-tight">TLU trong con số</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {content.stats.map((s, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 text-center transition-shadow hover:shadow-md">
              <div className="text-3xl font-semibold text-primary">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold">Khám phá chương trình đào tạo</h2>
            <p className="mt-1 text-sm opacity-90">32 chương trình đào tạo bậc đại học và sau đại học.</p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <Link to="/programs">Xem ngành học <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
