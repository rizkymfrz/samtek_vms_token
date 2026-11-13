import { Progress } from "@/components/ui/progress";
import type { Dashboard } from "../services/build-dashboard";

export const CrowdBullets = ({
  areas,
}: {
  areas: Dashboard["crowd"]["areas"];
}) => {
  return (
    <ul className="flex flex-col gap-4">
      {areas.map((area) => {
        const scale = Math.max(area.peak, area.max) * 1.1;
        return (
          <li key={area.area} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span>{area.area}</span>
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">
                  {area.peak}
                </span>{" "}
                / {area.max} people · {area.alarms}{" "}
                {area.alarms === 1 ? "alarm" : "alarms"}
              </span>
            </div>
            <div className="relative">
              <Progress
                value={area.peak}
                max={scale}
                variant="segmented"
                filledClassName="data-filled:bg-chart-2"
                aria-label={`${area.area} peak headcount`}
              />
              <span
                className="absolute -inset-y-1 w-0.5 bg-foreground"
                style={{ left: `${(area.max / scale) * 100}%` }}
                title={`Limit: ${area.max}`}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};
