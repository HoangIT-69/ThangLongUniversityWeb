import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Facebook,
  GraduationCap,
  Instagram,
  Linkedin,
  Menu,
  Play,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
  Youtube,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const schoolLogo = "/images/LogoThangLongUniversity.png";

const navItems = [
  { href: "#about", label: "Giới thiệu" },
  { href: "#programs", label: "Đào tạo" },
  { href: "#student-life", label: "Sinh viên" },
  { href: "#contact", label: "Liên hệ" },
];

const stats = [
  { value: "1988", label: "Năm thành lập" },
  { value: "25+", label: "Ngành đào tạo" },
  { value: "10", label: "Lĩnh vực tuyển sinh" },
  { value: "TLU", label: "Cộng đồng khác biệt" },
];

const programs = [
  "Công nghệ thông tin",
  "Kinh tế - Quản trị",
  "Ngôn ngữ",
  "Truyền thông",
  "Du lịch",
  "Khoa học sức khỏe",
];

const testimonials = [
  {
    name: "Nguyễn Hải Đăng - K33",
    quote:
      "Môi trường học tập cởi mở tại Thăng Long giúp mình tự tin phát huy thế mạnh. Các phòng thực hành và studio truyền cảm hứng rất rõ.",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Trần Bảo Ngọc - K34",
    quote:
      "Thư viện, phòng lab và không gian sinh viên khiến mỗi ngày lên trường đều có cảm giác mình đang được sống trong một cộng đồng sáng tạo.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Lê Hoàng Nam - K31",
    quote:
      "Giảng viên tâm huyết, phong trào sinh viên mạnh và bạn bè đa dạng là bệ phóng rất thực tế cho hành trình nghề nghiệp của mình.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
  },
];

const gallery = [
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1427504494785-319ce51cb2f9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80",
];

const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=85",
    alt: "Không gian đại học hiện đại",
  },
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=85",
    alt: "Sinh viên học tập và làm việc nhóm",
  },
  {
    src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1920&q=85",
    alt: "Cộng đồng sinh viên năng động",
  },
  {
    src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=85",
    alt: "Giảng đường và hoạt động học tập",
  },
];

export function ThangLongLanding() {
  return (
    <div className="min-h-screen scroll-smooth bg-black font-sans text-white selection:bg-[#C8102E] selection:text-white">
      <Hero />
      <ScrollReveal>
        <QuickStats />
      </ScrollReveal>
      <ScrollReveal>
        <Intro />
      </ScrollReveal>
      <ScrollReveal>
        <Programs />
      </ScrollReveal>
      <ScrollReveal>
        <StudentLife />
      </ScrollReveal>
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>
      <ScrollReveal>
        <Gallery />
      </ScrollReveal>
      <ScrollReveal>
        <AdmissionsCta />
      </ScrollReveal>
      <ScrollReveal>
        <Footer />
      </ScrollReveal>
    </div>
  );
}

export default ThangLongLanding;

function ScrollReveal({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`transform-gpu transition-all duration-1000 ease-out ${
        isVisible ? "translate-y-0 opacity-100 blur-0" : "translate-y-12 opacity-0 blur-sm"
      }`}
    >
      {children}
    </div>
  );
}

