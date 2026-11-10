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
import type { Dashboard } from "../services/build-dashboard";

const accessConfig = {
  outside: { label: "Outside whitelist", color: "var(--chart-3)" },
  stranger: { label: "Stranger", color: "var(--destructive)" },
} satisfies ChartConfig;

export const AccessTrend = ({
  data,
}: {
  data: Dashboard["access"]["timeline"];
}) => {
  return (
    <ChartContainer config={accessConfig} className="aspect-auto h-44 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          interval={5}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={24}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {(["outside", "stranger"] as const).map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="access"
            fill={`var(--color-${key})`}
            stroke="var(--card)"
            strokeWidth={2}
            maxBarSize={24}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};
