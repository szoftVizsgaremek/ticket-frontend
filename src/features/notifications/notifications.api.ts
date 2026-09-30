import { apiFetch } from "@/lib/api-client";
import type { Notification, NotificationFeed } from "./notifications.types";

export async function fetchNotifications(): Promise<NotificationFeed> {
  return apiFetch<NotificationFeed>("/api/notifications");
}

export async function markNotificationRead(id: number): Promise<Notification> {
  return apiFetch<Notification>(`/api/notifications/${id}/read`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead(): Promise<{
  ok: boolean;
  unreadCount: number;
}> {
  return apiFetch<{ ok: boolean; unreadCount: number }>(
    "/api/notifications/read-all",
    { method: "POST" }
  );
}
