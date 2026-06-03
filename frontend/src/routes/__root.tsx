import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Đại học Thăng Long — Cổng thông tin" },
      { name: "description", content: "Hệ thống quản lý Trường Đại học Thăng Long." },
      { property: "og:title", content: "Đại học Thăng Long — Cổng thông tin" },
      { name: "twitter:title", content: "Đại học Thăng Long — Cổng thông tin" },
      { property: "og:description", content: "Hệ thống quản lý Trường Đại học Thăng Long." },
      { name: "twitter:description", content: "Hệ thống quản lý Trường Đại học Thăng Long." },
      { property: "og:image", content: "/images/LogoThangLongUniversity.png" },
      { property: "og:site_name", content: "Đại học Thăng Long" },
      { name: "twitter:image", content: "/images/LogoThangLongUniversity.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#C8102E" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/images/LogoThangLongUniversity.png" },
      { rel: "shortcut icon", type: "image/png", href: "/images/LogoThangLongUniversity.png" },
      { rel: "apple-touch-icon", href: "/images/LogoThangLongUniversity.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://images.unsplash.com" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-2 text-muted-foreground">Trang không tồn tại.</p>
        <a
          href="/"
          className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PublicShell />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function PublicShell() {
  return (
    <>
      <Outlet />
    </>
  );
}
