import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";
import type { ComponentProps } from "react";

const inputSizes = {
  md: "h-10",
  xs: "h-6",
  sm: "h-7",
  lg: "h-12",
} as const;

const Input = ({
  className,
  type,
  size = "md",
  ...props
}: Omit<ComponentProps<"input">, "size"> & {
  size?: keyof typeof inputSizes;
}) => {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        inputSizes[size],
        "w-full min-w-0 rounded border border-border bg-secondary text-secondary-foreground px-2 py-1 text-xs transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-xs dark:aria-invalid:border-destructive/50",
        className,
      )}
      {...props}
    />
  );
};

export { Input };
