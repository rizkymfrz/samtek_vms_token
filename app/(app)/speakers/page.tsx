import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { SpeakersSkeleton } from "@/features/speakers/components/speakers-skeleton";
import { SpeakersView } from "@/features/speakers/components/speakers-view";
import { getSpeakersIfAllowed } from "@/features/speakers/services/get-speakers";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const SpeakersContent = async () => {
  await connection();
  const data = await redirectIfUnauthorized(getSpeakersIfAllowed());
  if (!data) {
    return (
      <p className="p-8 text-center text-xs text-muted-foreground">
        You do not have permission to view speakers.
      </p>
    );
  }
  return <SpeakersView data={data} />;
};

export const metadata: Metadata = { title: "Speakers" };

const Page = () => {
  return (
    <Suspense fallback={<SpeakersSkeleton />}>
      <SpeakersContent />
    </Suspense>
  );
};

export default Page;
