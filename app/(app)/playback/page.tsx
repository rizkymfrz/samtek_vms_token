import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { LiveSkeleton } from "@/features/live/components/live-skeleton";
import { getLive } from "@/features/live/services/get-live";
import { PlaybackView } from "@/features/playback";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const PlaybackContent = async () => {
  await connection();
  const data = await redirectIfUnauthorized(getLive());
  return <PlaybackView data={data} isLive={isLiveSource} />;
};

export const metadata: Metadata = { title: "Playback" };

const Page = () => {
  return (
    <Suspense fallback={<LiveSkeleton />}>
      <PlaybackContent />
    </Suspense>
  );
};

export default Page;
