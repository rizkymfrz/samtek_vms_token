import { connection } from "next/server";
import { Suspense } from "react";
import { CamerasSkeleton } from "@/features/cameras/components/cameras-skeleton";
import { CamerasView } from "@/features/cameras/components/cameras-view";
import { buildCameras } from "@/features/cameras/services/build-cameras";

const CamerasContent = async () => {
  await connection();
  return <CamerasView data={buildCameras()} />;
};

const Page = () => {
  return (
    <Suspense fallback={<CamerasSkeleton />}>
      <CamerasContent />
    </Suspense>
  );
};

export default Page;
