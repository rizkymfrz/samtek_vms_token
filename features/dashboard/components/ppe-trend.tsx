"use client";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Dashboard } from "../services/build-dashboard";

const ppeConfig = {
  violations: { label: "Violations", color: "var(--chart-2)" },
} satisfies ChartConfig;

export const PpeTrend = ({ data }: { data: Dashboard["ppe"]["timeline"] }) => {
  return (
    <ChartContainer config={ppeConfig} className="aspect-auto h-52 w-full">
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
        <Line
          dataKey="violations"
          type="monotone"
          stroke="var(--color-violations)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
        />
      </LineChart>
    </ChartContainer>
  );
};
