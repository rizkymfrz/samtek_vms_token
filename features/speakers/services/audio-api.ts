import { http } from "@/lib/axios/browser-client";
import type { SpeakerAudioData, SpeakerCallsData } from "../types";

export const fetchSpeakerAudio = async () =>
  (await http.get<SpeakerAudioData>("/api/speaker-audio")).data;

export const uploadSpeakerAudio = async (
  edgeId: string,
  file: File,
  name: string,
) => {
  const form = new FormData();
  form.set("edgeId", edgeId);
  form.set("file", file);
  form.set("name", name);
  await http.post("/api/speaker-audio", form);
};

export const deleteSpeakerAudio = async (edgeId: string, audioId: string) => {
  await http.delete(`/api/speaker-audio/${edgeId}/${audioId}`);
};

export const fetchSpeakerCalls = async () =>
  (await http.get<SpeakerCallsData>("/api/speaker-calls")).data;
