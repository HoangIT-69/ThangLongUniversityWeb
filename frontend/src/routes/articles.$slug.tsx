import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { articleApi } from "@/lib/api/articles";
import { ChevronRight, Clock, Eye, Facebook, Twitter, ArrowLeft } from "lucide-react";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/articles/$slug")({
  component: ArticleDetailPage,
  head: () => ({
    meta: [{ title: "Bài viết — Đại học Thăng Long" }],
    links: [{ rel: "canonical", href: `${SITE}/articles` }],
  }),
});

function ArticleDetailPage() {
  const { slug } = useParams({ from: "/articles/$slug" });

  const { data: article, isPending } = useQuery({
    queryKey: ["articles", "detail", slug],
    queryFn: () => articleApi.getArticle(slug),
  });

  const { data: related } = useQuery({
    queryKey: ["articles", "related", article?.id],
    queryFn: () => articleApi.getRelatedArticles(article!.id, 4),
    enabled: !!article,
  });

  if (isPending) return <ArticleDetailSkeleton />;

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Breadcrumb
          items={[{ label: "Tin tức & Sự kiện", to: "/articles" }, { label: "Không tìm thấy" }]}
        />
        <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <div className="text-6xl font-black text-[#C8102E]">404</div>
          <h1 className="text-2xl font-bold text-[#00204A]">Bài viết không tồn tại</h1>
          <p className="text-slate-500">Bài viết bạn tìm kiếm đã bị gỡ hoặc không tồn tại.</p>
          <Link
            to="/articles"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#C8102E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a50d25]"
          >
            <ArrowLeft size={16} />
            Quay lại trang tin tức
          </Link>
        </div>
      </div>
    );
  }

  const publishDate = new Date(article.publishedAt);
  const formattedDate = publishDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const longDate = publishDate.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pageUrl = `${SITE}/articles/${article.slug}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-sans text-slate-900">
      {/* ── Top brand bar ── */}
      <div className="h-1 w-full bg-gradient-to-r from-[#00204A] via-[#C8102E] to-[#00204A]" />

      {/* ── Breadcrumb ── */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 py-2.5 sm:px-6 lg:px-10">
          <Breadcrumb
            items={[
              { label: "Trang chủ", to: "/" },
              { label: "Tin tức & Sự kiện", to: "/articles" },
              { label: article.title },
            ]}
          />
        </div>
      </div>

      {/* ── Main content: 2 cols = Title | Body ── */}
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
          {/* ── Left col: Title block ── */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {/* Category badge */}
            <span className="inline-block rounded-full bg-[#C8102E] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {article.category.name}
            </span>

            {/* Title */}
            <h1 className="mt-4 text-2xl font-black leading-tight text-[#00204A] sm:text-3xl xl:text-4xl">
              {article.title}
            </h1>

            {/* Date + author */}
            <div className="mt-5 flex items-center gap-1.5 text-sm text-slate-500">
              <span className="h-4 w-0.5 rounded-full bg-[#C8102E]" />
              <time dateTime={article.publishedAt} title={longDate}>
                {formattedDate}
              </time>
            </div>
            <div className="mt-1 text-sm font-medium text-slate-600">{article.author.name}</div>

            {/* Meta */}
            <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-[#C8102E]" />
                {article.readingTime} phút đọc
              </span>
              <span className="flex items-center gap-1">
                <Eye size={12} className="text-[#C8102E]" />
                {article.viewCount.toLocaleString("vi-VN")} lượt xem
              </span>
            </div>

            {/* Share */}
            <div className="mt-6 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Chia sẻ:</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chia sẻ Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white"
              >
                <Facebook size={14} />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chia sẻ Twitter / X"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-500 transition hover:bg-sky-500 hover:text-white"
              >
                <Twitter size={14} />
              </a>
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {article.tags.map((t) => (
                  <span
                    key={t.slug}
                    className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-[#C8102E] hover:text-[#C8102E]"
                  >
                    #{t.name}
                  </span>
                ))}
              </div>
            )}

            {/* Related articles */}
            {related && related.length > 0 && (
              <div className="mt-8">
                <div
                  className="mb-1 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white"
                  style={{ backgroundColor: "#00204A" }}
                >
                  Bài viết liên quan
                </div>
                <ul className="divide-y divide-slate-100 rounded-b border border-t-0 border-slate-200 bg-white">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link
                        to="/articles/$slug"
                        params={{ slug: r.slug }}
                        className="group flex gap-3 px-3 py-3 transition hover:bg-slate-50"
                      >
                        {r.coverImage && (
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded">
                            <img
                              src={r.coverImage}
                              alt={r.title}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-xs font-semibold leading-snug text-[#00204A] transition group-hover:text-[#C8102E]">
                            {r.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {new Date(r.publishedAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-2">
                  <Link
                    to="/articles"
                    className="flex items-center gap-1 text-xs font-semibold text-[#C8102E] hover:underline"
                  >
                    Xem tất cả tin tức <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Right col: Article body ── */}
          <article>
            {/* Cover image */}
            {article.coverImage && (
              <div className="mb-6 overflow-hidden rounded-xl shadow-sm">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}

            {/* Excerpt / lead */}
            <p className="border-l-4 border-[#C8102E] pl-4 text-base font-semibold italic leading-relaxed text-[#00204A]/80">
              {article.excerpt}
            </p>

            {/* Body HTML */}
            <div
              className="article-body prose prose-slate mt-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>
        </div>
      </main>

      {/* Article body styles */}
      <style>{`
        .article-body p { margin-bottom: 1rem; line-height: 1.8; color: #1e293b; }
        .article-body h2 { font-size: 1.25rem; font-weight: 800; color: #00204A; margin: 1.75rem 0 0.75rem; padding-left: 0.75rem; border-left: 4px solid #C8102E; }
        .article-body h3 { font-size: 1.05rem; font-weight: 700; color: #00204A; margin: 1.5rem 0 0.5rem; }
        .article-body ul, .article-body ol { margin: 0.75rem 0 1rem 1.25rem; }
        .article-body li { margin-bottom: 0.4rem; line-height: 1.75; color: #334155; }
        .article-body ul li { list-style: disc; }
        .article-body ol li { list-style: decimal; }
        .article-body strong { font-weight: 700; color: #00204A; }
        .article-body blockquote { margin: 1.5rem 0; padding: 1rem 1.25rem; border-left: 4px solid #C8102E; background: #fef2f2; border-radius: 0 8px 8px 0; font-style: italic; color: #7f1d1d; }
        .article-body img { border-radius: 10px; margin: 1.25rem auto; max-width: 100%; display: block; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .article-body a { color: #C8102E; text-decoration: underline; }
        .article-body a:hover { color: #a50d25; }
        .article-body figure { margin: 1.5rem 0; text-align: center; }
        .article-body figcaption { margin-top: 0.5rem; font-size: 0.8rem; color: #64748b; font-style: italic; }
        .article-body table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.875rem; }
        .article-body th { background: #00204A; color: white; padding: 0.6rem 0.9rem; text-align: left; }
        .article-body td { padding: 0.55rem 0.9rem; border-bottom: 1px solid #e2e8f0; }
        .article-body tr:nth-child(even) td { background: #f8fafc; }
      `}</style>
    </div>
  );
}

/* ── Breadcrumb ─────────────────────────────────────────────────────── */

function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-xs text-slate-500"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} className="text-slate-300" />}
            {item.to && !isLast ? (
              <Link
                to={item.to as never}
                className="max-w-[180px] truncate transition hover:text-[#C8102E]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`max-w-[240px] truncate ${isLast ? "font-semibold text-[#00204A]" : ""}`}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/* ── Loading skeleton ───────────────────────────────────────────────── */

function ArticleDetailSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <div className="h-1 w-full bg-gradient-to-r from-[#00204A] via-[#C8102E] to-[#00204A]" />
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 py-2.5 sm:px-6 lg:px-10">
          <div className="h-3 w-64 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="h-[300px] animate-pulse bg-slate-200" />
              <div className="space-y-4 p-8">
                <div className="h-8 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                <div className="mt-6 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <aside>
            <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm" />
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ── TLU Footer ─────────────────────────────────────────────────────── */
