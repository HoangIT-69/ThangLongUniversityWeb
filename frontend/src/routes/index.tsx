import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useLanding } from "@/lib/landing-content";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, Globe2, Trophy, CalendarDays } from "lucide-react";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Đại học Thăng Long — Kiến tạo tri thức, dẫn dắt tương lai" },
      { name: "description", content: "Trường Đại học Thăng Long (TLU) — đại học ngoài công lập đầu tiên Việt Nam, đào tạo Công nghệ, Kinh tế, Ngôn ngữ, Y khoa. Tuyển sinh 2025 đang mở." },
      { property: "og:title", content: "Đại học Thăng Long — Kiến tạo tri thức, dẫn dắt tương lai" },
      { property: "og:description", content: "Hơn 35 năm tiên phong giáo dục đại học. Khám phá chương trình đào tạo và tuyển sinh 2025." },
      { property: "og:url", content: `${SITE}/` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollegeOrUniversity",
        name: "Trường Đại học Thăng Long",
        alternateName: "Thang Long University",
        url: SITE,
        foundingDate: "1988",
        address: { "@type": "PostalAddress", addressLocality: "Hà Nội", addressCountry: "VN" },
      }),
    }],
  }),
});

function LandingPage() {
  const { content } = useLanding();
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-warning/10" />
        <div className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <Trophy className="h-3.5 w-3.5" />Top 10 đại học tư thục Việt Nam
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              {content.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">{content.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2"><Link to="/admissions">{content.heroCtaPrimary}<ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/login">{content.heroCtaSecondary}</Link></Button>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {content.stats.map((s, i) => (
                <div key={i} className="rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur">
                  <div className="text-3xl font-semibold text-primary">{s.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">{content.aboutTitle}</h2>
            <p className="mt-4 text-muted-foreground">{content.aboutBody}</p>
            <Button asChild variant="link" className="mt-3 gap-1 px-0"><Link to="/about">Tìm hiểu thêm <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="grid gap-4 lg:col-span-2 lg:grid-cols-2">
            {[
              { icon: GraduationCap, t: "Đào tạo chất lượng cao", d: "Chương trình kiểm định AUN-QA, giảng viên tốt nghiệp từ các trường danh tiếng." },
              { icon: Globe2, t: "Hợp tác quốc tế", d: "60+ trường đối tác ở Mỹ, Nhật, Hàn, EU. Trao đổi sinh viên & học kỳ ngoài nước." },
              { icon: BookOpen, t: "Trải nghiệm hiện đại", d: "LMS, MOOC, lab AI, fablab, không gian học tập 24/7." },
              { icon: Trophy, t: "Việc làm sau tốt nghiệp", d: "Tỷ lệ sinh viên có việc làm sau 6 tháng đạt 96% (khảo sát 2024)." },
            ].map((f) => (
              <div key={f.t} className="rounded-xl border bg-card p-5">
                <f.icon className="h-6 w-6 text-primary" />
                <div className="mt-3 font-semibold">{f.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Chương trình tiêu biểu</h2>
              <p className="mt-2 text-muted-foreground">32 chương trình đào tạo bậc đại học và sau đại học.</p>
            </div>
            <Button asChild variant="outline"><Link to="/programs">Xem tất cả</Link></Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {content.programs.map((p) => (
              <article key={p.id} className="group rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                <div className="text-xs font-medium uppercase tracking-wide text-primary">{p.duration}</div>
                <h3 className="mt-2 text-lg font-semibold">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-semibold tracking-tight">Tin tức & sự kiện</h2>
          <Button asChild variant="outline"><Link to="/news">Tất cả tin</Link></Button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {content.news.map((n) => (
            <article key={n.id} className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{new Date(n.date).toLocaleDateString("vi-VN")}</div>
              <h3 className="mt-2 line-clamp-2 text-base font-semibold">{n.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{n.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold">Sẵn sàng trở thành tân sinh viên TLU?</h2>
            <p className="mt-1 text-sm opacity-90">Hạn nộp hồ sơ tuyển sinh 2025: {content.admissionsDeadline}. Hotline {content.admissionsHotline}.</p>
          </div>
          <Button asChild size="lg" variant="secondary"><Link to="/admissions">Đăng ký tư vấn</Link></Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
