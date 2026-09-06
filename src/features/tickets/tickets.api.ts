import { apiFetch } from "@/lib/api-client";
import type { CreateTicketInput, Ticket } from "./ticket.types";

export async function fetchTickets(): Promise<Ticket[]> {
  return apiFetch<Ticket[]>("/api/tickets");
}

export async function fetchMyTickets(): Promise<Ticket[]> {
  return apiFetch<Ticket[]>("/api/tickets/mine");
}

export async function createTicket(
  input: CreateTicketInput
): Promise<Ticket> {
  return apiFetch<Ticket>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
