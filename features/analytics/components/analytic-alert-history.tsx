"use client";
import { BellIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { RiskBadge } from "@/components/shared/risk-badge";
import {
  AlertDetailDialog,
  AlertImage,
  type AlertsData,
  useAlerts,
} from "@/features/alerts";
import { HistoryPanel } from "./analytic-history-panel";
import { rangeFilters } from "../lib/range-filters";

export const AnalyticAlertHistory = ({
  analyticIds,
  initialAlerts,
  isLive,
}: {
  analyticIds: string[];
  initialAlerts: AlertsData;
  isLive: boolean;
}) => {
  const [range, setRange] = useState<DateRange>();
  const [openId, setOpenId] = useState<string | null>(null);
  const filters = useMemo(() => rangeFilters(range), [range]);
  const { data } = useAlerts(initialAlerts, isLive, filters);
  const alerts = data ?? initialAlerts;
  const rows = useMemo(
    () => alerts.rows.filter((row) => analyticIds.includes(row.analyticId)),
    [alerts.rows, analyticIds],
  );
  const open = alerts.rows.find((row) => row.id === openId) ?? null;
  return (
    <>
      <HistoryPanel
        title="Alert History"
        emptyIcon={BellIcon}
        emptyTitle="No alerts"
        emptyDescription="No alerts from this analytic yet."
        items={rows}
        range={range}
        onRangeChange={setRange}
        onSelect={setOpenId}
        renderItem={(alert) => (
          <>
            <AlertImage
              path={alert.imagePath}
              src={alert.imageUrl}
              iconClassName="size-8"
              className="w-full"
            />
            <span className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{alert.title}</span>
              <RiskBadge level={alert.risk} />
            </span>
            <span className="flex items-center justify-between gap-2 text-muted-foreground">
              <span className="truncate">{alert.camera}</span>
              <span className="shrink-0 tabular-nums">
                {alert.time.slice(0, 5)} · {alert.date}
              </span>
            </span>
          </>
        )}
      />
      <AlertDetailDialog alert={open} onClose={() => setOpenId(null)} />
    </>
  );
};
