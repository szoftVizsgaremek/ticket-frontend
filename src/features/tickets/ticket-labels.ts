import { Cpu, Laptop, Thermometer } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { TicketPriority, TicketStatus, TicketType } from "./ticket.types";

export const priorityLabel: Record<TicketPriority, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
};

export const priorityVariant: Record<
  TicketPriority,
  "destructive" | "default" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "default",
  moderate: "secondary",
  low: "outline",
};

export const statusLabel: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed",
};

export const typeLabel: Record<TicketType, string> = {
  thermal: "Thermal",
  software: "Software",
  hardware: "Hardware",
};

export const typeIcon: Record<TicketType, LucideIcon> = {
  thermal: Thermometer,
  software: Laptop,
  hardware: Cpu,
};

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}