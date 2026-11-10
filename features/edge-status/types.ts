export type EdgeSample = {
  receivedAt: number;
  uptimeSeconds: number;
  cpuPercent: number | null;
  temperatureC: number | null;
  memory: { usedBytes: number; totalBytes: number } | null;
  storage: {
    totalBytes: number;
    freeBytes: number;
    recordingsBytes: number | null;
    analyticsBytes: number | null;
    retentionDays: number | null;
  } | null;
};

export type EdgeSeries = {
  cpu: number[];
  temperature: number[];
  memory: number[];
};

export type EdgeEntry = { sample: EdgeSample; series: EdgeSeries };

export type EdgeStatusState = {
  isConnected: boolean;
  error: string | null;
  entries: ReadonlyMap<string, EdgeEntry>;
  online: ReadonlySet<string>;
};

export type DetectionObject = {
  label: string;
  confidence: number;
  trackId: number | null;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
