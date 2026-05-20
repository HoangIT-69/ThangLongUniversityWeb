/**
 * article-types.ts
 * TypeScript interfaces for the Article/News system.
 * Designed to match a future CMS REST API schema.
 * Used by: article-mock.ts, articles.ts (API module), article pages
 */

// ─── Core Article Types ──────────────────────────────────────────────

export interface ArticleResponse {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /** HTML content body */
  content: string;
  coverImage?: string | null;
  category: ArticleCategoryResponse;
  tags: ArticleTagResponse[];
  author: ArticleAuthorResponse;
  publishedAt: string;
  updatedAt?: string | null;
  /** Estimated reading time in minutes */
  readingTime: number;
  viewCount: number;
  relatedArticleIds: number[];
}

export interface ArticleCategoryResponse {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
}

export interface ArticleTagResponse {
  id: number;
  slug: string;
  name: string;
}

export interface ArticleAuthorResponse {
  name: string;
  avatar?: string | null;
  role?: string | null;
}

// ─── Paginated List ──────────────────────────────────────────────────

export interface ArticleListResponse {
  items: ArticleResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Query Params ────────────────────────────────────────────────────

export interface ArticleListParams {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
}
