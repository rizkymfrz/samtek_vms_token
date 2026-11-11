import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const statusDot = cva("inline-block size-2 shrink-0", {
  variants: {
    status: {
      live: "bg-chart-2",
      offline: "bg-muted-foreground",
      danger: "bg-destructive",
      caution: "bg-chart-3",
      info: "bg-primary",
      none: "bg-transparent",
    },
    shape: {
      round: "rounded-full",
      square: "rounded border",
      diamond: "rotate-45",
    },
  },
  compoundVariants: [
    { shape: "square", status: "live", className: "border-chart-2" },
    {
      shape: "square",
      status: "offline",
      className: "border-muted-foreground bg-transparent",
    },
  ],
  defaultVariants: { status: "offline", shape: "round" },
});

export const StatusDot = ({
  status,
  shape,
  className,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof statusDot>) => {
  return (
    <span className={cn(statusDot({ status, shape }), className)} {...props} />
  );
};
