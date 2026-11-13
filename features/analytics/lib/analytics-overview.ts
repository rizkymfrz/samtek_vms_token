import { ANALYTIC_GROUPS } from "./analytic-groups";

const HOUR_MS = 3_600_000;
const HOURS = 24;

export type AnalyticStats = {
  cameras: number;
  alarms: number;
  hourly: number[];
  firstHour: number;
};

export type AnalyticsOverview = {
  snapshotAt: number;
  failedEdges: string[];
  stats: Record<string, AnalyticStats>;
};

const firstHourAt = (now: number) =>
  Math.floor(now / HOUR_MS) * HOUR_MS - (HOURS - 1) * HOUR_MS;

export const buildAnalyticsOverview = (
  cameras: { analyticId: string | null; isEnabled: boolean }[],
  alarms: { analyticId: string; at: number }[],
  failedEdges: string[],
  now: number,
): AnalyticsOverview => {
  const firstHour = firstHourAt(now);
  return {
    snapshotAt: now,
    failedEdges,
    stats: Object.fromEntries(
      ANALYTIC_GROUPS.map(({ slug, analyticIds }) => {
        const hourly = Array.from({ length: HOURS }, () => 0);
        let total = 0;
        for (const alarm of alarms) {
          if (!analyticIds.includes(alarm.analyticId) || alarm.at < firstHour) {
            continue;
          }
          total += 1;
          hourly[Math.floor((alarm.at - firstHour) / HOUR_MS)] += 1;
        }
        return [
          slug,
          {
            cameras: cameras.filter(
              (camera) =>
                camera.isEnabled &&
                camera.analyticId !== null &&
                analyticIds.includes(camera.analyticId),
            ).length,
            alarms: total,
            hourly,
            firstHour,
          },
        ];
      }),
    ),
  };
};

export const rollOverview = (
  overview: AnalyticsOverview,
  now: number,
): AnalyticsOverview => {
  const firstHour = firstHourAt(now);
  const shift = Math.min(
    HOURS,
    Math.round(
      (firstHour - Object.values(overview.stats)[0].firstHour) / HOUR_MS,
    ),
  );
  if (shift <= 0) return overview;
  return {
    ...overview,
    stats: Object.fromEntries(
      Object.entries(overview.stats).map(([slug, stats]) => {
        const hourly = [
          ...stats.hourly.slice(shift),
          ...Array.from({ length: shift }, () => 0),
        ];
        return [
          slug,
          {
            ...stats,
            hourly,
            firstHour,
            alarms: hourly.reduce((sum, count) => sum + count, 0),
          },
        ];
      }),
    ),
  };
};

export const applyAlarm = (
  overview: AnalyticsOverview,
  alarm: { analyticId: string; at: number },
  now: number,
): AnalyticsOverview => {
  if (alarm.at <= overview.snapshotAt) return overview;
  const rolled = rollOverview(overview, now);
  const group = ANALYTIC_GROUPS.find(({ analyticIds }) =>
    analyticIds.includes(alarm.analyticId),
  );
  if (!group) return rolled;
  const stats = rolled.stats[group.slug];
  const index = Math.floor((alarm.at - stats.firstHour) / HOUR_MS);
  if (index < 0 || index >= HOURS) return rolled;
  const hourly = stats.hourly.map((count, position) =>
    position === index ? count + 1 : count,
  );
  return {
    ...rolled,
    stats: {
      ...rolled.stats,
      [group.slug]: { ...stats, hourly, alarms: stats.alarms + 1 },
    },
  };
};
