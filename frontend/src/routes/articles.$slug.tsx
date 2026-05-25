import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ArticleHeroBanner } from "@/components/marketing/ArticleHeroBanner";
import { ArticleSidebarLeft } from "@/components/marketing/ArticleSidebarLeft";
import { ArticleSidebarRight } from "@/components/marketing/ArticleSidebarRight";
import { useQuery } from "@tanstack/react-query";
import { articleApi } from "@/lib/api/articles";
import { CalendarDays, Clock, Eye, ArrowLeft, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/articles/$slug")({
  component: ArticleDetailPage,
});

function ArticleDetailPage() {
  const { slug } = Route.useParams();

  const { data: article, isPending, isError } = useQuery({
    queryKey: ["articles", "detail", slug],
    queryFn: () => articleApi.getArticle(slug),
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ["articles", "related", article?.id],
    queryFn: () => articleApi.getRelatedArticles(article!.id),
    enabled: article?.id != null,
  });

  const { data: categories } = useQuery({
    queryKey: ["articles", "categories"],
    queryFn: articleApi.listCategories,
    staleTime: 60 * 60 * 1000,
  });

  /* ── Loading state ────────────────────────────────────────────── */
  if (isPending) {
    return (
      <MarketingLayout>
        <ArticleHeroBanner />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 py-20">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#b01c18" }} />
            <span className="text-sm" style={{ color: "#6b7280" }}>Đang tải bài viết...</span>
          </div>
        </div>
      </MarketingLayout>
    );
  }

  /* ── Error / Not found state ──────────────────────────────────── */
  if (isError || !article) {
    return (
      <MarketingLayout>
        <ArticleHeroBanner />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold" style={{ color: "#00133b" }}>
            Không tìm thấy bài viết
          </h1>
          <p className="mt-2" style={{ color: "#6b7280" }}>
            Bài viết không tồn tại hoặc đã bị xóa.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/articles"><ArrowLeft className="mr-2 h-4 w-4" />Quay lại tin tức</Link>
          </Button>
        </div>
      </MarketingLayout>
    );
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết!");
  };

  const publishedDate = new Date(article.publishedAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <MarketingLayout>
      {/* ════ Hero Banner ════════════════════════════════════════════ */}
      <ArticleHeroBanner />

      {/* ════ Breadcrumb + Share Bar ════════════════════════════════ */}
      <div style={{ backgroundColor: "#f5f5f5" }} className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs" style={{ color: "#6b7280" }}>
            <Link to="/" className="transition-colors hover:text-[#b01c18]">Trang chủ</Link>
            <span>/</span>
            <Link to="/articles" className="transition-colors hover:text-[#b01c18]">Tin tức</Link>
            <span>/</span>
            <span className="max-w-[200px] truncate font-medium sm:max-w-xs" style={{ color: "#1a1a1a" }}>
              {article.title}
            </span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs sm:inline" style={{ color: "#6b7280" }}>Chia sẻ</span>
            <button
              onClick={copyLink}
              className="grid h-7 w-7 place-items-center rounded border transition-colors duration-150 hover:border-[#b01c18] hover:text-[#b01c18]"
              style={{ borderColor: "#d1d5db", color: "#6b7280" }}
              aria-label="Chia sẻ bài viết"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ════ Main 3-Column Layout ══════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[220px_1fr_300px] lg:gap-8">

          {/* ──── LEFT SIDEBAR ──────────────────────────────────── */}
          <ArticleSidebarLeft
            categories={categories ?? []}
            activeCategorySlug={article.category.slug}
          />

          {/* ──── MAIN CONTENT ─────────────────────────────────── */}
          <article className="min-w-0">
            {/* Title */}
            <h1
              className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[34px]"
              style={{ color: "#00133b" }}
            >
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="mt-3 text-base leading-relaxed" style={{ color: "#6b7280" }}>
              {article.excerpt}
            </p>

            {/* Metadata row */}
            <div
              className="mt-4 flex flex-wrap items-center gap-4 border-b pb-4 text-xs"
              style={{ color: "#6b7280", borderColor: "#e5e7eb" }}
            >
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {publishedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {article.readingTime} phút đọc
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {article.viewCount.toLocaleString("vi-VN")} lượt xem
              </span>
              <span className="ml-auto text-xs font-medium" style={{ color: "#1a1a1a" }}>
                {article.author.name}
              </span>
            </div>

            {/* Article HTML content */}
            <div
              className="article-content mt-6"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags (mobile-only, mirroring sidebar) */}
            <div className="mt-8 flex flex-wrap gap-1.5 lg:hidden">
              {article.tags.map((t) => (
                <span
                  key={t.slug}
                  className="inline-block rounded border px-2.5 py-1 text-xs"
                  style={{ color: "#1a1a1a", borderColor: "#e5e7eb" }}
                >
                  #{t.name}
                </span>
              ))}
            </div>

            {/* Back link */}
            <div className="mt-8 border-t pt-6" style={{ borderColor: "#e5e7eb" }}>
              <Button asChild variant="outline" size="sm">
                <Link to="/articles">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Quay lại tin tức
                </Link>
              </Button>
            </div>

            {/* Related articles (mobile-only) */}
            {related && related.length > 0 && (
              <div className="mt-8 lg:hidden">
                <h3
                  className="mb-4 border-b-2 pb-2 text-sm font-bold uppercase tracking-wider"
                  style={{ borderColor: "#b01c18", color: "#00133b" }}
                >
                  Bài viết liên quan
                </h3>
                <ul className="space-y-3">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link
                        to="/articles/$slug"
                        params={{ slug: r.slug }}
                        className="group block"
                      >
                        <p className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-[#b01c18]">
                          {r.title}
                        </p>
                        <span className="mt-1 block text-xs" style={{ color: "#6b7280" }}>
                          {new Date(r.publishedAt).toLocaleDateString("vi-VN")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          {/* ──── RIGHT SIDEBAR ─────────────────────────────────── */}
          <div className="hidden lg:block">
            <ArticleSidebarRight
              article={article}
              related={related ?? []}
            />
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
