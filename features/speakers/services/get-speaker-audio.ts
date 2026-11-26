import { getFromEdge } from "@/lib/api/edge-client";
import { getEdgeServers } from "@/lib/api/edge-registry";
import { queryEdges } from "@/lib/api/fan-out";
import { requireAccessToken } from "@/lib/auth/session";
import { edgeAudiosResponseSchema } from "../schemas/audio";
import type { SpeakerAudioData } from "../types";

export const getSpeakerAudio = async (): Promise<SpeakerAudioData> => {
  const edges = await getEdgeServers(await requireAccessToken());
  const { results, failures } = await queryEdges(edges, (edge) =>
    getFromEdge(edge, "/v1/speaker-audio", edgeAudiosResponseSchema),
  );
  return {
    audios: results.flatMap(({ edge, data }) =>
      data.audios.map((audio) => ({
        id: audio.audio_id,
        edgeId: edge.id,
        edgeName: edge.name,
        name: audio.name,
        format: audio.format,
        bytes: audio.bytes,
      })),
    ),
    failures: failures.map(({ edgeName, message }) => ({ edgeName, message })),
  };
};
