import { isLiveSource } from "@/config/env";
import { listCentralDevices } from "@/lib/api/central-devices";
import { getFromEdge } from "@/lib/api/edge-client";
import { getCentralServers, getEdgeServers } from "@/lib/api/edge-registry";
import { queryEdges } from "@/lib/api/fan-out";
import { requireAccessToken } from "@/lib/auth/session";
import { buildRecognitions } from "./build-recognitions";
import { toRow } from "../lib/recognition-row";
import { DEFAULT_HOURS } from "../lib/recognition-window";
import {
  edgeFaceReferencesSchema,
  edgeRecognitionsResponseSchema,
} from "../schemas/edge-recognition";
import type { RecognitionsData, RecognitionsQuery } from "../types";

const EDGE_LIMIT = 1000;

export const getRecognitions = async (
  recognizer: string,
  query?: Pick<RecognitionsQuery, "since" | "until">,
): Promise<RecognitionsData> => {
  const now = Date.now();
  const window = query ?? {
    since: now - DEFAULT_HOURS * 3_600_000,
    until: null,
  };
  if (!isLiveSource) return buildRecognitions(now, { ...window, recognizer });
  const token = await requireAccessToken();
  const [edges, servers] = await Promise.all([
    getEdgeServers(token),
    getCentralServers(token),
  ]);
  const [{ results, failures }, { devices }, faces] = await Promise.all([
    queryEdges(edges, (edge) =>
      getFromEdge(edge, "/v1/recognitions", edgeRecognitionsResponseSchema, {
        recognizer,
        since: new Date(window.since).toISOString(),
        limit: EDGE_LIMIT,
        ...(window.until !== null && {
          until: new Date(window.until).toISOString(),
        }),
      }),
    ),
    listCentralDevices(token, servers),
    queryEdges(edges, (edge) =>
      getFromEdge(edge, "/v1/faces", edgeFaceReferencesSchema),
    ),
  ]);
  const references = new Map<string, string>();
  for (const { edge, data } of faces.results) {
    for (const face of data.faces) {
      const key = `${edge.id}:${face.person_id}`;
      if (face.has_photo && !references.has(key)) {
        references.set(key, `/api/edge/${edge.id}/faces/${face.face_id}/photo`);
      }
    }
  }
  const cameraNames = new Map(
    devices.map((device) => [device.id, device.name]),
  );
  const rows = results
    .flatMap(({ edge, data }) =>
      data.recognitions.map((recognition) =>
        toRow(
          edge.id,
          recognition,
          cameraNames,
          recognition.crop_path !== undefined,
          references,
        ),
      ),
    )
    .sort((a, b) => b.at - a.at || b.id.localeCompare(a.id));
  return {
    now,
    rows,
    isTruncated: results.some(
      ({ data }) => data.recognitions.length >= EDGE_LIMIT,
    ),
    cameraNames: Object.fromEntries(cameraNames),
    references: Object.fromEntries(references),
    failures,
  };
};
