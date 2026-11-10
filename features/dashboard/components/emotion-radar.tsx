"use client";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { BarItem } from "../types";

const emotionConfig = {
  value: { label: "Faces", color: "var(--chart-2)" },
} satisfies ChartConfig;

export const EmotionRadar = ({ items }: { items: BarItem[] }) => {
  return (
    <ChartContainer config={emotionConfig} className="aspect-auto h-60 w-full">
      <RadarChart
        data={items.map((item) => ({ emotion: item.label, value: item.value }))}
      >
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <PolarGrid />
        <PolarAngleAxis dataKey="emotion" />
        <Radar
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill="var(--color-value)"
          fillOpacity={0.1}
          dot={{
            r: 4,
            fill: "var(--color-value)",
            stroke: "var(--card)",
            strokeWidth: 2,
          }}
        />
      </RadarChart>
    </ChartContainer>
  );
};
