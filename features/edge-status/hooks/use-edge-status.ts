"use client";
import { useCallback, useSyncExternalStore } from "react";
import { mqttConfig } from "@/config/mqtt";
import {
  getEdgeCatalog,
  getEdgeStatus,
  getOnlineEdges,
  getServerEdgeCatalog,
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
    (server: { id: string; isActive: boolean }, fallback: boolean) =>
      mqttConfig ? server.isActive && online.has(server.id) : fallback,
    [online],
  );
};

export const useAnalyticCatalog = (edgeId: string) =>
  useSyncExternalStore(
    subscribeEdgeStatus,
    () => getEdgeCatalog(edgeId),
    getServerEdgeCatalog,
  );
