import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notifications as initialNotifications } from "@/data/mock";
import { Bell, Info, AlertTriangle, CheckCircle2, XCircle, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/student/notifications")({ component: NotificationsPage });

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

const typeConfig = {
  INFO: { icon: Info, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  WARNING: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  SUCCESS: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
  ERROR: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

function NotificationsPage() {
  const [items, setItems] = useState(initialNotifications);
  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div>
      <PageHeader
        title="Thông báo"
        description={unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Tất cả thông báo đã đọc"}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Không có thông báo nào.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm divide-y">
          {items.map((notif) => {
            const { icon: Icon, color, bg } = typeConfig[notif.type];
            return (
              <div
                key={notif.id}
                className={cn(
                  "flex cursor-pointer items-start gap-4 px-4 py-4 transition-colors hover:bg-muted/30",
                  !notif.read && "bg-primary/5",
                )}
                onClick={() => markRead(notif.id)}
              >
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", bg)}>
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm", !notif.read ? "font-semibold" : "font-medium")}>
                        {notif.title}
                      </span>
                      {!notif.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(notif.at)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{notif.body}</p>
                  {notif.link && (
                    <a
                      href={notif.link}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Xem chi tiết <ChevronRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
