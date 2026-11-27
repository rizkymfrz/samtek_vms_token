import type { Metadata } from "next";
import { Suspense } from "react";
import { AudioView } from "@/features/speakers/components/audio-view";
import { SpeakersGate } from "@/features/speakers/components/speakers-gate";
import { SpeakersSkeleton } from "@/features/speakers/components/speakers-skeleton";

export const metadata: Metadata = { title: "Audio" };

const Page = () => {
  return (
    <Suspense fallback={<SpeakersSkeleton />}>
      <SpeakersGate render={(data) => <AudioView data={data} />} />
    </Suspense>
  );
};

export default Page;
