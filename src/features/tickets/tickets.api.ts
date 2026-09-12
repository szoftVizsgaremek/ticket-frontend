import { ApiError, apiFetch, API_BASE_URL } from "@/lib/api-client";
import type {
  CreateTicketInput,
  Ticket,
  TicketAttachment,
  TicketComment,
  TicketDetail,
  UpdateTicketInput,
} from "./ticket.types";

export async function fetchTickets(): Promise<Ticket[]> {
  return apiFetch<Ticket[]>("/api/tickets");
}

export async function fetchMyTickets(): Promise<Ticket[]> {
  return apiFetch<Ticket[]>("/api/tickets/mine");
}

export async function fetchTicket(id: number): Promise<TicketDetail> {
  return apiFetch<TicketDetail>(`/api/tickets/${id}`);
}

export async function createTicket(
  input: CreateTicketInput
): Promise<Ticket> {
  return apiFetch<Ticket>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTicket(
  id: number,
  input: UpdateTicketInput
): Promise<Ticket> {
  return apiFetch<Ticket>(`/api/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function addComment(
  ticketId: number,
  content: string
): Promise<TicketComment> {
  return apiFetch<TicketComment>(`/api/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function uploadAttachment(
  ticketId: number,
  file: File
): Promise<TicketAttachment> {
  const formData = new FormData();
  formData.append("attachment", file);

  const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/attachments`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    let message = `Upload failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) {
        message = body.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<TicketAttachment>;
}