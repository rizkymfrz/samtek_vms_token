import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const MediaTile = ({
  label,
  title,
  subtitle,
  topStart,
  topEnd,
  onSelect,
  className,
  children,
}: {
  label: string;
  title: string;
  subtitle: string;
  topStart?: ReactNode;
  topEnd?: ReactNode;
  onSelect: () => void;
  className?: string;
  children: ReactNode;
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      className={cn(
        "group relative aspect-video w-full cursor-pointer overflow-hidden border-r border-b bg-sidebar text-left text-sidebar-foreground outline-none",
        className,
      )}
    >
      {children}
      {(topStart || topEnd) && (
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
          {topStart}
          {topEnd}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 p-2">
        <Badge variant="overlay" className="max-w-full">
          <span className="truncate">{title}</span>
        </Badge>
        <Badge variant="overlay" className="max-w-full text-muted-foreground">
          <span className="truncate">{subtitle}</span>
        </Badge>
      </div>
    </button>
  );
};
