import { http } from "@/lib/axios/browser-client";
import { getLinkToken } from "../lib/link-token";
import type {
  ActionBody,
  TicketDetail,
  TicketEvidence,
  TicketRecord,
} from "../types";

const LINK_HEADER = "X-Ticket-Link";
const BASE = "/api/ticket-link/ticket";
const headers = () => ({ [LINK_HEADER]: getLinkToken() ?? "" });

export const fetchLinkTicket = async () =>
  (await http.get<TicketDetail>(BASE, { headers: headers() })).data;

export const postLinkAction = async (
  action: "acknowledge" | "start" | "request-resolution",
  body: ActionBody,
) =>
  (
    await http.post<TicketRecord>(`${BASE}/${action}`, body, {
      headers: headers(),
    })
  ).data;

export const uploadLinkEvidence = async (file: File) => {
  const form = new FormData();
  form.append("file", file, file.name);
  return (
    await http.post<TicketEvidence>(`${BASE}/evidence`, form, {
      headers: headers(),
    })
  ).data;
};

export const fetchLinkPhoto = async (path: string) =>
  (
    await http.get<Blob>(`${BASE}${path}`, {
      headers: headers(),
      responseType: "blob",
    })
  ).data;
