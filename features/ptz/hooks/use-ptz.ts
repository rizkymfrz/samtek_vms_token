"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import {
  callPtzPreset,
  deletePtzPreset,
  focusPtz,
  homePtz,
  listPtzPresets,
  movePtz,
  type PtzPreset,
  setPtzPreset,
  stopPtz,
} from "@/features/edge-status";

const MOVE_MS = 2000;
const FOCUS_MS = 500;
const RESEND_MS = 1000;
const FOCUS_RESEND_MS = 300;

export type PtzAxes = { pan?: number; tilt?: number; zoom?: number };

const fail = (title: string, failure: unknown) =>
  toast.add({
    title,
    description:
      failure instanceof Error
        ? failure.message
        : "The command could not be completed.",
    type: "error",
  });

export const usePtz = (edgeId: string, deviceId: string) => {
  const [presets, setPresets] = useState<PtzPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const timer = useRef<number | null>(null);
  const clearTimer = useCallback(() => {
    if (timer.current === null) return;
    window.clearInterval(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => {
    let isCurrent = true;
    listPtzPresets(edgeId, deviceId)
      .then((list) => isCurrent && setPresets(list))
      .catch(() => undefined)
      .finally(() => isCurrent && setIsLoading(false));
    return () => {
      isCurrent = false;
      if (timer.current === null) return;
      window.clearInterval(timer.current);
      timer.current = null;
      void stopPtz(edgeId, deviceId).catch(() => undefined);
    };
  }, [edgeId, deviceId]);
  const hold = useCallback(
    (send: () => Promise<unknown>, resendMs: number) => {
      clearTimer();
      const run = () =>
        send().catch((failure) => {
          clearTimer();
          fail("Failed to send the PTZ command", failure);
        });
      void run();
      timer.current = window.setInterval(run, resendMs);
    },
    [clearTimer],
  );
  const startMove = useCallback(
    (axes: PtzAxes) =>
      hold(
        () => movePtz(edgeId, deviceId, { ...axes, durationMs: MOVE_MS }),
        RESEND_MS,
      ),
    [edgeId, deviceId, hold],
  );
  const startFocus = useCallback(
    (speed: number) =>
      hold(() => focusPtz(edgeId, deviceId, speed, FOCUS_MS), FOCUS_RESEND_MS),
    [edgeId, deviceId, hold],
  );
  const release = useCallback(() => {
    if (timer.current === null) return;
    clearTimer();
    stopPtz(edgeId, deviceId).catch((failure) =>
      fail("Failed to stop the PTZ movement", failure),
    );
  }, [edgeId, deviceId, clearTimer]);
  const act = useCallback(
    async (title: string, command: () => Promise<unknown>) => {
      clearTimer();
      setIsBusy(true);
      try {
        await command();
        return true;
      } catch (failure) {
        fail(title, failure);
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [clearTimer],
  );
  const goHome = useCallback(
    () =>
      act("Failed to move the camera to its home position", () =>
        homePtz(edgeId, deviceId),
      ),
    [act, edgeId, deviceId],
  );
  const goPreset = useCallback(
    (token: string) =>
      act("Failed to move the camera to the preset", () =>
        callPtzPreset(edgeId, deviceId, token),
      ),
    [act, edgeId, deviceId],
  );
  const addPreset = useCallback(
    (name: string) =>
      act("Failed to save the preset", async () => {
        const preset = await setPtzPreset(edgeId, deviceId, name);
        setPresets((current) => [...current, preset]);
      }),
    [act, edgeId, deviceId],
  );
  const removePreset = useCallback(
    (token: string) =>
      act("Failed to delete the preset", async () => {
        await deletePtzPreset(edgeId, deviceId, token);
        setPresets((current) => current.filter((p) => p.token !== token));
      }),
    [act, edgeId, deviceId],
  );
  return {
    presets,
    isLoading,
    isBusy,
    startMove,
    startFocus,
    release,
    goHome,
    goPreset,
    addPreset,
    removePreset,
  };
};
