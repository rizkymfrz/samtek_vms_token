"use client";
import { type ReactNode, useState } from "react";
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

const X_TICKS = [-60, -45, -30, -15, 0];
const secondLabel = (second: number) => (second === 0 ? "now" : `${second}s`);

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
  footer?: ReactNode;
  empty?: string;
}) => {
  const config: ChartConfig = {
    value: { label: `${title} (${unit})`, color: "var(--chart-2)" },
  };
  const [isHovered, setIsHovered] = useState(false);
  const data = points.map((point, index) => ({
    second: index - (points.length - 1),
    value: point,
  }));
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{title}</span>
            <span className="text-xs text-muted-foreground">Last 60 sec</span>
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
          <p className="flex min-h-40 flex-1 items-center justify-center rounded border border-dashed text-xs text-muted-foreground">
            {empty}
          </p>
        ) : (
          <div
            className="relative min-h-40 flex-1"
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
          >
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
                  dataKey="second"
                  type="number"
                  domain={[-60, 0]}
                  ticks={X_TICKS}
                  tickFormatter={secondLabel}
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
                  active={isHovered ? undefined : false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(_, items) => {
                        const second = Number(items?.[0]?.payload?.second ?? 0);
                        return second === 0 ? "now" : `${-second} sec ago`;
                      }}
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
                  activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
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
