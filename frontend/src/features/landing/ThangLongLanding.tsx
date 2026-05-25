import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Newspaper,
  Shield,
  Smartphone,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { marketingAnnouncements } from "@/lib/marketing-announcements";

const heroImages = [
  "/images/dhtl4.jpg",
  "/images/dhtl2.jpg",
  "/images/dhtl3.jpg",
  "/images/dhtl1.jpg",
];

const newsItems = [
  {
    id: 1,
    slug: "thong-bao-tuyen-sinh-2025",
    title: "Đại học Thăng Long tổ chức Lễ trao bằng tốt nghiệp đợt 1 năm 2026",
    date: "22/05/2026",
    image: "/images/dhtl1.jpg",
  },
  {
    id: 2,
    slug: "co-hoi-nganh-tri-tue-nhan-tao-tlu",
    title: "Sinh viên TLU xuất sắc giành giải Nhất cuộc thi Khởi nghiệp Quốc gia",
    date: "20/05/2026",
    image: "/images/dhtl3.jpg",
  },
  {
    id: 3,
    slug: "diem-chuan-2024-ky-luc-truyen-thong",
    title: "Ngày hội việc làm TLU Job Fair 2026 thu hút hơn 50 doanh nghiệp",
    date: "18/05/2026",
    image: "/images/dhtl2.jpg",
  },
];

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ThangLongLanding() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-950 selection:bg-[#C8102E] selection:text-white">
      <HeroCarousel />
      <NewsAndAnnouncements />
      <SupportFooter />
    </div>
  );
}

export default ThangLongLanding;

