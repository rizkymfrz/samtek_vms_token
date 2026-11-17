import { proxyTicketBinary } from "@/features/tickets/services/ticket-binary";
import { isValidIds } from "@/lib/api/central-proxy";
import { noToken, readLinkToken } from "../../../token";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ evidenceId: string }> },
) => {
  const token = readLinkToken(request);
  if (!token) return noToken();
  const { evidenceId } = await params;
  if (!isValidIds(evidenceId)) return new Response(null, { status: 404 });
  return proxyTicketBinary(
    `/v1/ticket-links/ticket/evidence/${evidenceId}`,
    "api/ticket-link evidence photo",
    token,
  );
};
