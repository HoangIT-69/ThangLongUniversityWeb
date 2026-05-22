import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, ChevronRight, Loader2, Megaphone, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  listStudentNotifications,
  markAllStudentNotificationsRead,
  markStudentNotificationRead,
  type StudentNotification,
} from "@/lib/api/notifications";

export const Route = createFileRoute("/student/notifications")({ component: NotificationsPage });

function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  const diff = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "Vua xong";
  if (minutes < 60) return `${minutes} phut truoc`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} gio truoc`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngay truoc`;

  return date.toLocaleDateString("vi-VN");
}

function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["student", "notifications"],
    queryFn: listStudentNotifications,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: markStudentNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student", "notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllStudentNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student", "notifications"] }),
  });

  const items = notificationsQuery.data ?? [];

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = async () => {
    await markAllReadMutation.mutateAsync();
  };

  const openNotification = async (notif: StudentNotification) => {
    if (!notif.read) {
      await markReadMutation.mutateAsync(notif.id);
    }

    if (notif.type === "CHAT") {
      navigate({ to: "/student/chat" });
      return;
    }

    if (notif.link) {
      // TODO: When the SEO landing page exposes real public school notices,
      // SCHOOL notification links should point to that landing-page notice detail.
      window.location.href = notif.link;
    }
  };

  const isBusy = notificationsQuery.isLoading || markAllReadMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Thong bao"
        description={unreadCount > 0 ? `${unreadCount} thong bao chua doc` : "Tat ca thong bao da doc"}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead} disabled={markAllReadMutation.isPending}>
              {markAllReadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Danh dau tat ca da doc
            </Button>
          ) : undefined
        }
      />

      {notificationsQuery.isError && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(notificationsQuery.error as Error).message}
        </div>
      )}

      {isBusy && items.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border bg-card py-14 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Dang tai thong bao...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Khong co thong bao nao.</p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card shadow-sm">
          {items.map((notif) => {
            const isChat = notif.type === "CHAT";
            const Icon = isChat ? MessageCircle : Megaphone;

            return (
              <button
                key={notif.id}
                type="button"
                className={cn(
                  "flex w-full items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/40",
                  !notif.read && "bg-primary/5",
                )}
                onClick={() => void openNotification(notif)}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    isChat ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30" : "bg-red-50 text-red-600 dark:bg-red-950/30",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={cn("truncate text-sm", !notif.read ? "font-semibold" : "font-medium")}>
                        {notif.title}
                      </span>
                      {!notif.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(notif.createdAt)}</span>
                  </span>

                  {notif.body && <span className="mt-1 block line-clamp-2 text-sm text-muted-foreground">{notif.body}</span>}

                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    {isChat ? "Mo chat" : "Xem chi tiet"}
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
