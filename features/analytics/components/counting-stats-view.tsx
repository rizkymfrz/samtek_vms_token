"use client";
import {
  ArrowLeftIcon,
  BoxIcon,
  CalendarIcon,
  CctvIcon,
  ChartColumnIcon,
  ClockIcon,
  FlameIcon,
  HourglassIcon,
  TimerIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { SidePanel } from "@/components/layout/side-panel";
import { DateRangeDialog } from "@/components/shared/date-range-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlertsData } from "@/features/alerts";
import { CameraTile, type LiveData } from "@/features/live";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { messageOf } from "@/lib/axios/browser-client";
import { AnalyticAlertHistory } from "./analytic-alert-history";
import { CameraPicker } from "./camera-picker";
import { CountingStatsChart } from "./counting-stats-chart";
import { StatCard } from "./stat-card";
import { useAnalyticTiles } from "../hooks/use-analytic-tiles";
import { useCountingStats } from "../hooks/use-counting-stats";
import type { AnalyticGroup } from "../lib/analytic-groups";
import {
  bucketLabel,
  chartRows,
  clock,
  labelsOf,
  peakLabel,
  type StatsMetric,
  summarize,
} from "../lib/stats-summary";
import { statsWindow } from "../lib/stats-window";
import type { StatsBucket } from "../types";

const ALL = "all";

const BUCKETS = [
  { value: "hour", label: "Hourly" },
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

const METRICS = [
  { value: "count", label: "Line count" },
  { value: "objects", label: "Objects in area" },
  { value: "stay", label: "Stay time (min)" },
];

const PEAK_TITLE: Record<StatsBucket, string> = {
  hour: "Busiest hour",
  day: "Busiest day",
  week: "Busiest week",
  month: "Busiest month",
};

const rangeText = (range: DateRange | undefined) => {
  if (!range?.from) return "Today";
  const { since, until } = statsWindow(range, Date.now());
  const from = bucketLabel(since, "day");
  const to = bucketLabel((until ?? Date.now()) - 1, "day");
  return from === to ? from : `${from} – ${to}`;
};

export const CountingStatsView = ({
  group,
  live,
  alerts,
}: {
  group: Pick<AnalyticGroup, "slug" | "title" | "analyticIds">;
  live: LiveData;
  alerts: AlertsData;
}) => {
  const tiles = useAnalyticTiles(live, group.analyticIds);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bucket, setBucket] = useState<StatsBucket>("hour");
  const [metric, setMetric] = useState<StatsMetric>("count");
  const [label, setLabel] = useState(ALL);
  const [range, setRange] = useState<DateRange>();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const tile = tiles.find(({ id }) => id === selectedId) ?? tiles[0] ?? null;
  const { data, error, isPending } = useCountingStats({
    edgeId: tile?.serverId ?? null,
    deviceId: tile?.id ?? null,
    bucket,
    range,
  });
  useFailureToast("Failed to load statistics", [
    error ? messageOf(error, "Failed to load statistics.") : null,
  ]);
  const labels = useMemo(() => (data ? labelsOf(data) : []), [data]);
  const active = labels.includes(label) ? label : ALL;
  const shown = useMemo(
    () => (active === ALL ? labels : [active]),
    [active, labels],
  );
  const summary = useMemo(
    () => data && summarize(data, active === ALL ? null : active),
    [data, active],
  );
  const rows = useMemo(
    () => (data ? chartRows(data, metric, shown) : []),
    [data, metric, shown],
  );
  return (
    <div className="flex min-h-full flex-1 flex-col lg:min-h-0 lg:flex-row">
      <SidePanel side="left">
        <CameraPicker
          tiles={tiles}
          selectedId={tile?.id ?? null}
          onSelect={setSelectedId}
        />
      </SidePanel>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0 lg:overflow-y-auto">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            aria-label={`Back to ${group.title}`}
            title={`Back to ${group.title}`}
            nativeButton={false}
            render={<Link href={`/analytics/${group.slug}`} />}
          >
            <ArrowLeftIcon />
          </Button>
          <h1 className="mr-auto text-sm font-medium">
            {group.title} | Statistics
          </h1>
          <Pick
            label="Object"
            icon={BoxIcon}
            items={[
              { value: ALL, label: "All objects" },
              ...labels.map((name) => ({ value: name, label: name })),
            ]}
            value={active}
            onChange={setLabel}
          />
          <Pick
            label="Interval"
            icon={TimerIcon}
            items={BUCKETS}
            value={bucket}
            onChange={(next) => setBucket(next as StatsBucket)}
          />
          <Button variant="secondary" onClick={() => setIsPickerOpen(true)}>
            <CalendarIcon />
            {rangeText(range)}
          </Button>
        </div>
        <DateRangeDialog
          open={isPickerOpen}
          onOpenChange={setIsPickerOpen}
          title="Statistics date range"
          value={range}
          onChange={setRange}
        />
        {!tile ? (
          <EmptyState
            icon={<CctvIcon />}
            title="No cameras"
            description={`No camera is using ${group.title} yet.`}
          />
        ) : (
          <>
            <div className="grid grid-cols-[14rem_minmax(0,1fr)_18rem] gap-4">
              <div className="grid grid-rows-4 gap-2">
                {isPending || !summary ? (
                  Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-full min-h-24" />
                  ))
                ) : (
                  <>
                    <StatCard
                      icon={ClockIcon}
                      label="Average stay time"
                      value={clock(summary.averageStaySeconds)}
                      hint={`Per object · ${summary.objects} ${summary.objects === 1 ? "object" : "objects"}`}
                    />
                    <StatCard
                      icon={HourglassIcon}
                      label="Total stay time"
                      value={clock(summary.staySeconds)}
                      hint="All objects in the areas"
                    />
                    <StatCard
                      icon={UsersIcon}
                      label="Line count"
                      value={String(summary.total)}
                      hint={
                        summary.total === 0
                          ? "No line crossings"
                          : "Crossings on all lines"
                      }
                    />
                    <StatCard
                      icon={FlameIcon}
                      label={PEAK_TITLE[bucket]}
                      value={
                        data && summary.peakIndex !== null
                          ? peakLabel(data.buckets[summary.peakIndex], bucket)
                          : "—"
                      }
                      hint={
                        summary.peakIndex === null
                          ? "No activity yet"
                          : `${summary.peakActivity} counted or dwelling`
                      }
                    />
                  </>
                )}
              </div>
              <div className="relative min-h-64 overflow-hidden rounded border bg-sidebar">
                <CameraTile
                  key={tile.id}
                  tile={tile}
                  quality="sub"
                  className="absolute inset-0 aspect-auto h-full border-0"
                />
              </div>
              <div className="relative min-h-64 rounded border bg-card">
                <div className="absolute inset-0 flex flex-col p-4">
                  <AnalyticAlertHistory
                    analyticIds={group.analyticIds}
                    cameraName={tile.name}
                    initialAlerts={alerts}
                  />
                </div>
              </div>
            </div>
            <Card size="sm" className="min-h-80 flex-1">
              <CardHeader className="grid-cols-[1fr_auto]">
                <CardTitle>{tile.name}</CardTitle>
                <CardAction>
                  <Pick
                    label="Metric"
                    icon={ChartColumnIcon}
                    items={METRICS}
                    value={metric}
                    onChange={(next) => setMetric(next as StatsMetric)}
                    className="w-44"
                  />
                </CardAction>
              </CardHeader>
              <CardContent className="min-h-0 flex-1">
                {isPending ? (
                  <Skeleton className="h-full min-h-56" />
                ) : (
                  <CountingStatsChart
                    labels={shown}
                    rows={rows}
                    className="h-full min-h-56"
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
