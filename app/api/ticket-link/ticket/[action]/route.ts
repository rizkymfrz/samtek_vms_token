import {
  LINK_ACTIONS,
  ticketActionInputSchemas,
} from "@/features/tickets/schemas/ticket";
import {
  linkErrorResponse,
  runLinkAction,
} from "@/features/tickets/services/ticket-link-source";
import { noToken, readLinkToken } from "../../token";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) => {
  const { action } = await params;
  const known = LINK_ACTIONS.find((item) => item === action);
  if (!known) return new Response(null, { status: 404 });
  const token = readLinkToken(request);
  if (!token) return noToken();
  const body = ticketActionInputSchemas[known].safeParse(
    await request.json().catch(() => ({})),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid ticket data" }, { status: 400 });
  }
  try {
    return Response.json(await runLinkAction(token, known, body.data));
  } catch (error) {
    return linkErrorResponse(error, "api/ticket-link action");
  }
};
