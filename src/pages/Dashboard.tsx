import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Search,
  Ticket as TicketIcon,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchTickets } from "@/features/tickets/tickets.api";
import type { Ticket } from "@/features/tickets/ticket.types";
import { useAuth } from "@/features/auth/useAuth";
import { ROLE_LABELS } from "@/features/auth/auth.types";
import {
  formatDate,
  priorityLabel,
  priorityVariant,
  statusLabel,
  typeIcon,
  typeLabel,
} from "@/features/tickets/ticket-labels";
import { cn } from "@/lib/utils";

// The stat cards double as filters, so each one names the slice of the list it
// narrows the tickets down to.
type TicketFilter = "open" | "in_progress" | "critical" | "closed";

const FILTERS: Record<
  TicketFilter,
  { title: string; description: string; icon: ReactNode; variant: "default" | "danger" }
> = {
  open: {
    title: "Open tickets",
    description: "Currently open",
    icon: <TicketIcon className="h-4 w-4" />,
    variant: "default",
  },
  in_progress: {
    title: "In progress",
    description: "Being worked on",
    icon: <Clock3 className="h-4 w-4" />,
    variant: "default",
  },
  critical: {
    title: "Critical",
    description: "Require immediate attention",
    icon: <AlertTriangle className="h-4 w-4" />,
    variant: "danger",
  },
  closed: {
    title: "Closed",
    description: "Successfully closed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    variant: "default",
  },
};

function matchesFilter(ticket: Ticket, filter: TicketFilter): boolean {
  return filter === "critical"
    ? ticket.priority === "critical"
    : ticket.status === filter;
}

// Search covers the fields a person would actually recall a ticket by: what it
// is called, what went wrong, and who reported or owns it.
function matchesSearch(ticket: Ticket, term: string): boolean {
  if (!term) return true;

  const needle = term.toLowerCase();

  return [
    ticket.name,
    ticket.description,
    ticket.type,
    ticket.status,
    ticket.priority,
    ticket.reporter?.name,
    ticket.reporter?.username,
    ticket.assignee?.name,
    ticket.assignee?.username,
  ].some((field) => field?.toLowerCase().includes(needle));
}

function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [filter, setFilter] = useState<TicketFilter | null>(null);
  const [search, setSearch] = useState("");

  const { data: tickets, isLoading: isTicketsLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets,
  });

  const allTickets = useMemo(() => tickets ?? [], [tickets]);

  const counts = useMemo(
    () => ({
      open: allTickets.filter((t) => t.status === "open").length,
      in_progress: allTickets.filter((t) => t.status === "in_progress").length,
      critical: allTickets.filter((t) => t.priority === "critical").length,
      closed: allTickets.filter((t) => t.status === "closed").length,
    }),
    [allTickets]
  );

  // The search box and the stat-card filter are independent: typing narrows the
  // list, clicking a card narrows it again, and both apply at once.
  const visibleTickets = useMemo(
    () =>
      allTickets.filter(
        (ticket) =>
          (!filter || matchesFilter(ticket, filter)) &&
          matchesSearch(ticket, search.trim())
      ),
    [allTickets, filter, search]
  );

  if (isAuthLoading || isTicketsLoading) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  // Clicking the active card clears the filter again, so the cards behave as
  // toggles rather than as a one-way trip.
  function toggleFilter(next: TicketFilter) {
    setFilter((current) => (current === next ? null : next));
  }

  const activeFilterLabel = filter ? FILTERS[filter].title : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <div className="mt-2 flex items-center gap-2">
          <p className="text-muted-foreground">
            Welcome back, {user?.name ?? "there"}
          </p>

          {user && (
            <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
          )}
        </div>
      </div>

      {/* Statistics — each card filters the list below it */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(FILTERS) as TicketFilter[]).map((key) => (
          <DashboardCard
            key={key}
            title={FILTERS[key].title}
            value={String(counts[key])}
            description={FILTERS[key].description}
            icon={FILTERS[key].icon}
            variant={FILTERS[key].variant}
            active={filter === key}
            onClick={() => toggleFilter(key)}
          />
        ))}
      </div>

      {/* Search + filtered list */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle>
            {activeFilterLabel ?? "All tickets"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {visibleTickets.length} of {allTickets.length}
            </span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets..."
                aria-label="Search tickets"
                className="pl-8"
              />
            </div>

            {(filter || search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilter(null);
                  setSearch("");
                }}
              >
                <X />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {visibleTickets.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              {allTickets.length === 0
                ? "No tickets yet."
                : "No tickets match this filter."}
            </p>
          ) : (
            <div className="space-y-3">
              {visibleTickets.map((ticket) => (
                <DashboardTicketItem key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  variant: "default" | "danger";
  active: boolean;
  onClick: () => void;
}

function DashboardCard({
  title,
  value,
  description,
  icon,
  variant = "default",
  active,
  onClick,
}: DashboardCardProps) {
  return (
    // The card is the filter control, so it is a real button: focusable, and it
    // announces its pressed state instead of only looking selected.
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="block w-full rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card
        size="sm"
        className={cn(
          "transition-colors hover:bg-muted/50",
          active && "bg-muted ring-2 ring-foreground/40"
        )}
      >
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>

          <div
            className={
              variant === "danger"
                ? "text-destructive"
                : "text-muted-foreground"
            }
          >
            {icon}
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">{value}</div>

          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </button>
  );
}

interface DashboardTicketItemProps {
  ticket: Ticket;
}

function DashboardTicketItem({ ticket }: DashboardTicketItemProps) {
  const TypeIcon = typeIcon[ticket.type];

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{ticket.name}</p>

          <Badge variant={priorityVariant[ticket.priority]}>
            {priorityLabel[ticket.priority]}
          </Badge>
        </div>

        <p className="mt-1 truncate text-sm text-muted-foreground">
          {ticket.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{statusLabel[ticket.status]}</span>

          <span className="inline-flex items-center gap-1">
            <TypeIcon className="size-3.5" />
            {typeLabel[ticket.type]}
          </span>

          {ticket.assignee && <span>Assigned to {ticket.assignee.name}</span>}

          <span>Created {formatDate(ticket.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export default Dashboard;
