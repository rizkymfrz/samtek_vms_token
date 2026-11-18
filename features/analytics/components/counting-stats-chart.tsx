"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-5)",
  "var(--chart-2)",
  "var(--chart-4)",
];

export const CountingStatsChart = ({
  labels,
  rows,
  className,
}: {
  labels: string[];
  rows: Record<string, number | string>[];
  className?: string;
}) => {
  const config: ChartConfig = Object.fromEntries(
    labels.map((label, index) => [
      `s${index}`,
      { label, color: COLORS[index % COLORS.length] },
    ]),
  );
  return (
    <ChartContainer
      config={config}
      className={cn("aspect-auto h-64 w-full", className)}
    >
      <BarChart data={rows} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="at"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={32}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {labels.map((_, index) => (
          <Bar
            key={index}
            dataKey={`s${index}`}
            stackId="stats"
            fill={`var(--color-s${index})`}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};
