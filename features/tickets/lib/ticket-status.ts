import {
  formatDateTime as formatFull,
  formatShortDateTime as formatShort,
} from "@/lib/format-date";
import { EVIDENCE_STATUSES } from "../schemas/ticket";
import type { TicketAction, TicketRecord, TicketStatus } from "../types";

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  acknowledged: "Acknowledged",
  in_progress: "In progress",
  resolve_requested: "Awaiting approval",
  resolved: "Resolved",
  false_alarm: "False alarm",
};

export const STATUS_VARIANT = {
  open: "destructive",
  acknowledged: "secondary",
  in_progress: "secondary",
  resolve_requested: "default",
  resolved: "outline",
  false_alarm: "outline",
} as const satisfies Record<TicketStatus, string>;

const EVENT_LABEL: Record<string, string> = {
  created: "Ticket created",
  assigned: "Assigned",
  reassigned: "Reassigned",
  escalated: "Escalated to a supervisor",
  acknowledged: "Acknowledged",
  started: "Work started",
  resolution_requested: "Resolution requested",
  approved: "Resolution approved",
  rejected: "Resolution rejected",
  link_requested: "Link sent again",
};

export const eventLabel = (type: string) =>
  EVENT_LABEL[type] ??
  type.replace(/_/g, " ").replace(/^\w/, (char) => char.toUpperCase());

export const isFinal = (status: TicketStatus) =>
  status === "resolved" || status === "false_alarm";

export const canAddEvidence = (status: TicketStatus) =>
  (EVIDENCE_STATUSES as readonly TicketStatus[]).includes(status);

export const availableActions = (
  ticket: Pick<TicketRecord, "status" | "assigneeId">,
  userId: string | null,
): TicketAction[] => {
  const isAssignee = userId !== null && ticket.assigneeId === userId;
  switch (ticket.status) {
    case "open":
      return isAssignee ? ["acknowledge"] : [];
    case "acknowledged":
      return isAssignee ? ["start", "request-resolution"] : [];
    case "in_progress":
      return isAssignee ? ["request-resolution"] : [];
    case "resolve_requested":
      return ["approve", "reject"];
    default:
      return [];
  }
};

export const formatDateTime = (iso: string) => formatFull(iso);

export const formatShortDateTime = (iso: string) => formatShort(iso);
