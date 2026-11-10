"use client";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Dashboard } from "../services/build-dashboard";

const dustConfig = {
  level: { label: "Dust level", color: "var(--chart-2)" },
} satisfies ChartConfig;

const HIGH_RISK = 0.66;

export const DustTrend = ({
  data,
}: {
  data: Dashboard["dust"]["timeline"];
}) => {
  return (
    <ChartContainer config={dustConfig} className="aspect-auto h-52 w-full">
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          interval={3}
          tickMargin={8}
        />
        <YAxis
          domain={[0, 1]}
          tickLine={false}
          axisLine={false}
          width={32}
          tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => `${Math.round(Number(value) * 100)}%`}
            />
          }
        />
        <ReferenceLine
          y={HIGH_RISK}
          stroke="var(--destructive)"
          strokeDasharray="4 4"
          label={{
            value: "High risk",
            position: "insideTopRight",
            fill: "var(--muted-foreground)",
            fontSize: 12,
          }}
        />
        <Line
          dataKey="level"
          type="monotone"
          stroke="var(--color-level)"
          strokeWidth={2}
          dot={{
            r: 4,
            fill: "var(--color-level)",
            stroke: "var(--card)",
            strokeWidth: 2,
          }}
          activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  );
};
