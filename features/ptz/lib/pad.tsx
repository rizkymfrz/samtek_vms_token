import {
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  RefreshCwIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { PtzAxes } from "../hooks/use-ptz";

type PadKey = {
  label: string;
  icon: ReactNode;
  axes: PtzAxes | "home";
};

export const PAD: PadKey[] = [
  {
    label: "Move up left",
    icon: <ArrowUpLeftIcon />,
    axes: { pan: -1, tilt: 1 },
  },
  { label: "Tilt up", icon: <ChevronUpIcon />, axes: { tilt: 1 } },
  {
    label: "Move up right",
    icon: <ArrowUpRightIcon />,
    axes: { pan: 1, tilt: 1 },
  },
  { label: "Pan left", icon: <ChevronLeftIcon />, axes: { pan: -1 } },
  { label: "Go to home position", icon: <RefreshCwIcon />, axes: "home" },
  { label: "Pan right", icon: <ChevronRightIcon />, axes: { pan: 1 } },
  {
    label: "Move down left",
    icon: <ArrowDownLeftIcon />,
    axes: { pan: -1, tilt: -1 },
  },
  { label: "Tilt down", icon: <ChevronDownIcon />, axes: { tilt: -1 } },
  {
    label: "Move down right",
    icon: <ArrowDownRightIcon />,
    axes: { pan: 1, tilt: -1 },
  },
];

export const scale = (axes: PtzAxes, speed: number): PtzAxes => ({
  ...(axes.pan !== undefined && { pan: axes.pan * speed }),
  ...(axes.tilt !== undefined && { tilt: axes.tilt * speed }),
  ...(axes.zoom !== undefined && { zoom: axes.zoom * speed }),
});
