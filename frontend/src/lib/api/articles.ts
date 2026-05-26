import type {
  ArticleCategoryResponse,
  ArticleListParams,
  ArticleListResponse,
  ArticleResponse,
  ArticleTagResponse,
} from "@/lib/api/article-types";

export const articleApi = {
  listArticles: async (params: ArticleListParams = {}): Promise<ArticleListResponse> => {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 9;
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  },

  getArticle: async (_slug: string): Promise<ArticleResponse | null> => null,

  getRelatedArticles: async (_articleId: number, _limit = 3): Promise<ArticleResponse[]> => [],

  listCategories: async (): Promise<ArticleCategoryResponse[]> => [],

  listTags: async (): Promise<ArticleTagResponse[]> => [],
};
