import type { LucideIcon } from "lucide-react";

export const MetaLine = ({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) => (
  <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
    <Icon className="size-3 shrink-0" />
    <span className="truncate">{text}</span>
  </span>
);
