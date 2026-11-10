import { cacheLife } from "next/cache";
import { z } from "zod";
import { createCentralClient } from "./central-client";
import type { EdgeTarget } from "./edge-client";

const edgeServersSchema = z.array(
  z.object({
    id: z.coerce.string(),
    name: z.string(),
    hostAddress: z.string().nullable(),
    localHostAddress: z.string().nullable(),
    isActive: z.boolean(),
  }),
);

const fetchEdgeServers = async (token: string): Promise<EdgeTarget[]> => {
  "use cache";
  cacheLife({ revalidate: 30, expire: 60 });
  const { data } =
    await createCentralClient(token).get<unknown>("/edge-servers");
  return edgeServersSchema
    .parse(data)
    .filter((edge) => edge.isActive)
    .map(({ id, name, hostAddress, localHostAddress }) => ({
      id,
      name,
      hostAddress,
      localHostAddress,
    }));
};

export const getEdgeServers = fetchEdgeServers;

export const findEdgeServer = async (token: string, edgeId: string) =>
  (await fetchEdgeServers(token)).find((edge) => edge.id === edgeId) ?? null;
