"use client";
import { useCallback, useSyncExternalStore } from "react";
import { mqttConfig } from "@/config/mqtt";
import {
  getEdgeCatalog,
  getEdgeRecording,
  getEdgeStatus,
  getOnlineEdges,
  getRecordingDevice,
  getServerEdgeCatalog,
  getServerEdgeRecording,
  getServerEdgeStatus,
  getServerOnlineEdges,
  getServerRecordingDevice,
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

export const useEdgeRecording = (edgeId: string) =>
  useSyncExternalStore(
    subscribeEdgeStatus,
    () => getEdgeRecording(edgeId),
    getServerEdgeRecording,
  );

export const useRecordingDevice = (edgeId: string, deviceId: string) =>
  useSyncExternalStore(
    subscribeEdgeStatus,
    () => getRecordingDevice(edgeId, deviceId),
    getServerRecordingDevice,
  );
