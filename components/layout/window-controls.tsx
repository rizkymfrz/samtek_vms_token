import { MaximizeIcon, MinusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const WindowControls = () => {
  return (
    <>
      <Separator orientation="vertical" className="mx-2" />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" aria-label="Minimize">
          <MinusIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Fullscreen">
          <MaximizeIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close"
          className="hover:bg-destructive hover:text-destructive-foreground"
        >
          <XIcon />
        </Button>
      </div>
    </>
  );
};
