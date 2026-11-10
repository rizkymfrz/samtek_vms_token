import { http } from "@/lib/axios/browser-client";
import type { AlertsData } from "../types";

export const fetchAlerts = async () =>
  (await http.get<AlertsData>("/api/alerts")).data;
