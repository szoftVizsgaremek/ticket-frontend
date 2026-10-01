import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAuth } from "@/features/auth/useAuth";
import { ROLE_LABELS } from "@/features/auth/auth.types";
// TODO: assumption. fetchTickets returns the ticket list (every ticket the
// user may see). Point it at your real API function.
import { fetchTickets } from "@/features/tickets/tickets.api";
import {
  formatDate,
  priorityLabel,
  priorityVariant,
  statusLabel,
} from "@/features/tickets/ticket-labels";

function ProfilePage() {
  const { user } = useAuth();

  // The page is only reachable when logged in, but `user` is still typed as
  // nullable, so guard once here and let everything below assume it exists.
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

      <AccountCard />
      <MyTicketsCard userId={user.id} />
    </div>
  );
}

/**
 * Read-only account details.
 *
 * Name, username and role are display-only on purpose: role changes belong to
 * an admin (PERMISSIONS), and renaming usernames is a user-management concern.
 */
function AccountCard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
        <Field label="Name" value={user.name} />
        <Field label="Username" value={user.username} />
        <Field label="Role" value={ROLE_LABELS[user.role]} />
      </CardContent>
    </Card>
  );
}

// Small label/value pair, reused so the three account fields line up.
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

/**
 * The user's tickets, split into "Reported by me" and "Assigned to me".
 *
 * These use the same two ownership checks as `canManage` on the ticket detail
 * page (uploadedBy / assigneeId), so the profile and the detail page agree on
 * what "mine" means.
 *
 * Filtering is done client-side because it is the least work. If the ticket
 * list gets large, swap fetchTickets for a server-side filter
 * (e.g. ?assigneeId=...) and drop the useMemo below.
 */
function MyTicketsCard({ userId }: { userId: number }) {
  const [tab, setTab] = useState<"reported" | "assigned">("reported");

  const { data: tickets, isLoading, isError } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets,
  });

  // Computed once per data/tab change instead of on every render.
  const visible = useMemo(() => {
    const list = tickets ?? [];
    return list.filter((t) =>
      tab === "reported" ? t.uploadedBy === userId : t.assigneeId === userId
    );
  }, [tickets, tab, userId]);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle>My tickets</CardTitle>

        {/* Plain buttons as tabs: no extra dependency, and the active one
            gets the filled variant so the state is obvious. */}
        <div className="flex gap-2">
          <Button
            size="xs"
            variant={tab === "reported" ? "default" : "outline"}
            onClick={() => setTab("reported")}
          >
            Reported by me
          </Button>
          <Button
            size="xs"
            variant={tab === "assigned" ? "default" : "outline"}
            onClick={() => setTab("assigned")}
          >
            Assigned to me
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading tickets...</p>
        ) : isError ? (
          <p className="text-sm text-destructive">Unable to load tickets.</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {tab === "reported"
              ? "You have not reported any tickets."
              : "No tickets are assigned to you."}
          </p>
        ) : (
          <ul className="space-y-2">
            {visible.map((t) => (
              <li key={t.id}>
                {/* The whole row is the link, so the click target is large. */}
                <Link
                  to={`/tickets/${t.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(t.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={priorityVariant[t.priority]}>
                      {priorityLabel[t.priority]}
                    </Badge>
                    <Badge variant="outline">{statusLabel[t.status]}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default ProfilePage;