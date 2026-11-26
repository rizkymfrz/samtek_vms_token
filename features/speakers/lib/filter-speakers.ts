import type { SpeakerRecord } from "../types";

export const ALL = "all";

export type Filters = {
  query: string;
  status: string;
  server: string;
};

export const DEFAULT_FILTERS: Filters = {
  query: "",
  status: ALL,
  server: ALL,
};

export const isFiltered = (filters: Filters) =>
  filters.query.trim() !== "" ||
  filters.status !== ALL ||
  filters.server !== ALL;

export const filterSpeakers = (speakers: SpeakerRecord[], filters: Filters) => {
  const needle = filters.query.trim().toLowerCase();
  return speakers.filter(
    (speaker) =>
      (filters.status === ALL ||
        speaker.isEnabled === (filters.status === "enabled")) &&
      (filters.server === ALL || speaker.edgeServerId === filters.server) &&
      (!needle ||
        `${speaker.name} ${speaker.host}`.toLowerCase().includes(needle)),
  );
};

export const countByServer = (speakers: SpeakerRecord[], filters: Filters) => {
  const counts: Record<string, number> = {};
  for (const speaker of filterSpeakers(speakers, { ...filters, server: ALL })) {
    counts[speaker.edgeServerId] = (counts[speaker.edgeServerId] ?? 0) + 1;
  }
  return counts;
};

export const applyState = (speaker: SpeakerRecord) =>
  speaker.applyStatus ?? "pending";
