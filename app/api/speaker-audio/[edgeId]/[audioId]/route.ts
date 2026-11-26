import { AUDIO_ID } from "@/features/speakers/schemas/audio";
import { deleteFromEdge } from "@/lib/api/edge-client";
import { edgeErrorResponse } from "@/lib/api/edge-proxy";
import { findEdgeServer } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ edgeId: string; audioId: string }> },
) => {
  const { edgeId, audioId } = await params;
  if (!AUDIO_ID.test(audioId)) return new Response(null, { status: 400 });
  try {
    const edge = await findEdgeServer(await requireAccessToken(), edgeId);
    if (!edge) {
      return Response.json({ error: "Edge server not found" }, { status: 404 });
    }
    await deleteFromEdge(edge, `/v1/speaker-audio/${audioId}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    return edgeErrorResponse(error, "api/speaker-audio delete");
  }
};
