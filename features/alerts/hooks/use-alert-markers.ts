"use client";
import { useState } from "react";
import { useAlerts } from "./use-alerts";
import { toneByTitle } from "../lib/alert-tones";
import { CUSTOM_RANGE, DEFAULT_FILTERS, toDateKey } from "../lib/filter-alerts";

export const ALL_ALERTS = "all";

export const useAlertMarkers = (
  day: Date,
  cameraNames: string[],
  isLive: boolean,
) => {
  const key = toDateKey(day);
  const { data } = useAlerts(undefined, isLive, {
    ...DEFAULT_FILTERS,
    range: CUSTOM_RANGE,
    from: key,
    to: key,
  });
  const [selected, setSelected] = useState(ALL_ALERTS);
  const names = new Set(cameraNames);
  const alerts = (data?.rows ?? []).filter((row) => names.has(row.camera));
  const tones = toneByTitle(alerts.map((alert) => alert.title));
  const value = tones.has(selected) ? selected : ALL_ALERTS;
  return {
    value,
    onChange: setSelected,
    items: [
      { value: ALL_ALERTS, label: "All alerts" },
      ...[...tones.keys()].map((title) => ({ value: title, label: title })),
    ],
    markers: alerts.flatMap((alert) => {
      const tone = tones.get(alert.title);
      return tone && (value === ALL_ALERTS || alert.title === value)
        ? { id: alert.id, at: alert.at, label: alert.title, className: tone }
        : [];
    }),
  };
};
