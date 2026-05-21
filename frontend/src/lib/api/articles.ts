/**
 * articles.ts — Article API module with mock fallback
 * Pattern: matches studentApi / adminApi from existing codebase
 * Strategy: try API first → fallback to mock if 404/error
 */
import type {
  ArticleResponse,
  ArticleCategoryResponse,
  ArticleTagResponse,
  ArticleListResponse,
  ArticleListParams,
} from "@/lib/api/article-types";
import {
  mockArticles,
  mockCategories,
  mockTags,
} from "@/data/article-mock";

// ─── Mock helpers (used when API is unavailable) ─────────────────────

function paginateMock(
  items: ArticleResponse[],
  page: number,
  pageSize: number,
): ArticleListResponse {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

function filterMock(params: ArticleListParams): ArticleResponse[] {
  let filtered = [...mockArticles];

  if (params.categorySlug) {
    filtered = filtered.filter(
      (a) => a.category.slug === params.categorySlug,
    );
  }
  if (params.tagSlug) {
    filtered = filtered.filter((a) =>
      a.tags.some((t) => t.slug === params.tagSlug),
    );
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q),
    );
  }

  // Sort by publishedAt descending
  filtered.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return filtered;
}

// ─── Public API module ───────────────────────────────────────────────

export const articleApi = {
  /**
   * List articles with pagination, category/tag filter, search.
   * Falls back to mock data when backend article API is unavailable.
   */
  listArticles: async (
    params: ArticleListParams = {},
  ): Promise<ArticleListResponse> => {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 9;

    // TODO: Replace with apiRequest when backend article endpoint exists
    // try {
    //   const qs = new URLSearchParams();
    //   qs.set("page", String(page));
    //   qs.set("pageSize", String(pageSize));
    //   if (params.categorySlug) qs.set("category", params.categorySlug);
    //   if (params.tagSlug) qs.set("tag", params.tagSlug);
    //   if (params.search) qs.set("q", params.search);
    //   return await apiRequest<ArticleListResponse>(`/api/articles?${qs}`);
    // } catch {
    //   // Fallback to mock
    // }

    const filtered = filterMock(params);
    return paginateMock(filtered, page, pageSize);
  },

  /**
   * Get single article by slug.
   */
  getArticle: async (slug: string): Promise<ArticleResponse | null> => {
    // TODO: Replace with apiRequest<ArticleResponse>(`/api/articles/${slug}`)
    return mockArticles.find((a) => a.slug === slug) ?? null;
  },

  /**
   * Get related articles for a given article.
   */
  getRelatedArticles: async (
    articleId: number,
    limit = 3,
  ): Promise<ArticleResponse[]> => {
    const article = mockArticles.find((a) => a.id === articleId);
    if (!article) return [];
    return mockArticles
      .filter((a) => article.relatedArticleIds.includes(a.id))
      .slice(0, limit);
  },

  /**
   * List all categories.
   */
  listCategories: async (): Promise<ArticleCategoryResponse[]> => {
    // TODO: Replace with apiRequest<ArticleCategoryResponse[]>('/api/articles/categories')
    return mockCategories;
  },

  /**
   * List all tags.
   */
  listTags: async (): Promise<ArticleTagResponse[]> => {
    // TODO: Replace with apiRequest<ArticleTagResponse[]>('/api/articles/tags')
    return mockTags;
  },
};
