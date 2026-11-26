import { getFromEdge } from "@/lib/api/edge-client";
import { getEdgeServers } from "@/lib/api/edge-registry";
import { queryEdges } from "@/lib/api/fan-out";
import { requireAccessToken } from "@/lib/auth/session";
import { edgeCallsResponseSchema } from "../schemas/audio";
import type { SpeakerCallsData } from "../types";

export const CALLS_LIMIT = 200;

export const getSpeakerCalls = async (
  edgeId: string | null,
): Promise<SpeakerCallsData> => {
  const edges = (await getEdgeServers(await requireAccessToken())).filter(
    (edge) => edgeId === null || edge.id === edgeId,
  );
  const { results, failures } = await queryEdges(edges, (edge) =>
    getFromEdge(edge, "/v1/speaker-calls", edgeCallsResponseSchema, {
      limit: CALLS_LIMIT,
    }),
  );
  const calls = results
    .flatMap(({ edge, data }) =>
      data.calls.map((call) => ({
        id: call.call_id,
        edgeId: edge.id,
        edgeName: edge.name,
        occurredAt: call.occurred_at,
        source: call.source,
        deviceId: call.device_id ?? null,
        speakerId: call.speaker_id ?? null,
        eventId: call.event_id ?? null,
        kind: call.kind ?? null,
        label: call.label ?? null,
        status: call.status,
        reason: call.reason ?? null,
        durationMs: call.duration_ms,
      })),
    )
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, CALLS_LIMIT);
  return {
    calls,
    failures: failures.map(({ edgeName, message }) => ({ edgeName, message })),
  };
};
