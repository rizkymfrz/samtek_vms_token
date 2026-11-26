"use client";
import { useEffect, useSyncExternalStore } from "react";
import { applyEndpointsCookie, endpointsStore } from "../lib/endpoints-store";

export const EndpointsSync = () => {
  const { status, value } = useSyncExternalStore(
    endpointsStore.subscribe,
    endpointsStore.getSnapshot,
    endpointsStore.getServerSnapshot,
  );
  useEffect(() => {
    if (status === "ready" && applyEndpointsCookie(value)) {
      window.location.reload();
    }
  }, [status, value]);
  return null;
};
