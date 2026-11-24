"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  scanResultSchema,
  scanStateSchema,
  startDeviceScan,
  stopDeviceScan,
  subscribeEdgeScan,
  ulid,
} from "@/features/edge-status";
import {
  isScanning,
  reduceScan,
  SCAN_IDLE,
  type ScanCredential,
} from "../lib/device-scan";

export const useDeviceScan = () => {
  const [session, dispatch] = useReducer(reduceScan, SCAN_IDLE);
  const active = useRef<{ edgeId: string; scanId: string } | null>(null);
  useEffect(
    () =>
      subscribeEdgeScan((edgeId, message) => {
        if (edgeId !== active.current?.edgeId) return;
        const result = scanResultSchema.safeParse(message);
        if (result.success) {
          dispatch({ type: "result", data: result.data.data });
          return;
        }
        const state = scanStateSchema.safeParse(message);
        if (state.success) dispatch({ type: "state", data: state.data.data });
      }),
    [],
  );
  useEffect(
    () => () => {
      const current = active.current;
      if (current)
        void stopDeviceScan(current.edgeId, current.scanId).catch(() => {});
    },
    [],
  );
  const start = useCallback(
    async (
      edgeId: string,
      ipRange: string,
      ports: number[],
      credentials: ScanCredential[],
    ) => {
      const scanId = `scan-${ulid(Date.now())}`;
      active.current = { edgeId, scanId };
      dispatch({ type: "start", scanId });
      try {
        await startDeviceScan(edgeId, { scanId, ipRange, ports, credentials });
      } catch (failure) {
        dispatch({
          type: "refused",
          message:
            failure instanceof Error
              ? failure.message
              : "The scan did not start.",
        });
      }
    },
    [],
  );
  const stop = useCallback(() => {
    const current = active.current;
    if (!current) return;
    stopDeviceScan(current.edgeId, current.scanId).catch((failure: unknown) =>
      dispatch({
        type: "local",
        message:
          failure instanceof Error
            ? failure.message
            : "Could not stop the scan.",
      }),
    );
  }, []);
  return { session, start, stop, isScanning: isScanning(session) };
};
