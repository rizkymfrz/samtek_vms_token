import { FlameIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusDot } from "@/components/shared/status-dot";
import { cn } from "@/lib/utils";
import type { Dashboard } from "../services/build-dashboard";

const MARKS = {
  fire: { label: "Fire", shape: "round", status: "danger" },
  smoke: { label: "Smoke", shape: "diamond", status: "caution" },
} as const;

const Mark = ({
  kind,
  className,
}: {
  kind: keyof typeof MARKS;
  className?: string;
}) => {
  return (
    <StatusDot
      shape={MARKS[kind].shape}
      status={MARKS[kind].status}
      className={className}
    />
  );
};

export const FireStatus = ({ fire }: { fire: Dashboard["fire"] }) => {
  const alarm = fire.total > 0;
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FlameIcon className="size-4" />
            <span className="text-xs">Fire & smoke</span>
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              alarm ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {alarm
              ? `${fire.total} ${fire.total === 1 ? "alarm" : "alarms"}`
              : "All clear"}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="relative h-4">
            <div className="absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 bg-muted" />
            {[0.25, 0.5, 0.75].map((tick) => (
              <span
                key={tick}
                className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-border"
                style={{ left: `calc(4px + (100% - 8px) * ${tick})` }}
              />
            ))}
            <div className="absolute inset-x-1 inset-y-0">
              {fire.events.map((event) => (
                <span
                  key={event.id}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 p-1"
                  style={{ left: `${event.position * 100}%` }}
                  title={`${MARKS[event.kind].label} · ${event.device} · ${event.time}`}
                >
                  <Mark kind={event.kind} className="block ring-2 ring-card" />
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            {fire.axis.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="truncate text-muted-foreground">
            {fire.last
              ? `Last: ${fire.last.device} · ${fire.last.time}`
              : "No fire or smoke alarms in 24 hours."}
          </span>
          <div className="flex shrink-0 items-center gap-4">
            <span className="flex items-center gap-2">
              <Mark kind="fire" />
              Fire <span className="font-medium tabular-nums">{fire.fire}</span>
            </span>
            <span className="flex items-center gap-2">
              <Mark kind="smoke" />
              Smoke{" "}
              <span className="font-medium tabular-nums">{fire.smoke}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
