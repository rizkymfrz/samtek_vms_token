import type { BarItem } from "../types";

export const BarList = ({
  items,
  format = String,
}: {
  items: BarItem[];
  format?: (value: number) => string;
}) => {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.label} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span>{item.label}</span>
            <span className="font-medium tabular-nums">
              {format(item.value)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-muted">
            <div
              className="h-full bg-chart-2"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};
