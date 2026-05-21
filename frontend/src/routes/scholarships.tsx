import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Star, Building2, GraduationCap, CheckCircle } from "lucide-react";
import { academicScholarships, corporateScholarships, formatVND } from "@/data/university-data";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/scholarships")({
  component: ScholarshipsPage,
  head: () => ({
    meta: [
      { title: "Học bổng & Hỗ trợ tài chính — Đại học Thăng Long" },
      { name: "description", content: "Học bổng doanh nghiệp LOTTE, học bổng học thuật Xuất sắc (5 triệu) và Giỏi (3 triệu). Chính sách hỗ trợ sinh viên TLU." },
      { property: "og:title", content: "Học bổng Đại học Thăng Long" },
      { property: "og:url", content: `${SITE}/scholarships` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/scholarships` }],
  }),
});

function ScholarshipsPage() {
  return (
    <MarketingLayout>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-warning/10 to-primary/10">
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-warning/15 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <Award className="h-3.5 w-3.5" />Học bổng ngập tràn — Vững vàng tài chính
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Học bổng & Hỗ trợ tài chính</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Biến áp lực học phí thành động lực phấn đấu. Học bổng doanh nghiệp quốc tế và học bổng học thuật cho sinh viên xuất sắc.
          </p>
        </div>
      </section>

      {/* ── Corporate Scholarships ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Học bổng doanh nghiệp</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Sinh viên TLU được các tập đoàn đa quốc gia chú ý và đầu tư trực tiếp.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {corporateScholarships.map((s) => (
            <div key={s.name} className="rounded-2xl border bg-gradient-to-br from-warning/5 to-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-warning/10">
                  <Award className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <div className="text-xs text-muted-foreground">Tài trợ bởi: {s.sponsor}</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
          {/* Placeholder for future scholarships */}
          <div className="flex items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-6">
            <div className="text-center">
              <Star className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Thêm nhiều học bổng doanh nghiệp đang được cập nhật...</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Academic Scholarships ──────────────────────────────── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Học bổng học thuật nội bộ</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Xét minh bạch ngay sau khi công bố kết quả kỳ học chính thức. Phân chia thành các ngưỡng Khá – Giỏi – Xuất sắc.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {academicScholarships.map((s) => (
              <div key={s.level} className="relative rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                {s.level === "Xuất sắc" && (
                  <div className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground shadow">
                    Top tier
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${s.level === "Xuất sắc" ? "bg-primary/10" : "bg-info/10"}`}>
                    <Star className={`h-7 w-7 ${s.level === "Xuất sắc" ? "text-primary" : "text-info"}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Xếp loại {s.level}</h3>
                    <div className="text-xs text-muted-foreground">GPA ≥ {s.gpaMin.toFixed(1)} (thang 10)</div>
                  </div>
                </div>
                <div className="mt-4 text-3xl font-semibold text-primary">{formatVND(s.amount)}<span className="text-base font-normal text-muted-foreground">/suất</span></div>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Process ────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Quy trình xét học bổng</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { step: 1, title: "Hoàn thành kỳ học", desc: "Tham gia đầy đủ các môn học trong kỳ chính." },
            { step: 2, title: "Công bố kết quả", desc: "Nhà trường công bố kết quả GPA chính thức." },
            { step: 3, title: "Xét duyệt tự động", desc: "Hệ thống tự động xác định sinh viên đủ điều kiện." },
            { step: 4, title: "Nhận học bổng", desc: "Sinh viên nhận tiền mặt hoặc giảm trừ học phí kỳ tiếp theo." },
          ].map((s) => (
            <div key={s.step} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{s.step}</div>
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold">Sẵn sàng nộp hồ sơ?</h2>
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
