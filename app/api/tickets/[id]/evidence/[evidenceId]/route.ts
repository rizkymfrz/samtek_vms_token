import { proxyTicketBinary } from "@/features/tickets/services/ticket-binary";
import { isValidIds } from "@/lib/api/central-proxy";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string; evidenceId: string }> },
) => {
  const { id, evidenceId } = await params;
  if (!isValidIds(id, evidenceId)) return new Response(null, { status: 404 });
  return proxyTicketBinary(
    `/v1/tickets/${id}/evidence/${evidenceId}`,
    "api/tickets evidence photo",
  );
};
