import { createRandom } from "@/lib/random";
import type { LogLine } from "../types";

export const LOG_TEMPLATES: [
  level: "INFO" | "WARN" | "DEBUG",
  template: string,
][] = [
  ["INFO", "mqtt: published edge.state (devices=%d)"],
  ["INFO", "stream: webrtc session opened device=cam-%s"],
  ["DEBUG", "analytics: pipeline tick latency=%dms"],
  ["INFO", "recorder: segment closed device=cam-%s size=%dMB"],
  ["INFO", "stats: flushed object_counts rows=%d"],
  ["INFO", "health: heartbeat ok"],
  ["WARN", "recorder: disk free below 20%"],
  ["WARN", "stream: reconnecting device=cam-%s"],
];

export const logLine = (seed: number, at: number): LogLine => {
  const random = createRandom(seed);
  const [level, template] =
    LOG_TEMPLATES[Math.floor(random() * LOG_TEMPLATES.length)];
  const message = template.replace(/%([ds])/g, (_, kind: string) =>
    kind === "s"
      ? String(Math.floor(random() * 13) + 1).padStart(3, "0")
      : String(Math.floor(random() * 880) + 20),
  );
  return { id: seed, at, level, message };
};
