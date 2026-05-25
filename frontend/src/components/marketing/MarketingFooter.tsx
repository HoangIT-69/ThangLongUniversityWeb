import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useLanding } from "@/lib/landing-content";

const schoolLogo = "/images/LogoThangLongUniversity.png";

export function MarketingFooter() {
  const { content } = useLanding();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-[#00204A] text-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <img
                src={schoolLogo}
                alt="Logo Đại học Thăng Long"
                className="h-12 w-auto rounded-lg  px-2 py-1 shadow-sm"
              />
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              Trường đại học ngoài công lập đầu tiên của Việt Nam, thành lập năm 1988.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/50">
              Liên hệ
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <span>{content.contactAddress}</span>
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <span>{content.contactPhone}</span>
              </li>
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <span>{content.contactEmail}</span>
              </li>
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
              <li>
                <Link to="/login" className="text-white/70 transition hover:text-white">
                  Đăng nhập hệ thống
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
