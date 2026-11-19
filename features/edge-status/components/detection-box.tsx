import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  FootprintsIcon,
  GlassesIcon,
  HandIcon,
  HardHatIcon,
  type LucideIcon,
  ShieldAlertIcon,
  ShirtIcon,
  TriangleAlertIcon,
  VenetianMaskIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { detailOf, STATUS_LABEL, toneOf } from "../lib/detection-status";
import type { DetectionObject, DetectionStatus } from "../types";

const STATUS_ICON: Record<DetectionStatus, LucideIcon> = {
  ok: CircleCheckIcon,
  warning: TriangleAlertIcon,
  alert: CircleAlertIcon,
  unknown: CircleHelpIcon,
};

const ITEM_ICON: Record<string, LucideIcon> = {
  helmet: HardHatIcon,
  vest: ShirtIcon,
  mask: VenetianMaskIcon,
  gloves: HandIcon,
  glove: HandIcon,
  boots: FootprintsIcon,
  shoes: FootprintsIcon,
  glasses: GlassesIcon,
  goggles: GlassesIcon,
};

const CORNERS = [
  "top-0 left-0 border-t-2 border-l-2",
  "top-0 right-0 border-t-2 border-r-2",
  "bottom-0 left-0 border-b-2 border-l-2",
  "right-0 bottom-0 border-r-2 border-b-2",
];

const percent = (value: number) => `${value * 100}%`;

export const DetectionBox = ({
  object,
  analyticId,
  isInstant = false,
}: {
  object: DetectionObject;
  analyticId: string | null | undefined;
  isInstant?: boolean;
}) => {
  const caption = `${object.label} ${Math.round(object.confidence * 100)}%`;
  const StatusIcon = object.status ? STATUS_ICON[object.status] : null;
  const detail = detailOf(object);
  return (
    <div
      className={cn(
        "absolute border-2 border-current",
        !isInstant &&
          "transition-[left,top,width,height] duration-100 ease-linear",
        toneOf(object, analyticId),
      )}
      style={{
        left: percent(object.x1),
        top: percent(object.y1),
        width: percent(object.x2 - object.x1),
        height: percent(object.y2 - object.y1),
      }}
    >
      {CORNERS.map((corner) => (
        <span
          key={corner}
          className={cn("absolute size-3 border-current", corner)}
        />
      ))}
      <div className="absolute bottom-full -left-px mb-0.5 flex max-w-full flex-col-reverse items-start gap-0.5">
        <span className="flex max-w-full items-center gap-1 border-l-2 border-current bg-detect-label px-2 font-mono text-[10px] leading-4 tracking-wider uppercase">
          {StatusIcon && object.status && (
            <StatusIcon
              aria-label={STATUS_LABEL[object.status]}
              className="size-3 shrink-0"
            />
          )}
          <span className="truncate text-detect-label-foreground">
            {caption}
          </span>
          {detail && (
            <span className="shrink-0 text-detect-label-foreground">
              {detail}
            </span>
          )}
        </span>
        {object.missingItems && object.missingItems.length > 0 && (
          <span className="flex flex-wrap gap-0.5">
            {object.missingItems.map((item) => {
              const ItemIcon = ITEM_ICON[item.toLowerCase()] ?? ShieldAlertIcon;
              return (
                <span
                  key={item}
                  className="flex items-center gap-1 bg-detect-label px-2 font-mono text-[10px] leading-4 tracking-wider text-detect-label-foreground uppercase"
                >
                  <ItemIcon className="size-3 shrink-0 text-detect-red" />
                  No {item}
                </span>
              );
            })}
          </span>
        )}
      </div>
    </div>
  );
};
