"use client";
import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const MIN_SIDE = 32;
const MAX_OUTPUT = 1024;
const KEY_STEP = 0.01;

type Size = { width: number; height: number };
type Crop = { x: number; y: number; width: number; height: number };
type Mode = "move" | "nw" | "ne" | "sw" | "se";

const HANDLES: { mode: Exclude<Mode, "move">; className: string }[] = [
  { mode: "nw", className: "top-0 left-0 cursor-nwse-resize" },
  { mode: "ne", className: "top-0 right-0 cursor-nesw-resize" },
  { mode: "sw", className: "bottom-0 left-0 cursor-nesw-resize" },
  { mode: "se", className: "right-0 bottom-0 cursor-nwse-resize" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isFull = (crop: Crop, size: Size) =>
  crop.x === 0 &&
  crop.y === 0 &&
  crop.width === size.width &&
  crop.height === size.height;

const moved = (from: Crop, dx: number, dy: number, size: Size): Crop => ({
  ...from,
  x: clamp(Math.round(from.x + dx), 0, size.width - from.width),
  y: clamp(Math.round(from.y + dy), 0, size.height - from.height),
});

const resized = (
  mode: Exclude<Mode, "move">,
  from: Crop,
  dx: number,
  dy: number,
  size: Size,
): Crop => {
  let left = from.x;
  let top = from.y;
  let right = from.x + from.width;
  let bottom = from.y + from.height;
  if (mode.includes("w"))
    left = clamp(Math.round(left + dx), 0, right - MIN_SIDE);
  if (mode.includes("e")) {
    right = clamp(Math.round(right + dx), left + MIN_SIDE, size.width);
  }
  if (mode.includes("n"))
    top = clamp(Math.round(top + dy), 0, bottom - MIN_SIDE);
  if (mode.includes("s")) {
    bottom = clamp(Math.round(bottom + dy), top + MIN_SIDE, size.height);
  }
  return { x: left, y: top, width: right - left, height: bottom - top };
};

export const ImageCropper = ({
  file,
  onChange,
}: {
  file: File;
  onChange: (file: File) => void;
}) => {
  const [src, setSrc] = useState<string | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [crop, setCrop] = useState<Crop | null>(null);
  const image = useRef<HTMLImageElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    mode: Mode;
    x: number;
    y: number;
    crop: Crop;
  } | null>(null);
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setSrc(String(reader.result));
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);
  const emit = (next: Crop) => {
    const element = image.current;
    if (!element || !size || isFull(next, size)) {
      onChange(file);
      return;
    }
    const scale = Math.min(1, MAX_OUTPUT / Math.max(next.width, next.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(next.width * scale);
    canvas.height = Math.round(next.height * scale);
    canvas
      .getContext("2d")
      ?.drawImage(
        element,
        next.x,
        next.y,
        next.width,
        next.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    canvas.toBlob(
      (blob) =>
        blob && onChange(new File([blob], file.name, { type: "image/jpeg" })),
      "image/jpeg",
      0.92,
    );
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!crop) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const target = event.target as HTMLElement;
    drag.current = {
      mode: (target.dataset.mode as Mode | undefined) ?? "move",
      x: event.clientX,
      y: event.clientY,
      crop,
    };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    const box = frame.current?.getBoundingClientRect();
    if (!start || !box || !size) return;
    const ratio = size.width / box.width;
    const dx = (event.clientX - start.x) * ratio;
    const dy = (event.clientY - start.y) * ratio;
    setCrop(
      start.mode === "move"
        ? moved(start.crop, dx, dy, size)
        : resized(start.mode, start.crop, dx, dy, size),
    );
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    if (crop) emit(crop);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const direction = arrows[event.key];
    if (!direction || !crop || !size) return;
    event.preventDefault();
    const step = Math.min(size.width, size.height) * KEY_STEP;
    const next = moved(crop, direction[0] * step, direction[1] * step, size);
    setCrop(next);
    emit(next);
  };
  const hole =
    crop && size
      ? {
          left: (crop.x / size.width) * 100,
          top: (crop.y / size.height) * 100,
          width: (crop.width / size.width) * 100,
          height: (crop.height / size.height) * 100,
        }
      : null;
  return (
    <div
      ref={frame}
      className="relative w-full overflow-hidden rounded border bg-sidebar"
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={image}
          src={src}
          alt="Selected photo"
          draggable={false}
          className="block h-auto w-full select-none"
          onLoad={(event) => {
            const { naturalWidth: width, naturalHeight: height } =
              event.currentTarget;
            setSize({ width, height });
            setCrop({ x: 0, y: 0, width, height });
          }}
        />
      )}
      {hole && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-background/60"
            style={{
              clipPath: `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${hole.left}% ${hole.top}%, ${hole.left}% ${hole.top + hole.height}%, ${hole.left + hole.width}% ${hole.top + hole.height}%, ${hole.left + hole.width}% ${hole.top}%, ${hole.left}% ${hole.top}%)`,
            }}
          />
          <div
            role="group"
            tabIndex={0}
            aria-label="Crop area. Drag to move or resize it, or use the arrow keys to move it."
            className="absolute cursor-move touch-none border-2 border-primary outline-none focus-visible:border-ring"
            style={{
              left: `${hole.left}%`,
              top: `${hole.top}%`,
              width: `${hole.width}%`,
              height: `${hole.height}%`,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
          >
            {HANDLES.map(({ mode, className }) => (
              <span
                key={mode}
                data-mode={mode}
                aria-hidden
                className={cn("absolute size-4 bg-primary", className)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
