import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { CamerasSkeleton } from "@/features/cameras/components/cameras-skeleton";
import { CamerasView } from "@/features/cameras/components/cameras-view";
import { getCameras } from "@/features/cameras/services/get-cameras";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const CamerasContent = async () => {
  await connection();
  const data = await redirectIfUnauthorized(getCameras());
  return <CamerasView data={data} isLive={isLiveSource} />;
};

const Page = () => {
  return (
    <Suspense fallback={<CamerasSkeleton />}>
      <CamerasContent />
    </Suspense>
  );
};

export default Page;
