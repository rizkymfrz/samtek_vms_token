"use client";
import { Area, AreaChart, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const sparklineConfig = {
  value: { label: "Count", color: "var(--chart-2)" },
} satisfies ChartConfig;

export const Sparkline = ({
  data,
  labels,
}: {
  data: number[];
  labels: string[];
}) => {
  return (
    <ChartContainer
      config={sparklineConfig}
      className="aspect-auto h-16 w-full"
    >
      <AreaChart
        data={data.map((value, index) => ({
          value,
          label: labels[index] ?? "",
        }))}
        margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
      >
        <XAxis dataKey="label" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill="var(--color-value)"
          fillOpacity={0.1}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
};
