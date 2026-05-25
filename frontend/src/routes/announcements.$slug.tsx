import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Building2, CalendarDays, ChevronRight, Megaphone } from "lucide-react";
import { getAnnouncementBySlug, getRelatedAnnouncements } from "@/lib/marketing-announcements";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/announcements/$slug")({
  component: AnnouncementDetailPage,
  head: ({ params }) => {
    const announcement = getAnnouncementBySlug(params.slug);

    return {
      meta: [
        {
          title: announcement
            ? `${announcement.title} - Đại học Thăng Long`
            : "Thông báo - Đại học Thăng Long",
        },
        {
          name: "description",
          content:
            announcement?.summary ?? "Chi tiết thông báo dành cho sinh viên Đại học Thăng Long.",
        },
        {
          property: "og:title",
          content: announcement?.title ?? "Thông báo sinh viên TLU",
        },
        { property: "og:url", content: `${SITE}/announcements/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `${SITE}/announcements/${params.slug}` }],
    };
  },
});

function AnnouncementDetailPage() {
  const { slug } = Route.useParams();
  const announcement = getAnnouncementBySlug(slug);

  if (!announcement) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Breadcrumb
          items={[{ label: "Thông báo", to: "/announcements" }, { label: "Không tìm thấy" }]}
        />
        <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <div className="text-6xl font-black text-[#C8102E]">404</div>
          <h1 className="text-2xl font-bold text-[#00204A]">Thông báo không tồn tại</h1>
          <p className="text-slate-500">
            Thông báo bạn tìm kiếm đã bị gỡ hoặc đường dẫn không còn chính xác.
          </p>
          <Link
            to="/announcements"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#C8102E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a50d25]"
          >
            <ArrowLeft size={16} />
            Quay lại trang thông báo
          </Link>
        </div>
        <TluFooter />
      </div>
    );
  }

  const relatedAnnouncements = getRelatedAnnouncements(announcement.slug, announcement.category);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <div className="h-1 w-full bg-gradient-to-r from-[#00204A] via-[#C8102E] to-[#00204A]" />

      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 py-2.5 sm:px-6 lg:px-10">
          <Breadcrumb
            items={[
              { label: "Trang chủ", to: "/" },
              { label: "Thông báo", to: "/announcements" },
              { label: announcement.title },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <span className="inline-block rounded-full bg-[#C8102E] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {announcement.category}
            </span>

            <h1 className="mt-4 text-2xl font-black leading-tight text-[#00204A] sm:text-3xl xl:text-4xl">
              {announcement.title}
            </h1>

            <div className="mt-5 flex items-center gap-1.5 text-sm text-slate-500">
              <span className="h-4 w-0.5 rounded-full bg-[#C8102E]" />
              <time dateTime={announcement.fullDate}>{announcement.fullDate}</time>
            </div>
            <div className="mt-1 text-sm font-medium text-slate-600">{announcement.department}</div>

            <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Megaphone size={12} className="text-[#C8102E]" />
                {announcement.category}
              </span>
              <span className="flex items-center gap-1">
                <Building2 size={12} className="text-[#C8102E]" />
                {announcement.department}
              </span>
            </div>

            {announcement.isNew ? (
              <div className="mt-6 inline-flex rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-rose-600">
                Mới
              </div>
            ) : null}

            <div className="mt-8">
              <div
                className="mb-1 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white"
                style={{ backgroundColor: "#00204A" }}
              >
                Thông báo liên quan
              </div>
              <ul className="divide-y divide-slate-100 rounded-b border border-t-0 border-slate-200 bg-white">
                {relatedAnnouncements.length === 0 ? (
                  <li className="px-3 py-3 text-xs text-slate-500">Chưa có thông báo liên quan.</li>
                ) : (
                  relatedAnnouncements.map((related) => (
                    <li key={related.id}>
                      <Link
                        to="/announcements/$slug"
                        params={{ slug: related.slug }}
                        className="group flex gap-3 px-3 py-3 transition hover:bg-slate-50"
                      >
                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded bg-rose-50 text-center">
                          <span className="text-sm font-black leading-none text-[#00204A]">
                            {related.day}
                          </span>
                          <span className="mt-0.5 text-[10px] font-medium uppercase text-slate-500">
                            {related.month}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-xs font-semibold leading-snug text-[#00204A] transition group-hover:text-[#C8102E]">
                            {related.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">{related.fullDate}</p>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
              <div className="mt-2">
                <Link
                  to="/announcements"
                  className="flex items-center gap-1 text-xs font-semibold text-[#C8102E] hover:underline"
                >
                  Xem tất cả thông báo <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          <article>
            <p className="border-l-4 border-[#C8102E] pl-4 text-base font-semibold italic leading-relaxed text-[#00204A]/80">
              {announcement.summary}
            </p>

            <div className="article-body mt-6 max-w-none">
              {announcement.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <h2>Thông tin cần lưu ý</h2>
              <ul>
                <li>Sinh viên theo dõi Portal để cập nhật các thay đổi mới nhất.</li>
                <li>Nếu cần hỗ trợ, liên hệ đúng đơn vị phụ trách: {announcement.department}.</li>
                <li>Nhà trường khuyến nghị sinh viên hoàn thành yêu cầu trước thời hạn.</li>
              </ul>
            </div>
          </article>
        </div>
      </div>

      <TluFooter />

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
        .article-body a { color: #C8102E; text-decoration: underline; }
        .article-body a:hover { color: #a50d25; }
        .article-body table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.875rem; }
        .article-body th { background: #00204A; color: white; padding: 0.6rem 0.9rem; text-align: left; }
        .article-body td { padding: 0.55rem 0.9rem; border-bottom: 1px solid #e2e8f0; }
        .article-body tr:nth-child(even) td { background: #f8fafc; }
      `}</style>
    </div>
  );
}

function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-xs text-slate-500"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <ChevronRight size={12} className="text-slate-300" />}
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

function TluFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-[#00204A] text-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-black text-[#C8102E]">
                TLU
              </div>
              <div>
                <div className="font-bold">Đại học Thăng Long</div>
                <div className="text-xs text-white/60">Thang Long University</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              Trường đại học ngoài công lập đầu tiên của Việt Nam, thành lập năm 1988.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/50">
              Liên hệ
            </h4>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li>Đường Nghiêm Xuân Yêm, Đại Kim, Hoàng Mai, Hà Nội</li>
              <li>024 3858 7346</li>
              <li>daotao@thanglong.edu.vn</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/50">
              Truy cập nhanh
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link to="/" className="text-white/70 transition hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/articles" className="text-white/70 transition hover:text-white">
                  Tin tức & Sự kiện
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-white/70 transition hover:text-white">
                  Thông báo
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Trường Đại học Thăng Long. Bảo lưu mọi quyền. · Mã trường:
          DTL
        </div>
      </div>
    </footer>
  );
}
