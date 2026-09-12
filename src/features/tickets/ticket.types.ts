export type TicketPriority = "low" | "moderate" | "high" | "critical";

export type TicketStatus = "open" | "in_progress" | "closed";

export type TicketType = "servers" | "computers";

export interface TicketUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  createdBy: number;
  content: string;
  createdAt: string;
  author?: {
    id: number;
    name: string;
    username: string;
  };
}

export interface TicketAttachment {
  id: number;
  ticketId: number;
  uploadedBy: number;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  fileSizeBytes: number;
  mimeType: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  name: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  type: TicketType;
  uploadedBy: number;
  assigneeId: number | null;
  reporter: TicketUser | null;
  assignee: TicketUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetail extends Ticket {
  comments: TicketComment[];
  attachments: TicketAttachment[];
}

export interface CreateTicketInput {
  name: string;
  description?: string;
  priority?: TicketPriority;
  type?: TicketType;
  assigneeId?: number | null;
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority;
  type?: TicketType;
  assigneeId?: number | null;
}