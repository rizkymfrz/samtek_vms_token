import { isLiveSource } from "@/config/env";
import { locationInputSchema } from "@/features/map/schemas/map";
import { callCentral, errorResponse } from "@/lib/api/central-proxy";

export const PATCH = async (request: Request) => {
  if (!isLiveSource) return new Response(null, { status: 404 });
  const body = locationInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid location" }, { status: 400 });
  }
  const { type, id, edgeServerId, latitude, longitude } = body.data;
  const path =
    type === "group"
      ? `/v1/edge-server-groups/${id}`
      : type === "server"
        ? `/v1/edge-servers/${id}`
        : `/v1/edge-servers/${edgeServerId}/devices/${id}`;
  try {
    await callCentral("patch", path, { latitude, longitude });
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/map location");
  }
};
