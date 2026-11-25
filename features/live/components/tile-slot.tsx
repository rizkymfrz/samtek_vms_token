"use client";
import { type ReactNode, useState } from "react";
import { DEVICE_DRAG_TYPE } from "@/components/shared/device-tree";
import { cn } from "@/lib/utils";

export const TileSlot = ({
  cameraId,
  onPlace,
  children,
}: {
  cameraId: string | null;
  onPlace: (cameraId: string) => void;
  children: ReactNode;
}) => {
  const [isOver, setIsOver] = useState(false);
  return (
    <div
      draggable={cameraId !== null}
      onDragStart={(event) => {
        if (!cameraId) return;
        event.dataTransfer.setData(DEVICE_DRAG_TYPE, cameraId);
        event.dataTransfer.effectAllowed = "copyMove";
      }}
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
        "relative flex min-w-0 lg:h-full lg:min-h-0 [&>*]:flex-1",
        isOver &&
          "after:absolute after:inset-0 after:z-20 after:bg-primary/20 after:ring-2 after:ring-primary after:ring-inset",
      )}
    >
      {children}
    </div>
  );
};
