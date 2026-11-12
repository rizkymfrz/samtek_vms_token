import { http } from "@/lib/axios/browser-client";
import type { AlertsData, AlertsQuery } from "../types";

export const fetchAlerts = async ({ since, until }: AlertsQuery) =>
  (
    await http.get<AlertsData>("/api/alerts", {
      params: { since, ...(until !== null && { until }) },
    })
  ).data;
