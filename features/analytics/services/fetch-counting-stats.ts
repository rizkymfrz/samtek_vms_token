import { http } from "@/lib/axios/browser-client";
import type { CountingStats, CountingStatsQuery } from "../types";

export const fetchCountingStats = async ({
  edgeId,
  deviceId,
  bucket,
  since,
  until,
  utcOffsetMinutes,
}: CountingStatsQuery) =>
  (
    await http.get<CountingStats>("/api/stats/counting-dwelling", {
      params: {
        edge: edgeId,
        device: deviceId,
        bucket,
        since,
        utcOffset: utcOffsetMinutes,
        ...(until !== null && { until }),
      },
    })
  ).data;
