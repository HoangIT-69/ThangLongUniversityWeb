import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { useLanding } from "@/lib/landing-content";
import { MapPin, Phone, Mail } from "lucide-react";

const SITE = "https://academe-view-pro.lovable.app";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Liên hệ — Đại học Thăng Long" },
      { name: "description", content: "Địa chỉ, điện thoại, email và bản đồ đường đi Trường Đại học Thăng Long, Hoàng Mai, Hà Nội." },
      { property: "og:title", content: "Liên hệ TLU" },
      { property: "og:description", content: "Thông tin liên hệ chính thức Trường Đại học Thăng Long." },
      { property: "og:url", content: `${SITE}/contact` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/contact` }],
  }),
});

function ContactPage() {
  const { content } = useLanding();
  return (
    <MarketingLayout>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight">Liên hệ</h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          { i: MapPin, t: "Địa chỉ", v: content.contactAddress },
          { i: Phone, t: "Điện thoại", v: content.contactPhone },
          { i: Mail, t: "Email", v: content.contactEmail },
        ].map((c) => (
          <div key={c.t} className="rounded-xl border bg-card p-6">
            <c.i className="h-6 w-6 text-primary" />
            <div className="mt-3 text-sm font-semibold">{c.t}</div>
            <div className="mt-1 text-sm text-muted-foreground">{c.v}</div>
          </div>
        ))}
      </section>
    </MarketingLayout>
  );
}
