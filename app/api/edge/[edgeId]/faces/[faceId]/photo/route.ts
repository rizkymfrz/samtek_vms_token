import { isLiveSource } from "@/config/env";
import { EdgeError, getBinaryFromEdge } from "@/lib/api/edge-client";
import { findEdgeServer } from "@/lib/api/edge-registry";
import { requireAccessToken, UnauthorizedError } from "@/lib/auth/session";

const FACE_ID = /^[A-Za-z0-9._-]+$/;

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ edgeId: string; faceId: string }> },
) => {
  const { edgeId, faceId } = await params;
  if (!isLiveSource) return new Response(null, { status: 404 });
  if (!FACE_ID.test(faceId)) return new Response(null, { status: 400 });
  try {
    const edge = await findEdgeServer(await requireAccessToken(), edgeId);
    if (!edge) return new Response(null, { status: 404 });
    const photo = await getBinaryFromEdge(edge, `/v1/faces/${faceId}/photo`);
    return new Response(photo, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return new Response(null, { status: 401 });
    }
    if (error instanceof EdgeError && error.status === 404) {
      return new Response(null, { status: 404 });
    }
    console.error("[api/edge face photo]", error);
    return new Response(null, { status: 502 });
  }
};
