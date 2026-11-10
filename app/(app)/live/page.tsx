import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { LiveSkeleton } from "@/features/live/components/live-skeleton";
import { LiveView } from "@/features/live/components/live-view";
import { getLive } from "@/features/live/services/get-live";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const LiveContent = async () => {
  await connection();
  const data = await redirectIfUnauthorized(getLive());
  return <LiveView data={data} isLive={isLiveSource} />;
};

const Page = () => {
  return (
    <Suspense fallback={<LiveSkeleton />}>
      <LiveContent />
    </Suspense>
  );
};

export default Page;
