import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Calculator,
  TrendingUp,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import {
  tuitionTiers,
  tuitionGroups,
  tuitionProjection,
  retakeFees,
  tuitionComparison,
  formatVND,
  faculties,
} from "@/data/university-data";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/tuition")({
  component: TuitionPage,
  head: () => ({
    meta: [
      { title: "Học phí & Chi phí — Đại học Thăng Long" },
      { name: "description", content: "Học phí 27–45 triệu/năm. Biểu giá tín chỉ, lộ trình tăng ≤7%, so sánh chi phí và công cụ ước tính 4 năm." },
      { property: "og:title", content: "Học phí Đại học Thăng Long 2025" },
      { property: "og:url", content: `${SITE}/tuition` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/tuition` }],
  }),
});

// Flatten all majors for the calculator
const allMajors = faculties.flatMap((f) =>
  f.majors.map((m) => ({ label: m.name, fee: m.tuitionPerYear }))
);
const uniqueMajors = allMajors.filter(
  (m, i, arr) => arr.findIndex((a) => a.label === m.label) === i
);

function TuitionPage() {
  const [selectedMajor, setSelectedMajor] = useState(uniqueMajors[0]?.label ?? "");
  const majorFee = uniqueMajors.find((m) => m.label === selectedMajor)?.fee ?? 33_000_000;

  // 4-year projection with ~5% annual increase
  const projection = [
    { year: "Năm 1", fee: majorFee },
    { year: "Năm 2", fee: Math.round(majorFee * 1.05) },
    { year: "Năm 3", fee: Math.round(majorFee * 1.05 * 1.06) },
    { year: "Năm 4", fee: Math.round(majorFee * 1.05 * 1.06 * 1.07) },
  ];
  const total4Year = projection.reduce((s, p) => s + p.fee, 0);

  return (
    <MarketingLayout>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 to-success/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <CreditCard className="h-3.5 w-3.5" />Minh bạch tài chính
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Học phí & Chi phí đầu tư</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Học phí từ <strong className="text-foreground">27 – 45 triệu đồng/năm</strong>. Lộ trình tăng cam kết không vượt quá 7%/năm.
          </p>
        </div>
      </section>

      {/* ── Tuition by Program Group ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Học phí theo nhóm ngành (2024–2025)</h2>
        <div className="mt-6 rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium">Nhóm ngành</th>
                  <th className="px-4 py-2.5 text-left font-medium">Chuyên ngành tiêu biểu</th>
                  <th className="px-4 py-2.5 text-right font-medium">Học phí/năm</th>
                </tr>
              </thead>
              <tbody>
                {tuitionGroups.map((g, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{g.groupName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{g.representativeMajors.join(", ")}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{formatVND(g.annualFee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Credit-based Pricing ───────────────────────────────── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold">Giá tín chỉ theo khóa</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {tuitionTiers.map((t, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.cohort}</div>
                <div className="mt-2 text-2xl font-semibold text-primary">{formatVND(t.pricePerCredit)}</div>
                <div className="mt-1 text-xs text-muted-foreground">mỗi tín chỉ</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tuition Calculator ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Ước tính chi phí 4 năm</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Chọn ngành học để xem dự toán tổng chi phí (bao gồm dự báo tăng 5–7%/năm).</p>
        <div className="mt-4 space-y-1.5">
          <Label>Chọn ngành</Label>
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm md:w-80"
          >
            {uniqueMajors.map((m) => (
              <option key={m.label} value={m.label}>{m.label} — {formatVND(m.fee)}/năm</option>
            ))}
          </select>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {projection.map((p) => (
            <div key={p.year} className="rounded-xl border bg-card p-4 text-center">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{p.year}</div>
              <div className="mt-1 text-lg font-semibold text-primary">{formatVND(p.fee)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border bg-primary/5 p-5 text-center">
          <div className="text-sm text-muted-foreground">Tổng dự toán 4 năm</div>
          <div className="mt-1 text-3xl font-semibold text-primary">{formatVND(total4Year)}</div>
        </div>
      </section>

      {/* ── Tuition Roadmap ────────────────────────────────────── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Lộ trình học phí 2025–2028</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">2025–2026</div>
              <div className="mt-2 text-lg font-semibold">Tăng ~{tuitionProjection.year2526.increasePercent}%</div>
              <p className="mt-1 text-sm text-muted-foreground">{tuitionProjection.year2526.note}</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">2026–2027</div>
              <div className="mt-2 text-lg font-semibold">Tăng {tuitionProjection.year2627.increasePercent}–{tuitionProjection.year2627.maxPercent}%</div>
              <p className="mt-1 text-sm text-muted-foreground">{tuitionProjection.year2627.note}</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                <div className="text-xs font-bold uppercase tracking-wider text-success">2027–2028+</div>
              </div>
              <div className="mt-2 text-lg font-semibold">Cam kết ≤ {tuitionProjection.year2728onward.maxPercent}%/năm</div>
              <p className="mt-1 text-sm text-muted-foreground">{tuitionProjection.year2728onward.note}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Retake Fees FAQ ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Phụ thu & Lệ phí khác</h2>
        <div className="mt-4 space-y-3">
          {[
            { q: "Thi lại lần 1", a: retakeFees.retake1 },
            { q: "Thi lại lần 2", a: retakeFees.retake2 },
            { q: "Làm lại khóa luận tốt nghiệp", a: retakeFees.thesisRedo },
          ].map((f) => (
            <div key={f.q} className="rounded-xl border bg-card p-4">
              <div className="font-medium">{f.q}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cost Comparison ────────────────────────────────────── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold">So sánh học phí với các trường khác</h2>
          <p className="mt-1 text-sm text-muted-foreground">Thăng Long định vị ở phân khúc tầm trung — cao cấp, với cơ sở vật chất chuẩn quốc tế.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {tuitionComparison.map((c) => (
              <div key={c.name} className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${c.name.includes("Thăng Long") ? "border-primary/30 bg-primary/5" : "bg-card"}`}>
                <div className={`text-sm font-semibold ${c.name.includes("Thăng Long") ? "text-primary" : ""}`}>{c.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.range}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold">Giảm áp lực tài chính với học bổng TLU</h2>
            <p className="mt-1 text-sm opacity-90">Học bổng doanh nghiệp + học bổng học thuật cho sinh viên xuất sắc.</p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <Link to="/scholarships">Xem học bổng <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
