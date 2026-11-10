import { connection } from "next/server";
import { Suspense } from "react";
import { FloorplanSkeleton } from "@/features/floorplan/components/floorplan-skeleton";
import { FloorplanView } from "@/features/floorplan/components/floorplan-view";
import { buildFloorplan } from "@/features/floorplan/services/build-floorplan";

const FloorplanContent = async () => {
  await connection();
  return <FloorplanView data={buildFloorplan()} />;
};

const Page = () => {
  return (
    <Suspense fallback={<FloorplanSkeleton />}>
      <FloorplanContent />
    </Suspense>
  );
};

export default Page;
