import {
  mockAnnouncements,
  announcementCategories,
  type Announcement,
  type AnnouncementCategory,
} from "@/data/announcement-mock";

// ─── Types ───────────────────────────────────────────────────────────

export interface AnnouncementListParams {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  search?: string;
}

export interface AnnouncementListResponse {
  items: Announcement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type { Announcement, AnnouncementCategory };

// ─── Helpers ─────────────────────────────────────────────────────────

function filterAnnouncements(params: AnnouncementListParams): Announcement[] {
  let filtered = [...mockAnnouncements];

  if (params.categorySlug) {
    filtered = filtered.filter((a) => a.category.slug === params.categorySlug);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q),
    );
  }

  // Pinned first, then by date desc
  filtered.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return filtered;
}

function paginate(
  items: Announcement[],
  page: number,
  pageSize: number,
): AnnouncementListResponse {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

// ─── Public API ──────────────────────────────────────────────────────

export const announcementApi = {
  listAnnouncements: async (
    params: AnnouncementListParams = {},
  ): Promise<AnnouncementListResponse> => {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const filtered = filterAnnouncements(params);
    return paginate(filtered, page, pageSize);
  },

  getAnnouncement: async (slug: string): Promise<Announcement | null> => {
    return mockAnnouncements.find((a) => a.slug === slug) ?? null;
  },

  listCategories: async (): Promise<AnnouncementCategory[]> => {
    return announcementCategories;
  },
};
