"use client";
import { useCallback, useSyncExternalStore } from "react";
import { mqttConfig } from "@/config/mqtt";
import {
  getEdgeStatus,
  getOnlineEdges,
  getServerEdgeStatus,
  getServerOnlineEdges,
  subscribeEdgeStatus,
} from "../lib/edge-status-store";

export const useEdgeStatus = () =>
  useSyncExternalStore(subscribeEdgeStatus, getEdgeStatus, getServerEdgeStatus);

export const useServerOnline = () => {
  const online = useSyncExternalStore(
    subscribeEdgeStatus,
    getOnlineEdges,
    getServerOnlineEdges,
  );
  return useCallback(
    (server: { code: string; isActive: boolean }, fallback: boolean) =>
      mqttConfig ? server.isActive && online.has(server.code) : fallback,
    [online],
  );
};
