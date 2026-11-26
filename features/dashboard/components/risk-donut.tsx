import { DonutChart } from "./donut-chart";
import { riskConfig } from "../lib/risk-config";
import type { Dashboard } from "../types";

export const RiskDonut = ({ data }: { data: Dashboard["riskTotals"] }) => {
  return (
    <DonutChart
      config={riskConfig}
      data={data.map((item) => ({ key: item.level, count: item.count }))}
      unit="alarms"
    />
  );
};
