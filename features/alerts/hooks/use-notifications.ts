"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { mqttConfig } from "@/config/mqtt";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import {
  subscribeEdgeEvents,
  subscribeEdgeReconnect,
} from "@/features/edge-status";
import { alarmFromMessage, toRow } from "../lib/alarm-row";
import { addAlert } from "../lib/merge-alerts";
import { fetchAlerts } from "../services/fetch-alerts";
import type { AlertsData } from "../types";

const WINDOW_MS = 3_600_000;
const QUERY_KEY = ["alert-notifications"] as const;
const NO_RELAY = { webrtcUrl: null, webrtcUrlLocal: null };

export const useNotifications = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const stopEvents = subscribeEdgeEvents((event) => {
      if (event.kind !== "alarm") return;
      queryClient.setQueryData<AlertsData>(QUERY_KEY, (previous) => {
        if (!previous) return previous;
        const alarm = alarmFromMessage(event.data);
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
      });
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
