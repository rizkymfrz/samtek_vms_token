import { http } from "@/lib/axios/browser-client";
import type { SpeakersData } from "../types";

export const fetchSpeakers = async () =>
  (await http.get<SpeakersData>("/api/speakers")).data;
