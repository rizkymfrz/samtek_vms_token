"use client";
import { useEffect, useState } from "react";
import { listPtzPresets } from "@/features/edge-status";

const probes = new Map<string, Promise<boolean>>();

const probe = (edgeId: string, deviceId: string) => {
  const key = `${edgeId}:${deviceId}`;
  const cached = probes.get(key);
  if (cached) return cached;
  const result = listPtzPresets(edgeId, deviceId).then(
    () => true,
    () => false,
  );
  probes.set(key, result);
  return result;
};

export const usePtzSupport = (edgeId: string, deviceId: string) => {
  const [isSupported, setIsSupported] = useState(false);
  useEffect(() => {
    let isCurrent = true;
    void probe(edgeId, deviceId).then((ok) => isCurrent && setIsSupported(ok));
    return () => {
      isCurrent = false;
    };
  }, [edgeId, deviceId]);
  return isSupported;
};
