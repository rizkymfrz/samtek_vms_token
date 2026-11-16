import {
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
  BookmarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CrosshairIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { PtzPresetDialog } from "./ptz-preset-dialog";
import { type PtzAxes, usePtz } from "../hooks/use-ptz";

type PadKey = {
  label: string;
  icon: ReactNode;
  axes: PtzAxes | "home";
};

const PAD: PadKey[] = [
  {
    label: "Pan up left",
    icon: <ArrowUpLeftIcon />,
    axes: { pan: -1, tilt: 1 },
  },
  { label: "Tilt up", icon: <ChevronUpIcon />, axes: { tilt: 1 } },
  {
    label: "Pan up right",
    icon: <ArrowUpRightIcon />,
    axes: { pan: 1, tilt: 1 },
  },
  { label: "Pan left", icon: <ChevronLeftIcon />, axes: { pan: -1 } },
  { label: "Go to home position", icon: <RefreshCwIcon />, axes: "home" },
  { label: "Pan right", icon: <ChevronRightIcon />, axes: { pan: 1 } },
  {
    label: "Pan down left",
    icon: <ArrowDownLeftIcon />,
    axes: { pan: -1, tilt: -1 },
  },
  { label: "Tilt down", icon: <ChevronDownIcon />, axes: { tilt: -1 } },
  {
    label: "Pan down right",
    icon: <ArrowDownRightIcon />,
    axes: { pan: 1, tilt: -1 },
  },
];

const scale = (axes: PtzAxes, speed: number): PtzAxes => ({
  ...(axes.pan !== undefined && { pan: axes.pan * speed }),
  ...(axes.tilt !== undefined && { tilt: axes.tilt * speed }),
  ...(axes.zoom !== undefined && { zoom: axes.zoom * speed }),
});

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
      <span className="min-w-16 flex-1 text-center text-xs">{label}</span>
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

export const PtzControls = ({
  edgeId,
  deviceId,
}: {
  edgeId: string;
  deviceId: string;
}) => {
  const ptz = usePtz(edgeId, deviceId);
  const [speed, setSpeed] = useState(0.3);
  const [isAdding, setIsAdding] = useState(false);
  return (
    <div className="@container">
      <div className="grid gap-4 @xl:grid-cols-[auto_minmax(0,1fr)]">
        <Card className="@xl:h-48">
          <CardContent className="flex gap-4">
            <div className="flex w-52 flex-col gap-4">
              <Stepper
                label="Zoom"
                minusLabel="Zoom out"
                plusLabel="Zoom in"
                onPress={(direction) =>
                  ptz.startMove({ zoom: direction * speed })
                }
                onRelease={ptz.release}
              />
              <Stepper
                label="Focus"
                minusLabel="Focus decrease"
                plusLabel="Focus increase"
                onPress={(direction) => ptz.startFocus(direction * speed)}
                onRelease={ptz.release}
              />
              <div className="flex flex-col gap-2">
                <span className="text-xs">Speed Scale</span>
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
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-2 self-start">
              {PAD.map(({ label, icon, axes }) =>
                axes === "home" ? (
                  <Button
                    key={label}
                    variant="secondary"
                    size="icon"
                    aria-label={label}
                    title={label}
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
                    className="touch-none"
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
          </CardContent>
        </Card>
        <Card className="relative min-h-64 min-w-0 py-0 @xl:min-h-0">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex items-center gap-2 p-4">
              <BookmarkIcon className="size-4 text-muted-foreground" />
              <span className="flex-1 text-xs font-medium">Preset</span>
              <Button
                size="icon"
                aria-label="Add preset"
                title="Add preset"
                onClick={() => setIsAdding(true)}
              >
                <PlusIcon />
              </Button>
            </div>
            <Separator />
            <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
              {!ptz.isLoading && ptz.presets.length === 0 && (
                <li className="text-xs text-muted-foreground">
                  No presets saved on this camera.
                </li>
              )}
              {ptz.presets.map(({ token, name }) => (
                <li key={token} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-xs">
                    {name || `Preset ${token}`}
                  </span>
                  <Button
                    size="icon"
                    aria-label={`Go to ${name || token}`}
                    title="Go to preset"
                    disabled={ptz.isBusy}
                    onClick={() => void ptz.goPreset(token)}
                  >
                    <CrosshairIcon />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
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
          </div>
        </Card>
      </div>
      <PtzPresetDialog
        open={isAdding}
        isPending={ptz.isBusy}
        onSave={async (name) => {
          if (await ptz.addPreset(name)) setIsAdding(false);
        }}
        onClose={() => setIsAdding(false)}
      />
    </div>
  );
};
