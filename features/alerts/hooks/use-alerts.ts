"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  alertWindow,
  DEFAULT_FILTERS,
  type Filters,
  rangeKey,
} from "../lib/filter-alerts";
import { mergeAlerts } from "../lib/merge-alerts";
import { fetchAlerts } from "../services/fetch-alerts";
import type { AlertsData } from "../types";

const POLL_INTERVAL_MS = 15_000;
const OVERLAP_MS = 60_000;

export const useAlerts = (
  initialData: AlertsData,
  isPolling: boolean,
  filters: Filters,
) => {
  const key = rangeKey(filters);
  return useQuery({
    queryKey: ["alerts", key],
    queryFn: async ({ client }) => {
      const window = alertWindow(filters, Date.now());
      const previous = client.getQueryData<AlertsData>(["alerts", key]);
      const newest = previous?.rows[0]?.at;
      const isIncremental =
        window.until === null &&
        previous !== undefined &&
        newest !== undefined &&
        previous.failures.length === 0;
      const incoming = await fetchAlerts({
        since: isIncremental
          ? Math.max(window.since, newest - OVERLAP_MS)
          : window.since,
        until: window.until,
      });
      return isIncremental
        ? mergeAlerts(previous, incoming, window.since)
        : incoming;
    },
    initialData: key === rangeKey(DEFAULT_FILTERS) ? initialData : undefined,
    placeholderData: keepPreviousData,
    refetchInterval: () =>
      isPolling && alertWindow(filters, Date.now()).until === null
        ? POLL_INTERVAL_MS
        : false,
  });
};
