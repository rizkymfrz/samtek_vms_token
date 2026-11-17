import { connection } from "next/server";
import { env } from "@/config/env";
import { decodePolyline6 } from "@/features/map/lib/polyline";
import {
  matchInputSchema,
  matchResponseSchema,
} from "@/features/map/schemas/map";
import { errorResponse } from "@/lib/api/central-proxy";
import { requireAccessToken } from "@/lib/auth/session";

export const POST = async (request: Request) => {
  await connection();
  if (!env.MAP_MATCHING_URL) return new Response(null, { status: 404 });
  const body = matchInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid trail" }, { status: 400 });
  }
  try {
    await requireAccessToken();
    const response = await fetch(`${env.MAP_MATCHING_URL}/trace_route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shape: body.data.points.map(([lon, lat]) => ({ lat, lon })),
        costing: "pedestrian",
        shape_match: "map_snap",
        trace_options: { search_radius: 40, gps_accuracy: 20 },
      }),
      signal: AbortSignal.timeout(env.EDGE_TIMEOUT_MS),
    });
    if (!response.ok) {
      return Response.json({ error: "No road match" }, { status: 422 });
    }
    const trip = matchResponseSchema.parse(await response.json()).trip;
    return Response.json({
      line: trip.legs.flatMap((leg) => decodePolyline6(leg.shape)),
    });
  } catch (error) {
    return errorResponse(error, "api/map match");
  }
};
