import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const ToggleCard = ({
  id,
  icon,
  label,
  description,
  checked,
  onCheckedChange,
  className,
}: {
  id: string;
  icon: ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded border border-border bg-secondary p-4 text-secondary-foreground",
        className,
      )}
    >
      <span className="text-muted-foreground [&_svg:not([class*='size-'])]:size-5">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs font-normal text-muted-foreground">
          {description}
        </span>
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
};
