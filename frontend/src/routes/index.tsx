import { createFileRoute } from "@tanstack/react-router";
import ThangLongLanding from "@/features/landing/ThangLongLanding";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/")({
  component: ThangLongLanding,
  head: () => ({
    meta: [
      { title: "Đại học Thăng Long - Tin tức & Thông báo" },
      {
        name: "description",
        content: "Trang tin tức và thông báo của Cổng thông tin sinh viên Đại học Thăng Long.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
  }),
});
