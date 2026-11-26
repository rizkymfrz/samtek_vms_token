import { EdgeError, type EdgeTarget, getFromEdge } from "@/lib/api/edge-client";
import { getEdgeServers } from "@/lib/api/edge-registry";
import { queryEdges } from "@/lib/api/fan-out";
import { requireAccessToken } from "@/lib/auth/session";
import { edgeSearchResponseSchema } from "../schemas/edge-search";
import type { SearchData, SearchQuery, SearchRow } from "../types";

const SEARCH_TIMEOUT_MS = 60_000;

const searchEdge = async (edge: EdgeTarget, query: SearchQuery) => {
  try {
    const { results } = await getFromEdge(
      edge,
      "/v1/search",
      edgeSearchResponseSchema,
      {
        q: query.q,
        limit: query.limit,
        ...(query.deviceId && { device_id: query.deviceId }),
        ...(query.label && { label: query.label }),
        ...(query.since !== null && {
          since: new Date(query.since).toISOString(),
        }),
        ...(query.until !== null && {
          until: new Date(query.until).toISOString(),
        }),
      },
      { isExposed: true, timeout: SEARCH_TIMEOUT_MS },
    );
    const rows: SearchRow[] = results.map((result) => ({
      id: `${edge.id}:${result.id}`,
      resultId: result.id,
      edgeId: edge.id,
      trackKey: result.track_key,
      deviceId: result.device_id,
      label: result.label,
      seenAt: Date.parse(result.seen_at),
      similarity: result.similarity,
      confidence: result.confidence ?? null,
      hasCrop: result.crop_path !== undefined,
    }));
    return { rows, isUnavailable: false };
  } catch (error) {
    if (error instanceof EdgeError && error.status === 503) {
      return { rows: [], isUnavailable: true };
    }
    throw error;
  }
};

export const searchObjects = async (
  query: SearchQuery,
): Promise<SearchData> => {
  const token = await requireAccessToken();
  const edges = (await getEdgeServers(token)).filter(
    (edge) => query.edgeId === null || edge.id === query.edgeId,
  );
  const { results, failures } = await queryEdges(edges, (edge) =>
    searchEdge(edge, query),
  );
  const rows = results
    .flatMap(({ data }) => data.rows)
    .sort((a, b) => b.similarity - a.similarity || b.seenAt - a.seenAt)
    .slice(0, query.limit);
  return {
    rows,
    relays: Object.fromEntries(
      edges.map((edge) => [
        edge.id,
        { webrtcUrl: edge.webrtcUrl, webrtcUrlLocal: edge.webrtcUrlLocal },
      ]),
    ),
    edgeCount: edges.length,
    unavailable: results
      .filter(({ data }) => data.isUnavailable)
      .map(({ edge }) => edge.name),
    failures,
  };
};
