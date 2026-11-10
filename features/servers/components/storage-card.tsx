import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LevelBadge } from "./level-badge";
import { Stats } from "./stats";
import { percentLevel, storageTotals } from "../lib/metric-level";
import type { Metrics } from "../types";

const gb = (value: number) =>
  `${value.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} GB`;

const PARTS = [
  { key: "recordings", label: "Recordings", color: "bg-chart-3" },
  { key: "analytics", label: "Analytics", color: "bg-chart-2" },
  { key: "system", label: "System", color: "bg-chart-1" },
  { key: "free", label: "Free", color: "bg-muted" },
] as const;

export const StorageCard = ({
  storage,
  empty,
}: {
  storage: Metrics["storage"];
  empty?: string;
}) => {
  const { used, total, percent } = storageTotals(storage);
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Storage Usage</span>
            <span className="text-xs text-muted-foreground">Current</span>
          </div>
          {!empty && (
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm font-semibold tabular-nums">
                {percent}%
              </span>
              <LevelBadge level={percentLevel(percent)} />
            </div>
          )}
        </div>
        {empty ? (
          <p className="flex min-h-40 flex-1 items-center justify-center border border-dashed text-xs text-muted-foreground">
            {empty}
          </p>
        ) : (
          <>
            <div
              className="flex min-h-24 flex-1 gap-0.5"
              role="img"
              aria-label={`${percent}% of the disk is used`}
            >
              {PARTS.map((part) => (
                <div
                  key={part.key}
                  className={cn("h-full", part.color)}
                  style={{ width: `${(storage[part.key] / total) * 100}%` }}
                  title={`${part.label}: ${gb(storage[part.key])}`}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              {PARTS.map((part) => (
                <div key={part.key} className="flex items-center gap-2">
                  <span className={cn("size-2 shrink-0", part.color)} />
                  <span className="flex-1 text-muted-foreground">
                    {part.label}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {gb(storage[part.key])}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
        {!empty && (
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <Stats
              items={[
                ["Used", gb(used)],
                ["Free", gb(storage.free)],
                [
                  "Retention",
                  storage.retentionDays === null
                    ? "—"
                    : `${storage.retentionDays} days`,
                ],
              ]}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
