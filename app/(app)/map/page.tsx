import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { MapSkeleton } from "@/features/map/components/map-skeleton";
import { MapView } from "@/features/map/components/map-view";
import { getMap } from "@/features/map/services/get-map";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const MapContent = async () => {
  await connection();
  const data = await redirectIfUnauthorized(getMap());
  return <MapView data={data} isLive={isLiveSource} />;
};

const Page = () => {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <MapContent />
    </Suspense>
  );
};

export default Page;
