import type { SpeakerRecord } from "../types";

export const applyState = (speaker: SpeakerRecord) =>
  speaker.applyStatus ?? "pending";
