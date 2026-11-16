"use client";
import { useCallback, useSyncExternalStore } from "react";
import { mqttConfig } from "@/config/mqtt";
import {
  faultKey,
  getEdgeCatalog,
  getEdgeRecording,
  getEdgeStatus,
  getFaultyDevices,
  getOnlineEdges,
  getRecordingDevice,
  getServerEdgeCatalog,
  getServerEdgeRecording,
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
    (edgeId: string, deviceId: string) =>
      mqttConfig ? faulty.has(faultKey(edgeId, deviceId)) : false,
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

export const useRecordingDevice = (edgeId: string, deviceId: string) =>
  useSyncExternalStore(
    subscribeEdgeStatus,
    () => getRecordingDevice(edgeId, deviceId),
    getServerRecordingDevice,
  );
