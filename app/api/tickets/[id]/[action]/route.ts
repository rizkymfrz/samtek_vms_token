import {
  TICKET_ACTIONS,
  ticketActionInputSchemas,
} from "@/features/tickets/schemas/ticket";
import { runTicketAction } from "@/features/tickets/services/ticket-source";
import { errorResponse, isValidIds } from "@/lib/api/central-proxy";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) => {
  const { id, action } = await params;
  const known = TICKET_ACTIONS.find((item) => item === action);
  if (!known || !isValidIds(id)) return new Response(null, { status: 404 });
  const body = ticketActionInputSchemas[known].safeParse(
    await request.json().catch(() => ({})),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid ticket data" }, { status: 400 });
  }
  try {
    return Response.json(await runTicketAction(id, known, body.data));
  } catch (error) {
    return errorResponse(error, "api/tickets action");
  }
};
