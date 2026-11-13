import { isLiveSource } from "@/config/env";
import { deleteFromEdge } from "@/lib/api/edge-client";
import { edgeErrorResponse } from "@/lib/api/edge-proxy";
import { findEdgeServer } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";

const FACE_ID = /^[A-Za-z0-9._-]+$/;

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ edgeId: string; faceId: string }> },
) => {
  const { edgeId, faceId } = await params;
  if (!isLiveSource) return new Response(null, { status: 404 });
  if (!FACE_ID.test(faceId)) return new Response(null, { status: 400 });
  try {
    const edge = await findEdgeServer(await requireAccessToken(), edgeId);
    if (!edge) {
      return Response.json({ error: "Edge server not found" }, { status: 404 });
    }
    await deleteFromEdge(edge, `/v1/faces/${faceId}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    return edgeErrorResponse(error, "api/faces delete");
  }
};
