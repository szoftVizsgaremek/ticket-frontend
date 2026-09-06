import { CheckCircle2, Clock3, Ticket as TicketIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ticket, TicketPriority, TicketStatus } from "@/features/tickets/ticket.types";

const priorityVariant: Record<TicketPriority, "destructive" | "default" | "secondary" | "outline"> = {
  CRITICAL: "destructive",
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
};

const statusLabel: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

interface TicketsPageProps {
  title: string;
  description?: string;
  tickets: Ticket[];
}

function TicketsPage({ title, description, tickets }: TicketsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>All tickets</CardTitle>

          <Badge variant="secondary">{tickets.length} total</Badge>
        </CardHeader>

        <CardContent>
          {tickets.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No tickets to show.
            </p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TicketRowProps {
  ticket: Ticket;
}

function TicketRow({ ticket }: TicketRowProps) {
  const StatusIcon =
    ticket.status === "RESOLVED" || ticket.status === "CLOSED"
      ? CheckCircle2
      : ticket.status === "IN_PROGRESS"
        ? Clock3
        : TicketIcon;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{ticket.title}</p>

          <Badge variant={priorityVariant[ticket.priority]}>
            {ticket.priority}
          </Badge>
        </div>

        <p className="mt-1 truncate text-sm text-muted-foreground">
          {ticket.number} · {ticket.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <StatusIcon className="size-3.5" />
            {statusLabel[ticket.status]}
          </span>

          {ticket.assignee && (
            <span>Assigned to {ticket.assignee.name}</span>
          )}

          <span>Created {ticket.createdAt}</span>
        </div>
      </div>
    </div>
  );
}

export default TicketsPage;