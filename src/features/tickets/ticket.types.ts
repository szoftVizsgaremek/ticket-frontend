export type TicketPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export interface TicketUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Ticket {
  id: number;
  number: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  reporterId: number;
  assigneeId: number | null;
  reporter: TicketUser | null;
  assignee: TicketUser | null;
  createdAt: string;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority?: TicketPriority;
  assigneeId?: number | null;
}
