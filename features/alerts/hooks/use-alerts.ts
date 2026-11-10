"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchAlerts } from "../services/fetch-alerts";
import type { AlertsData } from "../types";

const POLL_INTERVAL_MS = 15_000;

export const useAlerts = (initialData: AlertsData, isPolling: boolean) =>
  useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    initialData,
    refetchInterval: isPolling ? POLL_INTERVAL_MS : false,
  });
