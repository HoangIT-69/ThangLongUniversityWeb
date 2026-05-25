import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import { LandingContentProvider } from "@/lib/landing-content";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Thang Long University — Portal" },
      { name: "description", content: "Hệ thống quản lý Trường Đại học Thăng Long." },
      { property: "og:title", content: "Thang Long University — Portal" },
      { name: "twitter:title", content: "Thang Long University — Portal" },
      { property: "og:description", content: "Hệ thống quản lý Trường Đại học Thăng Long." },
      { name: "twitter:description", content: "Hệ thống quản lý Trường Đại học Thăng Long." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4685982b-36cb-4bb8-88d8-2fbd1cab1da5/id-preview-64102f14--71421b7c-9016-4391-b6d1-476667aef3e6.lovable.app-1779018363785.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4685982b-36cb-4bb8-88d8-2fbd1cab1da5/id-preview-64102f14--71421b7c-9016-4391-b6d1-476667aef3e6.lovable.app-1779018363785.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-2 text-muted-foreground">Trang không tồn tại.</p>
        <a href="/" className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Về trang chủ</a>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head><HeadContent /></head>
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
        <LandingContentProvider>
          <PublicShell />
          <Toaster position="top-right" richColors />
        </LandingContentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function PublicShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const shouldHideHeader =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/teacher") ||
    pathname === "/login" ||
    pathname.endsWith(".xml");

  return (
    <>
      {!shouldHideHeader && <SiteHeader />}
      <Outlet />
    </>
  );
}
