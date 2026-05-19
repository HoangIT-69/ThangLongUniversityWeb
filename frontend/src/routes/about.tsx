import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useLanding } from "@/lib/landing-content";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "Giới thiệu Đại học Thăng Long — Lịch sử và Sứ mệnh" },
      { name: "description", content: "Tìm hiểu lịch sử 35+ năm, sứ mệnh, tầm nhìn và các giá trị cốt lõi của Trường Đại học Thăng Long." },
      { property: "og:title", content: "Giới thiệu Đại học Thăng Long" },
      { property: "og:description", content: "Lịch sử, sứ mệnh, tầm nhìn và giá trị cốt lõi của TLU." },
      { property: "og:url", content: `${SITE}/about` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/about` }],
  }),
});

function AboutPage() {
  const { content } = useLanding();
  return (
    <MarketingLayout>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight">{content.aboutTitle}</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">{content.aboutBody}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { t: "Sứ mệnh", d: "Cung cấp môi trường giáo dục đại học chất lượng cao, phát triển con người toàn diện, đóng góp tích cực cho xã hội." },
            { t: "Tầm nhìn", d: "Trở thành đại học định hướng ứng dụng hàng đầu khu vực Đông Nam Á vào năm 2035." },
            { t: "Giá trị cốt lõi", d: "Khai phóng · Sáng tạo · Liêm chính · Trách nhiệm · Hợp tác." },
          ].map((b) => (
            <div key={b.t} className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold text-primary">{b.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {content.stats.map((s, i) => (
            <div key={i} className="rounded-xl border bg-card p-5">
              <div className="text-2xl font-semibold text-primary">{s.value}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
