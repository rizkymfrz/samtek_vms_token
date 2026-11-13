"use client";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { mqttConfig } from "@/config/mqtt";
import {
  type EdgeEvent,
  subscribeEdgeEvents,
  subscribeEdgeReconnect,
} from "@/features/edge-status";
import { alarmFromMessage, clipFromMessage, toRow } from "../lib/alarm-row";
import {
  alertWindow,
  DEFAULT_FILTERS,
  type Filters,
  rangeKey,
} from "../lib/filter-alerts";
import { addAlert, mergeAlerts, setAlertClip } from "../lib/merge-alerts";
import { fetchAlerts } from "../services/fetch-alerts";
import type { AlertsData } from "../types";

const POLL_INTERVAL_MS = 15_000;
const OVERLAP_MS = 60_000;
const NO_RELAY = { webrtcUrl: null, webrtcUrlLocal: null };

const applyEvent = (previous: AlertsData, event: EdgeEvent, since: number) => {
  if (event.kind === "alarm") {
    const alarm = alarmFromMessage(event.data);
    if (Date.parse(alarm.occurred_at) < since) return previous;
    const names = new Map(Object.entries(previous.cameraNames));
    return addAlert(
      previous,
      toRow(
        event.edgeId,
        previous.relays[event.edgeId] ?? NO_RELAY,
        alarm,
        names,
      ),
    );
  }
  if (event.kind === "clip") {
    const rowId = `${event.edgeId}:${event.data.event_id}`;
    const row = previous.rows.find((candidate) => candidate.id === rowId);
    if (!row) return previous;
    const clip = clipFromMessage(
      event.edgeId,
      row.at,
      event.data,
      previous.relays[event.edgeId] ?? NO_RELAY,
    );
    return clip ? setAlertClip(previous, rowId, clip) : previous;
  }
  return previous;
};

export const useAlerts = (
  initialData: AlertsData,
  isPolling: boolean,
  filters: Filters,
) => {
  const key = rangeKey(filters);
  const queryClient = useQueryClient();
  const isLive = isPolling && mqttConfig !== null;
  useEffect(() => {
    if (!isLive) return;
    const queryKey = ["alerts", key];
    const stopEvents = subscribeEdgeEvents((event) => {
      const window = alertWindow(filters, Date.now());
      if (window.until !== null) return;
      queryClient.setQueryData<AlertsData>(queryKey, (previous) =>
        previous ? applyEvent(previous, event, window.since) : previous,
      );
    });
    const stopReconnect = subscribeEdgeReconnect(() => {
      void queryClient.invalidateQueries({ queryKey });
    });
    return () => {
      stopEvents();
      stopReconnect();
    };
  }, [isLive, key, filters, queryClient]);
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
      isPolling &&
      mqttConfig === null &&
      alertWindow(filters, Date.now()).until === null
        ? POLL_INTERVAL_MS
        : false,
  });
};
