import { type LucideIcon, MaximizeIcon, MinusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CONTROLS: {
  label: string;
  icon: LucideIcon;
  variant: "secondary" | "destructive";
}[] = [
  { label: "Minimize", icon: MinusIcon, variant: "secondary" },
  { label: "Fullscreen", icon: MaximizeIcon, variant: "secondary" },
  { label: "Close", icon: XIcon, variant: "destructive" },
];

export const WindowControls = () => {
  return (
    <>
      <Separator orientation="vertical" className="mx-2" />
      <div className="flex items-center gap-2">
        {CONTROLS.map(({ label, icon: Icon, variant }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Button variant={variant} size="icon-sm" aria-label={label} />
              }
            >
              <Icon />
            </TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </>
  );
};
