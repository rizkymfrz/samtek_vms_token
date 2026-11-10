import { riskConfig } from "../lib/risk-config";
import type { Dashboard } from "../services/build-dashboard";
import { DonutChart } from "./donut-chart";

export const RiskDonut = ({ data }: { data: Dashboard["riskTotals"] }) => {
  return (
    <DonutChart
      config={riskConfig}
      data={data.map((item) => ({ key: item.level, count: item.count }))}
      unit="alarms"
    />
  );
};
