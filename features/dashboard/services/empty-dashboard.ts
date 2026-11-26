import { clock, DAY, HOUR } from "../lib/format";
import type { Dashboard } from "../types";

export const emptyDashboard = (now: number): Dashboard => {
  const currentHour = Math.floor(now / HOUR) * HOUR;
  const hourStarts = Array.from(
    { length: 24 },
    (_, index) => currentHour - (23 - index) * HOUR,
  );
  const zeros = () => hourStarts.map(() => 0);
  return {
    kpis: {
      alarms: { value: 0, change: 0 },
      severe: { value: 0, change: 0 },
      recognitions: { value: 0, change: 0 },
      newPersons: { value: 0, total: 0 },
    },
    modules: {
      counting: false,
      ppe: false,
      fire: false,
      access: false,
      crowd: false,
      dust: false,
      worker: false,
      behavior: false,
      visitors: false,
      faceRecognition: false,
      faceAttribute: false,
      licensePlate: false,
      reid: false,
    },
    hasRecognition: false,
    ppe: {
      total: 0,
      change: 0,
      timeline: hourStarts.map((start) => ({
        label: clock.format(start),
        violations: 0,
      })),
      byItem: [],
    },
    fire: {
      total: 0,
      fire: 0,
      smoke: 0,
      last: null,
      events: [],
      axis: [clock.format(now - DAY), clock.format(now - DAY / 2), "Now"],
    },
    access: {
      stranger: 0,
      outside: 0,
      timeline: hourStarts.map((start) => ({
        label: clock.format(start),
        stranger: 0,
        outside: 0,
      })),
      byCamera: [],
    },
    crowd: { total: 0, areas: [] },
    dust: {
      total: 0,
      timeline: hourStarts.map((start) => ({
        label: clock.format(start),
        level: null,
      })),
    },
    absence: { events: 0, areas: [] },
    behavior: { phone: 0, sleep: 0, byCamera: [] },
    vehicles: { total: 0, types: [], colors: [], topPlates: [] },
    visitors: { value: 0, change: 0, hourly: zeros() },
    reid: { sightings: 0, people: 0, byCamera: [] },
    counting: {
      total: 0,
      change: 0,
      series: [],
      data: hourStarts.map((start) => ({ label: clock.format(start) })),
      hourly: zeros(),
      avgStay: [],
    },
    timeline: [],
    recognitionsTimeline: zeros(),
    heatmap: [],
    riskTotals: [],
    alarmsByKind: [],
    recognitionsByType: [],
    deviceNames: {},
    recentAlarms: [],
    relays: {},
    recentPlates: [],
    recentFaces: [],
    attributes: {
      Gender: [],
      "Age group": [],
      Mask: [],
      Glasses: [],
      Emotion: [],
    },
  };
};
