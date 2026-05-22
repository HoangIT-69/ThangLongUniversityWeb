import { createFileRoute } from "@tanstack/react-router";
import ThangLongLanding from "@/features/landing/ThangLongLanding";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/")({
  component: ThangLongLanding,
  head: () => ({
    meta: [
      { title: "Đại học Thăng Long - Chất riêng Thăng Long" },
      {
        name: "description",
        content:
          "Landing page Đại học Thăng Long: môi trường học tập cởi mở, cơ sở vật chất hiện đại, đa dạng ngành đào tạo và đời sống sinh viên giàu năng lượng.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
  }),
});
