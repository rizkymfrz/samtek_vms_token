"use client";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { AudioPanel } from "./audio-panel";
import { useSpeakers } from "../hooks/use-speakers";
import type { SpeakersData } from "../types";

export const AudioView = ({ data }: { data: SpeakersData }) => {
  const { data: current } = useSpeakers(data);
  useFailureToast(
    "Some data did not load",
    current.failures.map((failure) => `${failure.source}: ${failure.message}`),
  );
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
      <AudioPanel servers={current.servers} />
    </div>
  );
};
