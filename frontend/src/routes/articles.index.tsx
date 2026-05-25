import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useQuery } from "@tanstack/react-query";
import { articleApi } from "@/lib/api/articles";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Search, Tag, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/articles/")({
  component: ArticlesPage,
  head: () => ({
    meta: [
      { title: "Tin tức & Sự kiện — Đại học Thăng Long" },
      {
        name: "description",
        content:
          "Cập nhật tin tức tuyển sinh, hợp tác quốc tế, hoạt động sinh viên và sự kiện mới nhất tại TLU.",
      },
      { property: "og:title", content: "Tin tức TLU" },
      { property: "og:url", content: `${SITE}/articles` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/articles` }],
  }),
});

function ArticlesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["articles", "list", page, search],
    queryFn: () =>
      articleApi.listArticles({
        page,
        pageSize: 9,
        search: search || undefined,
      }),
  });

  return (
    <MarketingLayout>
      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-10">
          <h1 className="text-3xl font-semibold tracking-tight">Tin tức & Sự kiện</h1>
          <p className="mt-2 text-muted-foreground">Cập nhật mới nhất từ Đại học Thăng Long.</p>
        </div>
      </section>

      {/* ── Search ─────────────────────────────────────────────── */}
      <section className="border-b">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài viết…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-8 w-56 text-xs"
            />
          </div>
        </div>
      </section>

      {/* ── Articles Grid ──────────────────────────────────────── */}
      <section className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-10">
        {isPending ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl border bg-muted/50" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <div className="py-16 text-center text-muted-foreground">
            Không tìm thấy bài viết nào.
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((a) => (
                <Link
                  key={a.id}
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="group rounded-xl border bg-card transition-shadow hover:shadow-md"
                >
                  {a.coverImage && (
                    <div className="h-48 w-full overflow-hidden rounded-t-xl">
                      <img
                        src={a.coverImage}
                        alt={a.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {a.category.name}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(a.publishedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <h2 className="mt-3 line-clamp-2 text-base font-semibold group-hover:text-primary">
                      {a.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {a.tags.slice(0, 3).map((t) => (
                        <span
                          key={t.slug}
                          className="inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {t.name}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{a.author.name}</span>
                      <span className="flex items-center gap-1 font-medium text-primary">
                        Đọc tiếp <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {data.page} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </MarketingLayout>
  );
}
