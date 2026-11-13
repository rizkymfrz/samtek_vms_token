export type RecognitionRow = {
  id: string;
  edgeId: string;
  eventId: string;
  at: number;
  time: string;
  date: string;
  recognizer: string;
  camera: string;
  personId: string | null;
  name: string;
  group: string;
  similarity: number | null;
  confidence: number;
  cropUrl: string | null;
  referenceUrl: string | null;
};

export type RecognitionsQuery = {
  since: number;
  until: number | null;
  recognizer: string;
};

export type RecognitionsData = {
  now: number;
  rows: RecognitionRow[];
  isTruncated: boolean;
  cameraNames: Record<string, string>;
  references: Record<string, string>;
  failures: { edgeId: string; edgeName: string; message: string }[];
};
