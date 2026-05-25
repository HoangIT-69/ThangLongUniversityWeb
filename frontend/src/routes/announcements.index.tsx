import { Link, createFileRoute } from "@tanstack/react-router";
import { Building2, CalendarDays, Megaphone, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Input } from "@/components/ui/input";
import { announcementCategories, marketingAnnouncements } from "@/lib/marketing-announcements";
import { cn } from "@/lib/utils";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/announcements/")({
  component: AnnouncementsPage,
  head: () => ({
    meta: [
      { title: "Thông báo sinh viên - Đại học Thăng Long" },
      {
        name: "description",
        content:
          "Cập nhật thông báo học phí, đào tạo, khảo thí và các thông tin quan trọng dành cho sinh viên Đại học Thăng Long.",
      },
      { property: "og:title", content: "Thông báo sinh viên TLU" },
      { property: "og:url", content: `${SITE}/announcements` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/announcements` }],
  }),
});

function AnnouncementsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<(typeof announcementCategories)[number]>("Tất cả");

  const filteredAnnouncements = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi-VN");

    return marketingAnnouncements.filter((announcement) => {
      const matchesCategory =
        activeCategory === "Tất cả" || announcement.category === activeCategory;
      const matchesSearch =
        !normalizedSearch ||
        announcement.title.toLocaleLowerCase("vi-VN").includes(normalizedSearch) ||
        announcement.summary.toLocaleLowerCase("vi-VN").includes(normalizedSearch) ||
        announcement.department.toLocaleLowerCase("vi-VN").includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <MarketingLayout>
      <section className="border-b bg-[#F8FAFC]">
        <div className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 lg:px-10">
          <div className="flex max-w-3xl flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C8102E]">
              <Megaphone className="h-4 w-4" />
              Bảng tin sinh viên
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#00204A] md:text-5xl">
              Thông báo
            </h1>
            <p className="text-base leading-7 text-slate-600 md:text-lg">
              Theo dõi các thông báo mới nhất về đào tạo, học phí, khảo thí và hỗ trợ sinh viên.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b bg-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex min-w-0 items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm lg:w-[360px]">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm thông báo..."
              className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {announcementCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  activeCategory === category
                    ? "border-[#C8102E] bg-[#C8102E] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#C8102E] hover:text-[#C8102E]",
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-10">
        {filteredAnnouncements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#C8102E]">
              <Megaphone className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-[#00204A]">Không tìm thấy thông báo</h2>
            <p className="mt-2 text-sm text-slate-500">
              Hãy thử đổi từ khóa tìm kiếm hoặc chọn nhóm thông báo khác.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAnnouncements.map((announcement) => (
              <Link
                key={announcement.id}
                to="/announcements/$slug"
                params={{ slug: announcement.slug }}
                className="group flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-rose-100 hover:shadow-lg"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-center transition-colors group-hover:border-rose-100 group-hover:bg-rose-50">
                    <span className="text-xl font-black leading-none text-[#00204A]">
                      {announcement.day}
                    </span>
                    <span className="mt-1 text-xs font-medium uppercase text-slate-500">
                      {announcement.month}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      {announcement.category}
                    </span>
                    {announcement.isNew ? (
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-600">
                        Mới
                      </span>
                    ) : null}
                  </div>
                </div>

                <h2 className="line-clamp-3 text-lg font-bold leading-snug text-[#00204A] transition-colors group-hover:text-[#C8102E]">
                  {announcement.title}
                </h2>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
                  {announcement.summary}
                </p>

                <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#C8102E]" />
                    {announcement.fullDate}
                  </span>
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#C8102E]" />
                    {announcement.department}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </MarketingLayout>
  );
}
