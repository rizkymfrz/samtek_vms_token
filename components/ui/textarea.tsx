import { cn } from "cn";
import type { ComponentProps } from "react";

const Textarea = ({ className, ...props }: ComponentProps<"textarea">) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded border border-border bg-secondary text-secondary-foreground px-2 py-2 text-xs transition-colors outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-xs dark:aria-invalid:border-destructive/50",
        className,
      )}
      {...props}
    />
  );
};

export { Textarea };
