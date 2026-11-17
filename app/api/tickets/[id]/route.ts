import { connection } from "next/server";
import { getTicket } from "@/features/tickets/services/ticket-source";
import { errorResponse, isValidIds } from "@/lib/api/central-proxy";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  await connection();
  const { id } = await params;
  if (!isValidIds(id)) return new Response(null, { status: 404 });
  try {
    return Response.json(await getTicket(id));
  } catch (error) {
    return errorResponse(error, "api/tickets detail");
  }
};
