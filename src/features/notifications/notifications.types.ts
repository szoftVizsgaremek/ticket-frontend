export const NOTIFICATION_TYPES = {
  USER_CREATED: "user_created",
  TICKET_ASSIGNED: "ticket_assigned",
  TICKET_STATUS_CHANGED: "ticket_status_changed",
  COMMENT_ADDED: "comment_added",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface NotificationActor {
  id: number;
  name: string;
  username: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  actor: NotificationActor | null;
}

export interface NotificationFeed {
  items: Notification[];
  unreadCount: number;
}
