/**
 * ArticleSidebarLeft — Category navigation sidebar for article detail page.
 * University CMS-style nav with active state indicator.
 */
import { Link } from "@tanstack/react-router";
import type { ArticleCategoryResponse } from "@/lib/api/article-types";
import { cn } from "@/lib/utils";

interface Props {
  categories: ArticleCategoryResponse[];
  activeCategorySlug?: string;
}

export function ArticleSidebarLeft({ categories, activeCategorySlug }: Props) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20">
        <h3
          className="mb-4 border-b-2 pb-2 text-sm font-bold uppercase tracking-wider"
          style={{ borderColor: "#b01c18", color: "#00133b" }}
        >
          Danh mục
        </h3>
        <nav aria-label="Danh mục bài viết">
          <ul className="space-y-0.5">
            {categories.map((cat) => {
              const isActive = cat.slug === activeCategorySlug;
              return (
                <li key={cat.slug}>
                  <Link
                    to="/articles"
                    search={{ category: cat.slug } as never}
                    className={cn(
                      "block border-l-[3px] px-3 py-2 text-sm transition-all duration-150",
                      isActive
                        ? "border-[#b01c18] font-semibold"
                        : "border-transparent hover:border-[#b01c18]/30 hover:bg-[#f5f5f5]",
                    )}
                    style={isActive ? { color: "#b01c18" } : { color: "#1a1a1a" }}
                  >
                    {cat.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
