import type { Metadata } from "next";
import { Suspense } from "react";
import { SpeakersGate } from "@/features/speakers/components/speakers-gate";
import { SpeakersSkeleton } from "@/features/speakers/components/speakers-skeleton";
import { SpeakersView } from "@/features/speakers/components/speakers-view";

export const metadata: Metadata = { title: "Speakers" };

const Page = () => {
  return (
    <Suspense fallback={<SpeakersSkeleton />}>
      <SpeakersGate render={(data) => <SpeakersView data={data} />} />
    </Suspense>
  );
};

export default Page;
