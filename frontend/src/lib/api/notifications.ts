import { apiRequest } from "./client";

export type NotificationType = "SCHOOL" | "CHAT";

export interface StudentNotification {
  id: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

export function listNotifications() {
  return apiRequest<StudentNotification[]>("/api/student/notifications");
}

export function markNotificationRead(id: string) {
  return apiRequest<void>(`/api/student/notifications/${encodeURIComponent(id)}/read`, { method: "POST" });
}

export function markAllNotificationsRead() {
  return apiRequest<void>("/api/student/notifications/read-all", { method: "POST" });
}
