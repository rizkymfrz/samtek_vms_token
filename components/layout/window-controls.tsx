"use client";
import { MaximizeIcon, MinimizeIcon, MinusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDesktop, useDesktopFullscreen } from "@/hooks/use-desktop";

export const WindowControls = () => {
  const desktop = useDesktop();
  const fullscreen = useDesktopFullscreen(desktop);
  if (!desktop) return null;
  return (
    <>
      <Separator orientation="vertical" className="mx-2" />
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Minimize"
          onClick={desktop.minimize}
        >
          <MinusIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={desktop.toggleFullscreen}
        >
          {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close"
          className="hover:bg-destructive hover:text-destructive-foreground"
          onClick={desktop.close}
        >
          <XIcon />
        </Button>
      </div>
    </>
  );
};
