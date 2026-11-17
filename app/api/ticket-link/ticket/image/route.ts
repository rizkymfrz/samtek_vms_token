import { proxyTicketBinary } from "@/features/tickets/services/ticket-binary";
import { noToken, readLinkToken } from "../../token";

export const GET = async (request: Request) => {
  const token = readLinkToken(request);
  if (!token) return noToken();
  return proxyTicketBinary(
    "/v1/ticket-links/ticket/image",
    "api/ticket-link image",
    token,
  );
};
