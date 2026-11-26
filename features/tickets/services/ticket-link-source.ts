import {
  CentralError,
  createCentralClient,
  toCentralError,
} from "@/lib/api/central-client";
import { errorResponse } from "@/lib/api/central-proxy";
import {
  ticketDetailResponseSchema,
  ticketEvidenceResponseSchema,
  ticketResponseSchema,
} from "../schemas/ticket";
import type {
  ActionBody,
  TicketDetail,
  TicketEvidence,
  TicketRecord,
} from "../types";

export const LINK_HEADER = "X-Ticket-Link";
const LINK_INVALID = "TICKET_LINK_INVALID";

const linkCentral = async (
  token: string,
  method: "get" | "post",
  path: string,
  body?: unknown,
) => {
  try {
    const response = await createCentralClient().request<unknown>({
      method,
      url: `/v1/ticket-links/ticket${path}`,
      data: body,
      headers: { [LINK_HEADER]: token },
    });
    return response.data;
  } catch (error) {
    throw toCentralError(error);
  }
};

export const getLinkTicket = async (token: string): Promise<TicketDetail> => {
  return ticketDetailResponseSchema.parse(await linkCentral(token, "get", ""))
    .data;
};

export const runLinkAction = async (
  token: string,
  action: "acknowledge" | "start" | "request-resolution",
  body: ActionBody,
): Promise<TicketRecord> => {
  return ticketResponseSchema.parse(
    await linkCentral(token, "post", `/${action}`, body),
  ).data;
};

export const addLinkEvidence = async (
  token: string,
  file: File,
): Promise<TicketEvidence> => {
  const form = new FormData();
  form.append("file", file, file.name);
  return ticketEvidenceResponseSchema.parse(
    await linkCentral(token, "post", "/evidence", form),
  ).data;
};

export const linkErrorResponse = (error: unknown, scope: string) =>
  error instanceof CentralError && error.code === LINK_INVALID
    ? Response.json({ error: error.message }, { status: 410 })
    : errorResponse(error, scope);
