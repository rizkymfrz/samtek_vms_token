import { cn } from "cn";
import type { ComponentProps } from "react";

const Skeleton = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none bg-muted", className)}
      {...props}
    />
  );
};

export { Skeleton };
