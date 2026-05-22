import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const schoolLogo = "/images/LogoThangLongUniversity.png";

const navItems = [
  { to: "/", label: "Trang chủ" },
  { to: "/about", label: "Giới thiệu" },
  { to: "/programs", label: "Đào tạo" },
  { to: "/admissions", label: "Tuyển sinh" },
  { to: "/articles", label: "Tin tức" },
  { to: "/contact", label: "Liên hệ" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsVisible(currentScrollY <= lastScrollY || currentScrollY <= 120);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky left-0 top-0 z-50 w-full border-b border-black/10 bg-white text-black shadow-sm transition-transform duration-500",
        isVisible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        <Link to="/" className="z-50 flex items-center gap-3" aria-label="Trang chủ Đại học Thăng Long">
          <span className="grid h-20 w-20 place-items-center md:h-24 md:w-24">
            <img src={schoolLogo} alt="Logo Đại học Thăng Long" className="h-full w-full object-contain" />
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-8 text-sm font-semibold md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "transition-colors hover:text-[#C8102E]",
                  isActive ? "text-[#C8102E]" : "text-black",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/login"
            className="border border-[#C8102E] px-4 py-2 text-[#C8102E] transition-colors hover:bg-[#C8102E] hover:text-white"
          >
            Portal
          </Link>
        </nav>

        <button
          className="z-50 text-black md:hidden"
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
        <Link to="/login" className="text-3xl font-bold text-[#C8102E]">
          Portal
        </Link>
      </div>
    </header>
  );
}
