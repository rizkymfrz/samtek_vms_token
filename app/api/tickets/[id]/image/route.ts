import { proxyTicketBinary } from "@/features/tickets/services/ticket-binary";
import { isValidIds } from "@/lib/api/central-proxy";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  if (!isValidIds(id)) return new Response(null, { status: 404 });
  return proxyTicketBinary(`/v1/tickets/${id}/image`, "api/tickets image");
};
