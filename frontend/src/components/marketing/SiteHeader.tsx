import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const schoolLogo = "/images/LogoThangLongUniversity.png";

const navItems = [
  { to: "/", label: "Trang chủ" },
  { to: "/articles", label: "Tin tức" },
  { to: "/announcements", label: "Thông báo" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollYRef = useRef(0);
  const isHome = pathname === "/";
  const isTransparent = isHome && !isScrolled && !isOpen;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      setIsVisible(currentScrollY <= 8 || currentScrollY < lastScrollY);
      setIsScrolled(currentScrollY > 20);
      lastScrollYRef.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "left-0 top-0 z-50 w-full transition-all duration-500",
        isHome ? "fixed" : "sticky",
        isTransparent
          ? "border-b border-white/10 bg-transparent text-white shadow-none"
          : "border-b border-black/10 bg-white text-black shadow-sm",
        isVisible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-5 py-4 md:px-10 md:py-5">
        <Link
          to="/"
          className="z-50 flex items-center gap-3"
          aria-label="Trang chủ Đại học Thăng Long"
        >
          <span className="grid h-14 w-56 place-items-center md:h-16 md:w-64">
            <img
              src={schoolLogo}
              alt="Logo Đại học Thăng Long"
              className="h-full w-full object-contain"
            />
          </span>
        </Link>

        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-8 text-base font-semibold md:flex"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "transition-colors hover:text-[#C8102E]",
                  isActive
                    ? isTransparent
                      ? "text-white"
                      : "text-[#C8102E]"
                    : isTransparent
                      ? "text-white/90"
                      : "text-black",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/login"
            className="flex items-center gap-4 rounded-full border border-[#C8102E] bg-[#C8102E] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#a50d25] hover:shadow-lg"
          >
            Đăng nhập hệ thống
            <ChevronRight size={18} />
          </Link>
        </nav>

        <button
          className={cn("z-50 md:hidden", isTransparent ? "text-white" : "text-black")}
          type="button"
          aria-label={isOpen ? "Đóng menu" : "Mở menu"}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black text-white transition-transform duration-500 md:hidden",
          isOpen ? "translate-y-0" : "-translate-y-full",
        )}
      >
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className="text-3xl font-bold hover:text-[#C8102E]">
            {item.label}
          </Link>
        ))}
        <Link
          to="/login"
          className="rounded-full bg-white px-7 py-3 text-3xl font-bold text-[#C8102E]"
        >
          Đăng nhập hệ thống
        </Link>
      </div>
    </header>
  );
}
