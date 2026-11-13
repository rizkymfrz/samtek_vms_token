import { formatDate, formatTime } from "../lib/format-recognition";
import type {
  RecognitionRow,
  RecognitionsData,
  RecognitionsQuery,
} from "../types";

const PEOPLE = [
  { id: "p1", name: "Budi Santoso", group: "staff" },
  { id: "p2", name: "Sari Wulan", group: "staff" },
  { id: "p3", name: "Andi Pratama", group: "vip" },
  { id: "p4", name: "Rina Marlina", group: "visitor" },
];

const CAMERAS = ["Lobby Entrance", "Main Gate"];
const MINUTE_MS = 60_000;

export const buildRecognitions = (
  now: number,
  query: RecognitionsQuery,
): RecognitionsData => {
  const rows = Array.from({ length: 40 }, (_, index): RecognitionRow => {
    const person = PEOPLE[index % PEOPLE.length];
    const at = now - (index + 1) * 7 * MINUTE_MS;
    const occurredAt = new Date(at);
    return {
      id: `1:mock-${index}`,
      edgeId: "1",
      eventId: `mock-${index}`,
      at,
      time: formatTime(occurredAt),
      date: formatDate(occurredAt),
      recognizer: query.recognizer,
      camera: CAMERAS[index % CAMERAS.length],
      personId: person.id,
      name: person.name,
      group: person.group,
      similarity: 0.6 + ((index * 7) % 35) / 100,
      confidence: 0.9,
      cropUrl: null,
      referenceUrl: null,
    };
  }).filter(
    (row) =>
      row.at >= query.since && (query.until === null || row.at < query.until),
  );
  return {
    now,
    rows,
    isTruncated: false,
    cameraNames: {},
    references: {},
    failures: [],
  };
};
