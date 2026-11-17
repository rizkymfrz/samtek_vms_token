import { updateTicketRuleInputSchema } from "@/features/tickets/schemas/ticket";
import { setRuleEnabled } from "@/features/tickets/services/ticket-source";
import { errorResponse, isValidIds } from "@/lib/api/central-proxy";

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ serverId: string; id: string }> },
) => {
  const { serverId, id } = await params;
  if (!isValidIds(serverId, id)) return new Response(null, { status: 404 });
  const body = updateTicketRuleInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid rule data" }, { status: 400 });
  }
  try {
    return Response.json(
      await setRuleEnabled(serverId, id, body.data.isEnabled),
    );
  } catch (error) {
    return errorResponse(error, "api/ticket-rules update");
  }
};
