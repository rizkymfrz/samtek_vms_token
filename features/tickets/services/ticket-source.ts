import { callCentral } from "@/lib/api/central-proxy";
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

const PAGE_SIZE = 20;

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
  return ticketDetailResponseSchema.parse(
    await callCentral("get", `/v1/tickets/${id}`),
  ).data;
};

export const runTicketAction = async (
  id: string,
  action: TicketAction,
  body: ActionBody,
): Promise<TicketRecord> => {
  return ticketResponseSchema.parse(
    await callCentral("post", `/v1/tickets/${id}/${action}`, body),
  ).data;
};

export const addTicketEvidence = async (
  id: string,
  file: File,
): Promise<TicketEvidence> => {
  const form = new FormData();
  form.append("file", file, file.name);
  return ticketEvidenceResponseSchema.parse(
    await callCentral("post", `/v1/tickets/${id}/evidence`, form),
  ).data;
};

export const requestTicketLink = async (id: string) => {
  return linkDeliveryResponseSchema.parse(
    await callCentral("post", `/v1/tickets/${id}/link-deliveries`),
  ).data;
};

export const listRules = async (serverId: string): Promise<RulePage> => {
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
  return ticketRuleResponseSchema.parse(
    await callCentral(
      "patch",
      `/v1/edge-servers/${serverId}/ticket-rules/${id}`,
      { isEnabled },
    ),
  ).data;
};
