"use client";
import { useEffect, useSyncExternalStore } from "react";
import { hostnameOf, scopeOf, withLocalAddress } from "@/config/endpoints";
import { useLocalAddress } from "../hooks/use-local-address";
import { applyEndpointsCookie, endpointsStore } from "../lib/endpoints-store";

export const EndpointsSync = () => {
  const { status, value } = useSyncExternalStore(
    endpointsStore.subscribe,
    endpointsStore.getSnapshot,
    endpointsStore.getServerSnapshot,
  );
  const derived = useLocalAddress();
  useEffect(() => {
    if (status !== "ready" || !derived) return;
    const isLocal = scopeOf(hostnameOf(window.location.hostname)) === "local";
    const next = isLocal ? withLocalAddress(value, derived) : value;
    if (next !== value) endpointsStore.update(() => next);
    if (applyEndpointsCookie(next)) window.location.reload();
  }, [status, value, derived]);
  return null;
};
