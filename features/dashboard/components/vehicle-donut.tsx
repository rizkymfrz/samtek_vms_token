import type { ChartConfig } from "@/components/ui/chart";
import type { Dashboard } from "../services/build-dashboard";
import { DonutChart } from "./donut-chart";

const vehicleConfig = {
  car: { label: "Car", color: "var(--chart-1)" },
  motorbike: { label: "Motorbike", color: "var(--chart-3)" },
  unknown: { label: "Unknown", color: "var(--chart-5)" },
} satisfies ChartConfig;

export const VehicleDonut = ({
  types,
}: {
  types: Dashboard["vehicles"]["types"];
}) => {
  return (
    <DonutChart
      config={vehicleConfig}
      data={types}
      unit="reads"
      className="h-52"
    />
  );
};
