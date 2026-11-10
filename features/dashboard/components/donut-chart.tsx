"use client";
import { Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const CENTER_Y = "45%";

export const DonutChart = ({
  config,
  data,
  unit,
  className,
}: {
  config: ChartConfig;
  data: { key: string; count: number }[];
  unit: string;
  className?: string;
}) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const slices = data.map((item) => ({
    ...item,
    fill: `var(--color-${item.key})`,
  }));
  return (
    <div className={cn("relative h-60 w-full", className)}>
      <ChartContainer config={config} className="aspect-auto size-full">
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent hideLabel nameKey="key" />}
          />
          <Pie
            data={slices}
            dataKey="count"
            nameKey="key"
            innerRadius={56}
            outerRadius={80}
            stroke="var(--card)"
            strokeWidth={2}
            cy={CENTER_Y}
          />
          <ChartLegend content={<ChartLegendContent nameKey="key" />} />
        </PieChart>
      </ChartContainer>
      <div
        className="pointer-events-none absolute inset-x-0 flex -translate-y-1/2 flex-col items-center"
        style={{ top: CENTER_Y }}
      >
        <span className="text-2xl font-semibold tabular-nums">{total}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
};
