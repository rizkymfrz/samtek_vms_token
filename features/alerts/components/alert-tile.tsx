import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertImage } from "./alert-image";
import type { AlertRow } from "../types";

export const AlertTile = ({
  alert,
  onSelect,
  className,
}: {
  alert: AlertRow;
  onSelect: () => void;
  className?: string;
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${alert.title}, ${alert.camera}, ${alert.risk} risk, ${alert.time}`}
      className={cn(
        "group relative aspect-video w-full overflow-hidden border-r border-b bg-sidebar text-left text-sidebar-foreground outline-none",
        className,
      )}
    >
      <AlertImage
        path={alert.imagePath}
        src={alert.imageUrl}
        iconClassName="size-8"
        className="absolute inset-0 aspect-auto size-full border-0"
      />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
        <Badge variant="overlay" className="capitalize">
          <StatusDot status={alert.risk === "high" ? "danger" : "caution"} />
          {alert.risk}
        </Badge>
        <Badge variant="overlay" className="text-muted-foreground tabular-nums">
          {alert.time.slice(0, 5)} · {alert.date}
        </Badge>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col p-2">
        <span className="truncate text-sm font-medium">{alert.title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {alert.camera}
        </span>
      </div>
    </button>
  );
};
