import { cacheLife } from "next/cache";
import { z } from "zod";
import { createCentralClient, toCentralError } from "./central-client";
import type { EdgeTarget } from "./edge-client";

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

const edgeServersPageSchema = z.object({
  data: z.array(
    z.object({
      id: z.coerce.string(),
      name: z.string(),
      hostAddress: z.string().nullable(),
      localHostAddress: z.string().nullable(),
      isActive: z.boolean(),
    }),
  ),
  meta: z.object({ total: z.number().int().nonnegative() }),
});

const fetchEdgeServers = async (token: string): Promise<EdgeTarget[]> => {
  "use cache";
  cacheLife({ revalidate: 30, expire: 60 });
  const client = createCentralClient(token);
  const servers: z.output<typeof edgeServersPageSchema>["data"] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { data } = await client.get<unknown>("/v1/edge-servers", {
        params: { page, pageSize: PAGE_SIZE },
      });
      const body = edgeServersPageSchema.parse(data);
      servers.push(...body.data);
      if (page * PAGE_SIZE >= body.meta.total) break;
    }
  } catch (error) {
    throw toCentralError(error);
  }
  return servers
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
