import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

export const ToolbarToggle = ({
  pressed,
  onPressedChange,
  label,
  children,
  ...props
}: Omit<ComponentProps<typeof Button>, "variant" | "size" | "onClick"> & {
  pressed: boolean;
  onPressedChange?: (pressed: boolean) => void;
  label: string;
}) => {
  return (
    <Button
      variant={pressed ? "default" : "secondary"}
      size="icon-sm"
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={() => onPressedChange?.(!pressed)}
      {...props}
    >
      {children}
    </Button>
  );
};
