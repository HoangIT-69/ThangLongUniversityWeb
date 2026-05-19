import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useLanding } from "@/lib/landing-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/admissions")({
  component: AdmissionsPage,
  head: () => ({
    meta: [
      { title: "Tuyển sinh 2025 — Đại học Thăng Long" },
      { name: "description", content: "Thông tin tuyển sinh đại học chính quy 2025 của TLU: phương thức xét tuyển, học phí, học bổng và đăng ký tư vấn." },
      { property: "og:title", content: "Tuyển sinh 2025 TLU" },
      { property: "og:description", content: "Phương thức xét tuyển, học phí, học bổng và đăng ký tư vấn." },
      { property: "og:url", content: `${SITE}/admissions` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/admissions` }],
  }),
});

function AdmissionsPage() {
  const { content } = useLanding();
  return (
    <MarketingLayout>
      <section className="border-b bg-gradient-to-br from-primary/10 to-warning/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Tuyển sinh 2025</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Đăng ký xét tuyển vào TLU</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Hạn nộp hồ sơ: <strong className="text-foreground">{content.admissionsDeadline}</strong> · Hotline: <strong className="text-foreground">{content.admissionsHotline}</strong></p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold">Phương thức xét tuyển</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
            {[
              "Xét điểm thi tốt nghiệp THPT 2025",
              "Xét học bạ 3 năm THPT (≥ 18.0 điểm)",
              "Xét chứng chỉ quốc tế (IELTS, SAT, ACT)",
              "Xét tuyển thẳng theo quy chế Bộ GD&ĐT",
              "Xét kết quả kỳ thi ĐGNL ĐHQG",
              "Phỏng vấn năng khiếu (với ngành thiết kế, ngôn ngữ)",
            ].map((m, i) => (
              <li key={i} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>{m}</li>
            ))}
          </ol>
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
            <div className="space-y-1.5 sm:col-span-2"><Label>Ngành quan tâm</Label><Input placeholder="VD: Công nghệ Thông tin" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Lời nhắn</Label><Textarea rows={3} /></div>
          </div>
          <Button type="submit" className="mt-4 w-full">Gửi đăng ký</Button>
        </form>
      </section>
    </MarketingLayout>
  );
}
