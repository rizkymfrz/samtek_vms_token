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
            <div className="relative h-2 bg-muted">
              <div
                className="h-full bg-chart-2"
                style={{ width: `${(area.peak / scale) * 100}%` }}
              />
              <span
                className="absolute inset-y-0 w-0.5 bg-foreground"
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
