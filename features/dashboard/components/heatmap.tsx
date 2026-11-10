import type { Dashboard } from "../services/build-dashboard";

const tint = (count: number, max: number) =>
  `color-mix(in oklch, var(--chart-2) ${Math.round((count / max) * 100)}%, var(--muted))`;
export const Heatmap = ({
  rows,
  hours,
}: {
  rows: Dashboard["heatmap"];
  hours: string[];
}) => {
  const max = Math.max(...rows.flatMap((row) => row.hours), 1);
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div
          key={row.device}
          className="grid grid-cols-[6rem_1fr] items-center gap-2"
        >
          <span className="truncate text-xs text-muted-foreground">
            {row.device}
          </span>
          <div className="grid grid-cols-24 gap-0.5">
            {row.hours.map((count, index) => (
              <span
                key={index}
                className="h-4"
                style={{ backgroundColor: tint(count, max) }}
                title={`${row.device} · ${hours[index]} · ${count} ${count === 1 ? "alarm" : "alarms"}`}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-[6rem_1fr] items-center gap-2">
        <span />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{hours[0]}</span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-0.5">
              {[0, 0.25, 0.5, 0.75, 1].map((step) => (
                <span
                  key={step}
                  className="size-2"
                  style={{ backgroundColor: tint(step * max, max) }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
          <span>{hours[hours.length - 1]}</span>
        </div>
      </div>
    </div>
  );
};
