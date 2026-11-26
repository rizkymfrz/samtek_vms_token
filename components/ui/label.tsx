"use client";
import { cn } from "cn";
import type { ComponentProps } from "react";

const Label = ({ className, ...props }: ComponentProps<"label">) => {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-xs leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-foreground-disabled peer-disabled:cursor-not-allowed peer-disabled:text-foreground-disabled",
        className,
      )}
      {...props}
    />
  );
};

export { Label };
