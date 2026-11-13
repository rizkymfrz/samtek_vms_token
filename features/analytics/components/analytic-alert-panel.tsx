"use client";
import { BellIcon, CalendarIcon, HistoryIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { PanelEmpty } from "@/components/layout/side-panel";
import { DateRangeDialog } from "@/components/shared/date-range-dialog";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { AlertImage, type AlertRow } from "@/features/alerts";
import { CompactPager } from "./compact-pager";

const PAGE_SIZE = 10;

export const AnalyticAlertPanel = ({
  alerts,
  range,
  onRangeChange,
  onSelect,
}: {
  alerts: AlertRow[];
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  onSelect: (id: string) => void;
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [requestedPage, setPage] = useState(0);
  const lastPage = Math.max(0, Math.ceil(alerts.length / PAGE_SIZE) - 1);
  const page = Math.min(requestedPage, lastPage);
  const visible = alerts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex h-10 shrink-0 items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-medium">
          <HistoryIcon className="size-4" aria-hidden />
          Alert History
        </span>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Filter by date"
          title="Filter by date"
          onClick={() => setIsPickerOpen(true)}
        >
          <CalendarIcon />
        </Button>
      </div>
      <DateRangeDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        title="Alert date range"
        value={range}
        onChange={(next) => {
          onRangeChange(next);
          setPage(0);
        }}
      />
      {alerts.length === 0 ? (
        <PanelEmpty
          icon={<BellIcon />}
          title="No alerts"
          description="No alerts from this analytic yet."
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col border max-lg:max-h-svh">
          <ul key={page} className="min-h-0 flex-1 overflow-y-auto">
            {visible.map((alert) => (
              <li key={alert.id} className="border-b last:border-b-0">
                <button
                  type="button"
                  onClick={() => onSelect(alert.id)}
                  className="flex w-full flex-col gap-2 p-2 text-left text-xs outline-none hover:bg-accent focus-visible:bg-accent"
                >
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
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t p-2">
            <CompactPager
              page={page}
              pageSize={PAGE_SIZE}
              total={alerts.length}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};
