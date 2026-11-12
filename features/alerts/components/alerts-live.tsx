"use client";
import { useState } from "react";
import { AlertsView } from "./alerts-view";
import { useAlerts } from "../hooks/use-alerts";
import { DEFAULT_FILTERS, type Filters } from "../lib/filter-alerts";
import type { AlertsData } from "../types";

export const AlertsLive = ({
  initialData,
  isPolling,
}: {
  initialData: AlertsData;
  isPolling: boolean;
}) => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const { data, isPlaceholderData } = useAlerts(
    initialData,
    isPolling,
    filters,
  );
  return (
    <AlertsView
      data={data ?? initialData}
      filters={filters}
      onFiltersChange={setFilters}
      isLoading={isPlaceholderData}
    />
  );
};
