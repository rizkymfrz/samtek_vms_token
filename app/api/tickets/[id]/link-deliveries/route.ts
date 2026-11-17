import { requestTicketLink } from "@/features/tickets/services/ticket-source";
import { errorResponse, isValidIds } from "@/lib/api/central-proxy";

export const POST = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  if (!isValidIds(id)) return new Response(null, { status: 404 });
  try {
    return Response.json(await requestTicketLink(id), { status: 202 });
  } catch (error) {
    return errorResponse(error, "api/tickets link");
  }
};
