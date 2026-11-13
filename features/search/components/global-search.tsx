"use client";
import { HeaderSearch } from "@/components/layout/header-search";
import { useDeviceList } from "@/features/cameras";
import { useFloorplanList } from "@/features/floorplan";

export const GlobalSearch = () => {
  const { data: devices } = useDeviceList();
  const { data: floorplan } = useFloorplanList();
  return (
    <HeaderSearch
      cameras={devices?.cameras ?? []}
      servers={devices?.servers ?? []}
      floorplans={(floorplan?.plans ?? []).map((plan) => ({
        id: plan.id,
        name: plan.label,
      }))}
    />
  );
};
