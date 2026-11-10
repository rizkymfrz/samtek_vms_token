import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const AlertImage = ({
  path,
  className,
  iconClassName,
}: {
  path: string;
  className?: string;
  iconClassName?: string;
}) => {
  return (
    <div
      role="img"
      aria-label={`Snapshot ${path}`}
      className={cn(
        "flex aspect-video items-center justify-center border bg-sidebar text-muted-foreground",
        className,
      )}
    >
      <ImageIcon className={cn("size-4", iconClassName)} />
    </div>
  );
};
