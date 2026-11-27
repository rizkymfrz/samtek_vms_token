"use client";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { CallsPanel } from "./calls-panel";
import { useSpeakers } from "../hooks/use-speakers";
import type { SpeakersData } from "../types";

export const HistoryView = ({ data }: { data: SpeakersData }) => {
  const { data: current } = useSpeakers(data);
  useFailureToast(
    "Some data did not load",
    current.failures.map((failure) => `${failure.source}: ${failure.message}`),
  );
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
      <CallsPanel servers={current.servers} speakers={current.speakers} />
    </div>
  );
};
