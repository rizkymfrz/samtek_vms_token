import { connection } from "next/server";
import { listRules } from "@/features/tickets/services/ticket-source";
import { errorResponse, isValidIds } from "@/lib/api/central-proxy";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ serverId: string }> },
) => {
  await connection();
  const { serverId } = await params;
  if (!isValidIds(serverId)) return new Response(null, { status: 404 });
  try {
    return Response.json(await listRules(serverId));
  } catch (error) {
    return errorResponse(error, "api/ticket-rules");
  }
};
