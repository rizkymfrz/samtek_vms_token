import { cn } from "@/lib/utils";

const CORNER = "absolute size-4 border-primary/40";

export const CornerBrackets = () => {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-2">
      <span className={cn(CORNER, "top-0 left-0 border-t border-l")} />
      <span className={cn(CORNER, "top-0 right-0 border-t border-r")} />
      <span className={cn(CORNER, "bottom-0 left-0 border-b border-l")} />
      <span className={cn(CORNER, "right-0 bottom-0 border-r border-b")} />
    </div>
  );
};
