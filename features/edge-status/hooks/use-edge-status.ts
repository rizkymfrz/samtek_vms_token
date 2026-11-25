"use client";
import { useCallback, useSyncExternalStore } from "react";
import { mqttConfig } from "@/config/mqtt";
import type { DeviceFault } from "@/lib/device-state";
import {
  faultKey,
  getBodyworn,
  getEdgeCatalog,
  getEdgeRecording,
  getEdgeSearchIndex,
  getEdgeStatus,
  getFaultyDevices,
  getOnlineEdges,
  getRecordingDevice,
  getServerBodyworn,
  getServerEdgeCatalog,
  getServerEdgeRecording,
  getServerEdgeSearchIndex,
  getServerEdgeStatus,
  getServerFaultyDevices,
  getServerOnlineEdges,
  getServerRecordingDevice,
  getServerTalkDevices,
  getTalkDevices,
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

export const useDeviceFaulty = () => {
  const faulty = useSyncExternalStore(
    subscribeEdgeStatus,
    getFaultyDevices,
    getServerFaultyDevices,
  );
  return useCallback(
    (edgeId: string, deviceId: string) => {
      const fault = mqttConfig ? faulty.get(faultKey(edgeId, deviceId)) : null;
      return fault === "stream" || fault === "device";
    },
    [faulty],
  );
};

export const useDeviceFault = () => {
  const faulty = useSyncExternalStore(
    subscribeEdgeStatus,
    getFaultyDevices,
    getServerFaultyDevices,
  );
  return useCallback(
    (edgeId: string, deviceId: string): DeviceFault | null =>
      mqttConfig ? (faulty.get(faultKey(edgeId, deviceId)) ?? null) : null,
    [faulty],
  );
};

export const useTalkSupported = () => {
  const talk = useSyncExternalStore(
    subscribeEdgeStatus,
    getTalkDevices,
    getServerTalkDevices,
  );
  return useCallback(
    (edgeId: string, deviceId: string) =>
      talk.get(edgeId)?.has(deviceId) ?? false,
    [talk],
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

export const useEdgeSearchIndex = (edgeId: string) =>
  useSyncExternalStore(
    subscribeEdgeStatus,
    () => getEdgeSearchIndex(edgeId),
    getServerEdgeSearchIndex,
  );

export const useRecordingDevice = (edgeId: string, deviceId: string) =>
  useSyncExternalStore(
    subscribeEdgeStatus,
    () => getRecordingDevice(edgeId, deviceId),
    getServerRecordingDevice,
  );

export const useBodyworn = () => {
  const bodyworn = useSyncExternalStore(
    subscribeEdgeStatus,
    getBodyworn,
    getServerBodyworn,
  );
  return useCallback(
    (edgeId: string, deviceId: string) =>
      bodyworn.get(faultKey(edgeId, deviceId)) ?? null,
    [bodyworn],
  );
};
