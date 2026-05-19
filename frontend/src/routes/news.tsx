import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useLanding } from "@/lib/landing-content";
import { CalendarDays } from "lucide-react";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/news")({
  component: NewsPage,
  head: () => ({
    meta: [
      { title: "Tin tức & Sự kiện — Đại học Thăng Long" },
      { name: "description", content: "Cập nhật tin tức tuyển sinh, hợp tác quốc tế, hoạt động sinh viên và sự kiện mới nhất tại TLU." },
      { property: "og:title", content: "Tin tức TLU" },
      { property: "og:description", content: "Tin tức & sự kiện mới nhất tại Đại học Thăng Long." },
      { property: "og:url", content: `${SITE}/news` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/news` }],
  }),
});

function NewsPage() {
  const { content } = useLanding();
  return (
    <MarketingLayout>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight">Tin tức & sự kiện</h1>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.news.map((n) => (
            <article key={n.id} className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{new Date(n.date).toLocaleDateString("vi-VN")}</div>
              <h2 className="mt-2 text-base font-semibold">{n.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{n.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
