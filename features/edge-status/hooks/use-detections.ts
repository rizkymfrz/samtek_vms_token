"use client";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { acquireDetectionLease } from "../lib/detection-lease";
import {
  getDetections,
  getServerDetections,
  subscribeDetections,
} from "../lib/detection-store";

export const useDetections = (edgeId: string, deviceId: string) => {
  const subscribe = useCallback(
    (listener: () => void) => subscribeDetections(edgeId, deviceId, listener),
    [edgeId, deviceId],
  );
  const objects = useSyncExternalStore(
    subscribe,
    () => getDetections(edgeId, deviceId),
    getServerDetections,
  );
  useEffect(() => {
    return acquireDetectionLease(edgeId, deviceId);
  }, [edgeId, deviceId]);
  return objects;
};
