"use client";
import { Area, AreaChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AnalyticStats } from "../lib/analytics-overview";

const HOUR_MS = 3_600_000;

const chartConfig = {
  alarms: { label: "Alarms", color: "var(--chart-2)" },
} satisfies ChartConfig;

const hour = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
});

const rangeLabel = (at: number) =>
  `${hour.format(at)}–${hour.format(at + HOUR_MS)}`;

export const AlarmChart = ({ stats }: { stats: AnalyticStats }) => {
  const data = stats.hourly.map((alarms, index) => ({
    alarms,
    at: stats.firstHour + index * HOUR_MS,
  }));
  return (
    <div
      role="img"
      aria-label={`${stats.alarms} alarms in the last 24 hours`}
      className="flex min-h-16 flex-1 flex-col"
    >
      {stats.alarms === 0 ? (
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          No alarms
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto min-h-16 w-full flex-1"
        >
          <AreaChart
            data={data}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) =>
                    rangeLabel(payload[0].payload.at)
                  }
                />
              }
            />
            <Area
              dataKey="alarms"
              type="monotone"
              stroke="var(--color-alarms)"
              strokeWidth={2}
              fill="var(--color-alarms)"
              fillOpacity={0.1}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
};
