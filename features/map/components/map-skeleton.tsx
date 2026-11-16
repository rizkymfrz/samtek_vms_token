"use client";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MAP_STYLE_URL } from "../map-style";

export const MapSkeleton = () => {
  useEffect(() => {
    void import("maplibre-gl");
    void fetch(MAP_STYLE_URL).catch(() => undefined);
  }, []);
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96" />
    </div>
  );
};
