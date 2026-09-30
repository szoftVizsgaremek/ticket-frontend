import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Popover } from "@base-ui/react/popover";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/notifications.api";
import type { Notification } from "@/features/notifications/notifications.types";
import { formatDate } from "@/features/tickets/ticket-labels";
import { cn } from "@/lib/utils";

/**
 * The notification inbox, as a popover on the bell.
 *
 * Reads the same ["notifications"] query key as the rest of the app, so the
 * badge and the list can never disagree, and refetches on the same interval the
 * list used to poll at.
 */
export function NotificationBell() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markRead = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const label =
    unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={label}
            title={label}
          />
        }
      >
        <Bell />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium leading-none text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          sideOffset={8}
          align="end"
          className="z-50"
        >
          <Popover.Popup className="w-[22rem] rounded-xl border bg-popover text-popover-foreground shadow-lg outline-none">
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
              <p className="text-sm font-medium">Notifications</p>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                >
                  {markAllRead.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <CheckCheck />
                  )}
                  Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <p className="flex justify-center py-8 text-muted-foreground">
                  <Loader2 className="animate-spin" />
                </p>
              ) : isError ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Unable to load notifications.
                </p>
              ) : items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nothing to see here yet.
                </p>
              ) : (
                <ul className="divide-y">
                  {items.map((notification) => (
                    <li key={notification.id}>
                      <NotificationItem
                        notification={notification}
                        onRead={() => markRead.mutate(notification.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={onRead}
      disabled={notification.isRead}
      className={cn(
        "w-full px-4 py-3 text-left transition-colors hover:bg-muted/50",
        "disabled:pointer-events-none disabled:opacity-70",
        !notification.isRead && "bg-primary/5"
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          {!notification.isRead && (
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
          {notification.actor?.name ?? "System"}
        </p>

        <p className="shrink-0 text-xs text-muted-foreground">
          {formatDate(notification.createdAt)}
        </p>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {notification.message}
      </p>
    </button>
  );
}
