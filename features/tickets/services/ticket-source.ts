import { isLiveSource } from "@/config/env";
import { CentralError } from "@/lib/api/central-client";
import { callCentral } from "@/lib/api/central-proxy";
import {
  mockAddEvidence,
  MockConflictError,
  mockGetTicket,
  mockListRules,
  mockListTickets,
  mockRunAction,
  mockSetRule,
  MockUnprocessableError,
} from "./build-tickets";
import {
  linkDeliveryResponseSchema,
  ticketDetailResponseSchema,
  ticketEvidenceResponseSchema,
  ticketListSchema,
  ticketResponseSchema,
  ticketRuleListSchema,
  ticketRuleResponseSchema,
} from "../schemas/ticket";
import type {
  ActionBody,
  RulePage,
  TicketAction,
  TicketDetail,
  TicketEvidence,
  TicketFilters,
  TicketPage,
  TicketRecord,
  TicketRule,
} from "../types";

export const PAGE_SIZE = 20;

export const notFound = () =>
  new CentralError("Ticket not found", 404, "NOT_FOUND");

const query = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  return search.toString();
};

export const listTickets = async (
  filters: TicketFilters,
): Promise<TicketPage> => {
  if (!isLiveSource) return mockListTickets(filters, PAGE_SIZE);
  const data = await callCentral(
    "get",
    `/v1/tickets?${query({
      status: filters.status ?? undefined,
      edgeServerId: filters.edgeServerId ?? undefined,
      assigneeId: filters.assigneeId ?? undefined,
      page: filters.page,
      pageSize: PAGE_SIZE,
    })}`,
  );
  const body = ticketListSchema.parse(data);
  return { items: body.data, total: body.meta.total };
};

export const getTicket = async (id: string): Promise<TicketDetail> => {
  if (!isLiveSource) {
    const ticket = mockGetTicket(id);
    if (!ticket) throw notFound();
    return structuredClone(ticket);
  }
  return ticketDetailResponseSchema.parse(
    await callCentral("get", `/v1/tickets/${id}`),
  ).data;
};

export const fromMock = (error: unknown) => {
  if (error instanceof MockConflictError) {
    return new CentralError(error.message, 409, "TICKET_STATE_CONFLICT");
  }
  if (error instanceof MockUnprocessableError) {
    return new CentralError(error.message, 422, error.code);
  }
  return error;
};

export const runTicketAction = async (
  id: string,
  action: TicketAction,
  body: ActionBody,
): Promise<TicketRecord> => {
  if (!isLiveSource) {
    try {
      const ticket = mockRunAction(id, action, body);
      if (!ticket) throw notFound();
      return ticket;
    } catch (error) {
      throw fromMock(error);
    }
  }
  return ticketResponseSchema.parse(
    await callCentral("post", `/v1/tickets/${id}/${action}`, body),
  ).data;
};

export const addTicketEvidence = async (
  id: string,
  file: File,
): Promise<TicketEvidence> => {
  if (!isLiveSource) {
    try {
      const evidence = mockAddEvidence(id);
      if (!evidence) throw notFound();
      return evidence;
    } catch (error) {
      throw fromMock(error);
    }
  }
  const form = new FormData();
  form.append("file", file, file.name);
  return ticketEvidenceResponseSchema.parse(
    await callCentral("post", `/v1/tickets/${id}/evidence`, form),
  ).data;
};

export const requestTicketLink = async (id: string) => {
  if (!isLiveSource) {
    const ticket = mockGetTicket(id);
    if (!ticket) throw notFound();
    if (!ticket.assigneeId) {
      throw new CentralError(
        "The ticket has no assignee",
        409,
        "TICKET_UNASSIGNED",
      );
    }
    return { id: "1", ticketId: id, status: "pending" };
  }
  return linkDeliveryResponseSchema.parse(
    await callCentral("post", `/v1/tickets/${id}/link-deliveries`),
  ).data;
};

export const listRules = async (serverId: string): Promise<RulePage> => {
  if (!isLiveSource) return mockListRules(serverId);
  const body = ticketRuleListSchema.parse(
    await callCentral(
      "get",
      `/v1/edge-servers/${serverId}/ticket-rules?${query({ pageSize: 100 })}`,
    ),
  );
  return { items: body.data, total: body.meta.total };
};

export const setRuleEnabled = async (
  serverId: string,
  id: string,
  isEnabled: boolean,
): Promise<TicketRule> => {
  if (!isLiveSource) {
    const rule = mockSetRule(serverId, id, isEnabled);
    if (!rule) throw new CentralError("Rule not found", 404, "NOT_FOUND");
    return rule;
  }
  return ticketRuleResponseSchema.parse(
    await callCentral(
      "patch",
      `/v1/edge-servers/${serverId}/ticket-rules/${id}`,
      { isEnabled },
    ),
  ).data;
};