function Navbar() {
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

  return (
    <nav
      className={`fixed left-0 top-0 z-50 w-full border-b border-black/10 bg-white text-black shadow-sm transition-transform duration-500 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        <a href="#top" className="z-50 flex items-center gap-3">
          <span className="grid h-20 w-20 place-items-center md:h-24 md:w-24">
            <img
              src={schoolLogo}
              alt="Logo Đại học Thăng Long"
              className="h-full w-full object-contain"
            />
          </span>
        </a>

        <div className="hidden items-center gap-10 text-sm font-semibold text-black md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-[#C8102E]">
              {item.label}
            </a>
          ))}
          <Link
            to="/login"
            className="border border-[#C8102E] px-4 py-2 text-[#C8102E] hover:bg-[#C8102E] hover:text-white"
          >
            Portal
          </Link>
        </div>

        <button
          className="z-50 text-black md:hidden"
          type="button"
          aria-label="Mở menu"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black transition-transform duration-500 md:hidden ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className="text-3xl font-bold hover:text-[#C8102E]"
          >
            {item.label}
          </a>
        ))}
        <Link
          to="/login"
          onClick={() => setIsOpen(false)}
          className="text-3xl font-bold text-[#C8102E]"
        >
          Portal
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="top" className="relative h-screen overflow-hidden bg-black">
      {heroImages.map((image, index) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-1000 ease-out ${
            index === activeImage ? "scale-100 opacity-100" : "scale-105 opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
        {heroImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Chuyển ảnh ${index + 1}`}
            onClick={() => setActiveImage(index)}
            className={`h-2.5 rounded-full transition-all duration-500 ${
              index === activeImage ? "w-12 bg-[#C8102E]" : "w-2.5 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-8 right-6 z-10 hidden text-xs font-bold uppercase tracking-[0.35em] text-white/80 md:block">
        Scroll
      </div>
      <h1 className="hidden">Chất riêng</h1>
      <h2 className="hidden">Thăng Long</h2>

      <div className="hidden">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80"
          alt="Không gian đại học hiện đại"
          className="h-full w-full object-cover object-center grayscale transition-all duration-700 hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 hidden items-center gap-3 rounded-full bg-black/55 px-4 py-2 text-sm font-semibold backdrop-blur md:flex">
          <ShieldCheck className="h-4 w-4 text-[#C8102E]" />
          Đại học ngoài công lập đầu tiên tại Việt Nam
        </div>
      </div>

      <div className="hidden">
        <p className="max-w-sm border-l-2 border-[#C8102E] pl-4 text-lg font-medium leading-tight text-[#EBE9E4]">
          Một môi trường học tập cởi mở, nơi cá tính được tôn trọng và năng lực được đánh thức qua
          trải nghiệm thật.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admissions"
            className="bg-[#C8102E] px-8 py-5 font-bold text-white transition-colors hover:bg-white hover:text-black"
          >
            Tuyển sinh 2026
          </Link>
          <a
            href="#about"
            className="border border-white/30 px-8 py-5 font-bold text-white transition-colors hover:bg-white hover:text-black"
          >
            Khám phá TLU
          </a>
        </div>
      </div>
    </section>
  );
}

function QuickStats() {
  return (
    <section className="border-y border-white/10 bg-black px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden bg-white/10 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="bg-black p-6">
            <div className="text-4xl font-black tracking-tight text-[#C8102E] md:text-6xl">
              {item.value}
            </div>
            <div className="mt-2 text-sm font-semibold uppercase tracking-widest text-white/65">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section id="about" className="bg-[#EBE9E4] px-4 py-24 text-black md:px-8 md:py-40">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-12">
        <div className="flex flex-col justify-between md:col-span-5">
          <SectionEyebrow label="Tự hào sinh viên TLU" />
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80"
            alt="Sinh viên cộng tác trong khuôn viên"
            className="mt-14 w-4/5 border-l-4 border-[#C8102E] object-cover grayscale shadow-xl"
          />
        </div>
        <div className="md:col-span-7">
          <h2 className="mb-16 text-[10vw] font-medium leading-[0.9] tracking-tight md:text-[4.6vw]">
            Môi trường học tập cởi mở, tôn trọng sự khác biệt của mỗi cá nhân
          </h2>
          <div className="grid max-w-3xl gap-10 sm:grid-cols-2">
            <p className="text-base font-medium leading-relaxed">
              Thành lập từ năm 1988, Đại học Thăng Long tự hào là trường đại học ngoài công lập đầu
              tiên của Việt Nam, theo đuổi tinh thần khai phóng, thực học và chủ động hội nhập.
            </p>
            <p className="text-base font-medium leading-relaxed">
              TLU đặt người học ở trung tâm: không gian xanh, phòng thực hành, thư viện, câu lạc bộ
              và các hoạt động sinh viên được thiết kế để việc học không chỉ nằm trong lớp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Programs() {
  return (
    <section id="programs" className="relative bg-[#00204A] py-24 text-[#EBE9E4]">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="mb-12 max-w-4xl text-[11vw] font-medium leading-[0.9] tracking-tight md:mb-20 md:text-[6vw]">
          Tìm kiếm đam mê từ đa dạng ngành học
        </h2>
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1920&q=80"
            alt="Sinh viên học tập và thực hành"
            className="h-[62vh] w-full border-x-8 border-[#C8102E] object-cover grayscale"
          />
          <div className="bg-[#C8102E] p-8 text-white shadow-2xl md:absolute md:-bottom-16 md:right-8 md:w-[520px] md:p-12">
            <SectionEyebrow label="Đa dạng ngành học" inverted />
            <p className="mt-8 text-lg font-medium leading-tight">
              Từ Công nghệ thông tin, Kinh tế - Quản trị, Ngôn ngữ, Du lịch, Truyền thông đến Khoa
              học sức khỏe. Chương trình được cập nhật theo nhu cầu doanh nghiệp và năng lực nghề
              nghiệp thật.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-2">
              {programs.map((program) => (
                <div
                  key={program}
                  className="border border-white/30 px-3 py-2 text-sm font-semibold"
                >
                  {program}
                </div>
              ))}
            </div>
            <Link
              to="/programs"
              className="mt-8 inline-flex items-center gap-2 bg-[#00204A] px-8 py-4 font-bold text-[#EBE9E4] hover:bg-white hover:text-black"
            >
              Xem ngành đào tạo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StudentLife() {
  return (
    <section id="student-life" className="bg-black px-4 pb-24 pt-40 text-[#EBE9E4] md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionEyebrow label="Văn hóa TLU" />
        <h2 className="my-16 text-[13vw] font-medium leading-[0.85] tracking-tight text-white md:text-[8vw]">
          Đại học không chỉ có sách vở
        </h2>
        <div className="grid items-end gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="max-w-sm text-lg font-medium leading-relaxed text-white/90">
              Hàng chục câu lạc bộ học thuật, nghệ thuật, âm nhạc, vũ đạo và tình nguyện tạo nên một
              đời sống sinh viên giàu năng lượng. Đây là nơi bạn tìm thấy cộng đồng của mình.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                { icon: Users, label: "Câu lạc bộ và cộng đồng sinh viên" },
                { icon: Sparkles, label: "Sự kiện, workshop, sân khấu sáng tạo" },
                { icon: Trophy, label: "Không gian phát triển cá tính" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 border-t border-white/15 pt-3"
                >
                  <item.icon className="h-5 w-5 text-[#C8102E]" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative md:col-span-8">
            <div className="absolute -left-4 -top-4 h-24 w-24 bg-[#C8102E]" />
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1100&q=80"
              alt="Hoạt động sinh viên"
              className="relative z-10 max-h-[80vh] w-full object-cover grayscale shadow-2xl transition-all duration-700 hover:grayscale-0"
            />
            <button className="absolute bottom-6 left-6 z-20 grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-xl">
              <Play className="ml-1 h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-[#EBE9E4] px-4 py-24 text-black md:px-8 md:py-36">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-16 max-w-4xl text-[10vw] font-medium leading-[0.9] tracking-tight md:text-[5vw]">
          Sự chuyển đổi ngoạn mục trong hành trình tri thức
        </h2>
        <div className="border-y border-black/20">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="grid gap-8 border-t border-black/20 py-10 first:border-t-0 md:grid-cols-12"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest md:col-span-3">
                {testimonial.name}
              </h3>
              <div className="md:col-span-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-32 w-32 border-2 border-black/10 object-cover grayscale shadow-sm"
                />
              </div>
              <p className="flex items-center text-xl font-medium leading-tight text-black/90 md:col-span-6 md:text-2xl">
                “{testimonial.quote}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="overflow-hidden bg-[#00204A] px-4 py-24 text-[#EBE9E4] md:px-8 md:py-36">
      <div className="mx-auto max-w-7xl">
        <SectionEyebrow label="Hoạt động sinh viên" />
        <h2 className="my-16 text-[13vw] font-medium leading-[0.85] tracking-tight text-white md:text-[8vw]">
          Vibe sinh viên TLU
        </h2>
        <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-6 md:auto-rows-[210px]">
          {gallery.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Hoạt động sinh viên ${index + 1}`}
              className={`h-full w-full object-cover grayscale shadow-lg transition-all duration-500 hover:grayscale-0 ${
                index === 0 ? "col-span-2 row-span-2 md:col-span-3" : ""
              } ${index === 4 ? "col-span-2 md:col-span-2" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AdmissionsCta() {
  return (
    <section className="bg-black px-4 py-20 text-white md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 border border-white/15 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
        <div>
          <div className="mb-4 flex items-center gap-3 text-[#C8102E]">
            <GraduationCap className="h-6 w-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Sẵn sàng bắt đầu?</span>
          </div>
          <h2 className="max-w-3xl text-4xl font-medium leading-tight md:text-6xl">
            Chọn một môi trường đủ khác biệt để bạn lớn lên theo cách của mình.
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
          <Link
            to="/admissions"
            className="bg-[#C8102E] px-8 py-4 text-center font-bold hover:bg-white hover:text-black"
          >
            Xem tuyển sinh
          </Link>
          <Link
            to="/login"
            className="border border-white/30 px-8 py-4 text-center font-bold hover:bg-white hover:text-black"
          >
            Vào Portal
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      id="contact"
      className="flex flex-col items-center bg-[#C8102E] px-4 py-16 text-center text-white md:px-8"
    >
      <div className="mb-20 flex w-full flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-sm bg-white p-1">
            <img
              src={schoolLogo}
              alt="Logo Đại học Thăng Long"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-left text-sm font-bold uppercase leading-tight tracking-widest">
            Đại học
            <br />
            Thăng Long
          </span>
        </div>
        <div className="flex gap-4">
          {[Facebook, Youtube, Linkedin, Instagram].map((Icon) => (
            <Icon
              key={Icon.displayName}
              size={20}
              className="cursor-pointer transition-colors hover:text-black"
            />
          ))}
        </div>
      </div>

      <div className="mb-20 flex flex-col gap-6">
        <p className="text-lg font-medium tracking-widest text-white/80">HOTLINE: 024 3858 7346</p>
        <h2 className="mx-auto max-w-4xl text-[8vw] font-medium leading-none tracking-tight md:text-[3.5vw]">
          Đường Nghiêm Xuân Yêm, Đại Kim, Hoàng Mai, Hà Nội
        </h2>
        <p className="text-lg font-medium">info@thanglong.edu.vn</p>
      </div>

      <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-white/30 pt-8 text-sm font-medium md:flex-row">
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/about" className="underline hover:text-black">
            Giới thiệu
          </Link>
          <Link to="/programs" className="underline hover:text-black">
            Đào tạo
          </Link>
          <Link to="/admissions" className="underline hover:text-black">
            Tuyển sinh
          </Link>
        </div>
        <p>© 2026 Bản quyền thuộc về Đại học Thăng Long.</p>
      </div>
    </footer>
  );
}

function SectionEyebrow({ label, inverted = false }: { label: string; inverted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-4 w-4 rounded-sm ${inverted ? "bg-white" : "bg-[#C8102E]"}`} />
      <span
        className={`text-sm font-bold uppercase tracking-widest ${inverted ? "text-white" : "text-[#C8102E]"}`}
      >
        {label}
      </span>
    </div>
  );
}
