"use client";
import { useEffect, useState } from "react";
import { DEVICE_DRAG_TYPE } from "@/components/shared/device-tree";

export const useDeviceDrag = () => {
  const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    const start = (event: DragEvent) =>
      setIsDragging(
        event.dataTransfer?.types.includes(DEVICE_DRAG_TYPE) ?? false,
      );
    const end = () => setIsDragging(false);
    document.addEventListener("dragstart", start);
    document.addEventListener("dragend", end);
    document.addEventListener("drop", end);
    return () => {
      document.removeEventListener("dragstart", start);
      document.removeEventListener("dragend", end);
      document.removeEventListener("drop", end);
    };
  }, []);
  return isDragging;
};
