import { connection } from "next/server";
import { ticketListQuerySchema } from "@/features/tickets/schemas/ticket";
import { listTickets } from "@/features/tickets/services/ticket-source";
import { errorResponse } from "@/lib/api/central-proxy";

export const GET = async (request: Request) => {
  await connection();
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const query = ticketListQuerySchema.safeParse(params);
  if (!query.success) {
    return Response.json({ error: "Invalid ticket filter" }, { status: 400 });
  }
  try {
    return Response.json(
      await listTickets({
        status: query.data.status ?? null,
        edgeServerId: query.data.edgeServerId ?? null,
        assigneeId: query.data.assigneeId ?? null,
        page: query.data.page,
      }),
    );
  } catch (error) {
    return errorResponse(error, "api/tickets");
  }
};
