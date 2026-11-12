import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { FloorplanSkeleton } from "@/features/floorplan/components/floorplan-skeleton";
import { FloorplanView } from "@/features/floorplan/components/floorplan-view";
import { getFloorplan } from "@/features/floorplan/services/get-floorplan";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const FloorplanContent = async () => {
  await connection();
  const data = await redirectIfUnauthorized(getFloorplan());
  return <FloorplanView data={data} isLive={isLiveSource} />;
};

const Page = () => {
  return (
    <Suspense fallback={<FloorplanSkeleton />}>
      <FloorplanContent />
    </Suspense>
  );
};

export default Page;
