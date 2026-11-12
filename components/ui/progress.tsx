"use client";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "cn";

const Progress = ({
  className,
  children,
  value,
  min = 0,
  max = 100,
  variant = "line",
  segments = 20,
  ...props
}: ProgressPrimitive.Root.Props & {
  variant?: "line" | "segmented";
  segments?: number;
}) => {
  const ratio = value === null ? 0 : (value - min) / (max - min);
  return (
    <ProgressPrimitive.Root
      value={value}
      min={min}
      max={max}
      data-slot="progress"
      className={cn("flex flex-wrap gap-4", className)}
      {...props}
    >
      {children}
      {variant === "segmented" ? (
        <ProgressSegments count={segments} ratio={ratio} />
      ) : (
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      )}
    </ProgressPrimitive.Root>
  );
};

const ProgressSegments = ({
  count,
  ratio,
}: {
  count: number;
  ratio: number;
}) => {
  const filled = Math.round(Math.min(1, Math.max(0, ratio)) * count);
  return (
    <ProgressTrack className="h-2 min-w-0 gap-0.5 overflow-visible rounded-none bg-transparent">
      {Array.from({ length: count }, (_, segment) => segment).map((segment) => (
        <div
          key={segment}
          data-slot="progress-segment"
          data-filled={segment < filled ? "" : undefined}
          className="h-full flex-1 rounded-[1px] bg-muted data-filled:bg-primary"
        />
      ))}
    </ProgressTrack>
  );
};

const ProgressTrack = ({
  className,
  ...props
}: ProgressPrimitive.Track.Props) => {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded bg-muted",
        className,
      )}
      data-slot="progress-track"
      {...props}
    />
  );
};

const ProgressIndicator = ({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) => {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full bg-primary transition-all", className)}
      {...props}
    />
  );
};

const ProgressLabel = ({
  className,
  ...props
}: ProgressPrimitive.Label.Props) => {
  return (
    <ProgressPrimitive.Label
      className={cn("text-xs", className)}
      data-slot="progress-label"
      {...props}
    />
  );
};

const ProgressValue = ({
  className,
  ...props
}: ProgressPrimitive.Value.Props) => {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-xs text-muted-foreground tabular-nums",
        className,
      )}
      data-slot="progress-value"
      {...props}
    />
  );
};

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
};
