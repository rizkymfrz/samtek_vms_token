"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useEffectEvent } from "react";
import { mqttConfig } from "@/config/mqtt";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import {
  subscribeEdgeEvents,
  subscribeEdgeReconnect,
} from "@/features/edge-status";
import { alarmFromMessage, toRow } from "../lib/alarm-row";
import { alarmToast } from "../lib/alarm-toast";
import { addAlert } from "../lib/merge-alerts";
import { fetchAlerts } from "../services/fetch-alerts";
import type { AlertRow, AlertsData } from "../types";

const WINDOW_MS = 3_600_000;
const QUERY_KEY = ["alert-notifications"] as const;
const NO_RELAY = { webrtcUrl: null, webrtcUrlLocal: null };
const TOAST_TIMEOUT_MS = 8_000;

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const announce = useEffectEvent((row: AlertRow) => {
    alarmToast.add({
      title: row.title,
      data: { row },
      timeout: TOAST_TIMEOUT_MS,
    });
  });
  useEffect(() => {
    const stopEvents = subscribeEdgeEvents((event) => {
      if (event.kind !== "alarm") return;
      const previous = queryClient.getQueryData<AlertsData>(QUERY_KEY);
      if (!previous) return;
      const alarm = alarmFromMessage(event.data);
      const names = new Map(Object.entries(previous.cameraNames));
      const row = toRow(
        event.edgeId,
        previous.relays[event.edgeId] ?? NO_RELAY,
        alarm,
        names,
      );
      const isNew = !previous.rows.some((existing) => existing.id === row.id);
      queryClient.setQueryData(QUERY_KEY, addAlert(previous, row));
      if (isNew) announce(row);
    });
    const stopReconnect = subscribeEdgeReconnect(() => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    });
    return () => {
      stopEvents();
      stopReconnect();
    };
  }, [queryClient]);
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchAlerts({ since: Date.now() - WINDOW_MS, until: null }),
    staleTime: LIVE_STALE_TIME_MS,
    refetchInterval: mqttConfig === null ? LIVE_STALE_TIME_MS : false,
  });
};
