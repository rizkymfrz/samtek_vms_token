import type { RiskLevel } from "@/types/risk";

export type AlertClip = {
  edgeId: string;
  eventId: string;
  startAt: number | null;
  durationMs: number | null;
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
  analyticId: string;
  kind: string;
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
  titles: string[];
  cameras: string[];
  cameraNames: Record<string, string>;
  relays: Record<string, AlertClip["relay"]>;
  failures: { edgeId: string; edgeName: string; message: string }[];
};
