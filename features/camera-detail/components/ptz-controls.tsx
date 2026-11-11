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
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

const PAD: { label: string; icon: ReactNode }[] = [
  { label: "Pan up left", icon: <ArrowUpLeftIcon /> },
  { label: "Tilt up", icon: <ChevronUpIcon /> },
  { label: "Pan up right", icon: <ArrowUpRightIcon /> },
  { label: "Pan left", icon: <ChevronLeftIcon /> },
  { label: "Go to home position", icon: <RefreshCwIcon /> },
  { label: "Pan right", icon: <ChevronRightIcon /> },
  { label: "Pan down left", icon: <ArrowDownLeftIcon /> },
  { label: "Tilt down", icon: <ChevronDownIcon /> },
  { label: "Pan down right", icon: <ArrowDownRightIcon /> },
];

const PRESETS = Array.from({ length: 8 }, (_, index) => `Preset ${index + 1}`);

const Stepper = ({ label }: { label: string }) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="icon" aria-label={`${label} out`}>
        <MinusIcon />
      </Button>
      <span className="min-w-16 flex-1 text-center text-xs">{label}</span>
      <Button variant="secondary" size="icon" aria-label={`${label} in`}>
        <PlusIcon />
      </Button>
    </div>
  );
};

export const PtzControls = () => {
  return (
    <div className="@container">
      <div className="grid gap-4 @xl:grid-cols-[auto_minmax(0,1fr)]">
        <Card className="@xl:h-48">
          <CardContent className="flex gap-4">
            <div className="flex w-52 flex-col gap-4">
              <Stepper label="Zoom" />
              <Stepper label="Focus" />
              <div className="flex flex-col gap-2">
                <span className="text-xs">Speed Scale</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>0</span>
                  <Slider
                    aria-label="Speed scale"
                    defaultValue={[0.3]}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                  <span>1.0</span>
                </div>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-2 self-start">
              {PAD.map(({ label, icon }) => (
                <Button
                  key={label}
                  variant="secondary"
                  size="icon"
                  aria-label={label}
                  title={label}
                >
                  {icon}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="relative min-h-64 min-w-0 py-0 @xl:min-h-0">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex items-center gap-2 p-4">
              <BookmarkIcon className="size-4 text-muted-foreground" />
              <span className="flex-1 text-xs font-medium">Preset</span>
              <Button size="icon" aria-label="Add preset" title="Add preset">
                <PlusIcon />
              </Button>
            </div>
            <Separator />
            <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
              {PRESETS.map((name) => (
                <li key={name} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-xs">
                    {name}
                  </span>
                  <Button
                    size="icon"
                    aria-label={`Go to ${name}`}
                    title="Go to preset"
                  >
                    <CrosshairIcon />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    aria-label={`Delete ${name}`}
                    title="Delete preset"
                  >
                    <Trash2Icon />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};
