export type StatsBucket = "hour" | "day" | "week" | "month";

type CountingSeries = {
  perimeter: string;
  direction: string;
  label: string;
  count: number;
  counts: number[];
};

type DwellingSeries = {
  perimeter: string;
  label: string;
  objects: number;
  staySeconds: number;
  objectsByBucket: number[];
  stayByBucket: number[];
};

export type CountingStats = {
  bucket: StatsBucket;
  buckets: number[];
  counting: CountingSeries[];
  dwelling: DwellingSeries[];
};

export type CountingStatsQuery = {
  edgeId: string;
  deviceId: string;
  bucket: StatsBucket;
  since: number;
  until: number | null;
  utcOffsetMinutes: number;
};
