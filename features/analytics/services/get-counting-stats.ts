import { isLiveSource } from "@/config/env";
import { getFromEdge } from "@/lib/api/edge-client";
import { getEdgeServers } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";
import { buildCountingStats } from "./build-counting-stats";
import { edgeCountingStatsSchema } from "../schemas/counting-stats";
import type { CountingStats, CountingStatsQuery } from "../types";

export class EdgeNotFoundError extends Error {}

export const getCountingStats = async (
  query: CountingStatsQuery,
): Promise<CountingStats> => {
  if (!isLiveSource) return buildCountingStats(Date.now(), query);
  const token = await requireAccessToken();
  const edge = (await getEdgeServers(token)).find(
    ({ id }) => id === query.edgeId,
  );
  if (!edge) throw new EdgeNotFoundError(query.edgeId);
  const data = await getFromEdge(
    edge,
    "/v1/stats/counting-dwelling",
    edgeCountingStatsSchema,
    {
      bucket: query.bucket,
      utc_offset_minutes: query.utcOffsetMinutes,
      device_id: query.deviceId,
      since: new Date(query.since).toISOString(),
      ...(query.until !== null && {
        until: new Date(query.until).toISOString(),
      }),
    },
  );
  return {
    bucket: data.bucket,
    buckets: data.counting.buckets.map(({ start }) => Date.parse(start)),
    counting: data.counting.series.map((series) => ({
      perimeter: series.perimeter_name,
      direction: series.direction,
      label: series.object_label,
      count: series.count,
      counts: series.counts,
    })),
    dwelling: data.dwelling.series.map((series) => ({
      perimeter: series.perimeter_name,
      label: series.object_label,
      objects: series.objects,
      staySeconds: series.stay_seconds,
      objectsByBucket: series.objects_by_bucket,
      stayByBucket: series.stay_seconds_by_bucket,
    })),
  };
};
