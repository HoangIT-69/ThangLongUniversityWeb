import type { ReactNode } from "react";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="bg-background">{children}</div>;
}
