import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { EndpointAddress } from "@/config/endpoints";
import { browserLocalAddress } from "../lib/browser-local-address";
import { fetchInstalledCentral } from "../lib/installed-central";

export const useLocalAddress = (): EndpointAddress | null => {
  const { data, isError } = useQuery({
    queryKey: ["endpoints", "default"],
    queryFn: fetchInstalledCentral,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });
  const installed = isError ? "" : data;
  return useMemo(() => {
    if (installed === undefined) return null;
    const derived = browserLocalAddress();
    return { ...derived, centralUrl: derived.centralUrl || installed };
  }, [installed]);
};
