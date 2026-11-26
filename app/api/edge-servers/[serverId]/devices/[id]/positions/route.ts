import { connection } from "next/server";
import {
  devicePositionsQuerySchema,
  devicePositionsResponseSchema,
} from "@/features/map/schemas/map";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ serverId: string; id: string }> },
) => {
  await connection();
  const { serverId, id } = await params;
  if (!isValidIds(serverId, id)) {
    return new Response(null, { status: 404 });
  }
  const query = devicePositionsQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!query.success) {
    return Response.json({ error: "Invalid position range" }, { status: 400 });
  }
  const search = new URLSearchParams(
    Object.entries(query.data).map(([key, value]) => [key, String(value)]),
  );
  try {
    const data = await callCentral(
      "get",
      `/v1/edge-servers/${serverId}/devices/${id}/positions?${search}`,
    );
    return Response.json(devicePositionsResponseSchema.parse(data).data.items);
  } catch (error) {
    return errorResponse(error, "api/devices positions");
  }
};
