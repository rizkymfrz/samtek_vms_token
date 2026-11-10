import type { ChartConfig } from "@/components/ui/chart";

export const riskConfig = {
  medium: { label: "Medium", color: "var(--chart-3)" },
  high: { label: "High", color: "var(--destructive)" },
} satisfies ChartConfig;
