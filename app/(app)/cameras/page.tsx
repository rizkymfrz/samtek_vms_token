import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { CamerasSkeleton } from "@/features/cameras/components/cameras-skeleton";
import { CamerasView } from "@/features/cameras/components/cameras-view";
import { getCameras } from "@/features/cameras/services/get-cameras";
import { UnauthorizedError } from "@/lib/auth/session";

const CamerasContent = async () => {
  await connection();
  const data = await getCameras().catch((error) => {
    if (error instanceof UnauthorizedError) redirect("/login");
    throw error;
  });
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
