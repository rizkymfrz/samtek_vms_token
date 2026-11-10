"use client";
import { AlertsView } from "./alerts-view";
import { useAlerts } from "../hooks/use-alerts";
import type { AlertsData } from "../types";

export const AlertsLive = ({
  initialData,
  isPolling,
}: {
  initialData: AlertsData;
  isPolling: boolean;
}) => {
  const { data } = useAlerts(initialData, isPolling);
  return <AlertsView data={data} />;
};
