import type { AlertClip, AlertRow } from "@/features/alerts/types";

export type BarItem = { label: string; value: number };

export type Dashboard = {
  kpis: {
    alarms: { value: number; change: number };
    severe: { value: number; change: number };
    recognitions: { value: number; change: number };
    newPersons: { value: number; total: number };
  };
  modules: {
    counting: boolean;
    ppe: boolean;
    fire: boolean;
    access: boolean;
    crowd: boolean;
    dust: boolean;
    worker: boolean;
    behavior: boolean;
    visitors: boolean;
    faceRecognition: boolean;
    faceAttribute: boolean;
    licensePlate: boolean;
    reid: boolean;
  };
  hasRecognition: boolean;
  ppe: {
    total: number;
    change: number;
    timeline: { label: string; violations: number }[];
    byItem: BarItem[];
  };
  fire: {
    total: number;
    fire: number;
    smoke: number;
    last: { device: string; time: string } | null;
    events: {
      id: string;
      kind: "fire" | "smoke";
      position: number;
      device: string;
      time: string;
    }[];
    axis: string[];
  };
  access: {
    stranger: number;
    outside: number;
    timeline: { label: string; stranger: number; outside: number }[];
    byCamera: BarItem[];
  };
  crowd: {
    total: number;
    areas: { area: string; alarms: number; peak: number; max: number }[];
  };
  dust: {
    total: number;
    timeline: { label: string; level: number | null }[];
  };
  absence: {
    events: number;
    areas: { area: string; events: number; seconds: number }[];
  };
  behavior: { phone: number; sleep: number; byCamera: BarItem[] };
  vehicles: {
    total: number;
    types: { key: string; count: number }[];
    colors: BarItem[];
    topPlates: BarItem[];
  };
  visitors: { value: number; change: number; hourly: number[] };
  reid: { sightings: number; people: number; byCamera: BarItem[] };
  counting: {
    total: number;
    change: number;
    series: string[];
    data: ({ label: string } & Record<string, string | number>)[];
    hourly: number[];
    avgStay: BarItem[];
  };
  timeline: { label: string; medium: number; high: number }[];
  recognitionsTimeline: number[];
  heatmap: { device: string; hours: number[] }[];
  riskTotals: { level: "medium" | "high"; count: number }[];
  alarmsByKind: BarItem[];
  recognitionsByType: BarItem[];
  deviceNames: Record<string, string>;
  recentAlarms: AlertRow[];
  relays: Record<string, AlertClip["relay"]>;
  recentPlates: {
    id: string;
    plate: string;
    vehicle: string;
    device: string;
    time: string;
  }[];
  recentFaces: {
    id: string;
    name: string;
    group: string;
    similarity: number;
    device: string;
    time: string;
    visitor: boolean;
  }[];
  attributes: Record<
    "Gender" | "Age group" | "Mask" | "Glasses" | "Emotion",
    BarItem[]
  >;
};
