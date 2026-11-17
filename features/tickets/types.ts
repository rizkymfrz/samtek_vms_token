import type { z } from "zod";
import type {
  TICKET_ACTIONS,
  TICKET_STATUSES,
  ticketDetailSchema,
  ticketEvidenceSchema,
  ticketRuleSchema,
  ticketSchema,
} from "./schemas/ticket";

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketAction = (typeof TICKET_ACTIONS)[number];
export type TicketRecord = z.output<typeof ticketSchema>;
export type TicketDetail = z.output<typeof ticketDetailSchema>;
export type TicketEvidence = z.output<typeof ticketEvidenceSchema>;
export type TicketRule = z.output<typeof ticketRuleSchema>;

export type TicketFilters = {
  status: TicketStatus | null;
  edgeServerId: string | null;
  assigneeId: string | null;
  page: number;
};

export type TicketPage = { items: TicketRecord[]; total: number };
export type RulePage = { items: TicketRule[]; total: number };
export type ActionBody = { type?: string; note?: string };
