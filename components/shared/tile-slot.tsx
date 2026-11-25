"use client";
import { type ReactNode, useRef, useState } from "react";
import { DEVICE_DRAG_TYPE } from "@/components/shared/device-tree";
import { cn } from "@/lib/utils";

export const TileSlot = ({
  cameraId,
  dragPreview,
  isDragging,
  onPlace,
  children,
}: {
  cameraId: string | null;
  dragPreview: ReactNode;
  isDragging: boolean;
  onPlace: (cameraId: string) => void;
  children: ReactNode;
}) => {
  const preview = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);
  const [isSource, setIsSource] = useState(false);
  return (
    <div
      draggable={cameraId !== null}
      onDragStart={(event) => {
        if (!cameraId) return;
        event.dataTransfer.setData(DEVICE_DRAG_TYPE, cameraId);
        event.dataTransfer.effectAllowed = "move";
        if (preview.current)
          event.dataTransfer.setDragImage(preview.current, 96, 54);
        setIsSource(true);
      }}
      onDragEnd={() => setIsSource(false)}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes(DEVICE_DRAG_TYPE)) return;
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setIsOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsOver(false);
        const dropped = event.dataTransfer.getData(DEVICE_DRAG_TYPE);
        if (dropped && dropped !== cameraId) onPlace(dropped);
      }}
      className={cn(
        "relative flex min-w-0 transition-opacity lg:h-full lg:min-h-0 [&>*]:flex-1",
        cameraId && "cursor-grab active:cursor-grabbing",
        isDragging && "[&>*]:pointer-events-none",
        isSource && "opacity-40",
        isDragging &&
          !cameraId &&
          "bg-muted/40 outline-1 -outline-offset-4 outline-dashed outline-border",
      )}
    >
      {children}
      {isDragging && isOver && !isSource && (
        <div className="pointer-events-none absolute inset-0 z-20 bg-primary/20 ring-2 ring-primary ring-inset" />
      )}
      {cameraId && dragPreview && (
        <div
          ref={preview}
          aria-hidden
          className="pointer-events-none fixed top-0 -left-[9999px] w-48"
        >
          {dragPreview}
        </div>
      )}
    </div>
  );
};
