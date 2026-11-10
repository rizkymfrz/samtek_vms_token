import { connection } from "next/server";
import { Suspense } from "react";
import { LiveSkeleton } from "@/features/live/components/live-skeleton";
import { LiveView } from "@/features/live/components/live-view";
import { buildLive } from "@/features/live/services/build-live";

const LiveContent = async () => {
  await connection();
  return <LiveView data={buildLive()} />;
};

const Page = () => {
  return (
    <Suspense fallback={<LiveSkeleton />}>
      <LiveContent />
    </Suspense>
  );
};

export default Page;
