import { http } from "@/lib/axios/browser-client";
import type { RecognitionsData, RecognitionsQuery } from "../types";

export const fetchRecognitions = async ({
  recognizer,
  since,
  until,
}: RecognitionsQuery) =>
  (
    await http.get<RecognitionsData>("/api/recognitions", {
      params: { recognizer, since, ...(until !== null && { until }) },
    })
  ).data;
