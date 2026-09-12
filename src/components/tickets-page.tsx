import { CheckCircle2, Clock3, Monitor, Server, Ticket as TicketIcon } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ticket } from "@/features/tickets/ticket.types";
import {
  formatDate,
  priorityLabel,
  priorityVariant,
  statusLabel,
  typeLabel,
} from "@/features/tickets/ticket-labels";

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
  const TypeIcon = ticket.type === "servers" ? Server : Monitor;

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
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
          <span className="inline-flex items-center gap-1">
            {ticket.status === "closed" ? (
              <CheckCircle2 className="size-3.5" />
            ) : ticket.status === "in_progress" ? (
              <Clock3 className="size-3.5" />
            ) : (
              <TicketIcon className="size-3.5" />
            )}
            {statusLabel[ticket.status]}
          </span>

          <span className="inline-flex items-center gap-1">
            <TypeIcon className="size-3.5" />
            {typeLabel[ticket.type]}
          </span>

          {ticket.assignee && (
            <span>Assigned to {ticket.assignee.name}</span>
          )}

          <span>Created {formatDate(ticket.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export default TicketsPage;