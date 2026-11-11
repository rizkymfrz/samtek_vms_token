import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";

type NativeSelectProps = Omit<ComponentProps<"select">, "size"> & {
  size?: "xs" | "sm" | "md" | "lg";
};

const NativeSelect = ({
  className,
  size = "md",
  ...props
}: NativeSelectProps) => {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className,
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="h-10 w-full min-w-0 appearance-none rounded border border-border bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] py-1 pr-8 pl-2 text-xs transition-colors outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive data-[size=xs]:h-6 data-[size=sm]:h-7 data-[size=lg]:h-12 data-[size=sm]:rounded data-[size=sm]:py-0.5 dark:aria-invalid:border-destructive/50"
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
};

const NativeSelectOption = ({
  className,
  ...props
}: ComponentProps<"option">) => {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
};

const NativeSelectOptGroup = ({
  className,
  ...props
}: ComponentProps<"optgroup">) => {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
};

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
