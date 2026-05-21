/**
 * ArticleSidebarRight — Info panels for article detail page.
 * Matches TLU editorial style: info card, tags, related articles.
 */
import { Link } from "@tanstack/react-router";
import type {
  ArticleResponse,
  ArticleCategoryResponse,
  ArticleTagResponse,
} from "@/lib/api/article-types";
import { CalendarDays, Clock, Eye, FolderOpen } from "lucide-react";

/* ─── Info Panel ───────────────────────────────────────────────────── */

interface InfoPanelProps {
  category: ArticleCategoryResponse;
  publishedAt: string;
  readingTime: number;
  viewCount: number;
}

function InfoPanel({ category, publishedAt, readingTime, viewCount }: InfoPanelProps) {
  const dateStr = new Date(publishedAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const rows = [
    { icon: FolderOpen, label: "Chuyên mục", value: category.name },
    { icon: CalendarDays, label: "Ngày đăng", value: dateStr },
    { icon: Clock, label: "Thời gian đọc", value: `${readingTime} phút` },
    { icon: Eye, label: "Lượt xem", value: viewCount.toLocaleString("vi-VN") },
  ];

  return (
    <div className="overflow-hidden rounded-md border">
      <div
        className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
        style={{ backgroundColor: "#b01c18" }}
      >
        Thông tin bài viết
      </div>
      <div className="divide-y text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2.5 px-4 py-2.5">
            <r.icon className="h-3.5 w-3.5 shrink-0" style={{ color: "#6b7280" }} />
            <span style={{ color: "#6b7280" }}>{r.label}</span>
            <span className="ml-auto font-medium" style={{ color: "#1a1a1a" }}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tags Panel ───────────────────────────────────────────────────── */

function TagsPanel({ tags }: { tags: ArticleTagResponse[] }) {
  if (!tags.length) return null;
  return (
    <div className="mt-5">
      <h4
        className="mb-3 border-b-2 pb-1.5 text-xs font-bold uppercase tracking-wider"
        style={{ borderColor: "#b01c18", color: "#00133b" }}
      >
        Từ khóa
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t.slug}
            className="inline-block cursor-default rounded border px-2.5 py-1 text-xs transition-colors duration-150 hover:border-[#b01c18] hover:text-[#b01c18]"
            style={{ color: "#1a1a1a", borderColor: "#e5e7eb" }}
          >
            #{t.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Related Articles Panel ───────────────────────────────────────── */

function RelatedPanel({ articles }: { articles: ArticleResponse[] }) {
  if (!articles.length) return null;
  return (
    <div className="mt-5">
      <h4
        className="mb-3 border-b-2 pb-1.5 text-xs font-bold uppercase tracking-wider"
        style={{ borderColor: "#b01c18", color: "#00133b" }}
      >
        Bài viết liên quan
      </h4>
      <ul className="space-y-3">
        {articles.map((a) => (
          <li key={a.id}>
            <Link
              to="/articles/$slug"
              params={{ slug: a.slug }}
              className="group block"
            >
              <p className="line-clamp-2 text-sm font-medium leading-snug transition-colors duration-150 group-hover:text-[#b01c18]" style={{ color: "#1a1a1a" }}>
                {a.title}
              </p>
              <span className="mt-1 block text-xs" style={{ color: "#6b7280" }}>
                {new Date(a.publishedAt).toLocaleDateString("vi-VN")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Composed Sidebar ─────────────────────────────────────────────── */

interface Props {
  article: ArticleResponse;
  related: ArticleResponse[];
}

export function ArticleSidebarRight({ article, related }: Props) {
  return (
    <aside className="lg:block">
      <div className="sticky top-20 space-y-0">
        <InfoPanel
          category={article.category}
          publishedAt={article.publishedAt}
          readingTime={article.readingTime}
          viewCount={article.viewCount}
        />
        <TagsPanel tags={article.tags} />
        <RelatedPanel articles={related} />
      </div>
    </aside>
  );
}
