import { CctvIcon, type LucideIcon, ServerIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DeviceStatus = "online" | "offline";
type Items = { status: DeviceStatus }[];

const MAX_SEGMENTS = 12;

const Bar = ({ items }: { items: Items }) => {
  const online = items.filter((item) => item.status === "online").length;
  if (items.length > MAX_SEGMENTS) {
    return (
      <div className="flex h-1 w-24 overflow-hidden rounded bg-destructive">
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
            "h-1 w-2 rounded",
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
  items: Items;
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

export const HeaderStatus = ({
  cameras,
  servers,
}: {
  cameras: Items;
  servers: Items;
}) => {
  return (
    <div className="hidden items-center gap-4 text-xs xl:flex">
      <Status icon={CctvIcon} label="Cameras" items={cameras} />
      <Status icon={ServerIcon} label="Servers" items={servers} />
    </div>
  );
};