function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        window.setTimeout(() => setIsVisible(true), delay);
        observer.unobserve(element);
      },
      { threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((index) => (index + 1) % heroImages.length);
  const previousSlide = () =>
    setCurrentIndex((index) => (index === 0 ? heroImages.length - 1 : index - 1));

  return (
    <section id="top" className="group relative h-screen w-full overflow-hidden bg-black">
      {heroImages.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "z-10 opacity-100" : "z-0 opacity-0"
          }`}
        >
          <img
            src={image}
            alt={`Khuôn viên Đại học Thăng Long ${index + 1}`}
            className={`h-full w-full object-cover object-center transition-transform duration-[10000ms] ease-linear ${
              index === currentIndex ? "scale-105" : "scale-100"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
        </div>
      ))}

      <button
        type="button"
        onClick={previousSlide}
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white opacity-0 transition-opacity hover:bg-[#C8102E] group-hover:opacity-100"
        aria-label="Ảnh trước"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white opacity-0 transition-opacity hover:bg-[#C8102E] group-hover:opacity-100"
        aria-label="Ảnh tiếp theo"
      >
        <ChevronRight size={28} />
      </button>

      <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3">
        {heroImages.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 scale-125 bg-[#C8102E]"
                : "w-2.5 bg-white/60 hover:bg-white"
            }`}
            aria-label={`Chuyển đến ảnh ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function NewsAndAnnouncements() {
  const featuredNews = newsItems[0];
  const secondaryNews = newsItems.slice(1);
  const latestAnnouncements = marketingAnnouncements.slice(0, 5);

  return (
    <section id="announcements" className="bg-[#F8FAFC] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[#00204A] md:text-4xl">Tin tức & Thông báo</h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#C8102E]" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <div className="mb-6 flex items-center gap-2 text-[#00204A]">
                <Newspaper className="h-6 w-6 text-[#C8102E]" />
                <h3 className="text-2xl font-bold">Tin tức nổi bật</h3>
              </div>
            </ScrollReveal>

            <div className="flex flex-col gap-6">
              <ScrollReveal delay={100}>
                <Link
                  to="/articles/$slug"
                  params={{ slug: featuredNews.slug }}
                  className="group block cursor-pointer"
                >
                  <div className="mb-4 h-[300px] overflow-hidden rounded-2xl shadow-sm">
                    <img
                      src={featuredNews.image}
                      alt={featuredNews.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" /> {featuredNews.date}
                  </div>
                  <h4 className="text-2xl font-bold leading-tight text-[#00204A] transition-colors group-hover:text-[#C8102E]">
                    {featuredNews.title}
                  </h4>
                </Link>
              </ScrollReveal>

              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {secondaryNews.map((news, index) => (
                  <ScrollReveal delay={200 + index * 100} key={news.id}>
                    <Link
                      to="/articles/$slug"
                      params={{ slug: news.slug }}
                      className="group flex cursor-pointer flex-col gap-3"
                    >
                      <div className="h-[160px] overflow-hidden rounded-xl shadow-sm">
                        <img
                          src={news.image}
                          alt={news.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5" /> {news.date}
                        </div>
                        <h4 className="line-clamp-2 text-base font-semibold text-[#00204A] transition-colors group-hover:text-[#C8102E]">
                          {news.title}
                        </h4>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <ScrollReveal>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#00204A]">
                  <Megaphone className="h-6 w-6 text-rose-500" />
                  <h3 className="text-2xl font-bold">Thông báo mới</h3>
                </div>
                <Link
                  to="/announcements"
                  className="flex items-center gap-1 text-sm font-semibold text-[#C8102E] hover:underline"
                >
                  Xem tất cả <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                {latestAnnouncements.map((announcement, index) => (
                  <Link
                    key={announcement.id}
                    to="/announcements/$slug"
                    params={{ slug: announcement.slug }}
                    className={`group flex cursor-pointer gap-4 ${
                      index !== latestAnnouncements.length - 1
                        ? "border-b border-slate-100 pb-4"
                        : ""
                    }`}
                  >
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-center transition-colors group-hover:border-rose-100 group-hover:bg-rose-50">
                      <span className="text-xl font-black leading-none text-[#00204A]">
                        {announcement.day}
                      </span>
                      <span className="mt-1 text-xs font-medium uppercase text-slate-500">
                        {announcement.month}
                      </span>
                    </div>

                    <div className="flex flex-col justify-center">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          {announcement.category}
                        </span>
                        {announcement.isNew ? (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                            Mới
                          </span>
                        ) : null}
                      </div>
                      <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-[#00204A] transition-colors group-hover:text-[#C8102E]">
                        {announcement.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function SupportFooter() {
  return (
    <footer id="support" className="border-t border-slate-100 bg-white pb-10 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C8102E] text-xl font-black tracking-tighter text-white">
                TLU
              </div>
              <span className="text-xl font-bold text-[#00204A]">Đại học Thăng Long</span>
            </div>
            <p className="mb-6 max-w-sm text-slate-500">
              Cổng thông tin sinh viên nội bộ. Hệ thống được quản trị và phát triển bởi Trung tâm
              CNTT - Đại học Thăng Long.
            </p>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-[#C8102E] hover:text-white">
                <Smartphone size={20} />
              </div>
              <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-[#00204A] hover:text-white">
                <Shield size={20} />
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:col-span-7 md:grid-cols-3">
            <div>
              <h4 className="mb-4 font-bold text-[#00204A]">Hỗ trợ nhanh</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>
                  <Link to="/login" className="hover:text-[#C8102E]">
                    Quên mật khẩu?
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#C8102E]">
                    Cấp lại tài khoản
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@thanglong.edu.vn" className="hover:text-[#C8102E]">
                    Báo lỗi hệ thống
                  </a>
                </li>
                <li>
                  <Link to="/announcements" className="hover:text-[#C8102E]">
                    Câu hỏi thường gặp
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2">
              <div className="h-full rounded-2xl bg-blue-50 p-6">
                <h4 className="mb-2 font-bold text-blue-900">Phòng Đào tạo</h4>
                <p className="mb-4 text-sm text-blue-700">
                  Giải đáp thắc mắc về điểm, đăng ký môn và lịch thi.
                </p>
                <p className="font-bold text-blue-900">024 3858 7346 (Phím 1)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-slate-100 pt-8 text-sm text-slate-400 md:flex-row">
          <p>© 2026 Thang Long University. All rights reserved.</p>
          <div className="mt-4 flex gap-6 md:mt-0">
            <a href="#support" className="hover:text-slate-600">
              Điều khoản sử dụng
            </a>
            <a href="#support" className="hover:text-slate-600">
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
