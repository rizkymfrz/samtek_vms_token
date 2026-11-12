import { MediaTile } from "@/components/shared/media-tile";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
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
    <MediaTile
      label={`${alert.title}, ${alert.camera}, ${alert.risk} risk, ${alert.time}`}
      title={alert.title}
      subtitle={alert.camera}
      topStart={
        <Badge variant="overlay" className="capitalize">
          <StatusDot status={alert.risk === "high" ? "danger" : "caution"} />
          {alert.risk}
        </Badge>
      }
      topEnd={
        <Badge variant="overlay" className="text-muted-foreground tabular-nums">
          {alert.time.slice(0, 5)} · {alert.date}
        </Badge>
      }
      onSelect={onSelect}
      className={className}
    >
      <AlertImage
        path={alert.imagePath}
        src={alert.imageUrl}
        iconClassName="size-8"
        className="absolute inset-0 aspect-auto size-full border-0"
      />
    </MediaTile>
  );
};
