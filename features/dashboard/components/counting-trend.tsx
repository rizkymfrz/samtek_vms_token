"use client";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Dashboard } from "../services/build-dashboard";

const COLORS = ["var(--chart-1)", "var(--chart-4)"];

export const CountingTrend = ({
  series,
  data,
}: Pick<Dashboard["counting"], "series" | "data">) => {
  const config: ChartConfig = Object.fromEntries(
    series.map((label, index) => [
      `s${index}`,
      { label, color: COLORS[index] },
    ]),
  );
  return (
    <ChartContainer config={config} className="aspect-auto h-52 w-full">
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
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={32}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((_, index) => (
          <Line
            key={index}
            dataKey={`s${index}`}
            type="monotone"
            stroke={`var(--color-s${index})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};
