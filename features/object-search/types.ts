export type SearchQuery = {
  q: string;
  edgeId: string | null;
  deviceId: string | null;
  label: string | null;
  since: number | null;
  until: number | null;
  limit: number;
};

export type SearchRow = {
  id: string;
  resultId: string;
  edgeId: string;
  trackKey: string;
  deviceId: string;
  label: string;
  seenAt: number;
  similarity: number;
  confidence: number | null;
  hasCrop: boolean;
};

export type SearchData = {
  rows: SearchRow[];
  relays: Record<
    string,
    { webrtcUrl: string | null; webrtcUrlLocal: string | null }
  >;
  edgeCount: number;
  unavailable: string[];
  failures: { edgeId: string; edgeName: string; message: string }[];
};
