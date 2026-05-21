import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useLanding } from "@/lib/landing-content";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Globe2,
  Trophy,
  CalendarDays,
  Quote,
  PlayCircle
} from "lucide-react";
import {
  founder,
  alumniStories,
} from "@/data/university-data";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/")(  {
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Đại học Thăng Long — Kiến tạo tri thức, dẫn dắt tương lai" },
      { name: "description", content: "Trường Đại học Thăng Long (TLU) — đại học ngoài công lập đầu tiên Việt Nam, đào tạo Công nghệ, Kinh tế, Ngôn ngữ, Y khoa. Tuyển sinh 2025 đang mở." },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
  }),
});

function LandingPage() {
  const { content } = useLanding();
  return (
    <MarketingLayout>
      {/* ── Hero Section with Background Image ─────────────────── */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/DHTL.jpg" 
            alt="Thang Long University Campus" 
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:px-8 text-white text-center">
          <div className="mx-auto flex flex-col items-center max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md">
              <Trophy className="h-4 w-4 text-warning" />
              Đại học tư thục đầu tiên tại Việt Nam
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl drop-shadow-lg">
              Kiến tạo tri thức <br /> Dẫn dắt tương lai
            </h1>
            <p className="mt-6 text-lg text-white/90 drop-shadow md:text-xl">
              Năm 2026, trường Đại học Thăng Long dự kiến tuyển sinh hệ Đại học chính quy ở 10 lĩnh vực với 25 ngành đào tạo.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-lg gap-2 bg-primary hover:bg-primary/90 text-white rounded-full transition-transform hover:scale-105">
                <Link to="/admissions">
                  Tuyển sinh 2026 <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md rounded-full transition-transform hover:scale-105">
                <Link to="/programs">Chương trình đào tạo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Facilities (Hệ thống kiến trúc) ────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-sm font-bold tracking-wider text-primary uppercase">Cơ sở vật chất</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Hệ thống kiến trúc thay đổi tư duy</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Kiến trúc trong xây dựng không phải là một khái niệm mới lạ. Tuy nhiên, kiến trúc trong giáo dục lại là một khái niệm mới mẻ. Chúng tôi thiết kế riêng một không gian độc đáo, sáng tạo, nơi sinh viên có thể học tập mọi lúc mọi nơi.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              {[
                { icon: BookOpen, t: "Không gian học tập 24/7" },
                { icon: Globe2, t: "Môi trường chuẩn Quốc tế" }
              ].map((f) => (
                <div key={f.t} className="flex flex-col gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div className="font-semibold">{f.t}</div>
                </div>
              ))}
            </div>
            <Button asChild variant="link" className="mt-8 gap-2 px-0 text-primary hover:text-primary/80">
              <Link to="/about">Khám phá cơ sở vật chất <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted shadow-2xl lg:aspect-[4/3] group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-info/30 mix-blend-multiply z-10" />
            <img 
              src="/images/DHTL.jpg" 
              alt="Facilities" 
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* ── Student Life (Đô thị đại học) ──────────────────────── */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1 relative aspect-video overflow-hidden rounded-3xl bg-card shadow-xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-info/80 opacity-20 group-hover:opacity-10 transition-opacity z-10" />
              <img 
                src="/images/DHTL.jpg" 
                alt="Student Life" 
                className="h-full w-full object-cover object-center opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20">
                <Button size="icon" className="h-20 w-20 rounded-full bg-white/90 text-primary shadow-xl hover:bg-white hover:scale-110 transition-transform">
                  <PlayCircle className="h-10 w-10 ml-1" />
                </Button>
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:pl-10">
              <span className="text-sm font-bold tracking-wider text-primary uppercase">Đời sống Thăng Long</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Đô thị đại học & hệ sinh thái giáo dục</h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Môi trường học tập thoải mái, truyền cảm hứng và sự sáng tạo cho người học, đáp ứng mọi nhu cầu học tập - nghỉ ngơi - giải trí. Trở thành một thành viên trong cộng đồng Thăng Long, bạn được kết nối với những người trẻ nhiệt huyết, đa dạng và đầy màu sắc.
              </p>
              <Button asChild className="mt-8 rounded-full h-12 px-8" size="lg">
                <Link to="/">Đời sống sinh viên</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inspirational People ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-sm font-bold tracking-wider text-primary uppercase">Con người TLU</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Người truyền cảm hứng</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Những cá nhân kiệt xuất đứng sau sự thành công và triết lý giáo dục khác biệt của Đại học Thăng Long.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-3xl border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/30">
            <Quote className="h-10 w-10 text-primary/20 mb-6 group-hover:text-primary/40 transition-colors" />
            <blockquote className="text-lg font-medium leading-relaxed mb-8">
              "{founder.quote}"
            </blockquote>
            <div className="flex items-center gap-4 border-t pt-6 mt-auto">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xl font-bold text-primary">
                GS
              </div>
              <div>
                <div className="font-bold">{founder.name}</div>
                <div className="text-sm text-muted-foreground">{founder.title}</div>
              </div>
            </div>
          </div>
          {alumniStories.slice(0, 2).map((a) => (
            <div key={a.id} className="group rounded-3xl border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/30 flex flex-col">
              <Quote className="h-10 w-10 text-primary/20 mb-6 group-hover:text-primary/40 transition-colors" />
              <blockquote className="text-lg font-medium leading-relaxed mb-8 flex-1">
                "{a.description}"
              </blockquote>
              <div className="flex items-center gap-4 border-t pt-6 mt-auto">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xl font-bold text-primary">
                  {a.name.split(" ").pop()?.charAt(0)}
                </div>
                <div>
                  <div className="font-bold">{a.name}</div>
                  <div className="text-sm text-primary font-medium">{a.achievement}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── News ───────────────────────────────────────────────── */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Tin tức nổi bật</h2>
              <p className="mt-3 text-muted-foreground text-lg">Cập nhật những thông tin mới nhất từ nhà trường.</p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex rounded-full h-12 px-6">
              <Link to="/articles">Xem tất cả tin tức</Link>
            </Button>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {content.news.map((n) => (
              <article key={n.id} className="group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-muted mb-5 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-info/10 mix-blend-overlay z-10" />
                  <img 
                    src="/images/DHTL.jpg" 
                    alt={n.title} 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(n.date).toLocaleDateString("vi-VN")}
                </div>
                <h3 className="line-clamp-2 text-xl font-bold group-hover:text-primary transition-colors">
                  {n.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-muted-foreground leading-relaxed">
                  {n.excerpt}
                </p>
              </article>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-10 w-full sm:hidden rounded-full h-12">
            <Link to="/articles">Xem tất cả tin tức</Link>
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
