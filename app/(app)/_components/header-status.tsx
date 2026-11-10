import { CameraIcon, ServerIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CAMERAS, SERVERS, type DeviceStatus } from "./dummy-data";

const MAX_SEGMENTS = 12;

const Bar = ({ items }: { items: { status: DeviceStatus }[] }) => {
  const online = items.filter((item) => item.status === "online").length;
  if (items.length > MAX_SEGMENTS) {
    return (
      <div className="flex h-1 w-24 bg-destructive">
        <div
          className="bg-chart-2"
          style={{ width: `${(online / items.length) * 100}%` }}
        />
      </div>
    );
  }
  return (
    <div className="flex gap-0.5">
      {items.map((item, index) => (
        <span
          key={index}
          className={cn(
            "h-1 w-2",
            item.status === "online" ? "bg-chart-2" : "bg-destructive",
          )}
        />
      ))}
    </div>
  );
};

const Status = ({
  icon: Icon,
  label,
  items,
}: {
  icon: LucideIcon;
  label: string;
  items: { status: DeviceStatus }[];
}) => {
  const online = items.filter((item) => item.status === "online").length;
  const text = `${label}: ${online} of ${items.length} online`;
  return (
    <div className="flex items-center gap-2" title={text} aria-label={text}>
      <Icon className="size-4 text-muted-foreground" />
      <Bar items={items} />
      <span className="font-medium tabular-nums">
        {online}/{items.length}
      </span>
    </div>
  );
};

export const HeaderStatus = () => {
  return (
    <div className="hidden items-center gap-4 text-xs xl:flex">
      <Status icon={CameraIcon} label="Cameras" items={CAMERAS} />
      <Status icon={ServerIcon} label="Servers" items={SERVERS} />
    </div>
  );
};
