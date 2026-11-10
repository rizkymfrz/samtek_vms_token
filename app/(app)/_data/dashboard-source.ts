import { ANALYTICS } from "./analytics-catalog";

export type RiskLevel = "low" | "medium" | "high";

export type AlarmEvent = {
  event_id: string;
  device_id: string;
  analytic_id: string;
  kind: string;
  title: string;
  description: string;
  risk_level: RiskLevel;
  perimeter_shape: string;
  perimeter_name: string;
  object_label: string;
  occurred_at: Date;
  track_id: number;
  score: number;
  frame_width: number;
  frame_height: number;
  image_path: string;
  created_at: Date;
};

export type AlarmDetail = {
  event_id: string;
  detail_key: string;
  text_value: string | null;
  number_value: number | null;
  item_index: number | null;
};

export type RecognitionEvent = {
  event_id: string;
  device_id: string;
  recognizer: string;
  kind: string;
  object_label: string;
  occurred_at: Date;
  track_id: number;
  score: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  frame_width: number;
  frame_height: number;
  crop_path: string;
  created_at: Date;
};

export type FaceRecognitionResult = {
  event_id: string;
  person_id: string;
  person_name: string;
  person_group: string;
  similarity: number;
};

export type FaceAttributeResult = {
  event_id: string;
  person_gender: string;
  person_age_group: string;
  person_mask: string;
  person_glasses: string;
  person_emotion: string;
};

export type LicensePlateResult = {
  event_id: string;
  plate_number: string;
  vehicle_type: string;
  vehicle_color: string;
};

export type PersonSeenResult = {
  event_id: string;
  person_id: string;
  similarity: number;
  new_person: boolean;
};

export type DeviceInfo = {
  device_id: string;
  name: string;
  edge_server: string;
  is_enabled: boolean;
  analytics: string[];
};

export type ObjectCount = {
  device_id: string;
  perimeter_type: "line";
  perimeter_name: string;
  direction: string;
  object_label: string;
  counted_object: number;
  start_date: Date;
  end_date: Date;
  created_at: Date;
};

export type ObjectDwelling = {
  device_id: string;
  perimeter_name: string;
  object_label: string;
  total_stay_time: number;
  total_object: number;
  average_stay_time: number;
  start_date: Date;
  end_date: Date;
  created_at: Date;
};

export type PersonSighting = {
  person_id: string;
  device_id: string;
  seen_at: Date;
  similarity: number;
  track_id: number;
  crop_path: string;
  created_at: Date;
};

const HOUR = 3_600_000;

export const createDevices = (selected: string[]): DeviceInfo[] => {
  return ANALYTICS.filter((a) => selected.includes(a.id)).map((a) => ({
    device_id: `cam-${a.id}`,
    name: a.camera,
    edge_server: a.edge,
    is_enabled: true,
    analytics: [a.id],
  }));
};

export const COUNTING_ANALYTICS = [
  "people_counting_dwelling",
  "vehicle_counting_dwelling",
];

export const PPE_ANALYTICS = ["ppe_violation", "ppe_violation_advance"];

export const PLATE_ANALYTICS = [
  "license_plate_recognition",
  "vehicle_license_plate_recognition",
];

export const FACE_ANALYTICS = ["face_recognition", "face_visitor_attendance"];

type Risk = RiskLevel | "dust";

type AlarmKindDef = {
  kind: string;
  title: string;
  analytics: string[];
  risk: Risk;
  objects: string[];
  shape: "area" | "line" | "";
  weight: number;
};

