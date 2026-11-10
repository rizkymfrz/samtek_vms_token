import { isLiveSource } from "@/config/env";
import { createCentralClient, failureMessage } from "@/lib/api/central-client";
import { fetchAllPages, fetchTotal } from "@/lib/api/central-pages";
import { listCentralServers } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";
import { buildServers } from "./build-servers";
import { serverGroupSchema } from "../schemas/server";
import type { ServerFailure, ServersData } from "../types";

export const getServers = async (): Promise<ServersData> => {
  if (!isLiveSource) return buildServers();
  const token = await requireAccessToken();
  const client = createCentralClient(token);
  const now = Date.now();
  const [servers, groups] = await Promise.all([
    listCentralServers(token),
    fetchAllPages(client, "/v1/edge-server-groups", serverGroupSchema).catch(
      (error) => {
        console.error("[servers groups]", error);
        return null;
      },
    ),
  ]);
  const failures: ServerFailure[] = [];
  if (!groups) {
    failures.push({ serverName: "Groups", message: "Could not be loaded" });
  }
  const counts = await Promise.allSettled(
    servers.map((server) =>
      fetchTotal(client, `/v1/edge-servers/${server.id}/devices`),
    ),
  );
  return {
    now,
    failures: [
      ...failures,
      ...counts.flatMap((outcome, index) => {
        if (outcome.status === "fulfilled") return [];
        console.error(`[servers cameras ${servers[index].id}]`, outcome.reason);
        return [
          {
            serverName: servers[index].name,
            message: `Camera count unavailable: ${failureMessage(outcome.reason)}`,
          },
        ];
      }),
    ],
    servers: servers.map((server, index) => {
      const count = counts[index];
      return {
        ...server,
        vendor: null,
        cameraCount: count.status === "fulfilled" ? count.value : 0,
      };
    }),
    groups: groups ?? [],
    discovered: [],
    metrics: {},
  };
};
