import type { EdgeEntry } from "@/features/edge-status";
import type { Metrics } from "../types";

const GB = 1e9;
const GIB = 1024 ** 3;
const gb = (bytes: number) => Math.round((bytes / GB) * 10) / 10;

export const toMetrics = ({ sample, series }: EdgeEntry): Metrics => {
  const storage = sample.storage;
  const recordings = storage?.recordingsBytes ?? 0;
  const analytics = storage?.analyticsBytes ?? 0;
  const system = storage
    ? Math.max(
        0,
        storage.totalBytes - storage.freeBytes - recordings - analytics,
      )
    : 0;
  return {
    cpuTemp: series.temperature,
    memory: series.memory,
    cpu: series.cpu,
    memoryTotalGb: sample.memory
      ? Math.round((sample.memory.totalBytes / GIB) * 10) / 10
      : 0,
    storage: {
      recordings: gb(recordings),
      analytics: gb(analytics),
      system: gb(system),
      free: gb(storage?.freeBytes ?? 0),
      retentionDays: storage?.retentionDays ?? null,
    },
  };
};
