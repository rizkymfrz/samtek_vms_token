import { isLiveSource } from "@/config/env";
import { getFromEdge } from "@/lib/api/edge-client";
import { getEdgeServers } from "@/lib/api/edge-registry";
import { queryEdges } from "@/lib/api/fan-out";
import { requireAccessToken } from "@/lib/auth/session";
import { buildFaces } from "./build-faces";
import { edgeFacesResponseSchema } from "../schemas/face";
import type { FacesData } from "../types";

export const getFaces = async (): Promise<FacesData> => {
  if (!isLiveSource) return buildFaces();
  const edges = await getEdgeServers(await requireAccessToken());
  const { results, failures } = await queryEdges(edges, (edge) =>
    getFromEdge(edge, "/v1/faces", edgeFacesResponseSchema),
  );
  return {
    edges: edges.map(({ id, name }) => ({ id, name })),
    faces: results.flatMap(({ edge, data }) =>
      data.faces.map((face) => ({
        id: face.face_id,
        personId: face.person_id,
        name: face.name,
        group: face.group,
        hasPhoto: face.has_photo,
        edgeId: edge.id,
        edgeName: edge.name,
      })),
    ),
    failures: failures.map(({ edgeName, message }) => ({ edgeName, message })),
  };
};
