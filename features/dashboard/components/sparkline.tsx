"use client";
import { Area, AreaChart } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

const sparklineConfig = {
  value: { label: "Count", color: "var(--chart-2)" },
} satisfies ChartConfig;

export const Sparkline = ({ data }: { data: number[] }) => {
  return (
    <ChartContainer
      config={sparklineConfig}
      className="aspect-auto h-16 w-full"
    >
      <AreaChart
        data={data.map((value) => ({ value }))}
        margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
      >
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
