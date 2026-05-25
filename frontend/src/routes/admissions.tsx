import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useLanding } from "@/lib/landing-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import {
  ArrowRight,
  FileCheck,
  BookMarked,
  GraduationCap,
  Brain,
  Award,
  Zap,
  Calculator,
  Search,
} from "lucide-react";
import {
  admissionMethods,
  certificateConversions,
  hsaTsaFormula,
  getAllMajors,
} from "@/data/university-data";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/admissions")({
  component: AdmissionsPage,
  head: () => ({
    meta: [
      { title: "Tuyển sinh 2025 — Đại học Thăng Long" },
      { name: "description", content: "6 phương thức xét tuyển, bảng điểm chuẩn 2024-2025, quy đổi chứng chỉ quốc tế, công thức tính điểm HSA/TSA. Đăng ký tư vấn ngay." },
      { property: "og:title", content: "Tuyển sinh 2025 TLU" },
      { property: "og:description", content: "Phương thức xét tuyển, điểm chuẩn, học phí và đăng ký tư vấn." },
      { property: "og:url", content: `${SITE}/admissions` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/admissions` }],
  }),
});

const methodIcons: Record<string, typeof FileCheck> = {
  FileCheck, BookMarked, GraduationCap, Brain, Award, Zap,
};

function AdmissionsPage() {
  const { content } = useLanding();
  const [scoreFilter, setScoreFilter] = useState("");
  const allMajors = getAllMajors();

  // Filter majors by score
  const scoreNum = parseFloat(scoreFilter);
  const eligibleMajors = !isNaN(scoreNum)
    ? allMajors.filter((m) => m.benchmarks.some((b) => b.score <= scoreNum))
    : [];

  return (
    <MarketingLayout>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 to-warning/10">
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Tuyển sinh 2025</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Đăng ký xét tuyển vào TLU</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Hạn nộp hồ sơ: <strong className="text-foreground">{content.admissionsDeadline}</strong> · Hotline: <strong className="text-foreground">{content.admissionsHotline}</strong>
          </p>
        </div>
      </section>

      {/* ── 6 Admission Methods ────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">6 phương thức xét tuyển</h2>
        <p className="mt-1 text-sm text-muted-foreground">Đa dạng cơ hội, giảm áp lực từ kỳ thi truyền thống.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {admissionMethods.map((m, i) => {
            const Icon = methodIcons[m.icon] ?? FileCheck;
            return (
              <div key={m.id} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">{i + 1}</span>
                </div>
                <h3 className="mt-3 font-semibold">{m.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HSA/TSA Formula ─────────────────────────────────────── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <Calculator className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Công thức tính điểm HSA/TSA</h2>
              <p className="mt-2 rounded-lg border bg-card p-4 text-sm font-medium">{hsaTsaFormula}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Score Checker ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Tra cứu ngành theo điểm</h2>
        <p className="mt-1 text-sm text-muted-foreground">Nhập điểm dự kiến để xem các ngành bạn đủ điều kiện xét tuyển.</p>
        <div className="mt-4 flex items-end gap-3">
          <div className="space-y-1.5">
            <Label>Điểm của bạn</Label>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                step="0.01"
                min="0"
                max="30"
                placeholder="VD: 20"
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="w-32"
              />
            </div>
          </div>
          {scoreFilter && (
            <span className="text-sm text-muted-foreground">
              {eligibleMajors.length > 0
                ? `${eligibleMajors.length} ngành phù hợp`
                : "Chưa có ngành phù hợp với mức điểm này"}
            </span>
          )}
        </div>
        {eligibleMajors.length > 0 && (
          <div className="mt-4 rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2.5 text-left font-medium">Ngành</th>
                    <th className="px-4 py-2.5 text-left font-medium">Khoa</th>
                    <th className="px-4 py-2.5 text-left font-medium">Tổ hợp</th>
                    <th className="px-4 py-2.5 text-right font-medium">Điểm chuẩn</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleMajors.map((m) =>
                    m.benchmarks
                      .filter((b) => b.score <= scoreNum)
                      .map((b, bi) => (
                        <tr key={`${m.id}-${bi}`} className="border-b last:border-0">
                          <td className="px-4 py-2.5 font-medium">{m.name}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{m.facultyName.length > 40 ? m.facultyName.slice(0, 40) + "…" : m.facultyName}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{b.subjectGroup}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-primary">{b.score}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── Certificate Conversion ─────────────────────────────── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold">Quy đổi chứng chỉ quốc tế</h2>
          <p className="mt-1 text-sm text-muted-foreground">Bảng quy đổi điểm IELTS / TOEFL iBT sang thang điểm 10 của TLU.</p>
          <div className="mt-6 rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2.5 text-left font-medium">Chứng chỉ</th>
                    <th className="px-4 py-2.5 text-left font-medium">IELTS</th>
                    <th className="px-4 py-2.5 text-left font-medium">TOEFL iBT</th>
                    <th className="px-4 py-2.5 text-right font-medium">Điểm quy đổi (thang 10)</th>
                  </tr>
                </thead>
                <tbody>
                  {certificateConversions.map((c, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-2.5">{c.certificate}</td>
                      <td className="px-4 py-2.5 font-medium">{c.ielts}</td>
                      <td className="px-4 py-2.5">{c.toeflIbt}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-primary">{c.tluScore.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Consultation Form + Methods sidebar ────────────────── */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold">Điểm chuẩn tham khảo 2025</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ngưỡng điểm sàn từ 16 đến 23 điểm.</p>
          <div className="mt-4 rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">Ngành</th>
                    <th className="px-3 py-2 text-left font-medium">Tổ hợp</th>
                    <th className="px-3 py-2 text-right font-medium">Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {getAllMajors()
                    .filter((m) => m.benchmarks.some((b) => b.year === 2025))
                    .flatMap((m) =>
                      m.benchmarks
                        .filter((b) => b.year === 2025)
                        .map((b, bi) => (
                          <tr key={`${m.id}-${bi}`} className="border-b last:border-0">
                            <td className="px-3 py-2 font-medium">{m.name}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{b.subjectGroup}</td>
                            <td className="px-3 py-2 text-right font-semibold text-primary">{b.score}</td>
                          </tr>
                        ))
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <form
          className="rounded-2xl border bg-card p-6 shadow-sm"
          onSubmit={(e) => { e.preventDefault(); toast.success("Đã gửi đăng ký tư vấn — bộ phận tuyển sinh sẽ liên hệ sớm."); (e.target as HTMLFormElement).reset(); }}
        >
          <h2 className="text-xl font-semibold">Đăng ký tư vấn tuyển sinh</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2"><Label>Họ và tên</Label><Input required /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" required /></div>
            <div className="space-y-1.5"><Label>Số điện thoại</Label><Input required /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Ngành quan tâm</Label><Input placeholder="VD: Công nghệ Thông tin, Trí tuệ nhân tạo" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Lời nhắn</Label><Textarea rows={3} /></div>
          </div>
          <Button type="submit" className="mt-4 w-full">Gửi đăng ký</Button>
        </form>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold">Tìm hiểu chi phí đầu tư</h2>
            <p className="mt-1 text-sm opacity-90">Học phí minh bạch, học bổng hấp dẫn, lộ trình tài chính rõ ràng.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/tuition">Xem học phí</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/scholarships">Học bổng <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
