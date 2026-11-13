"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  alarmFromMessage,
  clipFromMessage,
  toAlertRow,
} from "@/features/alerts";
import {
  subscribeEdgeEvents,
  subscribeEdgeReconnect,
} from "@/features/edge-status";
import { RECENT_ALARMS } from "../lib/recent-alarms";
import type { Dashboard } from "../services/build-dashboard";

const NO_RELAY = { webrtcUrl: null, webrtcUrlLocal: null };

export const useLiveAlarms = (
  initial: Dashboard["recentAlarms"],
  deviceNames: Dashboard["deviceNames"],
  relays: Dashboard["relays"],
) => {
  const router = useRouter();
  const [alarms, setAlarms] = useState(initial);
  const [seenInitial, setSeenInitial] = useState(initial);
  if (seenInitial !== initial) {
    setSeenInitial(initial);
    setAlarms(initial);
  }
  useEffect(() => {
    const names = new Map(Object.entries(deviceNames));
    const stopEvents = subscribeEdgeEvents((event) => {
      if (event.kind === "alarm") {
        if (event.data.risk_level === "low") return;
        const row = toAlertRow(
          event.edgeId,
          relays[event.edgeId] ?? NO_RELAY,
          alarmFromMessage(event.data),
          names,
        );
        setAlarms((previous) =>
          previous.some((item) => item.id === row.id)
            ? previous
            : [row, ...previous].slice(0, RECENT_ALARMS),
        );
        return;
      }
      if (event.kind === "clip") {
        const rowId = `${event.edgeId}:${event.data.event_id}`;
        setAlarms((previous) =>
          previous.map((row) => {
            if (row.id !== rowId) return row;
            const clip = clipFromMessage(
              event.edgeId,
              row.at,
              event.data,
              relays[event.edgeId] ?? NO_RELAY,
            );
            return clip ? { ...row, clip } : row;
          }),
        );
      }
    });
    const stopReconnect = subscribeEdgeReconnect(() => router.refresh());
    return () => {
      stopEvents();
      stopReconnect();
    };
  }, [deviceNames, relays, router]);
  return alarms;
};
