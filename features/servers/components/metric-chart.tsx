"use client";
import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LevelBadge } from "./level-badge";
import type { Level } from "../lib/metric-level";

const config = {
  value: { label: "Value", color: "var(--chart-2)" },
} satisfies ChartConfig;

const X_TICKS = [-60, -45, -30, -15, 0];
const minuteLabel = (minute: number) => (minute === 0 ? "now" : `${minute}m`);

export const MetricChart = ({
  title,
  value,
  level,
  points,
  domain,
  ticks,
  unit,
  limit,
  footer,
  empty,
}: {
  title: string;
  value: string;
  level: Level;
  points: number[];
  domain: [number, number];
  ticks: number[];
  unit: string;
  limit?: number;
  footer: React.ReactNode;
  empty?: string;
}) => {
  const data = points.map((point, index) => ({
    minute: index - (points.length - 1),
    value: point,
  }));
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{title}</span>
            <span className="text-xs text-muted-foreground">Last 60 min</span>
          </div>
          {!empty && (
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm font-semibold tabular-nums">
                {value}
              </span>
              <LevelBadge level={level} />
            </div>
          )}
        </div>
        {empty ? (
          <p className="flex min-h-40 flex-1 items-center justify-center border border-dashed text-xs text-muted-foreground">
            {empty}
          </p>
        ) : (
          <div className="relative min-h-40 flex-1">
            <ChartContainer
              config={config}
              className="absolute inset-0 aspect-auto size-full"
            >
              <AreaChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="minute"
                  type="number"
                  domain={[-60, 0]}
                  ticks={X_TICKS}
                  tickFormatter={minuteLabel}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="font-mono"
                />
                <YAxis
                  domain={domain}
                  ticks={ticks}
                  tickFormatter={(tick: number) => `${tick}${unit}`}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  className="font-mono"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(_, items) => {
                        const minute = Number(items?.[0]?.payload?.minute ?? 0);
                        return minute === 0 ? "now" : `${-minute} min ago`;
                      }}
                      formatter={(v) => `${v}${unit}`}
                    />
                  }
                />
                {limit !== undefined && (
                  <ReferenceLine
                    y={limit}
                    stroke="var(--destructive)"
                    strokeDasharray="4 4"
                  />
                )}
                <Area
                  dataKey="value"
                  type="monotone"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  fill="var(--color-value)"
                  fillOpacity={0.15}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
        {!empty && footer && (
          <div className="border-t pt-4 text-xs text-muted-foreground">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
