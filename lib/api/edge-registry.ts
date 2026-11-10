import { cacheLife } from "next/cache";
import { z } from "zod";
import { createCentralClient } from "./central-client";
import { fetchAllPages } from "./central-pages";
import type { EdgeTarget } from "./edge-client";

const centralServerSchema = z.object({
  id: z.coerce.string(),
  groupId: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  hostAddress: z.string().nullable(),
  localHostAddress: z.string().nullable(),
  webrtcUrl: z.string().nullable(),
  webrtcUrlLocal: z.string().nullable(),
  macAddress: z.string().nullable(),
  isActive: z.boolean(),
  deviceCount: z.number().int().nonnegative(),
  lastSeenAt: z.iso.datetime().nullable(),
});

export type CentralServer = Omit<
  z.output<typeof centralServerSchema>,
  "lastSeenAt"
> & { lastSeenAt: number | null };

export const listCentralServers = async (
  token: string,
): Promise<CentralServer[]> => {
  const servers = await fetchAllPages(
    createCentralClient(token),
    "/v1/edge-servers",
    centralServerSchema,
  );
  return servers.map((server) => ({
    ...server,
    lastSeenAt: server.lastSeenAt ? Date.parse(server.lastSeenAt) : null,
  }));
};

export const getCentralServers = async (token: string) => {
  "use cache";
  cacheLife({ revalidate: 30, expire: 60 });
  return listCentralServers(token);
};

export const getEdgeServers = async (token: string): Promise<EdgeTarget[]> =>
  (await getCentralServers(token))
    .filter((server) => server.isActive)
    .map(({ id, name, hostAddress, localHostAddress }) => ({
      id,
      name,
      hostAddress,
      localHostAddress,
    }));

export const findEdgeServer = async (token: string, edgeId: string) =>
  (await getEdgeServers(token)).find((edge) => edge.id === edgeId) ?? null;
