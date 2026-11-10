import type { EdgeSample, EdgeSeries } from "../types";

export const SERIES_SECONDS = 60;

export const memoryPercent = (sample: EdgeSample) =>
  sample.memory && sample.memory.totalBytes > 0
    ? Math.round((sample.memory.usedBytes / sample.memory.totalBytes) * 1000) /
      10
    : null;

export const appendSample = (history: EdgeSample[], sample: EdgeSample) =>
  [...history, sample].slice(-SERIES_SECONDS);

const present = (values: (number | null)[]) =>
  values.filter((value): value is number => value !== null);

export const toSeries = (history: EdgeSample[]): EdgeSeries => ({
  cpu: present(history.map((sample) => sample.cpuPercent)),
  temperature: present(history.map((sample) => sample.temperatureC)),
  memory: present(history.map(memoryPercent)),
});
