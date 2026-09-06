import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Ticket,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchTickets } from "@/features/tickets/tickets.api";
import { useAuth } from "@/features/auth/useAuth";

function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const { data: tickets, isLoading: isTicketsLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets,
  });

  if (isAuthLoading || isTicketsLoading) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  const stats = {
    open: tickets?.filter((t) => t.status === "OPEN").length ?? 0,
    inProgress:
      tickets?.filter((t) => t.status === "IN_PROGRESS").length ?? 0,
    critical:
      tickets?.filter((t) => t.priority === "CRITICAL").length ?? 0,
    resolved:
      tickets?.filter(
        (t) => t.status === "RESOLVED" || t.status === "CLOSED"
      ).length ?? 0,
  };

  const criticalTickets =
    tickets?.filter((t) => t.priority === "CRITICAL").slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <div className="mt-2 flex items-center gap-2">
          <p className="text-muted-foreground">
            Welcome back, {user?.name ?? "there"}
          </p>

          {user && <Badge variant="secondary">{user.role}</Badge>}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Open tickets"
          value={String(stats.open)}
          description="Currently open"
          icon={<Ticket className="h-4 w-4" />}
        />

        <DashboardCard
          title="In progress"
          value={String(stats.inProgress)}
          description="Being worked on"
          icon={<Clock3 className="h-4 w-4" />}
        />

        <DashboardCard
          title="Critical"
          value={String(stats.critical)}
          description="Require immediate attention"
          icon={<AlertTriangle className="h-4 w-4" />}
          variant="danger"
        />

        <DashboardCard
          title="Resolved"
          value={String(stats.resolved)}
          description="This month"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      {/* Critical tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Critical tickets</CardTitle>
        </CardHeader>

        <CardContent>
          {criticalTickets.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              No critical tickets.
            </p>
          ) : (
            <div className="space-y-4">
              {criticalTickets.map((ticket) => (
                <DashboardTicketItem
                  key={ticket.id}
                  title={ticket.title}
                  ticketNumber={ticket.number}
                  priority={ticket.priority}
                />
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
  variant?: "default" | "danger";
}

function DashboardCard({
  title,
  value,
  description,
  icon,
  variant = "default",
}: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>

        <div
          className={
            variant === "danger" ? "text-destructive" : "text-muted-foreground"
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
  );
}

interface DashboardTicketItemProps {
  title: string;
  ticketNumber: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

function DashboardTicketItem({
  title,
  ticketNumber,
  priority,
}: DashboardTicketItemProps) {
  const priorityVariant: Record<
    "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    "destructive" | "default" | "secondary" | "outline"
  > = {
    CRITICAL: "destructive",
    HIGH: "default",
    MEDIUM: "secondary",
    LOW: "outline",
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>

        <p className="text-sm text-muted-foreground">{ticketNumber}</p>
      </div>

      <Badge variant={priorityVariant[priority]}>{priority}</Badge>
    </div>
  );
}

export default Dashboard;