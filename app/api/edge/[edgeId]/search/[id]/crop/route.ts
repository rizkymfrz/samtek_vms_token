import { EdgeError, getBinaryFromEdge } from "@/lib/api/edge-client";
import { findEdgeServer } from "@/lib/api/edge-registry";
import { requireAccessToken, UnauthorizedError } from "@/lib/auth/session";

const RESULT_ID = /^[A-Za-z0-9-]+$/;

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ edgeId: string; id: string }> },
) => {
  const { edgeId, id } = await params;
  if (!RESULT_ID.test(id)) return new Response(null, { status: 400 });
  try {
    const edge = await findEdgeServer(await requireAccessToken(), edgeId);
    if (!edge) return new Response(null, { status: 404 });
    const crop = await getBinaryFromEdge(edge, `/v1/search/${id}/crop`);
    return new Response(crop, {
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
    console.error("[api/edge search crop]", error);
    return new Response(null, { status: 502 });
  }
};
