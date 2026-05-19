import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useLanding } from "@/lib/landing-content";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/programs")({
  component: ProgramsPage,
  head: () => ({
    meta: [
      { title: "Chương trình đào tạo — Đại học Thăng Long" },
      { name: "description", content: "Khám phá 32 chương trình đào tạo bậc đại học và sau đại học tại Đại học Thăng Long." },
      { property: "og:title", content: "Chương trình đào tạo TLU" },
      { property: "og:description", content: "32 chương trình đào tạo — Công nghệ, Kinh tế, Ngôn ngữ, Y khoa." },
      { property: "og:url", content: `${SITE}/programs` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/programs` }],
  }),
});

function ProgramsPage() {
  const { content } = useLanding();
  return (
    <MarketingLayout>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight">Chương trình đào tạo</h1>
          <p className="mt-2 text-muted-foreground">Chương trình chuẩn kiểm định, gắn liền với doanh nghiệp và xu hướng quốc tế.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {content.programs.map((p) => (
            <article key={p.id} className="rounded-xl border bg-card p-6">
              <div className="text-xs font-medium uppercase tracking-wide text-primary">{p.duration}</div>
              <h2 className="mt-2 text-xl font-semibold">{p.name}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
            </article>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
