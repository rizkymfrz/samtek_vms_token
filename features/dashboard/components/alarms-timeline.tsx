"use client";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { riskConfig } from "../lib/risk-config";
import type { Dashboard } from "../services/build-dashboard";

export const AlarmsTimeline = ({ data }: { data: Dashboard["timeline"] }) => {
  return (
    <ChartContainer config={riskConfig} className="aspect-auto h-72 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          interval={2}
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
        {(["medium", "high"] as const).map((level) => (
          <Area
            key={level}
            dataKey={level}
            type="monotone"
            stackId="alarms"
            stroke={`var(--color-${level})`}
            strokeWidth={2}
            fill={`var(--color-${level})`}
            fillOpacity={0.35}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
};
