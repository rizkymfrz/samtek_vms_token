import { ANALYTIC_IDS, analyticLabel } from "@/config/analytics-catalog";
import type { RiskLevel } from "@/types/risk";
import { createDevices, generateAnalytics } from "./dashboard-source";

const TIME_ZONE = "Asia/Jakarta";

const time = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const date = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
});

const titleCase = (value: string) =>
  value.replace(/_/g, " ").replace(/^\w/, (char) => char.toUpperCase());

export type AlertClip = {
  edgeId: string;
  eventId: string;
  relay: { webrtcUrl: string | null; webrtcUrlLocal: string | null };
};

export type AlertRow = {
  id: string;
  at: number;
  time: string;
  date: string;
  title: string;
  description: string;
  risk: RiskLevel;
  camera: string;
  analytic: string;
  object: string;
  score: number;
  perimeter: string;
  trackId: number;
  frame: string;
  imagePath: string;
  imageUrl: string | null;
  clip: AlertClip | null;
  details: { label: string; value: string }[];
};

export type AlertsQuery = { since: number; until: number | null };

export type AlertsData = {
  now: number;
  rows: AlertRow[];
  isTruncated: boolean;
  titles: string[];
  cameras: string[];
  failures: { edgeId: string; edgeName: string; message: string }[];
};

export const buildAlerts = (
  now = Date.now(),
  query?: AlertsQuery,
): AlertsData => {
  const devices = createDevices(ANALYTIC_IDS);
  const data = generateAnalytics(now, devices);
  const camera = new Map(devices.map((d) => [d.device_id, d.name]));
  const detailsByEvent = new Map<string, typeof data.alarm_details>();
  for (const detail of data.alarm_details) {
    detailsByEvent.set(detail.event_id, [
      ...(detailsByEvent.get(detail.event_id) ?? []),
      detail,
    ]);
  }
  const formatDetails = (eventId: string) => {
    const grouped = new Map<string, string[]>();
    for (const d of detailsByEvent.get(eventId) ?? []) {
      const value = d.text_value ?? String(d.number_value ?? "");
      grouped.set(d.detail_key, [...(grouped.get(d.detail_key) ?? []), value]);
    }
    return [...grouped].map(([key, values]) => ({
      label: titleCase(key),
      value: values.join(", "),
    }));
  };
  const rows: AlertRow[] = data.alarm_events
    .filter((alarm) => alarm.occurred_at.getTime() <= now)
    .filter(
      (alarm) =>
        !query ||
        (alarm.occurred_at.getTime() >= query.since &&
          (query.until === null || alarm.occurred_at.getTime() < query.until)),
    )
    .sort((a, b) => b.occurred_at.getTime() - a.occurred_at.getTime())
    .map((alarm) => ({
      id: alarm.event_id,
      at: alarm.occurred_at.getTime(),
      time: time.format(alarm.occurred_at),
      date: date.format(alarm.occurred_at),
      title: alarm.title,
      description: alarm.description,
      risk: alarm.risk_level,
      camera: camera.get(alarm.device_id) ?? alarm.device_id,
      analytic: analyticLabel(alarm.analytic_id),
      object: titleCase(alarm.object_label),
      score: alarm.score,
      perimeter: alarm.perimeter_name
        ? `${alarm.perimeter_name} (${alarm.perimeter_shape})`
        : "None",
      trackId: alarm.track_id,
      frame: `${alarm.frame_width}×${alarm.frame_height}`,
      imagePath: alarm.image_path,
      imageUrl: null,
      clip: null,
      details: formatDetails(alarm.event_id),
    }));
  return {
    now,
    rows,
    titles: [...new Set(rows.map((r) => r.title))].sort(),
    cameras: [...new Set(rows.map((r) => r.camera))].sort(),
    isTruncated: false,
    failures: [],
  };
};
