import type { Metadata } from "next";
import { Suspense } from "react";
import { HistoryView } from "@/features/speakers/components/history-view";
import { SpeakersGate } from "@/features/speakers/components/speakers-gate";
import { SpeakersSkeleton } from "@/features/speakers/components/speakers-skeleton";

export const metadata: Metadata = { title: "Play history" };

const Page = () => {
  return (
    <Suspense fallback={<SpeakersSkeleton />}>
      <SpeakersGate render={(data) => <HistoryView data={data} />} />
    </Suspense>
  );
};

export default Page;
