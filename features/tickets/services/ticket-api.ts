import { http } from "@/lib/axios/browser-client";
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

export const fetchTickets = async (filters: TicketFilters) =>
  (
    await http.get<TicketPage>("/api/tickets", {
      params: {
        status: filters.status ?? undefined,
        edgeServerId: filters.edgeServerId ?? undefined,
        assigneeId: filters.assigneeId ?? undefined,
        page: filters.page,
      },
    })
  ).data;

export const fetchTicket = async (id: string) =>
  (await http.get<TicketDetail>(`/api/tickets/${id}`)).data;

export const postTicketAction = async (
  id: string,
  action: TicketAction,
  body: ActionBody,
) => (await http.post<TicketRecord>(`/api/tickets/${id}/${action}`, body)).data;

export const fetchRules = async (serverId: string) =>
  (await http.get<RulePage>(`/api/edge-servers/${serverId}/ticket-rules`)).data;

export const patchRule = async (
  serverId: string,
  id: string,
  isEnabled: boolean,
) =>
  (
    await http.patch<TicketRule>(
      `/api/edge-servers/${serverId}/ticket-rules/${id}`,
      { isEnabled },
    )
  ).data;

export const fetchServerNames = async () => {
  const { servers } = (
    await http.get<{ servers: { id: string; name: string }[] }>("/api/servers")
  ).data;
  return servers.map(({ id, name }) => ({ id, name }));
};

export const uploadEvidence = async (id: string, file: File) => {
  const form = new FormData();
  form.append("file", file, file.name);
  return (await http.post<TicketEvidence>(`/api/tickets/${id}/evidence`, form))
    .data;
};

export const requestLink = async (id: string) => {
  await http.post(`/api/tickets/${id}/link-deliveries`);
};