const ALARM_KINDS: AlarmKindDef[] = [
  {
    kind: "area_dwell",
    title: "Dwelling Alarm",
    analytics: COUNTING_ANALYTICS,
    risk: "high",
    objects: ["person", "car", "motorbike"],
    shape: "area",
    weight: 3,
  },
  {
    kind: "ppe_missing",
    title: "PPE Violation",
    analytics: PPE_ANALYTICS,
    risk: "high",
    objects: ["Worker"],
    shape: "area",
    weight: 10,
  },
  {
    kind: "fire_smoke_detected",
    title: "Fire Smoke Alarm",
    analytics: ["fire_smoke"],
    risk: "high",
    objects: ["fire", "smoke"],
    shape: "area",
    weight: 2,
  },
  {
    kind: "crowd_limit_exceeded",
    title: "Crowd Monitoring Alarm",
    analytics: ["people_crowd_monitoring"],
    risk: "high",
    objects: ["person"],
    shape: "area",
    weight: 2,
  },
  {
    kind: "worker_absent",
    title: "Worker Absent Alarm",
    analytics: ["people_worker_dwelling"],
    risk: "medium",
    objects: ["person"],
    shape: "area",
    weight: 4,
  },
  {
    kind: "cat_detected",
    title: "Cat Detection Alarm",
    analytics: ["cat_detection"],
    risk: "medium",
    objects: ["cat"],
    shape: "area",
    weight: 1,
  },
  {
    kind: "phone_call",
    title: "Phone Calling Alarm",
    analytics: ["phone_calling"],
    risk: "medium",
    objects: ["person"],
    shape: "area",
    weight: 5,
  },
  {
    kind: "sleep_on_duty",
    title: "Sleep Alarm",
    analytics: ["people_sleep_on_duty"],
    risk: "medium",
    objects: ["person"],
    shape: "area",
    weight: 2,
  },
  {
    kind: "motion_detected",
    title: "Motion Alarm",
    analytics: ["motion"],
    risk: "medium",
    objects: ["motion"],
    shape: "area",
    weight: 6,
  },
  {
    kind: "dust_detected",
    title: "Dust Detected",
    analytics: ["dust_spreading"],
    risk: "dust",
    objects: ["dust"],
    shape: "",
    weight: 2,
  },
  {
    kind: "face_not_in_whitelist",
    title: "Person Outside The Whitelist",
    analytics: ["face_recognition"],
    risk: "medium",
    objects: ["face"],
    shape: "area",
    weight: 3,
  },
  {
    kind: "face_stranger",
    title: "Stranger Detected",
    analytics: ["face_recognition"],
    risk: "high",
    objects: ["face"],
    shape: "area",
    weight: 2,
  },
];

const PPE_ITEMS: Record<string, string[]> = {
  ppe_violation: ["helmet", "vest", "mask"],
  ppe_violation_advance: ["helmet", "glasses", "vest", "wearpack", "shoes"],
};

const COUNTING_SETUP: Record<
  string,
  { line: string; area: string; labels: string[] }
> = {
  people_counting_dwelling: {
    line: "Entrance Line",
    area: "Lobby",
    labels: ["person"],
  },
  vehicle_counting_dwelling: {
    line: "Gate Line",
    area: "Gate Queue",
    labels: ["car", "motorbike", "truck", "bus"],
  },
};

export const canRaiseAlarms = (device: DeviceInfo) => {
  return ALARM_KINDS.some((k) =>
    k.analytics.some((a) => device.analytics.includes(a)),
  );
};

const AREAS = [
  "Restricted Zone",
  "Fence Line",
  "Loading Bay",
  "Entrance",
  "No-Parking Zone",
];

const PEOPLE = [
  { id: "p-001", name: "Andi Pratama", group: "Employee" },
  { id: "p-002", name: "Siti Rahma", group: "Employee" },
  { id: "p-003", name: "Budi Santoso", group: "Employee" },
  { id: "p-004", name: "Dewi Lestari", group: "VIP" },
  { id: "p-005", name: "Rudi Hartono", group: "Contractor" },
  { id: "p-006", name: "Maya Putri", group: "Visitor" },
];

const PLATE_LETTERS = ["B", "D", "F", "L", "N", "AB", "DK"];
const SUFFIX = ["KAL", "RFA", "TXN", "QWD", "MLP", "VBZ", "HGS"];

const createRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const generateAnalytics = (now: number, devices: DeviceInfo[]) => {
  const random = createRandom(20260509);
  const int = (min: number, max: number) =>
    min + Math.floor(random() * (max - min + 1));
  const round = (value: number, digits = 2) =>
    Math.round(value * 10 ** digits) / 10 ** digits;
  const pick = <T>(items: readonly T[]) => items[int(0, items.length - 1)];
  const weighted = <T>(items: readonly (readonly [T, number])[]) => {
    let roll = random() * items.reduce((sum, [, weight]) => sum + weight, 0);
    for (const [item, weight] of items) {
      roll -= weight;
      if (roll <= 0) return item;
    }
    return items[items.length - 1][0];
  };
  const isBusy = (at: number) => {
    const hour = (new Date(at).getUTCHours() + 7) % 24;
    return hour >= 7 && hour <= 19;
  };
  const randomTime = () => {
    for (;;) {
      const at = now - random() * 48 * HOUR;
      if (isBusy(at) || random() < 0.25) return new Date(at);
    }
  };
  const active = devices.filter((d) => d.is_enabled);
  const alarm_events: AlarmEvent[] = [];
  const alarm_details: AlarmDetail[] = [];
  const alarmDevices = active.filter(canRaiseAlarms);
  for (let i = 0; alarmDevices.length > 0 && i < 260; i++) {
    const device = pick(alarmDevices);
    const def = weighted(
      ALARM_KINDS.filter((k) =>
        k.analytics.some((a) => device.analytics.includes(a)),
      ).map((k) => [k, k.weight] as const),
    );
    const analytic_id = def.analytics.find((a) =>
      device.analytics.includes(a),
    )!;
    const at = randomTime();
    const event_id = `alm-${String(i + 1).padStart(4, "0")}`;
    const area = pick(AREAS);
    const num = (detail_key: string, value: number) =>
      alarm_details.push({
        event_id,
        detail_key,
        text_value: null,
        number_value: value,
        item_index: null,
      });
    const text = (
      detail_key: string,
      value: string,
      item_index: number | null = null,
    ) =>
      alarm_details.push({
        event_id,
        detail_key,
        text_value: value,
        number_value: null,
        item_index,
      });
    let risk: RiskLevel = def.risk === "dust" ? "medium" : def.risk;
    let score = round(0.55 + random() * 0.44);
    let object_label = pick(def.objects);
    let description = `${def.title} at ${device.name}`;
    switch (def.kind) {
      case "area_dwell":
        object_label = device.analytics.includes("vehicle_counting_dwelling")
          ? pick(["car", "motorbike"])
          : "person";
        num("stay_seconds", int(30, 300));
        description = `Exceeded the stay limit in area ${area}`;
        break;
      case "ppe_missing": {
        const pool = PPE_ITEMS[analytic_id];
        const missing = [pick(pool)];
        if (random() < 0.3)
          missing.push(pick(pool.filter((item) => item !== missing[0])));
        missing.forEach((item, index) => text("missing_items", item, index));
        description = `Worker without ${missing.join(", ")} in area ${area}`;
        break;
      }
      case "fire_smoke_detected":
        num("ssim", round(0.3 + random() * 0.35));
        break;
      case "crowd_limit_exceeded": {
        const max = 20;
        const count = int(max, max + 15);
        num("people_count", count);
        num("max_people", max);
        description = `${count} people in area ${area}, the limit is ${max}`;
        break;
      }
      case "worker_absent": {
        const absent = int(4, 120);
        num("working_seconds", int(60, 3600));
        num("absent_seconds", absent);
        description = `No worker in area ${area} for ${absent} seconds`;
        break;
      }
      case "cat_detected":
        num("clip_confidence", round(0.9 + random() * 0.09));
        break;
      case "motion_detected": {
        const ratio = round(0.003 + random() * 0.39, 3);
        num("change_ratio", ratio);
        score = round(0.85 + 0.13 * Math.min(1, ratio / 0.4));
        break;
      }
      case "dust_detected": {
        const level = round(0.5 + random() * 0.45);
        num("dust_score", level);
        risk = level >= 0.66 ? "high" : "medium";
        score = Math.min(1, level);
        break;
      }
      case "face_not_in_whitelist": {
        const person = pick(PEOPLE);
        text("person_id", person.id);
        text("person_name", person.name);
        text("person_group", person.group);
        num("similarity", round(0.7 + random() * 0.29));
        description = `${person.name} from group ${person.group} (ID ${person.id}) is not in a whitelisted group`;
        break;
      }
      case "face_stranger":
        description = "A face that is not in the gallery";
        break;
    }
    alarm_events.push({
      event_id,
      device_id: device.device_id,
      analytic_id,
      kind: def.kind,
      title: def.title,
      description,
      risk_level: risk,
      perimeter_shape: def.shape,
      perimeter_name: def.shape ? area : "",
      object_label,
      occurred_at: at,
      track_id:
        def.kind === "crowd_limit_exceeded" || def.kind === "worker_absent"
          ? 0
          : int(1, 900),
      score,
      frame_width: 1920,
      frame_height: 1080,
      image_path: `${analytic_id}/${event_id}_1920x1080.jpg`,
      created_at: new Date(at.getTime() + int(200, 1500)),
    });
  }
  const recognition_events: RecognitionEvent[] = [];
  const face_recognition_results: FaceRecognitionResult[] = [];
  const face_attribute_results: FaceAttributeResult[] = [];
  const license_plate_results: LicensePlateResult[] = [];
  const person_seen_results: PersonSeenResult[] = [];
  const person_sightings: PersonSighting[] = [];
  const plates = Array.from(
    { length: 24 },
    () => `${pick(PLATE_LETTERS)} ${int(1000, 9999)} ${pick(SUFFIX)}`,
  );
  const recognizers = [
    { recognizer: "face_recognition", weight: 5 },
    { recognizer: "face_visitor_attendance", weight: 2 },
    { recognizer: "face_attribute", weight: 5 },
    { recognizer: "license_plate_recognition", weight: 2 },
    { recognizer: "vehicle_license_plate_recognition", weight: 4 },
    { recognizer: "people_reidentification", weight: 6 },
  ];
  const available = recognizers.filter((r) =>
    active.some((d) => d.analytics.includes(r.recognizer)),
  );
  const seenPeople = new Set<string>();
  for (let i = 0; available.length > 0 && i < 700; i++) {
    const def = weighted(available.map((r) => [r, r.weight] as const));
    const device = pick(
      active.filter((d) => d.analytics.includes(def.recognizer)),
    );
    const at = randomTime();
    const event_id = `rec-${String(i + 1).padStart(4, "0")}`;
    const x1 = int(100, 1200);
    const y1 = int(80, 600);
    let kind = "face_recognized";
    let object_label = "face";
    if (def.recognizer === "face_attribute") {
      kind = "face_attribute";
    } else if (def.recognizer === "face_visitor_attendance" && random() < 0.3) {
      kind = "face_visitor_registered";
    } else if (def.recognizer === "license_plate_recognition") {
      kind = "license_plate";
      object_label = "licensePlate";
    } else if (def.recognizer === "vehicle_license_plate_recognition") {
      kind = "license_plate";
      object_label = pick(["car", "motorbike"]);
    } else if (def.recognizer === "people_reidentification") {
      kind = "person_seen";
      object_label = "person";
    }
    recognition_events.push({
      event_id,
      device_id: device.device_id,
      recognizer: def.recognizer,
      kind,
      object_label,
      occurred_at: at,
      track_id: int(1, 900),
      score: round(0.6 + random() * 0.39),
      x1,
      y1,
      x2: x1 + int(80, 300),
      y2: y1 + int(120, 400),
      frame_width: 1920,
      frame_height: 1080,
      crop_path: `${def.recognizer}/${event_id}_1920x1080.jpg`,
      created_at: new Date(at.getTime() + int(100, 900)),
    });
    if (kind === "face_recognized" || kind === "face_visitor_registered") {
      const known = kind === "face_recognized" && random() < 0.8;
      const person = known
        ? pick(PEOPLE)
        : {
            id: `v-${int(100, 999)}`,
            name: `visitor_${int(100, 999)}`,
            group: "nogroup",
          };
      face_recognition_results.push({
        event_id,
        person_id: person.id,
        person_name: person.name,
        person_group: person.group,
        similarity: round(0.7 + random() * 0.29),
      });
    } else if (kind === "face_attribute") {
      face_attribute_results.push({
        event_id,
        person_gender: weighted([
          ["Male", 55],
          ["Female", 45],
        ] as const),
        person_age_group: weighted([
          ["Child", 4],
          ["Teenager", 18],
          ["Adult", 62],
          ["Elder", 16],
        ] as const),
        person_mask: weighted([
          ["No", 70],
          ["Yes", 30],
        ] as const),
        person_glasses: weighted([
          ["No", 72],
          ["Yes", 28],
        ] as const),
        person_emotion: weighted([
          ["NEUTRAL", 50],
          ["HAPPINESS", 22],
          ["SURPRISE", 7],
          ["ANGER", 5],
          ["SADNESS", 6],
          ["FEAR", 3],
          ["DISGUST", 2],
        ] as const),
      });
    } else if (kind === "license_plate") {
      const vehicle = def.recognizer === "vehicle_license_plate_recognition";
      const lowConfidence = random() < 0.15;
      license_plate_results.push({
        event_id,
        plate_number: pick(plates),
        vehicle_type: vehicle ? object_label : "-",
        vehicle_color:
          vehicle && !lowConfidence
            ? weighted([
                ["black", 26],
                ["silver", 22],
                ["red", 12],
                ["blue", 12],
                ["green", 4],
                ["yellow", 6],
              ] as const)
            : "-",
      });
    } else {
      const person_id = `ps-${int(1, 120)}`;
      const new_person = !seenPeople.has(person_id);
      seenPeople.add(person_id);
      const similarity = round(0.6 + random() * 0.39);
      person_seen_results.push({ event_id, person_id, similarity, new_person });
      person_sightings.push({
        person_id,
        device_id: device.device_id,
        seen_at: at,
        similarity,
        track_id: int(1, 900),
        crop_path: `people_reidentification/${event_id}_1920x1080.jpg`,
        created_at: new Date(at.getTime() + int(100, 900)),
      });
    }
  }
  const object_counts: ObjectCount[] = [];
  const object_dwellings: ObjectDwelling[] = [];
  const currentHour = Math.floor(now / HOUR) * HOUR;
  for (const device of active) {
    const setup = COUNTING_SETUP[device.analytics[0]];
    if (!setup) continue;
    for (let k = 0; k < 48; k++) {
      const start = currentHour - k * HOUR;
      const busy = isBusy(start);
      const window = {
        start_date: new Date(start),
        end_date: new Date(start + HOUR),
        created_at: new Date(start + HOUR),
      };
      for (const direction of ["Entry", "Exit"]) {
        for (const object_label of setup.labels) {
          const base =
            object_label === "person" ? 40 : object_label === "car" ? 22 : 6;
          const counted_object = busy
            ? int(Math.floor(base / 2), base)
            : int(0, Math.floor(base / 6));
          if (counted_object > 0) {
            object_counts.push({
              device_id: device.device_id,
              perimeter_type: "line",
              perimeter_name: setup.line,
              direction,
              object_label,
              counted_object,
              ...window,
            });
          }
        }
      }
      const objects = busy ? int(6, 30) : int(0, 3);
      if (objects > 0) {
        const average = int(20, 140);
        object_dwellings.push({
          device_id: device.device_id,
          perimeter_name: setup.area,
          object_label: setup.labels[0],
          total_stay_time: average * objects,
          total_object: objects,
          average_stay_time: average,
          ...window,
        });
      }
    }
  }
  return {
    alarm_events,
    alarm_details,
    recognition_events,
    face_recognition_results,
    face_attribute_results,
    license_plate_results,
    person_seen_results,
    person_sightings,
    object_counts,
    object_dwellings,
  };
};
