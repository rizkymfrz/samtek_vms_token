"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import {
  browserOffsetMinutes,
  statsWindow,
  windowKey,
} from "../lib/stats-window";
import { fetchCountingStats } from "../services/fetch-counting-stats";
import type { StatsBucket } from "../types";

const POLL_INTERVAL_MS = 60_000;

export const useCountingStats = ({
  edgeId,
  deviceId,
  bucket,
  range,
}: {
  edgeId: string | null;
  deviceId: string | null;
  bucket: StatsBucket;
  range: DateRange | undefined;
}) =>
  useQuery({
    queryKey: ["counting-stats", edgeId, deviceId, bucket, windowKey(range)],
    queryFn: () =>
      fetchCountingStats({
        edgeId: edgeId ?? "",
        deviceId: deviceId ?? "",
        bucket,
        utcOffsetMinutes: browserOffsetMinutes(),
        ...statsWindow(range, Date.now()),
      }),
    enabled: edgeId !== null && deviceId !== null,
    placeholderData: keepPreviousData,
    refetchInterval: () =>
      statsWindow(range, Date.now()).until === null ? POLL_INTERVAL_MS : false,
  });
