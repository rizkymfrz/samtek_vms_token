"use client";
import {
  BookmarkIcon,
  CrosshairIcon,
  MinusIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { PanelSection, SidePanel } from "@/components/layout/side-panel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { PtzPresetDialog } from "./ptz-preset-dialog";
import { usePtz } from "../hooks/use-ptz";
import { PAD, scale } from "../lib/pad";
import { type PtzCamera, setPtzCamera, usePtzCamera } from "../lib/ptz-focus";

const ROWS = [PAD.slice(0, 3), PAD.slice(3, 6), PAD.slice(6, 9)];

const Stepper = ({
  label,
  minusLabel,
  plusLabel,
  onPress,
  onRelease,
}: {
  label: string;
  minusLabel: string;
  plusLabel: string;
  onPress: (direction: 1 | -1) => void;
  onRelease: () => void;
}) => {
  const release = {
    onPointerUp: onRelease,
    onPointerLeave: onRelease,
    onPointerCancel: onRelease,
  };
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="icon"
        aria-label={minusLabel}
        title={minusLabel}
        className="touch-none"
        onPointerDown={() => onPress(-1)}
        {...release}
      >
        <MinusIcon />
      </Button>
      <span className="flex-1 text-center text-xs">{label}</span>
      <Button
        variant="secondary"
        size="icon"
        aria-label={plusLabel}
        title={plusLabel}
        className="touch-none"
        onPointerDown={() => onPress(1)}
        {...release}
      >
        <PlusIcon />
      </Button>
    </div>
  );
};

const Controls = ({ edgeId, deviceId }: PtzCamera) => {
  const ptz = usePtz(edgeId, deviceId);
  const [speed, setSpeed] = useState(0.3);
  const [isAdding, setIsAdding] = useState(false);
  return (
    <>
      <PanelSection title="Direction">
        <div className="flex flex-col gap-2">
          {ROWS.map((row) => (
            <div key={row[0].label} className="flex gap-2">
              {row.map(({ label, icon, axes }) =>
                axes === "home" ? (
                  <Button
                    key={label}
                    variant="secondary"
                    size="icon"
                    aria-label={label}
                    title={label}
                    className="flex-1"
                    disabled={ptz.isBusy}
                    onClick={() => void ptz.goHome()}
                  >
                    {icon}
                  </Button>
                ) : (
                  <Button
                    key={label}
                    variant="secondary"
                    size="icon"
                    aria-label={label}
                    title={label}
                    className="flex-1 touch-none"
                    onPointerDown={() => ptz.startMove(scale(axes, speed))}
                    onPointerUp={ptz.release}
                    onPointerLeave={ptz.release}
                    onPointerCancel={ptz.release}
                  >
                    {icon}
                  </Button>
                ),
              )}
            </div>
          ))}
        </div>
      </PanelSection>
      <Separator />
      <PanelSection title="Lens">
        <Stepper
          label="Zoom"
          minusLabel="Zoom out"
          plusLabel="Zoom in"
          onPress={(direction) => ptz.startMove({ zoom: direction * speed })}
          onRelease={ptz.release}
        />
        <Stepper
          label="Focus"
          minusLabel="Decrease focus"
          plusLabel="Increase focus"
          onPress={(direction) => ptz.startFocus(direction * speed)}
          onRelease={ptz.release}
        />
      </PanelSection>
      <Separator />
      <PanelSection title="Speed scale">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>0.1</span>
          <Slider
            aria-label="Speed scale"
            value={[speed]}
            onValueChange={(value) =>
              setSpeed(Array.isArray(value) ? value[0] : value)
            }
            min={0.1}
            max={1}
            step={0.1}
          />
          <span>1.0</span>
        </div>
      </PanelSection>
      <Separator />
      <PanelSection title="Preset">
        <ul className="flex flex-col gap-2">
          {!ptz.isLoading && ptz.presets.length === 0 && (
            <li className="text-xs text-muted-foreground">
              No presets saved on this camera.
            </li>
          )}
          {ptz.presets.map(({ token, name }) => (
            <li key={token} className="flex items-center gap-2">
              <BookmarkIcon className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-xs">
                {name || `Preset ${token}`}
              </span>
              <Button
                size="icon-sm"
                aria-label={`Go to ${name || token}`}
                title="Go to preset"
                disabled={ptz.isBusy}
                onClick={() => void ptz.goPreset(token)}
              >
                <CrosshairIcon />
              </Button>
              <Button
                variant="destructive"
                size="icon-sm"
                aria-label={`Delete ${name || token}`}
                title="Delete preset"
                disabled={ptz.isBusy}
                onClick={() => void ptz.removePreset(token)}
              >
                <Trash2Icon />
              </Button>
            </li>
          ))}
        </ul>
        <Button className="w-full" onClick={() => setIsAdding(true)}>
          <PlusIcon />
          Add preset
        </Button>
      </PanelSection>
      <PtzPresetDialog
        open={isAdding}
        isPending={ptz.isBusy}
        onSave={async (name) => {
          if (await ptz.addPreset(name)) setIsAdding(false);
        }}
        onClose={() => setIsAdding(false)}
      />
    </>
  );
};

export const PtzPanel = ({ deviceId }: { deviceId?: string }) => {
  const camera = usePtzCamera();
  if (!camera || (deviceId && camera.deviceId !== deviceId)) return null;
  return (
    <SidePanel side="right" className="lg:w-52">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{camera.name}</span>
          <span className="text-xs text-muted-foreground">PTZ controls</span>
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Close PTZ controls"
          title="Close PTZ controls"
          onClick={() => setPtzCamera(null)}
        >
          <XIcon />
        </Button>
      </div>
      <Controls key={camera.deviceId} {...camera} />
    </SidePanel>
  );
};
